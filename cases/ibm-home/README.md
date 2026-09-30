# ibm-home — copied from aemcoder-adobe/sdt-ibm `migration/cases/home` (the site repo holds measure/, motion/, gate/, gate-served/)

# home — www.ibm.com/us-en (home template), 2026-09-30

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-ibm`, branch `blocks-first`; DA `/drafts/home|nav|footer` + `/drafts/media/*`, preview only.
A Carbon web-components origin (161 shadow roots, no `main`), a consent bar plus a geo-mismatch modal, a Kaltura hero video.

Committed here: `doc/` (generator + the three authored documents), `scripts/` (the composed-tree probes and the content dumps written
for this case; the general parts moved into `scripts/common.mjs`, `deep-probe.mjs`, `hover-diff.mjs` with this case's PR).
Not committed: captures, media, the harness serve dir (see the site repo's `migration/cases/home/README.md`).
