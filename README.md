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
- `scripts/` — the instruments (Node + Playwright): `probe-load`, `probe-structure`, `content-dump`, `content-view`, `media-list`,
  `media-fetch`, `live-spec`, `scroll-probe`, `deep-probe`, `click-dump`, `text-ladder`, `video-frame`, `da-put`, `sync-poll`, `serve`, `harness`,
  `sections`, `pair`, `leak`, `gate`, `hover-diff`, `click-state`, `crop`, `shift-probe`, `measure-view`, `measure-to-spec`, `origin-pick`, `spec-view`.
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
Every instrument takes `--consent <css>` (a consent control that reloads the page is waited out), `--dismiss <css,…>` (any other overlay:
geo modal, interstitial), `--locale <tag>` and `--require <css,…>` (composition gate: exit 4 when the session is not the one the origin
was captured in); every measurement waits for `document.fonts.ready`.

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
| 1 measure | `npx stardust-lite probe-load <url> 360,1440,2560` (first look at every gated width: a header fixed at 1440 may scroll at 360) · `npx stardust-lite probe-structure <url> <W> --root main --depth 3` (the section selector) · `npx stardust-lite cap-probe <url> --out cap.json` · `npx stardust-lite stitch-shot <url> live-<W>.png --width <W> --settle` (×3 widths, 1440 twice for the noise floor; a band far above the rest is a composition: pick one, pass its markers as `--require` below) · `npx stardust-lite content-dump <url> <W> --roots header,main,footer --out content.json` then `npx stardust-lite content-view content.json` (full texts, with text-transform) · `npx stardust-lite media-list <url> <W> --out media.json` · `npx stardust-lite media-fetch content.json --out media` (the source's bytes, lower-case names, manifest) · `npx stardust-lite live-spec <url> <W> --out measure --sections <css>` or, when the origin blocks headless, `npx stardust-lite measure <url> --headed --selectors … --json --out m.json` then `npx stardust-lite measure-to-spec` · `npx stardust-lite motion-observe <url> motion-live.json --headed --hover … --click …` · `npx stardust-lite scroll-probe <url> --layers <css> --paint <css> --up` when a layer changes with scroll · `npx stardust-lite click-dump <url> <W> --panel <css> --click <css> … --out clicks.json` for the content a click reveals (captions, tab panels, sub-menus) · `npx stardust-lite text-ladder <url> <W> --sels <css>` for a count-up or any text that changes with time · `npx stardust-lite video-frame <url> <W> poster.png --video <css>` for a hosted `<video>`, `--box <css> --hide <css,…>` for an iframe player |
| 2–3 triage, author, lint | write the triage table and the registers, generate the documents (a standalone picture in `<p>`), `npx stardust-lite lint doc/`; `npx stardust-lite da-put <org>/<site>/<branch> media/* --to drafts/media` and `… doc/*.html --to drafts` (bytes unchanged, preview only; warns on upper case and double hyphens) |
| 4 blocks | in the site repo, on a branch |
| 5 prototype | `npx stardust-lite serve proto --port 89xx --site .` (concurrent server, creates the `scripts blocks styles fonts icons` symlinks) then `npx stardust-lite harness doc/home.html --serve proto --name home --port 89xx --fragments <branch-host> --content measure/content-1440.json,measure/clicks.json` |
| 6 gate | `npx stardust-lite sections spec-<W>.json <build>` · `npx stardust-lite pair spec-<W>.json <build>` at all three widths before every CSS change · between rounds `npx stardust-lite gate --live <url> --build http://localhost:89xx/home.harness.html --out gate --widths <base>` (`--main <css>` for a `main`-less origin; crop the first gate's hottest band before any CSS round; a red photo band: `npx stardust-lite shift-probe live-<W>.png build-<W>.png --x0 … --y1 …` and `crop … --vs build-<W>.png`) · once clean: the three widths with `--probes probes.txt`, plus `hover-diff` / `click-state --hover` (repeat `--click` for a control inside a closed panel) on both sides |
| 7 deploy + gate | same document to DA (`da-put`), push the code, `npx stardust-lite sync-poll <branch-host> . blocks/x/x.css …` until the bus serves the repo's files, `gate … --origin <prototype gate dir>` against the served URL (one origin for both gates), `npx stardust-lite leak <url> --sels sels.txt` on both and diff |

Definition of done: three-width pixel table with the noise floor, cap-probe PASS at the probe width, motion-compare parity, lint clean at
step 2, served page within the prototype's numbers, leak table identical.

## Cases

| case | date | prototype 360 / 1440 / probe | served | rounds |
|---|---|---|---|---|
| `baincapital-home` | 2026-09-29/30 | 34.6 / 27.2 / 23.3 | 34.4 / 23.8 / 23.6 | — (v1 → v2 of the method) |
| `fidelity-home` | 2026-09-30 | 10.49 / 0.85 / 3.66 | 10.40 / 0.85 / 3.61 | 3 CSS rounds + 1 origin round |
| `travelers-home` | 2026-09-30 | 3.26 / 1.09 / 0.57 | 3.28 / 1.10 / 0.57 | 5 CSS rounds (1 void) + 1 served fix; 2 h wall, first prototype at 76 min |
| `ibm-home` | 2026-09-30 | 4.04 / 2.39 / 3.28 | 4.09 / 2.37 / 3.27 | 7 CSS rounds (1 void half-round, 2 on the hero video) + 1 served fix; 108 min wall, first shareable URL at 58 min; shadow-DOM origin, consent + geo modal |
| `walgreens-home` | 2026-09-30 | 8.48 / 2.84 / 1.62 | 8.53 / 2.85 / 1.63 | 4 CSS rounds (none void, 3 on inherited boilerplate rules) + 0 served fixes; 91 min wall, first shareable URL at 50 min; light-DOM AEM Sites origin with three session compositions, a GAM ad slot, personalisation slots |
| `stryker-home` | 2026-09-30/10-01 | 10.27 / 1.98 / 2.21 | 10.36 / 1.94 / 2.19 | 7 harness rounds (none void, 1 regression) + 0 served fixes; 67 min wall, first shareable URL at 46 min; light-DOM AEM Sites (Bootstrap 3) origin, reload-on-consent OneTrust bar, Dynamic Media hosted hero video, per-instance card styling (≈ 8 of the 10.3 % at 360), noise floor 0.00 |
| `usta2-home` | 2026-10-01 | 9.51 / 1.89 / 4.17 | 9.52 / 1.90 / 4.17 | 8 table rounds to the first push + 9 gate rounds (2 regressions, none void) + 0 served fixes; 100 min wall, first shareable URL at 59 min; light-DOM AEM Sites origin without `main`, header fixed at ≥ 900 only, uppercase by CSS, a GAM ad slot, a per-instance separator (≈ 4 of the 9.5 % at 360), noise floor 0.00; leak table 0 lines |
| `audemarspiguet-home` | 2026-10-01 | 4.28 / 2.50 / 1.34 | 4.19 / 2.48 / 1.34 | 6 harness rounds (none void, 1 regression) + 1 served fix (the pipeline's list-item `<p>`); 80 min wall, first shareable URL at 60 min; light-DOM AEM Sites origin with React islands (drawer, language selector), OneTrust + geo redirect, text-reveal line splits, Swiper `autoHeight` carousels, hero videos, noise floor 0.00; leak table 0 lines; every block a Block Collection shape |
| `hiltongrandvacations-home` | 2026-10-01 | 5.91 / 2.76 / 3.29 | 5.94 / 2.76 / 3.28 | 3 table rounds (r0–r2) to the first push + 3 gate rounds (r3–r5, none void) + 0 served fixes; 110 min wall, first shareable URL at 77 min; light-DOM Angular origin, Osano consent bar, Vimeo iframe hero (≈ 80 % of every width's number), two count-ups, Font Awesome Pro icons redrawn, avif media end to end, noise floor 0.10 (the hero frame); leak table 0 lines; cap-probe 11/11 |
| `dentsu-home` | 2026-10-01 | 4.88 / 2.21 / 2.12 | 4.98 / 2.21 / 2.11 | 2 table rounds (r0–r1) to the first push + 5 gate rounds (r2–r6, none void, 1 regression) + 0 served fixes; 55 min wall, first shareable URL at 37 min; light-DOM Kentico origin serving its Switzerland edition by IP, OneTrust bottom bar, header absolute over a 100vh hero, rellax parallax on four elements, no video, noise floor 0.84 (the parallax band); leak table 0 lines; every block a Block Collection shape |

Next: one static-CMS site, passing the lint at step 2 and holding its prototype number on the served page. ibm-home was the JS-heavy
one (Carbon web components); the composed-tree tier it needed is in `common.mjs` (`DEEP_HELPERS`), `deep-probe` and `hover-diff`.
walgreens-home was the session-variable one (three compositions per load); the composition gate it needed is `--require` on every
instrument. stryker-home was the deterministic one (noise floor 0.00): what cost rounds there was the tooling — a consent that reloads,
lazily loaded fonts, a single-threaded server, a truncated content viewer — and those are now `openPage`, `serve`, `harness --content`,
`video-frame`, `da-put` and `sync-poll`. usta2-home was the `main`-less one: what cost rounds there was what no table showed — uppercase
by CSS, a header fixed at one width, a 0-height spacing section, a toggle that closed on the probe's click — and those are now
`text-transform` in `content-dump` / `pair`, `probe-load` per width, `live-spec`'s spacing flag, `click-state --hover`, plus
`content-view` and `media-fetch` promoted after their second per-case rewrite. audemarspiguet-home was the one whose dump was not the page: a
text-reveal library's one-element-per-line paragraphs, a carousel's cards beyond the viewport, boxes read while their entrance transition
ran, a drawer whose served markup differed from the prototype's — and those are now `content-dump` / `live-spec` line runs and lazy `src`,
`pair`'s ⤷ rows, `settle` waiting for images and finite animations, the harness folding the list-item rule and warming the media,
`scroll-probe --paint`.
dentsu-home was the one whose residuals were paint, not layout: a negative-z veil that paints only below 900 px, a gradient under a picture, a
tile the capture caught mid-fade, a parallax torn at the chunk boundaries — read by no table and now by `shift-probe` (best shift, scale,
luminance ratio), `crop --vs` and `deep-probe --props` / `--anim`; `gate --origin` keeps one origin for the prototype and served gates.
hiltongrandvacations-home was the one whose content was not all at rest: a hero whose header sat under a 0-size wrapper, texts that count up
while the capture runs, captions and tab panels that exist only after a click, an iframe player no `<video>` probe can pause — and those are now
`content-dump` walking through 0-size wrappers, `text-ladder`, `click-dump` (a second `harness --content` source), `video-frame --box --hide`
and a repeated `--click` in `click-state`; the body weight, `[hidden]`, `decorateIcons(block)` and the fragment runtime's wrapper are method text.
