# travelers-home — copied from aemcoder-adobe/sdt-travelers `migration/cases/home` (the site repo holds measure/, motion/, gate/, gate-served/)

# home — www.travelers.com/ (home template), 2026-09-30

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-travelers`, branch `blocks-first`; DA `/drafts/home|nav|footer` + `/drafts/media/*`, preview only.

Committed: `doc/` (generator + the three authored documents), `measure/` (live-spec JSON per width, spec views, deep probes,
structure dumps, cap.json, nav trees, icon inventory), `motion/` (live/build/served observations, probes, compares, deep hover
diffs), `gate/` and `gate-served/` (pixel JSON per round, logs, leak tables, cap-probe compare), `scripts/` (instruments written
for this case, see REPORT.md). Not committed (regenerate): the captures (`*.png`: `npx stardust-lite stitch-shot <url> … --settle`),
`media/` (the page's images fetched from asset.trvstatic.com, uploaded to DA `/drafts/media/`), `proto/` (harness serve dir:
symlinks to the site repo + `drafts/*.plain.html`, served with `python3 -m http.server 8940 --directory proto`).
