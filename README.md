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

- `METHOD.md` — the procedure, per template. Every rule traces to a case; `BACKLOG.md` holds what the cases found wrong or missing. `ROLLOUT.md` — the
  procedure for a page after the template (one screen: the commands in order, the stop rule, the escalation rule, the evidence a page leaves).
- `scripts/` — the instruments (Node + Playwright): `measure-page` (step 1 in one session per width: one load, then probe-load's first look,
  the structure dump, the content dump, the media list, the spec + DOM, the deep-probe set, the stitched live capture `live-<W>.png` the gate reads as
  its origin and the site profile's per-width check, byte-compatible with the single instruments), `page-run` (ROLLOUT steps 1–7 as one call: measure-page →
  triage + inventory diff → stop for the review → media-fetch → da-put → author → lint → harness → section verdict at the three widths → pair; every step a
  child process of the sibling instrument, one step table, `page-run.json`), `probe-load`, `probe-structure`, `content-dump`, `content-view`, `media-list`,
  `media-fetch`, `live-spec`, `scroll-probe`, `deep-probe`, `click-dump`, `text-ladder`, `video-frame`, `da-put`, `sync-poll`, `serve`, `harness`,
  `sections`, `pair`, `leak`, `gate`, `hover-diff`, `click-state`, `crop`, `shift-probe`, `extent`, `measure-view`, `measure-to-spec`, `origin-pick`,
  `spec-view`, `site-profile` (the site's state after a template run — `migration/site.json`, read by every instrument as its flag defaults),
  `block-inventory` (the blocks a site has — `migration/blocks.json`: variants, shapes, source signatures, per-block budgets from the template's per-section gate table — `budgets --gate-dir`; `diff` a page against it),
  `brief` (the one-screen CSS brief of a measure dir: per section and width the text styles, media, paint, content x-range; the families' roles, the colours, the cap),
  `triage` (the draft triage table of a page from its content dump, matched against the inventory first; `scripts/lib/` holds the shared rules —
  `fingerprint`, `content-collector`, `spec-collector`, `probe-collectors` (the in-page readings of live-spec, probe-load, probe-structure, media-list and deep-probe, shared with `measure-page`), `recipes`, `doc-diff`, `section-pair`: the live ↔ authored section pairing `gate` reads its per-section table with, `stitch`: the in-process scroll-and-stitch capture of an open, settled page — stitch-shot's shape and pitfalls, readiness per chunk instead of fixed waits — used by `measure-page` and `gate`, `profile-check`: `site-profile check`'s per-width checks over an open page, shared with `measure-page`),
  `author` (the document from the triage and the dump through the inventory's recipes: default content as the dump holds it, blocks as tables per
  recipe, media through the manifest, section-metadata and the metadata block, then the lint — `scripts/lib/recipes.mjs` documents the recipe
  `blocks.json` carries per block, `scripts/lib/doc-diff.mjs` compares two documents structurally: blocks, rows × cols, text sets per section),
  `roster` (the site's pages from the nav document, a URL list or a bounded crawl, one light pass each — `migration/roster.json` + `roster.md`: coverage matrix pages × blocks, novelty, template clusters, reuse-first / novelty-first orders; `pick` writes `pages.json`, `print` re-renders the views from the JSON),
  `page-report` (a rollout page's row in `migration/site-report.json` from its `gate/gate.json` + `gate-served/gate.json` and a few flags — minutes, rounds, new blocks, deviations, blocked —, then `migration/pages/<slug>.md` and the site table `migration/site-report.md`).
- `templates/` — what `init` copies into a site repo: the skill stub, the AGENTS.md section, the migration README; `templates/foundation/` (`init --foundation`) the site
  code every migration rewrote — `scripts/stardust.js` (icon tokens, inline icons, widget auto-block, fragment-section reader, empty sections), `styles/reset.css`
  (`:where()` resets, `[hidden]`, the empty metadata section), the `styles.css` skeleton with the spec's token names and `fonts.css` — copied once, never overwritten.
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
geo modal, interstitial), `--locale <tag>`, `--chrome` / `--headed` (the installed Chrome, headless or with a window — inherited by every child process) and `--require <css,…>` (composition gate: exit 4 when the session is not the one the origin
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
npx stardust-lite init --foundation              # also scripts/stardust.js, styles/reset.css, styles.css + fonts.css skeletons (never overwrites)
npx stardust-lite method                         # path of METHOD.md — the template run reads this first
npx stardust-lite rollout                        # path of ROLLOUT.md — a page after the template reads this instead
```

A clean Copilot or Claude Code session opened in the site repo then finds the skill and `AGENTS.md`, reads `node_modules/stardust-lite/METHOD.md`
and runs `npx stardust-lite <instrument>`. Evidence goes to `migration/cases/<template>/`. Nothing under `node_modules/stardust-lite` is edited;
method changes and new instruments are pull requests here, traced to a case.

**Rollout (page N of a site).** Once a template is approved and `site-profile init` / `block-inventory scan` have written `migration/site.json` and
`migration/blocks.json`, every further page of that template is a page run: the agent reads `ROLLOUT.md` instead of METHOD, every instrument takes its
overlays, cap root, chrome heights and DA coordinates from the profile, `triage` matches the inventory, `author` writes the document through the recipes,
`gate` masks the approved chrome and reads each section against its block's budget, and the page leaves one row in `migration/site-report.json` plus
`migration/pages/<slug>.md` (`page-report`) — no case folder unless it added a block or turned out to be a new template (novelty ≥ 0.5, or a section the
inventory cannot name: then METHOD in full). The batch runs `roster pick`'s ten pages per site and one improvement pass per site after them.

## Run (per template)

`CHECKLIST.md` is the run: twelve steps, one command each, what to read after it and what to decide (`npx stardust-lite checklist` prints its path).
METHOD.md is the reference behind every step; ROLLOUT.md the procedure for a page after the template; `npx stardust-lite list --usage` every flag.

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
| `marriottvacationsworldwide-home` | 2026-10-01 | 2.66 / 0.30 / 0.16 | 2.82 / 0.33 / 0.20 | 3 table rounds (r0–r2) to the first push + 6 gate rounds (r3–r8, none void, 2 cost by instrument readings: an entrance-state spec and a mis-attributed `background-size`) + 0 served fixes; 110 min wall, first shareable URL at 57 min; light-DOM WordPress / Kadence origin, Splide hero with a Brightcove player (its playback API's progressive MP4 served `video/mp4` by DA), AOS entrances parked in the spec, nine body modals as hidden-but-present content, OneTrust reload-on-accept, noise floor 0.00; leak table 0 lines; every block but `brand-bar` a Block Collection shape |

What each case taught is in its REPORT and in `BACKLOG.md` (the rows name the case): ibm-home the composed-tree tier for shadow-DOM origins,
walgreens-home the composition gate (`--require`), stryker-home the tooling that cost rounds (consent that reloads, lazy fonts, a single-threaded
server), usta2-home what no table showed (uppercase by CSS, a header fixed at one width, 0-height spacing), audemarspiguet-home the authoring set
vs the painted set, dentsu-home residuals that are paint (`shift-probe`, `crop --vs`), hiltongrandvacations-home content not at rest (count-ups,
click panels, iframe posters), marriottvacationsworldwide-home entrance states parked in the spec. The loop cases (`loop/`, from scotiabank-personal
on) measure the minutes instead: what the agent read, what it typed by hand, and which instrument now does it.
