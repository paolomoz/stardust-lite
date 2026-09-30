# home — www.stryker.com/ch/en/index.html (home template), 2026-09-30 → 2026-10-01

Read `REPORT.md` (results, rounds, instruments, method gaps), `REGISTER.md` (triage table, deviations, motion), `LINT.md`.
Site: `aemcoder-adobe/sdt-stryker`, branch `blocks-first` (main untouched); DA `/drafts/home|nav|footer` + `/drafts/media/*`,
preview only, nothing published. Served page: https://blocks-first--sdt-stryker--aemcoder-adobe.aem.page/drafts/home
A light-DOM AEM Sites (Bootstrap 3) origin, geo path `/ch/en` pinned with `--locale en-CH`, a OneTrust consent bar whose accept
button reloads the page (measurement instruments take the close button instead), a Dynamic Media hosted hero video.

Committed: `doc/` (generator + the three authored documents), `measure/` (live-spec JSON per width, structure and content dumps,
deep probes, cap.json, nav tree, ; the source DOM dumps and its two stylesheets — read for the icon-font codepoints — stay local), `motion/` (live/build
observations, probes, deep hover diffs, click states, the back-to-top ladder), `gate/` and `gate-served/` (pixel JSON, logs, section
tables and pairings per round, leak tables), `scripts/` (instruments written for this case, see REPORT.md).
Not committed (regenerate): captures (`*.png`: `npx stardust-lite stitch-shot <url> live-<W>.png --width <W> --settle --consent
'#onetrust-accept-btn-handler' --locale en-CH`), `media/` (the source's bytes fetched from media-assets.stryker.com and
www.stryker.com, uploaded unchanged to DA `/drafts/media/` with `scripts/da-upload-media.sh`), `fonts/` (the source woff2/woff, copied
into the site's `/fonts`), `proto/` (harness serve dir: symlinks to the site repo + the pipeline's `drafts/*.plain.html`, served with
`python3 -m http.server 8971 --directory proto`).

---
Copied into stardust-lite from `sdt-stryker/migration/cases/home` (2026-10-01) with README, REPORT, REGISTER, LINT, `doc/` and
`scripts/`; the `measure/`, `motion/`, `gate/`, `gate-served/` tables stay in the site repo. The `common.mjs` import in `scripts/*.mjs`
is repointed to `../../../scripts/common.mjs`. Of the case scripts, `hero-frame.mjs` became `scripts/video-frame.mjs`, `btt-ladder.mjs`
became `scroll-probe --up`, `da-put-doc.sh` / `da-upload-media.sh` became `scripts/da-put.mjs`, `content-view.py`'s lesson became
`harness --content`; `doc/build-doc.py` (the site's nav parsed from the captured panels) is the page-specific template.
