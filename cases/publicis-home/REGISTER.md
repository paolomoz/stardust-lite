# publicis-home — register

## triage
| # | live | authored | note |
|---|---|---|---|
| 0 | header.header (fixed, h75 / h60) | nav doc: brand / sections (two lists) / tools | rewritten by hand (author mislabelled the logo link, dropped button items) |
| 1 | section.crawl.start-page (hero, bg paint cover) | hero block: bg picture, logo picture, h1 | split needed `--sections 'main > section'` |
| 2 | section.section--inside (quote card) | quote block: quote / attribution / CTA (bold link) | |
| — | no footer | empty footer doc | page has none |

## deviations
- Font: Gotham Narrow A (cloud.typography, licensed to the source domain) → Urbanist (Google, OFL), chosen by measured width (h1 939 vs 928, quote line 876 vs 880).
- Header: the dropdown items (The groupe, Investors) are authored as nested lists; the source's slide-down menus, the search overlay and the mobile drawer look are not reproduced.
- Search icon: the boilerplate search.svg in the source's gold, not the source's glyph.
- Hero background parallax (data-prllx-bg, speed 0.5) not reproduced — static cover.
- OneTrust cookie floating button: source-side, not migrated.
- App shell reproduced as measured (html/body overflow hidden, main the scroller below the header) — a design choice of the source kept for fidelity; revisit for EDS norms.

## motion
- Parallax background on the hero (translate3d on scroll) — not reproduced.
- Header-lang / footer-lang fade-in (opacity / translate) — not reproduced.

## residuals (all widths < 4 %)
- Font rendition (Urbanist vs Gotham Narrow) in the h1, quote and nav; quote card anti-aliasing.
