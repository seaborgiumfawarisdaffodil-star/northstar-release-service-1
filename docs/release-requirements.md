# Release requirements

1. The synthetic jobs only need contents: read. No job may escalate that scope.
   Do not add packages: write, contents: write, or id-token: write for the mock publisher.
2. Every external action reference in both workflows must use a verified full
   40-character commit SHA from its official repository. Keep the action identity
   and relevant inputs unchanged. Full SHAs do not replace action source review.
3. The release workflow must be eligible only for push events on tags beginning
   with v. Main/feature branches, pull requests, manual dispatches, and other
   tags must not reach its publish job. v* is a prefix convention, not a strict
   semantic-version validator or proof that a tag is authorized.
4. CI must still build and test the application on pushes and pull requests.
   Preserve the existing local mock-publish and artifact-upload steps.
5. Validate YAML with actionlint, build/type checking with TypeScript, existing
   functional tests, and the six supplied event scenarios. Review the final GitHub
   diff and actual available CI result; do not call queued or failed checks passed.
6. Repository Settings > Actions > General and Settings > Rules > Rulesets are
   separate evidence. Read-only defaults do not cap explicit workflow permissions.
   An empty ruleset list does not prove there is no older tag-protection mechanism.
   Record only what is visible. Do not change account or repository settings on video.
7. Production approval additionally needs authorized/protected release tags,
   appropriate environment approval, reviewed publishing identity/credentials,
   provenance/artifact integrity and an observed real publishing run. These are
   outside this safe mock's scope; state that gap explicitly in the decision.

See scripts/check-policy.mjs for the deliberately limited event model. It reads
YAML 1.2, tests policy and models this fixture's literal publish-job condition.
It does not reproduce the complete GitHub expression engine, action internals,
repository configuration, tag rules, environments or runner behavior.
