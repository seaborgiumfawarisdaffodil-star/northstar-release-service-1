# REL-204 — Review release workflow permissions, action provenance and triggers

Example Company needs a release-readiness assessment before this synthetic pipeline
is adapted for production. Audit the configuration against release-requirements.md.
Investigate permissions, external action references, and which events can reach
the publish job. Keep the TypeScript application and intended build steps intact.

The publishing command is intentionally a **local mock**: it creates
release-preview/app.js and manifest.json. Upload-artifact archives those files in
GitHub Actions. There is no npm publication, GitHub Release creation, registry
credential, production secret or production system.

Use available local checks and actual GitHub results. Provide a concise risk
matrix, before/after review, evidence, limitations, and one production APPROVE or
HOLD recommendation in Notion. A passing mock build alone is insufficient for
production approval. Do not introduce credentials or publish a release tag merely
to complete this exercise.
