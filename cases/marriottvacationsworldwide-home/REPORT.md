# www.marriottvacationsworldwide.com home → EDS, blocks-first v2 — run report (2026-10-01)

Site: `aemcoder-adobe/sdt-marriottvacationsworldwide`, branch `blocks-first` (main untouched). Content: DA `/drafts/home`, `/drafts/nav`,
`/drafts/footer` + `/drafts/media/*` (32 images = the bytes the live page serves, the hero mp4 from the Brightcove playback API and its
poster), previewed on the branch only, nothing published, no PR. Prototype: `migration/cases/home/proto/home.harness.html` served on
:8977 (runtime harness page). Served page: https://blocks-first--sdt-marriottvacationsworldwide--aemcoder-adobe.aem.page/drafts/home
Clock: start 08:04 CEST; step-2 documents previewed 08:41; **first shareable prototype + served URL 09:01 CEST** (57 min: round 4 within
3 px on the section table at 1440 → push 09:00:57, code sync triggered and polled to the pushed bytes at 09:01:10); final numbers 09:31.

## Three-width table

Pixel %, cached origin captured once with `--settle --locale en-US`, consent accepted (`#onetrust-accept-btn-handler`, a reload-on-accept
OneTrust bar); the served gate reuses the prototype's origins (`gate --origin gate`).

