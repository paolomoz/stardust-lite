# home — www.usta.com/en/home.html (home template), 2026-10-01

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-usta2`, branch `blocks-first`; DA `/drafts/home|nav|footer` + `/drafts/media/*` (75 files, the source's bytes),
preview only, nothing published. v1 pilot (`sdt-usta`, 16.4 % served) untouched; nothing shared with it.

Committed: `doc/` (generator + the three authored documents), `measure/` (live-spec JSON per width, content dumps and reading-order views,
deep probes, structure dumps, cap.json, nav tree, media list, scroll probe), `motion/` (live and build hover diffs, click states, motion
observation), `gate/` (section tables and pairings per round, gate logs, probes, cap-probe compare, pixel JSON), `gate-served/`,
`scripts/` (instruments written for this case, see REPORT.md). Not committed (regenerate): the captures (`*.png`:
`npx stardust-lite stitch-shot https://www.usta.com/en/home.html live-<W>.png --width <W> --settle --consent '#onetrust-accept-btn-handler'`),
`media/` (`python3 scripts/media-fetch.py measure/content-1440.json --extra-file measure/nav-media.txt --out media`), `proto/`
(harness serve dir: `npx stardust-lite serve proto --port 8945 --site ../../..` then the harness command in REPORT.md).

---
Copied into stardust-lite from `sdt-usta2/migration/cases/home` (2026-10-01) with README, REPORT, REGISTER, LINT, `doc/` and `scripts/`;
the `measure/`, `motion/`, `gate/`, `gate-served/` tables stay in the site repo. Of the case scripts, `content-view.py` became
`scripts/content-view.mjs` (second site that wrote one), `media-fetch.py` became `scripts/media-fetch.mjs` (the usta.com origin was
hard-coded here; the instrument takes `--base`), `rects.mjs` became `deep-probe --children`, `panel-state.mjs` became `click-state
--hover` + the `aria-expanded` line; `nav-dump.py` (the site's menu selectors), `outer.mjs` (the runtime outerHTML of one match) and
`doc/build-doc.py` (the document generator with the site's media manifest and nav tree) are the page-specific templates.
