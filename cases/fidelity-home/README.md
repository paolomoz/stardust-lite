# fidelity-home — www.fidelity.com/ (home template), 2026-09-30

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-fidelity`, branch `blocks-first`; DA `/drafts/home|nav|footer`, preview only.

Committed: `doc/` (generator + the three authored documents), `measure/*.json|*.txt` (measure.mjs runs at 360/1440/2560, the derived
spec-<W>.json, cap.json, disclosures from the archived state), `motion/` (live/build/served observations, probes, compares),
`gate/` and `gate-served/` (pixel JSON per round, leak tables, cap-probe compare). Not committed (regenerate): the captures
(`stitch-shot … --headed --consent '.accept-btn-box a'`), `media-eds/` (Wayback copies of the page's images, uploaded to DA
`/drafts/media/`), `fonts/` (Wayback copies of the four woff2), `proto/` (harness serve dir: symlinks to the site repo).
