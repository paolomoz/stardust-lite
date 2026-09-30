# stardust-lite

High-fidelity migration of a web page to AEM Edge Delivery Services, **blocks-first**: measure the source, triage the content model
(David's Model), author the document, write the blocks, let the runtime produce the prototype, gate it at three widths, deploy the same
document and code, gate again. One method document, a dozen instruments, cases as evidence.

This is an experiment: can the stardust plugin (100 markdown files, ~30 k lines of prose, 128 scripts) be rebuilt from the ground up
in a form that fits in one reading, and reach the same or better fidelity? The starting point is the procedure that transferred without
loss in the first two pilots.

| | stardust plugin | stardust-lite at start |
|---|---|---|
| prose | ~30,000 lines | `METHOD.md`, 117 lines |
| instruments | 128 scripts | 15 scripts + 8 vendored tools |
| fidelity.com home (2026-09-30) | — | 0.85 % at 1440, served page = prototype |

## Layout

- `METHOD.md` — the procedure. Every rule traces to a case; `BACKLOG.md` holds what the cases found wrong or missing.
- `scripts/` — the instruments (Node + Playwright): `live-spec`, `scroll-probe`, `harness`, `sections`, `pair`, `leak`, `gate`,
  `measure-view`, `measure-to-spec`, `origin-pick`, `spec-view`.
- `tools/` — vendored, unmodified, from Adobe's stardust plugin (Apache-2.0, see `NOTICE`): `replica/` capture and compare tools
  (`stitch-shot`, `pixel-compare`, `cap-probe`, `motion-observe`, `motion-compare`, `measure`, `anchor`), `diff/live-session.mjs`
  (their live-page session), `lint/davids-model-lint.mjs` + `davids-model.md`.
- `cases/<site>-<template>/` — one folder per run: triage table, deviations and motion registers, lint result, measurement tables,
  gate tables and report. Captures and media are regenerated, not committed.

## Setup

```sh
npm i                      # playwright, pixelmatch, pngjs
npx playwright install chromium
npm run check              # syntax of every script and tool
```

Bot-managed origins need the tools' `--headed` tier (real Chrome installed). DA / aem.page calls need an IMS bearer token in `DA_TOKEN`.

## Run (per template)

| step | command |
|---|---|
| 1 measure | `node tools/replica/cap-probe.mjs <url> --out cap.json` · `node tools/replica/stitch-shot.mjs <url> live-<W>.png --width <W> --settle` (×3 widths, 1440 twice for the noise floor) · `node scripts/live-spec.mjs <url> <W> --out measure --sections <css>` or, when the origin blocks headless, `node tools/replica/measure.mjs <url> --headed --selectors … --json --out m.json` then `node scripts/measure-to-spec.mjs` · `node tools/replica/motion-observe.mjs <url> motion-live.json --headed --hover … --click …` |
| 2–3 triage, author, lint | write the triage table and the registers, generate the documents, `node tools/lint/davids-model-lint.mjs doc/` |
| 4 blocks | in the site repo, on a branch |
| 5 prototype | `node scripts/harness.mjs doc/home.html --serve proto --name home --port 89xx` (serve dir symlinks the site's `scripts blocks styles fonts icons`) |
| 6 gate | `node scripts/gate.mjs --live <url> --build http://localhost:89xx/home.harness.html --out gate [--probes probes.txt]` · `node scripts/sections.mjs spec-<W>.json <build>` · `node scripts/pair.mjs spec-<W>.json <build>` before every CSS change |
| 7 deploy + gate | same document to DA, preview on the branch, `gate.mjs` against the served URL, `node scripts/leak.mjs <url> --sels sels.txt` on both and diff |

Definition of done: three-width pixel table with the noise floor, cap-probe PASS at the probe width, motion-compare parity, lint clean at
step 2, served page within the prototype's numbers, leak table identical.

## Cases

| case | date | prototype 360 / 1440 / probe | served | rounds |
|---|---|---|---|---|
| `baincapital-home` | 2026-09-29/30 | 34.6 / 27.2 / 23.3 | 34.4 / 23.8 / 23.6 | — (v1 → v2 of the method) |
| `fidelity-home` | 2026-09-30 | 10.49 / 0.85 / 3.66 | 10.40 / 0.85 / 3.61 | 3 CSS rounds + 1 origin round |

Next: one static-CMS site and one JS-heavy site, each passing the lint at step 2 and holding its prototype number on the served page.
