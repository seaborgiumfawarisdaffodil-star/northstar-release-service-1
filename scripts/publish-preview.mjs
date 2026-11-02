import fs from 'node:fs';
import crypto from 'node:crypto';
const app = fs.readFileSync('dist/app.js');
fs.mkdirSync('release-preview', {recursive: true});
fs.writeFileSync('release-preview/app.js', app);
fs.writeFileSync('release-preview/manifest.json', JSON.stringify({
  package: 'release-pipeline-review', version: '1.0.0',
  destination: 'LOCAL MOCK ONLY; no registry or release API calls',
  sha256: crypto.createHash('sha256').update(app).digest('hex'),
}, null, 2)+'\n');
console.log('Local mock publish complete: release-preview/app.js and manifest.json');
