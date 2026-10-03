# REGISTER — harbourvest about (`https://www.harbourvest.com/it/en/about-harbourvest`, Italy / English / Institutional Investor edition)

## Composition measured

- No redirect: the URL answers 200 for curl with `Accept-Language: en` and `it` alike (`lang="en"`, identical bytes). A browser without
  the `HV.attestation` cookie is JS-forwarded (clientlib-attestationpage `goToAttestation`) to `/us/en?preventForwarding=true` — the
  attestation page ("Home"): probe-load landed there at every width. The page measured is the **cookied** composition
  `HV.attestation=institutional-investor; HV.country=it; HV.language=en`; the header and footer are per-persona experience fragments the
  page loads by AJAX after the check (`processHeader`). Case preload `scripts/hv-cookies.mjs` (NODE_OPTIONS `--import`) adds the cookies
  to every Playwright context and makes every `goto` to the origin wait for both fragments; every instrument and the vendored tools ran
  under it. Composition markers passed as `--require`: `header .cmp-main-nav__container,footer #persona-footer-placeholder > *`.
- Noise floor (two chrome-loaded captures at 1440): **0 %**, Δh 0. The first noise pair read 11.61 % / Δh −473: the second session had
  no header and no footer (fragments not yet loaded) — a composition, not noise.
- Section selector for the dump / spec / gate split (`--sections`):
  `main > .cmp-container > .aem-Grid > .heroimage, main > .cmp-container > .aem-Grid > .container > .cmp-container > .container` (7 sections).
- Unassigned band: `div.footerdisclosures` (1 paragraph, after `footer`) — authored as the footer document's last section (`disclosures`).

## Triage (step 2 — first deliverable; `triage.md` is the drafted table with the edits read back by `--from-md`)

| # | live section (1440) | default content | block · shape · collection · rows × cols | section style |
|---|---|---|---|---|
| 0 | header 1440×130 (attestation bar 38 + menu bar 92, fixed z 1000, white; 360: navy 120 with hamburger) | nav document (brand / sections / tools) | `header` · chrome · BC header | — |
| 1 | hero 1200×762 — `picture p h1 p` | — (one hero cell) | `hero` · simple · BC hero · 1 × 1 | — |
| 2 | "Unlocking the power of private markets" 1200×366 — `h2 p×2` centred | h2, p, p | — (default content only) | `intro` |
| 3 | "Key strengths" 1200×493 — h2 + CTA row, `[picture h3 p]×3` centred | h2, `Meet the team` (bold link → button) | `cards (icons)` · container · BC cards · 3 × 2 | `light, small-bottom` |
| 4 | "Our talented experts" 1200×619 — photo 762 + overlapping card 482 (own background picture, h3, p, button) | — | `columns (overlap)` · container · BC columns · 1 × 2 | `small-bottom` |
| 5 | "Corporate citizenship" 1200×660 — the mirror of 4 | — | `columns (overlap, reverse)` · container · BC columns · 1 × 2 | — |
| 6 | "Our values shape everything we do" 1200×1008 — h2, `[picture h3 p]×4` white cards 2 × 2 | h2 | `cards (boxed)` · container · BC cards · 4 × 2 | `light` |
| 7 | "Explore our solutions" 1200×480 — h2 (1/3) + `[picture h3 a]×2` tiles with background pictures | h2 | `cards (tiles)` · container · BC cards · 2 × 2 | `dark` |
| 8 | footer 1200×472 (+ disclosures band 1000×184) | footer document: `columns` 1 × 4 (description + social \| 3 link groups), bottom row (© + 8 legal links), disclosures | `footer` · chrome · BC footer | `bottom`, `disclosures` |

The `triage` draft read every section as **new** with a collection guess; edits: row 2 → default content (not `columns`), row 3/6/7 →
`cards` with variants, row 4/5 → `columns (overlap)` / `(overlap, reverse)` (row 5 had "no collection shape"), section styles from the
source's container classes (`cmp-container--light-teal` → `light`, `--dark-aquamarine` → `dark`, `__small-bottom` → `small-bottom`).
`author --draft-new` wrote every block through the collection's default recipe; document edits after the draft: the variants (dropped
by the recipe), the section h2 + CTA that the cards recipe had folded into a first card row (sections 3 and 7 → default content before
the block), the section-4 CTA placed after the block (→ inside its card cell), seven `:icon:` placeholders → the fetched SVG pictures
(BACKLOG #5: the harness fold does not convert tokens), the two section styles above. nav and footer documents hand-authored (the
`--nav` / `--footer` simplest shapes held the links but no logo, no grouping, no disclosures).

## Deviations (source feature → decision → pixel cost)

