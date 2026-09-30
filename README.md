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
- `scripts/` — the instruments (Node + Playwright): `live-spec`, `scroll-probe`, `deep-probe`, `harness`, `sections`, `pair`, `leak`, `gate`,
  `hover-diff`, `click-state`, `crop`, `measure-view`, `measure-to-spec`, `origin-pick`, `spec-view`.
- `tools/` — vendored, unmodified, from Adobe's stardust plugin (Apache-2.0, see `NOTICE`): `replica/` capture and compare tools
  (`stitch-shot`, `pixel-compare`, `cap-probe`, `motion-observe`, `motion-compare`, `measure`, `anchor`), `diff/live-session.mjs`
  (their live-page session), `lint/davids-model-lint.mjs` + `davids-model.md`.
- `cases/<site>-<template>/` — one folder per run: triage table, deviations and motion registers, lint result, measurement tables,
  gate tables and report. Captures and media are regenerated, not committed.

## Setup (working on stardust-lite itself)

```sh
npm i                      # playwright, pixelmatch, pngjs
npx playwright install chromium
npm run check              # syntax of every script and tool
```

Bot-managed origins need the tools' `--headed` tier (real Chrome installed). DA / aem.page calls need an IMS bearer token in `DA_TOKEN`.
Every instrument takes `--consent <css>`, `--dismiss <css,…>` (any other overlay: geo modal, interstitial) and `--locale <tag>`.

## Use from a site repo (the normal way)

stardust-lite is a tool the **site being migrated** installs; the site repo holds the blocks and the evidence, this repo holds the
method and the instruments.

```sh
cd <site-repo>                                   # the EDS boilerplate clone
npm i -D github:paolomoz/stardust-lite           # or a pinned ref: github:paolomoz/stardust-lite#<sha>
npx playwright install chromium
npx stardust-lite init                           # writes .github/skills/stardust-lite/SKILL.md, .claude/skills/…, an AGENTS.md section,
                                                 # migration/cases/ and .gitignore lines
npx stardust-lite list                           # instruments; each prints usage without arguments
npx stardust-lite method                         # path of METHOD.md — the agent reads this first
```

A clean Copilot or Claude Code session opened in the site repo then finds the skill and `AGENTS.md`, reads `node_modules/stardust-lite/METHOD.md`
and runs `npx stardust-lite <instrument>`. Evidence goes to `migration/cases/<template>/`. Nothing under `node_modules/stardust-lite` is edited;
method changes and new instruments are pull requests here, traced to a case.

## Run (per template)

| step | command |
|---|---|
| 1 measure | `npx stardust-lite cap-probe <url> --out cap.json` · `npx stardust-lite stitch-shot <url> live-<W>.png --width <W> --settle` (×3 widths, 1440 twice for the noise floor) · `npx stardust-lite live-spec <url> <W> --out measure --sections <css>` or, when the origin blocks headless, `npx stardust-lite measure <url> --headed --selectors … --json --out m.json` then `npx stardust-lite measure-to-spec` · `npx stardust-lite motion-observe <url> motion-live.json --headed --hover … --click …` |
| 2–3 triage, author, lint | write the triage table and the registers, generate the documents, `npx stardust-lite lint doc/` |
| 4 blocks | in the site repo, on a branch |
| 5 prototype | `npx stardust-lite harness doc/home.html --serve proto --name home --port 89xx` (serve dir symlinks the site's `scripts blocks styles fonts icons`) |
| 6 gate | `npx stardust-lite sections spec-<W>.json <build>` · `npx stardust-lite pair spec-<W>.json <build>` at all three widths before every CSS change · between rounds `npx stardust-lite gate --live <url> --build http://localhost:89xx/home.harness.html --out gate --widths <base>` · once clean: the three widths with `--probes probes.txt`, plus `hover-diff` / `click-state` on both sides |
| 7 deploy + gate | same document to DA, preview on the branch, `gate` against the served URL, `npx stardust-lite leak <url> --sels sels.txt` on both and diff |

Definition of done: three-width pixel table with the noise floor, cap-probe PASS at the probe width, motion-compare parity, lint clean at
step 2, served page within the prototype's numbers, leak table identical.

## Cases

| case | date | prototype 360 / 1440 / probe | served | rounds |
|---|---|---|---|---|
| `baincapital-home` | 2026-09-29/30 | 34.6 / 27.2 / 23.3 | 34.4 / 23.8 / 23.6 | — (v1 → v2 of the method) |
| `fidelity-home` | 2026-09-30 | 10.49 / 0.85 / 3.66 | 10.40 / 0.85 / 3.61 | 3 CSS rounds + 1 origin round |
| `travelers-home` | 2026-09-30 | 3.26 / 1.09 / 0.57 | 3.28 / 1.10 / 0.57 | 5 CSS rounds (1 void) + 1 served fix; 2 h wall, first prototype at 76 min |
| `ibm-home` | 2026-09-30 | 4.04 / 2.39 / 3.28 | 4.09 / 2.37 / 3.27 | 7 CSS rounds (1 void half-round, 2 on the hero video) + 1 served fix; 108 min wall, first shareable URL at 58 min; shadow-DOM origin, consent + geo modal |

Next: one static-CMS site, passing the lint at step 2 and holding its prototype number on the served page. ibm-home was the JS-heavy
one (Carbon web components); the composed-tree tier it needed is in `common.mjs` (`DEEP_HELPERS`), `deep-probe` and `hover-diff`.
