---
name: stardust-lite
description: Migrate one web page to AEM Edge Delivery Services with high fidelity, blocks-first — measure the source at three widths, triage the content model (David's Model), author the document, write the blocks, gate the runtime prototype pixel-by-pixel, deploy to DA and gate the served page. Use when asked to migrate, replicate or prototype a page in EDS with a fidelity number.
---

# stardust-lite (installed in this site repo)

The procedure for a **template** (the first page of its kind on this site) is `{{ROOT}}/METHOD.md`. Read it in full before doing anything,
then `{{ROOT}}/BACKLOG.md` (known gaps; cite, do not re-solve). A **page after the template** reads `{{ROOT}}/ROLLOUT.md` instead (one screen:
the per-page commands in order, the stop rule, the escalation rule) together with `migration/site.json` and `migration/blocks.json`; its
evidence is one row in `migration/site-report.json` and `migration/pages/<slug>.md` (`page-report`), not a case folder. This repository is
the **site** being migrated: blocks, styles and scripts are written here (`npx stardust-lite init --foundation` copies `scripts/stardust.js`,
`styles/reset.css` and the `styles.css` / `fonts.css` skeletons once — the site owns them); the evidence of every template run goes to
`migration/cases/<template>/` (REPORT.md, REGISTER.md, LINT.md, tables — captures are not committed).

Instruments run with `npx stardust-lite <name> [args]` (`npx stardust-lite list --usage` prints every usage line in one call; `init --foundation --force` replaces the boilerplate's styles.css / fonts.css with the skeletons):
`cap-probe`, `stitch-shot`, `pixel-compare`, `measure`, `motion-observe`, `motion-compare` (capture and compare),
`measure-page` (step 1 in one session per width: `<url> --out measure --sections <css>` writes probe-load / structure / content / media / spec + dom / deep per width, the stitched live capture `live-<W>.png` the gate reads as its origin, the profile's per-width check (`profile check: PASS|WARN|FAIL`) and `summary.json` — one load per width, the profile's overlays; the single instruments are the targeted re-reads),
`page-run` (`<slug> [--sections <css>] [--main <css>] [--hidden <css,…>] [--triage-sections …] [--accept-draft | --resume] [--no-da]` — ROLLOUT steps 1–7 in one call, each a child process of the instrument it names: measure-page → triage + block-inventory diff → STOP for the review (exit 5) → media-fetch → da-put → author → lint → harness → the section tables at the three widths with their verdict → pair ×3; one step table, `page-run.json`; exit 0 tables CLEAN, 1 rows off, 6 template candidate),
`probe-load`, `probe-structure`, `content-dump`, `content-view`, `media-list`, `media-fetch`, `live-spec`, `scroll-probe`, `deep-probe`, `click-dump`,
`text-ladder`, `video-frame`, `measure-to-spec`,
`measure-view`, `origin-pick` (measurement), `lint` (David's Model), `da-put`, `sync-poll` (DA upload + preview, code sync),
`serve`, `harness`, `gate`, `sections`, `pair`, `leak`, `hover-diff`, `click-state`, `crop`, `shift-probe`, `extent` (prototype and gate; `gate` captures live and build at once in one browser — in-process stitching, `--capture-tool stitch-shot` for the vendored tool —, takes its origin from `--origin <any dir with live-<W>.png>` or the page's `measure/` by default, prints a timing line per width; `sections <build> --widths 360,1440,2560 --spec-dir measure [--blocks … --triage …] --out measure` prints the three tables and `tables: CLEAN — …` / `tables: n row(s) off — …` (`sections-verdict.json`; `gate --skip-widths-when-clean <it>` then gates the prototype at the base width only); on a page after the template `gate` masks the chrome from the profile's heights, prints the pixel % per authored section against its block's budget from `blocks.json` — `--chrome` / `--budget` / `--triage`, `--no-chrome` / `--no-budget` — and `harness --pages`, `gate --pages` / `--served-pages`, `da-put --pages [--dry]` run a `roster pick` list with one summary table),
`site-profile` (init / check / print — `migration/site.json`, the site's state after a template run; every instrument reads it as its flag defaults when present, `--site <file>` names another; `check`'s per-width checks also run inside `measure-page` — run it on its own on a FAIL),
`block-inventory` (scan / diff / print / budgets — `migration/blocks.json`, one row per block + variant the site has: shape, collection, rows × cols, authoring example, source signature, budget per width from the template's served per-section gate table (`gate --per-section`, then `budgets --gate-dir gate-served`; the page's number only until then); written at the end of a template run, read by triage and gate),
`triage` (a page's draft triage table from its content dump, as JSON + markdown: fingerprint, repeat, inventory match with confidence, collection match, default content, rows × cols, novelty — edit the draft, never write the table from nothing),
`author` (`<triage.json> --content <dump>[,clicks,hidden] --blocks migration/blocks.json --media media/manifest.json --out doc/<slug>.html` — the document from the triage and the dump through the inventory's recipes; review the stderr table and the lint, never type a text; a NEW section stops it; `block-inventory scan --cases` / `block-inventory recipe` write the recipes, `triage --from-md` reads your edits back),
`roster` (`--nav` / `--urls <file>` / `--crawl <N>` → `migration/roster.json` + `roster.md`: one light pass per page — content dump, section fingerprints, inventory match, no spec or capture — the coverage matrix pages × blocks, novelty per page, template clusters and candidates, reuse-first / novelty-first orders; `roster pick --n 10 --order reuseFirst|noveltyFirst --out pages.json` writes the rollout's page list; `roster print` re-renders the views from the JSON),
`page-report` (`<slug> --minutes --first-url-minutes --rounds-table --rounds-gate [--new-blocks a,b] [--deviation …]… [--blocked …]… [--note …]…` — the page's row in `migration/site-report.json` from `gate/gate.json` + `gate-served/gate.json`, then `migration/pages/<slug>.md` and `migration/site-report.md`; `--render` re-renders).

Rules that do not bend: the source is measured, never cloned; triage and lint before any block exists; the gated prototype is the
runtime harness page at 360 / 1440 / probe width against a cached origin with a noise floor; a CSS round changes only what the section
table and the pairing name; deploy the same document and code to a draft path, preview only, and gate the served page.
