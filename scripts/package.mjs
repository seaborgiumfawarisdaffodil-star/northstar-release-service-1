import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const root = process.cwd();
function run(cmd, args, options = {}) {
  const p = spawnSync(cmd, args, {...options, encoding: options.encoding === null ? null : 'utf8'});
  if (p.status !== 0) throw new Error(`${cmd} failed: ${p.stderr?.toString() || p.error?.message || p.status}`);
  return p.stdout;
}
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const pdfPath = 'evidence/final output 2.pdf';
const pdf = fs.readFileSync(pdfPath);
if (pdf.length < 200 || !pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('Export the real Notion PDF first');
const verification = JSON.parse(fs.readFileSync('evidence/verification.json', 'utf8'));
if (!verification.ok || verification.workflowSha256 !== sha(fs.readFileSync('.github/workflows/release.yml')) ||
    verification.applicationSha256 !== sha(fs.readFileSync('dist/app.js'))) throw new Error('Run npm run verify again for the current files');
if (!fs.existsSync('evidence/baseline.json')) throw new Error('Missing recorded baseline evidence');
run('git', ['diff', 'HEAD', '--exit-code']);
const original = run('git', ['rev-parse', 'original']).trim();
const final = run('git', ['rev-parse', 'HEAD']).trim();
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'release-review-'));
for (const [folder, ref] of [['input 1', 'original'], ['final output 1', 'HEAD']]) {
  const dest = path.join(stage, folder); fs.mkdirSync(dest);
  const archive = run('git', ['archive', '--format=tar', ref], {encoding: null});
  run('tar', ['-x', '-C', dest], {input: archive});
}
const output = path.join(stage, 'final output 1');
fs.cpSync('evidence', path.join(output, 'evidence'), {recursive: true,
  filter: src => path.resolve(src) !== path.resolve(pdfPath)});
fs.cpSync('release-preview', path.join(output, 'release-preview'), {recursive: true});
fs.writeFileSync(path.join(output, 'evidence', 'workflow-change.diff'), run('git', ['diff', 'original', 'HEAD', '--', '.github/workflows']));
fs.copyFileSync(pdfPath, path.join(stage, 'final output 2.pdf'));
fs.writeFileSync(path.join(output, 'evidence', 'package-manifest.json'), JSON.stringify({
  originalCommit: original, finalCommit: final, notionPdfSha256: sha(pdf),
  releaseWorkflowSha256: verification.workflowSha256,
}, null, 2)+'\n');
const zipPath = path.join(root, 'Deliverables.zip');
fs.rmSync(zipPath, {force: true});
run('zip', ['-qr', '-X', zipPath, 'input 1', 'final output 1', 'final output 2.pdf'], {cwd: stage});
console.log(run('unzip', ['-t', zipPath]).trim());
console.log('\nZIP root: input 1/ | final output 1/ | final output 2.pdf');
console.log('Notion PDF SHA-256: '+sha(pdf));
console.log('Deliverables.zip SHA-256: '+sha(fs.readFileSync(zipPath)));
console.log('Saved: '+zipPath);
fs.rmSync(stage, {recursive: true, force: true});
