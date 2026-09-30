---
name: stardust-lite
description: Migrate one web page to AEM Edge Delivery Services with high fidelity, blocks-first — measure the source at three widths, triage the content model (David's Model), author the document, write the blocks, gate the runtime prototype pixel-by-pixel, deploy to DA and gate the served page. Use when asked to migrate, replicate or prototype a page in EDS with a fidelity number.
---

# stardust-lite

The procedure is `METHOD.md` at the repository root; the working rules for agents are in `AGENTS.md`. This file only routes.

1. Read `METHOD.md` in full (117 lines) and `BACKLOG.md`.
2. Prerequisites table in METHOD.md → produce every artifact before authoring a row. Bot-managed origin: use the tools' `--headed`
   tier; consent or geo interstitial: pass its accept control with `--consent` to every tool.
3. Steps 1–8 of METHOD.md, in order. Commands per step are in `README.md` § Run.
4. Write the case folder as `cases/fidelity-home/` is written (README, REPORT, REGISTER, LINT, tables).

Instruments: `scripts/*.mjs` (each prints usage without arguments). Tools: `tools/replica/*.mjs --help`, `tools/lint/davids-model-lint.mjs --help`.
