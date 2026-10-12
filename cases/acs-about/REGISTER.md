# REGISTER — acs-about (triage, deviations, motion)

## Triage (triage.md edited, `triage --from-md`; the dump re-ordered first by `scripts/reorder-roots.py`)

| # | live section (1440) | model | shape | rows × cols | section style |
|---|---|---|---|---|---|
| 0 | header 1440×105 (hat 40 + masthead 64 + 1) **and** the local nav `div.localnav-wrapper` 1440×56 (fixed under it; the split folds a link-only band touching the header into the chrome) | nav document, 4 sections: brand (`:acs-emblem::acs-wordmark:`) · masthead links + `:search:` · hat links + Donate / Log In / **Join ACS** · local nav (About ACS, 5 items, *Jobs at ACS*) | — | — | — |
| 1 | "The world's scientific community" 1440×746 (eyebrow, h1, lede, the blue video card) | `hero` (new): background picture · text · card (pattern picture, logo picture, `:play:` link) | simple | 3 rows | — |
| 2 | "Our strategic direction" 1440×515 (two columns: head + button + image strip / Vision, Mission, Core Values) | `columns (strategy)` | simple | 1 × 2 | — |
| 3 | "A society governed by its members" 1440×517 (head + outlined button, 8 link cards) | default content + `cards (links)` (8 rows, one link each, the source's column order) | container | 8 × 1 | `grey` |
| 4 | "Powering scientific discovery" 1440×745 (dark band over a picture, 4 brand cards) | default content (picture, h2, lede) + `cards (brands)` | container | 4 × 2 | `dark` |
| 5 | "Impact in action" 1440×678 (bento: 2 tall picture cards, 2 short) | default content + `cards (bento)` (tall cards: picture · text · pattern) | container | 4 × 2–3 | — |
| 6 | "Thousands of perspectives…" 1440×314 | default content | — | — | — |
| 7 | people strip 1440×283 (12 shaped portraits, an endless loop ×2 on the live page) | `cards (people)` (12 rows, the duplicate set not authored) | container | 12 × 1 | — |
| 8 | Explore membership / Get involved 1440×104 | default content (bold + italic links → primary / secondary) | — | — | — |
| 9 | "Find your place at ACS" 1440×293 (blue panel) | default content | — | — | `callout` |
| 10 | "Our history" 1440×486 (collage picture + text + two buttons) | `columns (history)` | simple | 1 × 2 | `lavender` |
| 11 | "Ethical commitments" 1440×250 (two PDF links) | default content (italic links, the download icon in CSS) | — | — | — |
| 12 | footer `div.footer.acsFooter.parbase` 1440×470 (an unassigned band outside `<footer>`) | footer document, 3 sections: brand column (logo, contact, social) · three link columns · legal row | — | — | — |

## Deviations (with their pixel cost)

| # | what | where / cost | why |
|---|---|---|---|
| D1 | people strip frozen at the measured track offset (x −288 at 1440, −334 at 360) | 360 #6 57 %, 1440 #6 45 %, 2560 #6 45 % of a 199–316 px band (≈ 1.3–2.5 % of the page) | the live strip is an infinite CSS loop (`people-loop-track` transform); the capture freezes it at whatever offset the load reached — no static build matches every load. Also 2560: the live strip is 316 tall (larger portraits), the build keeps 187 (−33 Δh, registered, not chased) |
| D2 | global header behaviour: both bars fixed at rest; at ≥ 900 the global bar leaves once the page scrolls and the flow closes up by 105 (`body.nav-scrolled`, header.js) | the 1440 / 2560 band 450–900 (29 % / 16 %): the live and the build stitch the second chunk at different scroll positions around the 105-px jump | reproduced from measure-page's note (header GONE after one viewport, first content box −105); the live threshold / scroll anchoring is not measured — the build closes the flow at scrollY > 0 |
| D3 | hero background: the `blue-macro-pattern` picture cover from the top with a white fade over the bottom 23 % | hero 10.3 % at 1440 | the live section paints two gradients and the picture in `section-background-div` + `section-wrapper`; approximated from the spec's `bgi` row |
| D4 | strategy right column: the two rules drawn as `border-top` on paragraphs 3 and 7 (24 / 25 and 24 / 17 at 1440) | strategy 14.4 % at 1440 (most of it the chunk seam of D2) | the authored `<hr>` is a section delimiter (lint 🔴 HR) |
| D5 | bento card patterns: blue-3 / yellow-2 as a third cell under the picture; the picture's window ends in `clip-path: ellipse(76% 100% at 50% 0)` | bento 13.5 % at 1440, 17 % at 360 | the live shapes are the picture's own curved window over the SVG pattern; the ellipse approximates the curve |
| D6 | header menus are links with a CSS chevron, no mega-menu panels; Log In is a link; search is an icon; mobile drawer / hamburger not built (the mobile header shows logo + search only) | header, every chunk at 360 (the live shows Log In + search + menu buttons) | panels and the account menu are out of the template run (BACKLOG #148) |
| D7 | cap-probe FAIL at 2560 (12 of 12 rows): live modules are 1440-wide boxes with 57.5 px inner padding, build modules 1325-wide content boxes | none in pixels (2560 8.84 %) | the same content edges (x 618..1943 at 2560) read through two box models |
| D8 | ethical commitments links at 360: centred and overflowing both sides (the live box starts at x 32 and overflows right) | #10 6.6 % at 360 | a source overflow quirk, not reproduced |
| D9 | footer "Manage Cookies" is a `#manage-cookies` link (live: a consent-manager control) | footer | a control without a page href |
| D10 | Font Awesome face downloaded and declared (fonts.css from the measurement) but unused — the icons are the source's inline SVGs (`icons/`) | none | the measured @font-face list includes it |

## Motion (gate --probes, probes.txt, 1440)

0 parity · 24 missing · 1 advisory (`nav-scrolled` on the build) · 2 dead on live. Missing: the hover transitions (320 ms colour / background /
border on the secondary buttons, the brand cards' image zoom and background, the masthead link colour), the people loop, the `acs-hover-*`
orb entrances and the `hover-orb-active` class; the header scroll-morph reads live 40 / build 105 px. Registered, not chased (outside the clock).
