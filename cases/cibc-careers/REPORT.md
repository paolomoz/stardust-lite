# cibc-careers — report (template run, blocks-first v2.9 method, 2026-10-03)

Source https://www.cibc.com/en/about-cibc/careers.html → `aemcoder-adobe/sdt-cibc` branch `blocks-first`, document `/drafts/careers`
(+ `/drafts/nav`, `/drafts/footer`, media `/drafts/media/`), preview only. Served: https://blocks-first--sdt-cibc--aemcoder-adobe.aem.page/drafts/careers

## Numbers

| width | prototype r7 | served | Δh (live − build) | noise floor |
|---|---|---|---|---|
| 360 | 5.95 % | 5.83 % | 54 / 53 (the live document's 54-px band below the footer; content sections within 4 px) | — |
| 1440 | 2.39 % | 2.39 % | +1 / +1 | 0.00 % (Δh 0, two captures of one session) |
| 2560 (probe = max(2560, 1200 × 1.25)) | 1.51 % | 1.51 % | +1 / +1 | — |

cap-probe PASS 0 of 13 rows failed (content cap 1200 px, module kind, fluid shell). Motion: hover parity on 5 of 5 probed states
(hover-diff both sides), click-state parity on the second tab panel and the terms accordion, the outlined button's 300 ms transition
paired; 8 "missing" rows are the source's JS class toggles (register). Leak table prototype vs served: **0 differing lines** over 30
wrappers at 1440. Lint PASS 0 🔴 (4 🟡 justified in LINT.md). Rounds: 0 table rounds (57 texts; the 2 "not in the capture" are the
hero's `<br>` paragraph and the composite link row), 7 gate rounds (r0 9.93 / 16.02 / 2.27 → r7 2.39 / 5.95 / 1.51).

## Clock (TIMELINE.md)

setup 2.6 min · t0 10:31:14Z · measure done +3 · triage + lint +10 · first prototype +25 · first < 10 % at 1440 +36 (r2) · at the
three widths +52 (r6) · probes +54 · pushed + synced (11 s) +57 · served gate +59.

## Blocks (8, all new on an empty inventory)

| block | shape | rows × cols | note |
|---|---|---|---|
| `section-nav` | simple | 1 × 1 (list) | sticky section at ≥ 900 (`main` is the tall parent), hidden below |
| `hero` | simple | 3 × 1 | desktop picture → band background (cover, 100 % 0), mobile picture → `<source>`; card 580 at x 130 |
| `tabs` | container | 2 label rows + 12 × 4 | ≥ 900 tablist + first panel; < 900 the source's closed accordion; label rows are the own rows |
| `columns (callout)` | container | 1 × 2 | decorate marks `columns-img-left/right`; the two source callouts pad their text differently |
| `cards (icons)` | container | 3 × 2 | 380-px cards, icon 80, h3 Medium 26/36, p 18/27.9 with 14 px above |
| `cards (illustrated)` | container | 3 × 3 | third cell = tile tone (`blue` / `teal` / `pink`): the SVGs are transparent, the source paints the ground |
| `accordion` | container | 1 × 2 | the terms aside between main and footer; `<details>` |
| `header` / `footer` | fragments | nav 3 sections, footer 5 (with `columns (tools)` 1 × 2, `columns (links)` 1 × 4) | header: utility 40 + logo 118 + section bar 62; mobile 70 + 50 pinned bar |

## What the document got wrong or left out (for BACKLOG)

1. **Bot-managed origin, no tier in the instruments.** Headless Chromium gets `ERR_HTTP2_PROTOCOL_ERROR`; real Chrome in headless
   mode (`channel: 'chrome'`) passes. Only `probe-load` and the vendored tools have `--headed`; every `scripts/*` instrument launches
   `chromium.launch()`. The case wrote `scripts/chrome-tier.mjs` (a `--import` preload patching `chromium.launch`, applied via
   `NODE_OPTIONS` so `gate`'s children inherit it). BACKLOG #1 open since fidelity-home — the generic fix is a channel flag in
   `common.mjs` read by every launch, plus a hint printed by `probe-load` on an HTTP2 reset.
2. **A sticky layer that leaves the flow is read by nothing before the gate.** The 360 mobile section bar pins `fixed` at scrollY ≥ 70
   and the content jumps 50 px; `probe-load` (fixed layers at scrollY 0: none), `sections`/`pair` (DOM at rest: within 5 px) and the
   noise floor (both captures agree) were all blind; the 360 number sat at 15 % for three rounds until the chunk-top crop and
   `scroll-probe` named it. The first look should read the layers at scrollY 0 and after one viewport and report a layout shift.
3. **The prototype `sections` table pairs by anchor only**; one build section without a located anchor (the intro) shifted every
   later row by one on every round (`#6 +209, #8 −175 …`). `gate --per-section` already pairs by index when the counts match (#161).
4. **A red photo band had a layout cause the tables cannot name**: `img { height: 100% }` inside a `picture` kept at `height: auto`
   by the reset letterboxed the hero (62 % of one band, one round). `gate` could print the hottest band's `shift-probe` luminance
   ratio and the largest image's painted extent vs its box.
5. **`author` cannot start on an empty inventory** (#189 again): three documents typed by hand from `content-view`, 150 lines.
6. **Icon fonts** (#90/#187): 14 glyphs drawn by hand; a glyph-to-SVG reading from the font file is still a case script.
7. `site-profile init` read the body row from the footer (14px/22.75 white) and left 12 fields null (da, overlays, cap main, noise
   floor) although `measure/summary.json`, the gate logs and REGISTER hold them (#132 open). `block-inventory scan` has no budgets
   because the served gate ran without `--per-section`.
8. Small: `crop`'s third positional is a divisor; the first-look note says "add them to --roots" while `measure-page` has no such flag
   and dumps them anyway; `harness` refused a stale port without naming its owner; hover underlines drawn as borders enter layout.

## Residuals (register rows)

Medallia feedback tab (fixed, third-party), the live 360 document's 54-px band below the footer, the footer's mobile accordions
(headings only), icon drawings, two footer heading offsets (10 px), "Manage your meeting" 10 px, the live JS class toggles the motion
sampler counts.
