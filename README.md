# Release pipeline review

Synthetic TypeScript application and GitHub Actions review fixture. All records
use Test User 1 and Example Company. No production system, credential, personal
identifier or registry token is needed. The original workflow is deliberately
unresolved. Do not treat this repository as a deployment template.

## Before recording

Use Node.js 24, npm, Git, zip/unzip, and actionlint 1.7.12 or a compatible current
release. On macOS install actionlint before the recording (`brew install actionlint`).
Run `npm ci`, `npm run build`, and `npm test`. No downloaded tools belong in evidence.
Initialize a clean synthetic GitHub repository and a local git tag named original
at the untouched initial commit. See the external Setup_and_Submission.md.

## During the assessment

- `npm run baseline`: captures real build, tests, YAML lint, local mock-publish,
  policy and six event scenarios. An unresolved safeguard makes the command fail.
  Read the findings rather than treating a failure as a tooling problem.
- Make only justified workflow changes; do not edit the checker or expectations.
- `npm run verify`: repeats the same checks and writes fresh evidence/verification
  .txt and .json. actionlint must be installed; missing tools cause failure.
- Commit the corrected workflow, push the review branch, inspect the GitHub diff
  and actual CI. Do not push a release tag. Put current evidence in Notion.
- Export the actual completed Notion assessment as `evidence/final output 2.pdf`.
  Inspect that exact PDF. Then run `npm run package` with a clean committed tree.

The packager requires a passing current verification report, baseline evidence,
the original tag, a clean tracked tree and an exported PDF. It creates exactly
input 1/, final output 1/, and final output 2.pdf at the ZIP root. It excludes .git,
node_modules and installed tools, includes recorded evidence and mock artifacts,
and reports real SHA-256 digests. It cannot judge PDF content or verify a CI badge.

## Attribution

Application, workflows, scripts, scenarios and task documents: AI-generated before
recording. Official action references and guidance are linked in docs/action-pins.md.
Any assistant-prepared recording script is preparation material only; close all
assistants and disable AI features for the recorded task.
