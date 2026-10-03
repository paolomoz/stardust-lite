# REPORT — natixis about-article (blocks-first, stardust-lite 39e6a67)

Page: https://www.im.natixis.com/en-intl/about/diversity-equity-and-inclusion (Natixis Investment Managers, international edition; no redirect, nothing pinned).
Site: `aemcoder-adobe/sdt-natixis`, branch `blocks-first`. Served: https://blocks-first--sdt-natixis--aemcoder-adobe.aem.page/drafts/diversity-equity-and-inclusion (preview only; nav `/drafts/nav`, footer `/drafts/footer`, media `/drafts/media/`).

## Numbers (pixel % against the cached origin `measure/live-<W>.png`; noise floor 1440 **0 %**, Δh 0, two loads 18 s apart)

| | 360 | 1440 | 2560 (probe) | cap-probe | motion |
|---|---|---|---|---|---|
| prototype (harness, final) | **1.39 %** Δh +1 | **0.15 %** Δh 0 | **0.09 %** Δh 0 | PASS 2560, 0 of 4 rows | hover parity ×2 (hover-diff), click-state ✓, 4 MISSING = equivalent class names |
| served (branch, same origin) | **1.06 %** Δh 0 | **0.17 %** Δh 0 | **0.09 %** Δh 0 | PASS 2560 | same |

Section table: all 13 rows Δh 0 at 360, 1440 and 2560 (`sections --widths 360,1440,2560`), doc Δ −1 / 0 / 0. Pair: 92 anchors at 1440 / 86 at 360, every located row within 3 px; residuals are the sr-only "opens in a new tab" (MISSING by design) and two identical award texts paired crosswise. Leak table (28 wrappers): identical at 1440; at 360 one row differs by 1 px (footer-legal y).

Hottest bands: 360 y 6300–7200 at 4.4 % (ERG logos + text, `shift-probe` dx 0 dy 0, luminance ratio 1.006 — renditions / anti-aliasing); 1440 y 7650–8100 at 0.8 % (footer link text anti-aliasing, ratio 1.000).

## Clock (TIMELINE.md)

| milestone | UTC | from t0 |
|---|---|---|
| setup (repo, DA, Code Sync, foundation, branch) | 12:26:53 → 12:28:51 | 2 min before t0 (+1.5 min reading METHOD / BACKLOG / usage) |
| t0 — first `measure-page` | 12:30:30 | 0 |
| measure done (2 runs + probe-structure) | 12:33:01 | 2.5 min |
| brief, dumps, deep-probes, crops read | 12:44:00 | 13.5 min |
| triage + lint clean + document authored | 12:48:15 | 17.7 min |
| documents + media on DA (model approvable) | 12:49:30 | 19 min |
| code written (8 blocks, styles, fonts, icons) | 13:00:25 | 30 min |
| first prototype served | 13:02:05 | **31.6 min** |
| gate 1 (3 widths): 10.92 / 7.57 / 4.82 | 13:03:52 | 33.4 min |
| tables round 2: 360 clean, 1440 one row −16 | 13:12:04 | 41.6 min |
| gate 3 — first < 10 % at all three: 1.41 / 0.16 / 0.09 | 13:13:47 | **43.3 min** |
| probes pass (gate 1440 + probes, click-state, hover-diff) | 13:15:58 | **45.5 min** |
| code pushed + synced (11 s) | 13:20:43 | 50 min |
| served gate 1: 1.08 / 0.17 / 0.10 | 13:22:56 | **52.4 min** |
| final prototype gate (bold lead restored): 1.39 / 0.15 / 0.09 | 13:24:42 | 54 min |
| final served gate + leak: 1.06 / 0.17 / 0.09 | 13:29:06 | **58.6 min** |

Rounds: table rounds 2 (hero margin / sup / accordion gap / footer padding / facts padding; awards trailing 16), gate rounds 5 (1 first look, 1 after the tables, 1 probes, 1 content fix, 1 final), served gates 2.

