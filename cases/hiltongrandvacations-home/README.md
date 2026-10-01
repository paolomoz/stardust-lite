# home — www.hiltongrandvacations.com/en (home template), 2026-10-01

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-hiltongrandvacations`, branch `blocks-first` (main untouched); DA `/drafts/home|nav|footer` + `/drafts/media/*`,
preview only, nothing published. Served page: https://blocks-first--sdt-hiltongrandvacations--aemcoder-adobe.aem.page/drafts/home

Committed: `doc/` (generator `build-doc.mjs` + the three authored documents), `measure/` (live-spec JSON per width with spec views, structure
dumps, content dump and its reading-order view, media list and manifest, cap-probe, deep probes, hidden-state dumps: carousel captions, tab
panels, nav drawer; `clock.txt`), `motion/` (scroll ladder, count-up ladder, hover diffs live and build, click-states), `gate/` and
`gate-served/` (section tables, pairings, gate logs and pixel JSON per round), `scripts/` (instruments written for this case, see REPORT.md).
Not committed (regenerate): the captures (`*.png`: `npx stardust-lite stitch-shot <url> … --settle --consent button.osano-cm-accept-all
--locale en-US`), `media/` (the page's images fetched from ctfassets.apps.onegrandvacation.com with `media-fetch`, plus two hero poster frames
from `scripts/hero-poster.mjs` and two Vimeo thumbnails, uploaded to DA `/drafts/media/`), `proto/` (harness serve dir: `npx stardust-lite
serve proto --port 8947 --site <repo>`).

---
Copied into stardust-lite from `sdt-hiltongrandvacations/migration/cases/home` (2026-10-01) with README, REPORT, REGISTER, LINT, `doc/` and
`scripts/`; the `measure/`, `motion/`, `gate/`, `gate-served/` tables stay in the site repo. Of the case scripts, `hero-poster.mjs` became
`video-frame --box --hide` (an iframe player's box with its overlays hidden), `ticker-ladder.mjs` became `scripts/text-ladder` (any text that
changes with time, with duration and easing), `click-dump.mjs` became `scripts/click-dump` (openPage overlays, `--out` JSON that `harness
--content` accepts as a second source). The case's copies are kept here as they ran (they launch Playwright directly, with the site's selectors
inside `hero-poster.mjs`); `doc/build-doc.mjs` is the page's document generator with its media manifest.
