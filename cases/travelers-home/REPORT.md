# travelers.com home → EDS, blocks-first v2 — run report (2026-09-30)

Site: `aemcoder-adobe/sdt-travelers`, branch `blocks-first` (main untouched). Content: DA `/drafts/home`, `/drafts/nav`, `/drafts/footer`
+ `/drafts/media/*` (17 images, the source's own webp/jpeg bytes), previewed on the branch only, nothing published.
Prototype: `migration/cases/home/proto/home.harness.html` served on :8940 (runtime harness page). Served page:
https://blocks-first--sdt-travelers--aemcoder-adobe.aem.page/drafts/home

## Three-width table (pixel %, cached origin captured once with --settle; settle on both sides)

| width | noise floor (live vs live) | prototype (r5 = r6) | served | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (one capture kept; the page is deterministic, see 1440) | **3.26** | **3.28** | −2 / −2 | bands 6300–9900 (3.5–9.5 %) are the "Why Travelers" and "Prepare & Prevent" cards: photos are 90 % of the width and the build shows the pipeline's optimised 750 px renditions against the live 975 px webp; every text row within ±2 px (pairing); the Qualtrics tab in every chunk |
| 1440 | **0.00** (two captures, every band 0) | **1.09** | **1.10** | 0 / 0 | all 10 authored sections at Δ0 in the section table, doc height 6048 = live; residual = photo renditions (bands 2250 / 3600 / 4950 at 1.6 / 2.6 / 1.6 %) + text anti-aliasing + the tab |
| 2560 | — | **0.57** | **0.57** | 0 / 0 | cap-probe PASS (shell 1440 = 1440, 4 module rows); the same residual scaled by the wider viewport |

Rounds: r0 41.63 / 24.74 / 14.05 → r1 11.45 / 3.30 / 1.85 → r2 8.85 / 4.54 / 2.56 → r3 8.85 / 3.36 / 1.89 → r4 19.09 / 10.68 / 6.01 (void, see
below) → r5 3.26 / 1.09 / 0.57 → r6 (final code) 3.26 / 1.09 / 0.57. Served page gated once after the leak-table fix: 3.28 / 1.10 / 0.57.
Leak table prototype vs served (41 wrappers, 1440 and 360): **identical, 0 differing lines** (before the fix: 8 footer rows, +72 px).
Served section table at 1440: every row Δ0, doc height 6048. State probes on the served page: sticky bar (900 → sticks, 500 → releases,
1440 × 90), mega menu (1440 × 646 at y 89), deep hover diff: identical to the prototype. motion-compare on the served page: the same 15 parity / 12 missing / 1 extra / 4 dead verdict
lines as the prototype (r5), word for word. `migration/` is `.hlxignore`d (the evidence is not served).

## Lint (David's Model) at step 2 — before any block existed
home: **0 🔴, 1 🟡** (D1: `hero` "single-column, 3-row block holding only prose" — the Block Collection hero shape; the card is a
genuine widget: product select + ZIP form built from the authored list and labels, fixed "Get a quote" bar on scroll). nav, footer:
clean. Unchanged afterwards: the documents were edited once after step 2 (the footer trademark paragraph split in two to match the
source's blank line, and the media extension `.jpg` → `.webp`), the harness re-ran the same lint on every round: same result.

## Triage table, deviations, motion → `REGISTER.md`
Motion (motion-observe live vs prototype, motion-compare): **15 parity, 12 missing, 1 extra, 4 dead** — every "missing"/"extra" row is
either the source's class or animation *name* (`sticky--top`, `hide-secondary`, `dxp-bg-dark`, `sticky-animate-in` vs the build's
`hero-sticky`, `hero-sticky-in`), a border-radius transition with no visual change, the mega-menu open transition (hidden at rest;
the click state is verified with a probe), or a hover the frame sampler read as "no diff on build" while the deep hover diff shows the
identical change on both sides (primary button, nav toggle). Deep hover diff (`scripts/hover-diff.mjs`, live and build): every
measured hover reproduced except the search icon's fill change (img-based icon). Sticky bar: scroll-probe ladder identical to live.

## Rounds and where the time went
Prototype rounds (harness → section table + pairing → CSS → gate), pixel % at 360 / 1440 / 2560:
- **r0** first harness (blocks as written from the spec): 41.63 / 24.74 / 14.05, Δh 815 / 187 / 187. The tables named: the sticky
  bar never released (placeholder `display:none` → bottom always 0), header row overflow (search `p` 64 px tall), columns text
  column 780 px (flex-basis 0 + padding), letter-spacing on every button/eyebrow/utility link (0.5–1.5 px), `strong` in a 600 eyebrow
  → 900, footer margin collapse + one trademark paragraph, product list as a grid (shared rows) instead of independent columns.
- **r1**: 11.45 / 3.30 / 1.85, Δh −6 / 2 / 2 — every section within 2 px at 1440; cap-probe FAIL (wrapper cap: sections capped
  individually, `main` fluid).
- **r2**: 8.85 / 4.54 / 2.56 — webp source bytes instead of jpg, `main` as the 1440 shell (cap-probe PASS), hover states from the deep
  diff; 1440 regressed by a 1 px line box (`vertical-align: top` on the hero links made the 1440 row 24 px, live 25).
- **r3**: 8.85 / 3.36 / 1.89 — line box per breakpoint.
- **r4**: 19.09 / 10.68 / 6.01 — the measured list model (24 px rows, 30 px list margin) applied without the margin-collapse
  difference of a flex item: +9 px per panel. A void round in the method's sense: the target bands moved the wrong way.
- **r5**: **3.26 / 1.09 / 0.57**, Δh −2 / 0 / 0 — list margin 21 (30 − 9), mobile toggle geometry, hero mobile ratio. Section table at
  1440: every row Δ0, doc height 6048 = live; at 360 Δ2 total.
- **r6**: same code plus the empty-section rule the served page needed (no pixel change possible on the prototype — the harness drops
  that section); re-gated for the record.
- Served page: one deploy round. The leak table (41 wrappers, 1440 and 360) differed in 8 footer rows (+72 px): the metadata block's
  empty section took the section rhythm margin. Fixed with one CSS rule, code re-synced, leak tables identical (0 differing lines).

Time: setup + measurement ≈ 30 % (no bot manager, no consent — the live-spec / deep-probe / motion / nav / sticky / icon inventory
runs were the cost); triage + documents + lint ≈ 10 %; blocks ≈ 20 %; gate rounds ≈ 30 % (six prototype rounds, of which three chased
1–2 px line-box / margin-collapse rows — see gap 9); deploy + served gate + registers + report ≈ 10 %.


## Instruments written under `migration/cases/home/scripts/` (stardust-lite did not have them)
- `probe-load.mjs`, `probe-structure.mjs` — first look: fixed layers, consent elements, main's children with boxes (a "what are the
  sections" dump `live-spec` needs as input for `--sections`).
- `deep-probe.mjs` — rect + paint of named selectors **including `::before`/`::after`** (box-shadow, borders, pseudo paint) at a width;
  run on live and on the prototype. `live-spec` reads no pseudo-elements: the footer's curved top (an ellipse `::before`), the nav
  toggle underline, the top-hat underline and the card shadows were only visible here.
- `nav-open.mjs` — click-state probe: opens a dropdown / the mobile menu and dumps the opened panel's structure with boxes and fonts
  (the frame sampler is blind to class-toggled panels).
- `sticky-state.mjs`, `sticky-form.mjs`, `sticky-check.mjs` — the hero card's fixed state: scroll to Y, dump the card and its controls
  (live), and a scroll ladder on the prototype (sticks / releases).
- `svg-dump.mjs`, `icon-colors.mjs` — inventory of the inline SVG icons (sprite symbol ids, boxes, rendered colour) so the icons can be
  lifted as media with the measured colour baked in.
- `hover-diff.mjs` — deep hover diff: element, subtree and pseudo-elements, 19 properties, first *visible* match (the source has hidden
  duplicates); the fidelity-home report lists this as never run because no headed tier existed — this origin needed none.
- `crop.mjs` — crop a y-range out of a stitched PNG (with optional downscale) to look at one band of a 12,000 px capture.

## What the document got wrong or left out
1. **The section-height table needs a section map.** `sections.mjs` pairs live sections with build sections by index; the live spec has 16
   rows (h1, hero, quick links, each panel, each head…) and the build 11 (`main > .section`), so every row after the first is compared
   with the wrong partner and the table has to be re-read by hand from the `first heading` column. Either `live-spec --sections` should
   accept one selector per *authored section* (so the granularities match), or `sections.mjs` should pair by the first text anchor.
2. **The pairing reads inline boxes.** `pair.mjs` anchors the live `h2`/`p` block box to the build's `strong`/`a` inline box when the
   eyebrow is authored as `<p><strong>` or the link is inline: every such row shows Δh −6/−7 and Δw −100..−1200 that mean nothing. Pair
   block with block (walk up to the nearest block ancestor on the build side).
3. **Pseudo-elements are invisible to `live-spec`.** The footer's curved top edge, the nav toggle's 2 px underline, the top-hat 1 px
   underline and the elevation shadows exist only as `::before`/`::after` or `box-shadow`; the spec's `paint` items carry `shadow` but no
   pseudo boxes. `deep-probe.mjs` (this case) should be the paint tier of `live-spec`.
4. **The hover probe is not enough, even without a bot manager.** METHOD names "a deep hover diff" as a prerequisite but ships none; the
   frame sampler read "no change" on the small button and "no hover diff on build" on two elements whose hover is identical on both
   sides. `hover-diff.mjs` (this case) covers subtree + pseudo-elements; it should be in `scripts/` and `gate --probes` should run it.
5. **The icon path.** Nothing in the method says how `:icon:` tokens become files: on this site the icons are sprite symbols with
   `currentColor` fills, and the boilerplate's `decorateIcons` renders them as `<img>` (no colour inheritance). The colour has to be
   measured per use and baked into the SVG (`icon-colors.mjs`); a hover that changes the icon colour (search) cannot be reproduced.
   Worth a paragraph in step 4 next to BACKLOG #5.
6. **Media: upload the source bytes.** BACKLOG #4 says where the media lives; it should also say *what*: re-encoding the source's webp to
   jpg (fidelity-home path) cost ≈ 1.2 % at 1440 in photo bands; DA and the pipeline accept `.webp` sources unchanged (verified: byte-
   identical `media_*.webp`, optimised renditions work). r1 → r2 here is exactly that swap plus a 1 px line-box regression.
7. **`main` must be the shell.** cap-probe FAILs the "wrapper cap" row when sections are capped individually (EDS boilerplate default:
   `main > .section > div { max-width }`); the live site caps one container and bleeds full-width bands out of it with negative margins.
   Step 4 should say: `main { max-width: <shell> }`, full-bleed section styles with `margin: 0 calc(50% - 50vw)`. Passing cap-probe
   required that foundation change, not a block change.
8. **Session-variable text, not only regions.** The tracking phone number changes per session (6 values seen); the register has a row
   for "regions" (rotating heroes) — a per-load *text* is the same class. Name it in step 6 (cost here < 0.01 %).
9. **The 1 px line-box class of defect.** Three rounds were spent on 1–2 px row differences that the section table shows as Δ±2 but that
   turn a whole band's text red in pixel-compare: inline-block links in 24 px list rows (baseline offset), a 16 px link in a 15 px
   paragraph (line box 25), a margin that collapses through a wrapper. Step 6 should say: read `deep-probe` on both sides for the *rows*
   the pairing flags, not only the sections — the fix is always a display/line-height/margin-collapse rule, never a pixel value.
10. **What "stitch-shot pauses animations" means for a scroll-driven fixed bar.** The source's sticky quote bar animates from
    translateY(-100 %); paused at 0 % it is in neither capture. The build must use the same mechanism (class + animation) or it shows a
    90 px bar in every chunk below the hero on one side only. BACKLOG #9 names the chunk wait; this is the sibling rule for entrances.
11. **BACKLOG #7 (harness port collision) is real and cheap to check:** `md5 proto/home.harness.html` vs `curl …/home.harness.html` was
    done by hand every round. The harness should print the served hash.
12. Minor: `gate.mjs` prints "motion live…/build…" but no motion table without `--probes`; the `probes` file format is only documented in
    the script header. `pair.mjs` matches anchors case-insensitively ("Find an agent" quick link ↔ "Find an Agent" footer link).