## What the page is

A long editorial "about" article on an AEM Sites (core components) origin: breadcrumb, hero with an offset purple panel, a jump-link bar that pins, five content bands alternating white / #f3f4f5 / #e9ecef, three accordions (two on purple boxes), two card grids, a 4 × 3 logo wall, a footnote band, and a four-column footer. No video, no carousel, no consent reload, no geo edition. Every repeating unit is a Block Collection shape; the only site-specific block is `in-page-nav`.

## Blocks written (shape · rows × cols · variants)

- `breadcrumbs` · simple · 1 × 1 (ol) — full-bleed bar, chevron separators, one back-link at 360.
- `hero` · simple · 1 × 1 (h1, p, picture) · `image-right` — 60 % panel + 700×420 cover photo; column + bleeding panel at 360.
- `in-page-nav` · simple · 1 × 1 (ul of anchors) — fixed bar once scrolled past, scroll-spy active link, `<select>` at 360.
- `cards` · container · n × 2 (picture | body) · `facts` (number | text, 3 × 323 in 1016, 48 inner offset, 360 rules) · `awards` (image → h5 40, trailing 16).
- `accordion` · container · n × 2 (summary | panel) · `invert` (own purple box) — `<details>`, plus icon as a mask in currentColor, 40 / 32 above the first item.
- `columns` · simple · 1 × 4 · `logos` — picture + link pairs become linked logos with a visually-hidden label; 288 columns, 40 / 16 stacks.
- `header` (nav fragment: top bar, brand, sections, search) and `footer` (brand + social, 3 lists with the third in two CSS columns, legal) through `readFragmentSections` + `inlineIcons`.

Foundation: `styles.css` tokens from the brief (shell 1256 / gutter 16, spacing-md 64 / 24, band-pad 80 / 40, type scale per width), section styles named after the source's container classes, `sup` rule, `fonts.css` with the six static faces.

## Lessons

1. **The source's authoring vocabulary is the section-style vocabulary.** `ntx-spacing--md--top/bottom`, `container--narrow/slim`, `container--has-background` map one-to-one onto `spacing-top`, `narrow`, `grey`; the 64 / 24 and 80 / 40 pairs came straight from the spec's section `mar` rows at the two widths. No per-position CSS was needed.
2. **A source block margin may stay a block margin.** METHOD's "module spacing goes on the section as padding" read the hero as Δh +80 in the section table (the live section is the hero itself with `margin: 40px 0`); the wrapper margin that collapses through the section like the source's reproduces the table exactly.
3. **Margins that collapse out of a flex-less footer.** The footer content's bottom margin escaped through `footer` (no padding-bottom): −104 at 1440 / −80 at 360 in one row; padding instead of margin.
4. **The dump's `markup` is truncated at ~500 chars** (D5): one unclosed `<b>` broke the harness fold (the metadata block ended up inside a `<strong>` at body level, `closest('main > div')` null) and one quote lost its bold lead; the spec's inline `b` runs recovered it. A generic fix belongs in `content-dump`.
5. **`--draft-new` on an empty inventory reaches the shape, not the rows** (BACKLOG #148/#189 confirmed): accordion panels (hidden dump) unpaired, the section's h2 + lede swallowed into cards rows, the facts' text-only units given an empty image cell, the logo wall as one cell. The case script `scripts/fix-doc.mjs` (127 lines) did the rest from the same dumps.
6. **Section styles are comma-separated for `aem.js`** (`style.split(',')`); the first draft's space-separated styles became one class — a lint or author rule would catch it.
7. **Chromium keeps boxes for closed `<details>` content**: `pair` paired body texts into hidden accordion panels until the body was `display: none` when closed.
8. The sticky in-page nav repeats at every chunk boundary in both stitched captures — the noise floor (0 %) proved it is deterministic, and reproducing the same fixed behaviour made the chunks agree.
