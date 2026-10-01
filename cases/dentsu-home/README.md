# home — www.dentsu.com/ (home template), 2026-10-01

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-dentsu`, branch `blocks-first` (main untouched); DA `/drafts/home|nav|footer` + `/drafts/media/*`, preview only.
Served page: https://blocks-first--sdt-dentsu--aemcoder-adobe.aem.page/drafts/home

The origin serves the **Switzerland edition** of the home page at `/` to this operator's IP (server-side geo; `Accept-Language` and
`?global=true` choose other editions — see REGISTER.md). A light-DOM Kentico site: OneTrust bottom bar (`#onetrust-accept-btn-handler`),
no geo modal, header absolute over a 100vh hero, rellax parallax on four elements, no video.

Committed: `doc/` (generator + the three authored documents), `measure/` (live-spec JSON per width + DOM dumps, content dump and view,
media list and manifest, structure dumps, cap.json, deep probes live/build, css-props probes), `motion/` (scroll ladder, live/build
motion observations, probes, click-state dumps, deep hover diffs), `gate/` and `gate-served/` (section tables, pairings, pixel JSON per
round, gate logs, leak tables), `scripts/` (instruments written for this case, see REPORT.md). Not committed (regenerate): the captures
(`*.png`: `npx stardust-lite stitch-shot https://www.dentsu.com/ live-<W>.png --width <W> --settle --consent '#onetrust-accept-btn-handler'`),
`media/` (`npx stardust-lite media-fetch measure/content-1440.json --out media --extra https://www.dentsu.com/assets/images/main-logo-alt.png`),
`proto/` (harness serve dir: `npx stardust-lite serve proto --port 8962 --site ../../..` then `npx stardust-lite harness doc/home.html
--serve proto --name home --port 8962 --fragments https://blocks-first--sdt-dentsu--aemcoder-adobe.aem.page --content measure/content-1440.json`).

---
Copied into stardust-lite from `sdt-dentsu/migration/cases/home` (2026-10-01) with README, REPORT, REGISTER, LINT, `doc/` and `scripts/`; the
`measure/`, `motion/`, `gate/`, `gate-served/` tables stay in the site repo. Of the case scripts, `shift-probe.mjs` became `scripts/shift-probe`
(with the luminance ratio that named the hero veil printed on every run), `sbs-crop.mjs` became `crop --vs`, `css-props.mjs` became
`deep-probe --props` / `--anim`; `svg-dump.mjs` (the sprite inventory: which symbol ids, which fills) and `doc/build-doc.py` (the document
generator with the site's media manifest) are the page-specific templates. The case's copies are kept here as they ran (they import
`common.mjs` from the site repo's `node_modules/stardust-lite`).
