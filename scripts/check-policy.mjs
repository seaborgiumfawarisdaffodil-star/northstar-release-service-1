import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';

export function audit() {
  const workflows = ['ci.yml', 'release.yml'].map(name => {
    const file = `.github/workflows/${name}`;
    const doc = parseDocument(fs.readFileSync(file, 'utf8'), { uniqueKeys: true });
    if (doc.errors.length) throw new Error(`${file}: ${doc.errors.map(e => e.message).join('; ')}`);
    return { file, value: doc.toJS() };
  });
  const release = workflows[1].value;
  const permissionsSafe = workflows.every(({value: w}) =>
    w.permissions?.contents === 'read' &&
    Object.keys(w.permissions).length === 1 &&
    Object.values(w.jobs).every(j => j.permissions === undefined));
  const refs = workflows.flatMap(({file, value: w}) =>
    Object.values(w.jobs).flatMap(j => (j.steps ?? []).filter(s => s.uses)
      .map(s => ({file, ref: s.uses}))));
  const mutable = refs.filter(({ref}) => !/^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/.test(ref));
  const triggerSafe = typeof release.on === 'object' && !Array.isArray(release.on) &&
    Object.keys(release.on).join() === 'push' &&
    JSON.stringify(release.on.push) === JSON.stringify({tags: ['v*']});
  const policies = [
    {id: 'P1', rule: 'Only contents: read; no job permission escalation', pass: permissionsSafe},
    {id: 'P2', rule: 'Every external action uses a full commit SHA', pass: mutable.length === 0,
      detail: mutable.map(x => `${x.file}: ${x.ref}`).join(', ')},
    {id: 'P3', rule: 'Release workflow runs only on v-prefixed tag pushes', pass: triggerSafe},
  ];

  // Deliberately small model: supports this fixture's events, push filters,
  // and the literal publish-job condition. It does not run GitHub Actions.
  const condition = release.jobs.publish.if;
  if (condition !== "github.event_name == 'push'") {
    throw new Error('Unsupported publish-job condition; inspect it manually');
  }
  function workflowRuns(event, ref) {
    const on = release.on;
    if (Array.isArray(on)) return on.includes(event);
    if (typeof on === 'string') return on === event;
    if (!Object.hasOwn(on, event)) return false;
    if (event !== 'push' || on.push === null) return true;
    const filter = on.push;
    const keys = Object.keys(filter);
    if (keys.some(k => !['tags', 'branches'].includes(k))) throw new Error('Unsupported push filter');
    const isTag = ref.startsWith('refs/tags/');
    const patterns = isTag ? filter.tags : filter.branches;
    if (patterns === undefined) return keys.length === 0;
    return patterns.some(pattern => {
      if (!['v*', '*', 'main'].includes(pattern)) throw new Error('Unsupported ref pattern');
      const short = ref.slice(isTag ? 'refs/tags/'.length : 'refs/heads/'.length);
      return pattern === '*' || (pattern === 'v*' ? short.startsWith('v') : short === pattern);
    });
  }
  const scenarios = JSON.parse(fs.readFileSync('fixtures/events.json', 'utf8')).map(s => {
    const workflow = workflowRuns(s.event, s.ref);
    const publish = workflow && s.event === 'push';
    return {...s, workflow, publish, pass: publish === s.expectedPublish};
  });
  return { policies, actionReferences: refs, scenarios,
    ok: policies.every(p => p.pass) && scenarios.every(s => s.pass) };
}

export function printAudit(result) {
  for (const p of result.policies) console.log(`${p.pass ? 'PASS' : 'FAIL'} ${p.id} ${p.rule}${p.detail ? ': '+p.detail : ''}`);
  console.log('\nEvent model: workflow eligible / publish job eligible / required publish');
  for (const s of result.scenarios) console.log(`${s.pass ? 'PASS' : 'FAIL'} ${s.name}: ${s.workflow} / ${s.publish} / ${s.expectedPublish}`);
  console.log(`\nPolicy: ${result.policies.filter(p => p.pass).length}/3; event scenarios: ${result.scenarios.filter(s => s.pass).length}/6`);
  console.log('Model only: repository settings and real runner behavior require separate review.');
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = audit(); printAudit(result); process.exitCode = result.ok ? 0 : 1;
}
