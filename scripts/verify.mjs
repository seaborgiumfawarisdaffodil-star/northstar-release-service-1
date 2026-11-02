import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { audit, printAudit } from './check-policy.mjs';
const mode = process.argv[2];
if (!['baseline', 'verification'].includes(mode)) throw new Error('Invalid verification mode');
fs.mkdirSync('evidence', {recursive: true});
let text = '';
const checks = [];
function run(command, args) {
  const label = [command, ...args].join(' ');
  console.log(`\n$ ${label}`); text += `\n$ ${label}\n`;
  const p = spawnSync(command, args, {encoding: 'utf8'});
  const output = (p.stdout ?? '') + (p.stderr ?? '') + (p.error?.message ?? '');
  process.stdout.write(output); text += output;
  checks.push({command: label, exitCode: p.status, pass: p.status === 0});
}
run('node', ['--version']);
run('actionlint', ['-version']);
run('actionlint', ['-shellcheck=', '-pyflakes=', '.github/workflows/ci.yml', '.github/workflows/release.yml']);
run('npm', ['run', 'build']);
run('npm', ['test']);
run('npm', ['run', 'publish:preview']);
let policy;
try { policy = audit(); } catch (error) { policy = {ok: false, error: error.message, policies: [], scenarios: []}; }
const originalLog = console.log;
console.log = (...args) => { originalLog(...args); text += args.join(' ')+'\n'; };
if (policy.error) console.log('FAIL policy parsing: '+policy.error); else printAudit(policy);
console.log = originalLog;
const ok = checks.every(c => c.pass) && policy.ok;
const sha = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const report = {mode, time: new Date().toISOString(), checks, ...policy, ok,
  workflowSha256: sha('.github/workflows/release.yml'),
  applicationSha256: sha('dist/app.js'),
  limits: ['Event model covers six supplied scenarios only.', 'No real registry publication, tag protection, approvals or production credentials were exercised.', 'Optional shellcheck and pyflakes are disabled.']};
fs.writeFileSync(`evidence/${mode}.json`, JSON.stringify(report, null, 2)+'\n');
fs.writeFileSync(`evidence/${mode}.txt`, text+`\nOVERALL ${ok ? 'PASS' : 'FAIL'}\n`);
console.log(`\nOVERALL ${ok ? 'PASS' : 'FAIL'}; evidence/${mode}.txt and .json saved`);
process.exitCode = ok ? 0 : 1;
