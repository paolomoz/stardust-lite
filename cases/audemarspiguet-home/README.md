# home — www.audemarspiguet.com/ch/en/home (home template), 2026-10-01

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-audemarspiguet`, branch `blocks-first`; DA `/drafts/home|nav|footer` + `/drafts/media/*`, preview only.
Served: https://blocks-first--sdt-audemarspiguet--aemcoder-adobe.aem.page/drafts/home

Committed: `doc/` (generator + the three authored documents), `measure/` (probe-load, structure dumps, content dumps and views at 1440 / 360,
the full-text dump `content-full-1440.json`, the drawer dump `nav-1440.json`, live-spec JSON + spec views per width, deep probes, cap.json,
scroll ladders, footer/nav structures), `motion/` (live motion observation, hover diffs live/build, nav scroll ladders live/build/served,
drawer click-states live/build/served), `gate/` and `gate-served/` (round logs, section tables and pairings per round and width, motion
compare, leak tables + diffs, probes), `scripts/` (instruments written for this case, see REPORT.md).
Not committed (regenerate): the captures (`*.png`: `npx stardust-lite stitch-shot https://www.audemarspiguet.com/ch/en/home live-<W>.png
--width <W> --settle --locale en-GB --consent '#onetrust-accept-btn-handler'`), `crops/`, `media/` (the page's bytes fetched from
dynamicmedia.audemarspiguet.com / www.audemarspiguet.com, uploaded to DA `/drafts/media/`), `proto/` (harness serve dir: symlinks to the
site repo, served with `npx stardust-lite serve proto --port 8973 --site ../../..`), `measure/dom-*.html` (live-spec DOM dumps, 450 KB each).

---
Copied into stardust-lite from `sdt-audemarspiguet/migration/cases/home` (2026-10-01) with README, REPORT, REGISTER, LINT, `doc/` and
`scripts/`; the `measure/`, `motion/`, `gate/`, `gate-served/` tables stay in the site repo. Of the case scripts, the generic half of
`content-full.mjs` became `content-dump`'s line-run merge (`lines: N`) and lazy-attribute `src` plus `pair`'s ⤷ rows; the generic half of
`nav-scroll.mjs` became `scroll-probe --paint`; `content-full.mjs` (the site's section selectors), `nav-dump.mjs` (the drawer's menu
selectors), `nav-scroll.mjs` (the bar's state machine) and `doc/build-doc.py` (the document generator with the site's media manifest) are the
page-specific templates.