| width | noise floor (live vs live) | prototype (r8) | served (final) | Δh proto / served | notes |
|---|---|---|---|---|---|
| 360 | — (one capture; the 1440 pair reads 0.00 and the build's own 360 pair reads 0.00) | **2.66** | **2.82** | 0 / 0 | band 5400 (9.7 %): the NYSE photo and the coral row 1 px lower — fractional live row heights (703.56 / 674.77) vs integer rows (`shift-probe` dy −1 on three regions); band 0 (2.5 %): the mp4's frame 0 renders a faint vignette where the live stream is flat white, plus intro text; every other band 1–3.7 % = text anti-aliasing on 320 px columns full of text; served +0.16: the pipeline's `webply` renditions of the photos |
| 1440 | **0.00** (two captures, every band 0.0) | **0.30** | **0.33** | −1 / −1 | 1350 (1.1 %): brand logos resampled from 220 to 160 px; 8100 (1.0 %): footer link text; 450 (0.2 %): the hero video frame; all section rows within 3 px from r3, within 1 px from r5; cap-probe PASS 5/5 from r4 |
| 2560 | — | **0.16** | **0.20** | −1 / −1 | cap-probe PASS (shell 1260 on `main`, 0 of 5 rows failed); bands ≤ 0.5 % |

Rounds (360 / 1440 / 2560): r0–r2 tables only (no gate) → r3 — / 14.62 / — → r4 — / **2.06** / — (push) → r5 — / 0.51 / — → r6 — / 0.50 / — →
r7 2.99 / 0.50 / 0.24 (three widths + probes) → r8 **2.66 / 0.30 / 0.16**. Served: r1 3.14 / 0.53 / 0.28 (before r8's code) → r2 **2.82 /
0.33 / 0.20**. Leak table prototype vs served (27 wrappers, 1440 and 360): **0 differing lines**. Served hidden states (`click-state`): drawer
324 px / 54 px head / 58 px rows / 50 px sub-rows, nav mega panel 503/778/1052 × 269, brand modal 600×684, search overlay 898×363 — identical
to the prototype's. `migration/` is `.hlxignore`d.

## Triage table

Full table (section → default content | block, shape, collection match, rows × cols, section style) in `REGISTER.md`. Summary:

| # | source section | default content | block · shape · collection match |
|---|---|---|---|
| 0 | fixed header (bar, hover mega menu, search modal; hamburger drawer ≤ 1024) | nav doc: brand, nested list, tools | `header` · BC header (fragment) |
| 1 | Kadence/Splide hero slider: Brightcove video, an mp4, 5 photo slides with a heading pair, auto off; a button over the slide bottom | closing bold link | `carousel (hero)` · container · BC **carousel** · 7 × 2 |
| 2 | intro column: h1, paragraphs, two h2, lede; 9 logo tiles in three groups with a rule, each opening a modal | h1, p, p, h2, p, h2, h2 | `cards (brands)` ×2 + `cards (brands, divider)` · container · BC **cards** · 6 / 1 / 2 × 2 |
| 3 | five full-bleed photo + text bands (alternating side, three band colours, a stock chart in row 3) | — | `columns (company-tiles)` · container · BC **columns** · 5 × 2 |
| 4 | Global Presence: h2 + lede, three groups of stat cards (icon ring, number with a small prefix, label) | h2, p, h2, h2, h2 | `cards (stats)` ×3 · container · BC **cards** · 3 / 3 / 1 × 3 |
| 5 | footer: brand bar (two renditions), four link columns, legal row with social icons | footer doc: © line, icon links | `footer` · BC footer (fragment); `brand-bar` · simple · 2 × 1; `columns (footer-links)` · container · BC **columns** · 1 × 4 |

Every block but `brand-bar` is a Block Collection shape; `brand-bar` is the site's name for what the collection has no shape for (a
per-width rendition pair). Four section styles: `hero`, `intro`, `tiles`, `presence`.

## Lint

Step 2 (08:37 CEST, before any block existed): home **0 🔴, 0 🟡**, nav **0 🔴, 0 🟡**, footer **0 🔴, 1 🟡** (D1 `brand-bar` — two renditions of
one bar, justified). The first lint of the generated home document read one 🟡 (D3: the carousel's two video rows had one cell, the
photo rows two); the video rows got an empty text cell before the record. Changed afterwards: no — the document was edited once (a `tiles`
section style whose CSS rule was later dropped; the class is inert) and the harness re-ran the lint on every round with the same result.
See `LINT.md`.

## Motion register

Per row in `REGISTER.md`. motion-compare (gate --probes, 7 hover/click probes at 1440): **8 parity, 10 missing, 0 extra, 3 advisory**.
Verified: nav item hover (parity), CONTACT US hover (parity), LEARN MORE hover (parity), slider arrow hover (parity), social hover (parity
after the icons went inline in r6), footer link underline (hover-diff both sides), hero button hover (hover-diff both sides; the frame
sampler read no diff on live — "advisory"), back-to-top (both captures from chunk 2; the sampler lists the live `scroll-visible` class as
MISSING and the build's `visible` as extra — one behaviour, two class names), slider arrow click (fade to the next slide; the Splide
classes `is-active/is-next/is-prev/is-visible` read MISSING and the build's `active` extra — same reading), nav panels / drawer / brand
modal / search overlay (click-state on build and served, geometry identical to live's `nav-panels.mjs` and click-state readings).
Decided out: the AOS `fade-down` entrances (21 columns + tiles; the capture shows every element at rest and a build entrance risks a
mid-flight chunk — BACKLOG #93), the sticky header's `item-is-stuck` class (white on white), the `outline-width` /
`text-underline-offset` focus transitions, Splide's drag.

## Deviations register

In `REGISTER.md` (28 rows). The ones that decide the numbers: the Brightcove hero video lifted as the playback API's progressive MP4 and
served by DA as `video/mp4` (frame 0 white on both sides — band 450 at 0.2 %); the live spec read in the AOS entrance state (−100 px) —
rest positions taken from the containers and the capture; the fractional 360 row heights (the 1 px class: 9.7 % in one band); the
pipeline's photo renditions on the served page (+0.16 at 360); the mobile drawer rendering the desktop menu (the source's second WP menu is
a mobile-only DOM instance with other copy; hidden at rest); the brand modals authored from the hidden DOM; the icons inlined so
`currentColor` follows hover colours.

## Rounds and where the time went

Prototype rounds (harness → section table + pairing at 360 / 1440 / 2560 → CSS → gate at 1440; three widths once the tables were clean):
- **08:04–08:37 measurement** (33 min): probe-load at three widths, structure dumps to depth 7, content dumps at 1440 and 360, media list and
  fetch (32 files), cap-probe, live-spec ×3, scroll-probe, deep probes, hover-diff, click-states (dropdowns, drawer, modal, search), the
  nav panels (`nav-panels.mjs`, written because the Kadence panels open on hover only), the Brightcove playback API, the mp4 upload test.
- **08:37–08:41 triage + documents + lint** (the generator `doc/build-doc.py` reads the captured DOM; lint 0 🔴; media and documents
  previewed — the step-2 deliverable, 08:41).
- **08:41–08:48 blocks** (foundation, carousel, cards, columns, brand-bar, header, footer, scripts.js icon tokens and scroll-up).
- **r0** (08:48) first harness: header crashed on a nested group without a link (`a.href` of null) — fixed; tables: intro −8 (a
  `:first-of-type` that hit the second wrapper's h2; `h2 + .cards-wrapper` that never matches across wrappers), columns 620/820 (flex-basis 0
  + padding), footer bands unpadded, the company rows read +93 against the entrance-state spec.
- **r1–r2** (08:52–08:58) tables only: sibling selectors across `.default-content-wrapper`s, `flex: 0 0 50%`, a block-variant / section-class
  name collision in the footer (`footer-links` on both), the band padding losing to a higher-specificity shorthand; divider block 150 px,
  the heading after a cards block 48 px. Every width's table then showed one −31 chain and the +100 rows.
- **r3** (08:59) first gate at 1440: 14.62 % — the diff crop showed the five company rows 100 px apart on the two sides: the `−100 px`
  section overlap derived from the spec was the spec's entrance state. Rule removed.
- **r4** (09:00) **2.06 % at 1440**, Δh −1, cap-probe PASS, every section row within 3 px → **code pushed 09:00:57, synced 09:01:10: first
  shareable URL**. `shift-probe` + `crop --vs` named the remaining bands: brand logos painted `cover` instead of 160 px (the probe's value
  had been read off the stat icons' line), the photos 1 px low (the 40.6 px heading gap is a 40 px rule rounded by the source), the hero
  button under the active slide's stacking layer (hover dead).
- **r5** (09:09) 0.51 %: 160 px logos, 40 px gaps, hero button `z-index`; the back-to-top chevron black (an `<img>` icon cannot take
  `currentColor`).
- **r6** (09:11) 0.50 %: `inlineIcons()` for every block-created icon; social glyph hover colour now follows.
- **r7** (09:16) three widths + probes: 2.99 / 0.50 / 0.24; click-states on the build: nav column heading 52 → 50 px, panel text colour,
  drawer close bars, modal line-height leaking from the intro section, search box geometry; `isConnected` guard dropped (icons in the
  header were not inlined because the nav was not attached yet). Served gate r1 (09:24): 3.14 / 0.53 / 0.28.
- **r8** (09:26) 0.30 % at 1440: stat icons 120 px (the painted extent in the capture, `png-extent.py`; a second deep probe read
  `background-size: 120px` at rest). Pushed, synced 09:28; three widths 2.66 / 0.30 / 0.16; served r2 (09:31) 2.82 / 0.33 / 0.20; leak
  tables identical; served click-states identical. Stop rule met (every section row within 1 px, residual bands named).

Time (≈ 110 min wall to the final numbers and registers): measurement ≈ 30 %, triage + documents ≈ 5 %, blocks ≈ 10 %, table and gate
rounds ≈ 35 % (9 rounds; two cost by instrument readings — the entrance-state spec and the mis-attributed background-size — none void),
deploy + served gate + leak + hidden states ≈ 10 %, registers + report ≈ 10 %.

## Instruments written

Under `migration/cases/home/scripts/` (stardust-lite did not have them):
- `nav-panels.mjs` — hover each top item of a hover-opened menu and dump the visible panel subtree (box, bg, border, font, text, href).
  `click-state` needs a `--click` and a click on these items navigates; `motion-observe` resolves hidden first matches.
- `modals-from-dom.py` — the content of modals that sit in `<body>` with `aria-hidden` at rest (logo, heading with `<sup>`, paragraphs with
  links) from the captured DOM; writes `measure/modals.json` for the generator and `measure/modals-content.json` in the dump's shape so
  `harness --content` accepts the authored card texts (19 texts read "not in the capture" against the content dump alone).
- `png-extent.py` — the painted extent of a colour class in a region of a capture and the opaque bbox of a PNG asset (pure Python). It
  settled the stat icon size (120 px painted vs a 160 px probe line) and the brand-logo canvas (the logo fills its 220 px PNG).
- `doc/build-doc.py` — the document generator (texts and inline markup read from the captured DOM, not typed).

## What METHOD.md got wrong or left out

1. **Scroll-entrance libraries poison the spec.** `live-spec`, `content-dump` and `probe-structure` read at scrollY 0 after `settle`; an AOS /
   Kadence "animate once" library re-arms every element that leaves the viewport, so all three widths recorded the tiles, stat cards and
   company rows at `translateY(−100px)` / `opacity: 0` while the capture shows them at rest 100 px lower. One gate round (r3, 14.6 %) and a
   wrong section rule. Step 1 should say: a box with `tf=matrix(…, −100)` or `op=0` on a content element is an entrance state — read the
   untransformed container and the capture; `live-spec` could flag `data-aos` / opacity-0 items and print the pre-transform box.
2. **A hosted player's progressive MP4 may be one API call away.** Brightcove's playback API (policy key in the player JS) lists an MP4
   source; the bytes uploaded to DA were served `video/mp4` by the branch host — the ibm-home generalisation ("the pipeline serves an
   uploaded mp4 as `application/octet-stream`") did not hold here. The hosted-video row should say: ask the player's API for a progressive
   source and test the DA-served content-type before settling for link + poster.
3. **Read painted extents, not only computed values.** A responsive `background-size` (120 px at rest here, 160 px on a neighbouring
   element) and a cover-painted logo were both settled by measuring pixels in the capture; `shift-probe` gives shift/scale/luminance,
   `crop --vs` a picture, neither an extent. An extent probe (bbox of a colour class or alpha in a region) belongs next to them.
4. **Click probes that navigate kill the motion run.** A `click` probe on a link (`#primary-menu > li > a`) destroyed the live context
   ("Execution context was destroyed") and the whole motion-compare; `gate` should refuse or warn on click probes whose live target is an
   `a[href]`, and METHOD step 6 should say so.
5. **`deep-probe --sels` is a file, not a list.** The usage line reads `--sels …`; a comma list on the command line is opened as a filename
   (`ENAMETOOLONG`, then `ENOENT`). Accept an inline list or say "file".
6. **Hidden-but-present content is a third source.** Modals appended to `<body>` with `aria-hidden` are neither in `content-dump` (skipped)
   nor reachable by `click-dump` when the opener is a JS overlay the probe's click does not fire; `harness --content` then lists every
   correctly authored modal text as "not in the capture". A dump of hidden DOM content (opt-in) would close it.
7. **`currentColor` needs inline SVG.** Every control icon the blocks create (arrows, chevrons, close, social, scroll-up) is an inline SVG
   on the source; `decorateIcons` makes an `<img>` that renders black and never takes a hover colour (r5–r6). Step 4 names
   `decorateIcons(block)` but not the inlining; ibm-home wrote the same helper. A foundation-level `inlineIcons()` is a recurring need.
8. **Two specificity traps worth a sentence in step 4:** a foundation shorthand reset with more compound selectors silently wins over a
   block's longhand (`padding: 0 var(--gutter)` on `footer .footer > div > .section > div` beat every band padding — the reading is
   `deep-probe padding=0px`); and a decorate that classes fragment sections must not reuse a block variant's name (`footer-links` on the
   section and the columns block — one round).
9. **`pair` reads `display: contents` as MISSING.** The stat number paragraphs were painted but had no box; `pair` could fall back to the
   first child's box or say "no box (display: contents)".
10. **`click-state` on a hover-opened panel whose toggle is visually hidden** (opacity 0, `pointer-events: none` for mouse users) waits the
    8 s click timeout before printing the panel it already hovered open; a `--hover`-only mode (no `--click`) would do.
11. `[case-specific]` The hero's `<video>` frame 0 renders flat white at 1440 and a faint vignette at 360 on the build while the live
    stream is white at both — 2.5 % of one 360 band; the Brightcove stream and the progressive MP4 differ in their first frame at small
    sizes. A register row, no generic change.
12. `[case-specific]` cap-probe's module list at 2560 included shrink-wrapped text widths (a 255 px button, a 773 px paragraph); the build
    passed once the text column's children shrink-wrapped like the source's (`align-items: flex-start`). Step 4's "cap-probe's kind names
    the CSS placement" could add that leaf modules compare text widths too.

## Blocked

Nothing. (`da-put`, the code sync trigger (202) and the poll (11 s) all worked; no step failed twice.)
