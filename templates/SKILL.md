---
name: stardust-lite
description: Migrate one web page to AEM Edge Delivery Services with high fidelity, blocks-first — measure the source at three widths, triage the content model (David's Model), author the document, write the blocks, gate the runtime prototype pixel-by-pixel, deploy to DA and gate the served page. Use when asked to migrate, replicate or prototype a page in EDS with a fidelity number.
---

# stardust-lite (installed in this site repo)

The procedure is `{{ROOT}}/METHOD.md`. Read it in full before doing anything, then `{{ROOT}}/BACKLOG.md` (known gaps; cite, do not
re-solve). This repository is the **site** being migrated: blocks, styles and scripts are written here; the evidence of every run goes
to `migration/cases/<template>/` (REPORT.md, REGISTER.md, LINT.md, tables — captures are not committed).

Instruments run with `npx stardust-lite <name> [args]` (`npx stardust-lite list`; each prints usage without arguments):
`cap-probe`, `stitch-shot`, `pixel-compare`, `measure`, `motion-observe`, `motion-compare` (capture and compare),
`probe-load`, `probe-structure`, `content-dump`, `content-view`, `media-list`, `media-fetch`, `live-spec`, `scroll-probe`, `deep-probe`, `video-frame`, `measure-to-spec`,
`measure-view`, `origin-pick` (measurement), `lint` (David's Model), `da-put`, `sync-poll` (DA upload + preview, code sync),
`serve`, `harness`, `gate`, `sections`, `pair`, `leak`, `hover-diff`, `click-state` (prototype and gate).

Rules that do not bend: the source is measured, never cloned; triage and lint before any block exists; the gated prototype is the
runtime harness page at 360 / 1440 / probe width against a cached origin with a noise floor; a CSS round changes only what the section
table and the pairing name; deploy the same document and code to a draft path, preview only, and gate the served page.
