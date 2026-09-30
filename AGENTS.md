# Working in this repository (agents)

This repo migrates one web page at a time to AEM Edge Delivery Services with high fidelity. **Read `METHOD.md` first and follow it
step by step**; it is short on purpose. `BACKLOG.md` lists what earlier runs found wrong or missing — do not re-solve those, cite them.

## Environment
- Node ≥ 20, `npm i`, `npx playwright install chromium`. Real Google Chrome installed if the source is bot-managed (the tools' `--headed` tier).
- `DA_TOKEN` (Adobe IMS bearer, ~24 h) for `admin.da.live` and `admin.hlx.page`; `gh auth login` for the site repo. Never print tokens.
- The capture and compare tools are in `tools/` (vendored, unmodified — do not edit them; write new instruments under `scripts/`).

## Rules that are not negotiable
- The source is measured, never cloned: no copying of source DOM or CSS. Values come from `live-spec` / `measure` output.
- Triage the content model before any block exists; run `tools/lint/davids-model-lint.mjs` on the authored document at that point.
  A 🔴 is a modelling defect to fix in the model.
- The gated prototype is the runtime harness page (`scripts/harness.mjs`), at 360, 1440 and the probe width, against a cached origin
  with a noise floor. Read the section table (`sections.mjs`) and the pairing (`pair.mjs`) before every CSS change; a round may only
  change the properties those tables name.
- Deploy the same document and code to a draft path on a branch, preview only, and gate the served page again; diff `leak.mjs` on both.
- Every run is a case: `cases/<site>-<template>/` with `REPORT.md`, `REGISTER.md` (triage, deviations, motion), `LINT.md`, tables.
  Captures and media are not committed. Every method change must close a `BACKLOG.md` item with a case run.
