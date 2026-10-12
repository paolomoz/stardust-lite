# stardust-lite — notes for Claude Code (the working rules are in AGENTS.md)

## Versioning
- `package.json` carries the version. Bump the **patch** (x.x.**1**) for a fix; bump the **minor** (x.**1**.x) for a new feature or a
  breaking change. The bump lands in the same PR as the change, with a line in `CHANGELOG.md`.
- After the PR is merged, tag the merge commit `v<version>` and push the tag; field runs can then pin `github:paolomoz/stardust-lite#v<version>`.
