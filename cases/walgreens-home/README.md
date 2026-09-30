# walgreens-home — copied from aemcoder-adobe/sdt-walgreens `migration/cases/home` (the site repo holds measure/, motion/, gate/, gate-served/). `probe-load`, `probe-structure`, `content-dump` and `media-list` became stardust-lite instruments with this case's PR (`scripts/`); the copies here are the case's originals, their `common.mjs` import repointed to this repo. `nav-dump.mjs` stays a template (it carries the site's menu selectors).

# home — www.walgreens.com/ (home template), 2026-09-30

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-walgreens`, branch `blocks-first`; DA `/drafts/home|nav|footer` + `/drafts/media/*` (66 files, the
source's own bytes), preview only, nothing published. Served page: https://blocks-first--sdt-walgreens--aemcoder-adobe.aem.page/drafts/home

A light-DOM AEM Sites origin (Akamai bot manager present, headless Chromium with the real-Chrome UA gets the full page), with three
session-variable regions (an Adobe Target alert, a personalised coupon carousel or a sponsored banner in the same slot, a Google ad
slot) — the origin was captured in one composition and the 360 origin picked by region.

Committed here: `doc/` (generator + the three authored documents), `measure/` (live-spec JSON per width, spec views, structure and
content dumps, nav dumps, media map, deep probes, cap.json, selector lists), `motion/` (live/build hover diffs, probes, motion
observations and compares), `gate/`, `gate-served/` (pixel JSON, leak tables, cap-probe compare), `scripts/` (instruments written
for this case). Not committed (regenerate): captures (`*.png`: `npx stardust-lite stitch-shot <url> … --settle`), `media/` (the
source's images, uploaded to DA `/drafts/media/`), `proto/` (harness serve dir: symlinks to the repo + `drafts/*.plain.html`, served
with `python3 -m http.server 8960 --directory proto`).
