# home — www.marriottvacationsworldwide.com/ (home template), 2026-10-01

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-marriottvacationsworldwide`, branch `blocks-first` (main untouched); DA `/drafts/home|nav|footer` +
`/drafts/media/*` (32 images, the hero mp4 and its poster), preview only, nothing published.
Served page: https://blocks-first--sdt-marriottvacationsworldwide--aemcoder-adobe.aem.page/drafts/home
A WordPress / Kadence origin: Splide hero slider with a Brightcove player, AOS entrances, Kadence Pro modals, OneTrust consent that
reloads the page on accept.

Committed: `doc/` (generator + the three authored documents), `measure/` (live-spec JSON per width, content dumps and views, cap.json,
structure dumps, deep probes, nav panel dumps, click states, the brand modals' content, the Brightcove playback JSON, the Google Fonts CSS),
`motion/` (probes, live/build hover diffs, click states on build and served), `gate/` and `gate-served/` (pixel JSON, gate logs per round,
section tables, pairings, leak tables), `scripts/` (instruments written for this case). Not committed (regenerate): captures (`*.png`:
`npx stardust-lite stitch-shot <url> … --settle --consent '#onetrust-accept-btn-handler' --locale en-US`), `media/` (`npx stardust-lite
media-fetch measure/content-1440.json measure/content-360.json --out media`; the hero mp4 from the Brightcove playback API — see REGISTER),
`proto/` (harness serve dir: `npx stardust-lite serve proto --port 8977 --site <repo>` then `npx stardust-lite harness doc/home.html --serve
proto --name home --port 8977 --fragments https://blocks-first--sdt-marriottvacationsworldwide--aemcoder-adobe.aem.page --content
measure/content-1440.json,measure/modals-content.json`), the captured DOM dumps (`measure/dom-*.html`, written by `live-spec`).