| # | source | decision | cost |
|---|---|---|---|
| 1 | Intro h2 ends with **two trailing `&nbsp;`** (`markets&nbsp;&nbsp;`): at 360 they push "markets" to a 4th line (live h2 163 px, build 122). The pipeline trims a trailing nbsp (METHOD step 5, the fold applies the same), the author dropped them; glyph widths identical on both sides (canvas 270.45 px for "private markets"). | not reproducible on a served page; register | **−42 px at 360**, cascading over every later band: 360 stays ≈ 16 % (bands 2700–7200 are the shifted copy), 0 at 1440 / 2560 |
| 2 | Per-persona chrome loaded by AJAX; attestation gate by cookie; the mega-menu panels behind the nav tabs (buttons, click-opened) | cookies + fragment wait in the case preload; the tabs authored as links to the section landing pages (About → `/it/en/about-harbourvest.html`, Insights → `/it/en/insights.html`, Our Capabilities → `/it/en/institutional-investor/our-capabilities.html`); panels not authored | 0 at rest |
| 3 | Hero picture `object-position: 80% 50%` (deep-probe) and a gradient `::after` (deep-paint values) | CSS from the measured values | band 0 at 360 reads 43 %: same luminance (ratio 1.001), no shift — the pipeline's webp rendition of a 1280-px PNG upscaled to cover 360×723 vs the source's PNG; a rendition, not layout |
| 4 | Overlap row height: at 1440 the photo stretches to card + 64 (523 = 459 + 64, 500 = 436 + 64); at 2560 the row is 532 with the card (386) bottom-aligned | grid row = card margin 64 + card; `min-height: 532px` above 2000 px, photo absolute in its column | 0 / 0 / 0 |
| 5 | Tiles at 2560: tile 479×352 holding 284 px of content (an aspect box); 1440 and 360 are content-driven | `aspect-ratio: 479 / 352` above 2000 px (content wins below) | 2560 #7 +1 |
| 6 | Mobile logo is white (mark and word) on the navy bar; the desktop logo is navy + red | `filter: brightness(0) invert(1)` on the brand `<img>` under 900 px (the live SVG is recoloured by its CSS) | 0 |
| 7 | Inline SVG brand assets (logo, footer logo, search, chevron, button arrow, hamburger) have no file on the source | extracted from the captured DOM as media bytes; icons under `/icons`, logos/search/chevron on DA `/drafts/media` | 0 |
| 8 | Footer disclosures band sits after `footer` on the source (an unassigned root) | last section of the footer document (`disclosures`) → inside the build's `footer`; the chrome row reads Δh +213 / +525 for that reason only (pixels identical in place) | 0 |
| 9 | Footer bottom links: a 3-column grid at x 530 / 772 / 1070; link groups at x 886 / 1085 / 1214; © paragraph 226 wide | measured grid tracks (`399px 1fr` · `242px 298px 240px`; `236px 1fr 199px 129px 96px`) | footer rows within 1 px at 1440 |
| 10 | Mobile drawer (click-state 360): white dropdown, overlay rgba(0,0,0,.5), 3 tabs of 70, search 48 with 2-px rgb(249,173,27) rules, Client Portal 42, attestation section bg rgb(238,243,249) with two white boxes 118 / 145 | built from the nav document's sections and tools; box heights pinned (the boxes' inner texts — "Change location" affordances — are not authored) | hidden state; geometry matches row for row (click-state on build and served) |
| 11 | Live nav tabs grow 193 → 195.7 px on hover (a weight/spacing change the deep diff reads on the button) | not reproduced; the 4-px orange `::after` bar is | hover only |
| 12 | Live JS adds an `active` class 5× during the motion traversal (`motion class active`) | a JS class toggle on the source's tabs; no visual on the capture; BACKLOG #196 | motion row "missing", advisory |
| 13 | Boilerplate `decorateButtons` extended: a `.button-arrow` span appended to every button (the source's arrow is an element: hover `transform .3s`) | scripts.js | parity (was "0 ms" as a pseudo-element) |
| 14 | 19 px below the disclosures on the source (tracking pixel `img` 1×1 at the body's end) | disclosures section padding-bottom 83 (= 64 + 19) | Δh 360: 41 (the h2 wrap), 1440: −2, 2560: −37 (the 2560 live footer is 442, build 229-row chrome difference of the disclosures split) |

## Motion

| probe (live → build) | live | build | verdict |
|---|---|---|---|
| header scroll-morph | static across the traversal | static | dead on live — not required |
| hover nav tab `#level-one-index-0 button` → `header .nav-bar .nav-sections li:nth-of-type(1) a` | frame sampler: dead; **hover-diff**: `::after` background transparent → rgb(255,163,40), width +2.6 | hover-diff: `::after` → rgb(255,163,40) | parity by hover-diff (bar), width growth not reproduced (#11) |
| hover search `.cmp-main-nav__icon-link` → `header .nav-bar .nav-search a` | `::after` → rgb(255,163,40) | same | parity (hover-diff, prototype and served) |
| hover button `#buttonnew-714971129a` → `main .section:nth-of-type(3) a.button` | svg `transform: translateX(7px)`, `transition: transform .3s` | `.button-arrow` translateX(7px), .3s | **parity** (motion-compare: transition transform, 4 events both sides) |
| hover Client Portal, footer links | no change | no change | dead on live — not required |
| click hamburger (360) `.cmp-main-nav__mobile button` → `header .nav-hamburger button` | drawer 780 tall: rows at 120/330/346/405/463/483/617, `aria-expanded=true`, body overflow hidden | drawer 679: same rows, `aria-expanded=true` | click-state parity (prototype = served) |
| `class active` toggled 5× on live | JS class | — | missing (advisory, #12) |
