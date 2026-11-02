# Action reference inventory

Preparation lookup: 2026-11-02. These are reference literals, not an audit result.
Resolve and review the official repositories again if preparing a later recording.

| Action | Official commit resolved from v7 |
|---|---|
| actions/checkout | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| actions/setup-node | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| actions/upload-artifact | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |


Official commit links:
- https://github.com/actions/checkout/commit/3d3c42e5aac5ba805825da76410c181273ba90b1
- https://github.com/actions/setup-node/commit/949feb2413d6458794dcd2491c4babbbce0c15c1
- https://github.com/actions/upload-artifact/commit/cf430e030ddbb5b0abf93d22962f4752f3646cd9


GitHub guidance:
- https://docs.github.com/en/actions/reference/security/secure-use
- https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository

Full-SHA pinning is a scoped safeguard here. It does not establish that the action
code is safe or secure transitive dependencies. Consider current workflow
dependency lockfile guidance in a separate production review.
