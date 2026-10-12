# Register — rbc-home

## Triage (as authored, after re-modelling the draft)
| # | live section | model |
|---|---|---|
| 0 | header | nav doc: brand (logo), sections (6 main links), tools (search, Contact Us, EN, Sign In), extra (top country bar + Other Sites) |
| 1 | banner "Introducing My Money Matters" | `columns` text | picture, style banner (bg energy lines) |
| 2 | 3 panels (Where We Operate / Investor Day / Latest News) | `cards`, one row per panel, style grey |
| 3 | Careers + In the Community | `columns` picture | careers | community, style callouts |
| 4 | About RBC | default h1 + list (accordion heads) + `cards` (2 articles), style grey, about (two-column section grid) |
| 5 | Our Operations | default h2 + tab list + `cards` (6 icon items), style operations |
| 6 | footer | footer doc: 4 h3+list columns; bottom bar (copyright + legal links, social icons, Top) |

## Deviations
- Region select ("Canada" + Go) authored as a text box + Go link — no form control (dynamic).
- About RBC accordion: three heads authored as list items with a CSS chevron; panels not expanded/interactive (their content was not in the capture).
- Operations tabs: only the Canada panel authored; the four tabs are a static list (Canada drawn active).
- First article card in About RBC has an empty picture cell — the live image is broken (src "undefined"), the blank 190 px area is kept.
- Header dropdowns (Contact Us ▾, EN ▾, Other Sites ▾), search field, mobile drawer: static labels; the 360 Sign In lock icon inlined from icon-secure-dark.svg.
- "Advertising & Cookies" is text, not a link (no href in the measured document).
- List chevrons drawn in CSS (border chevron) instead of the source's chevron SVGs.

## Residuals (under 10 %, not polished)
- 360 band 1800–2700 12 % (callouts card: image crop and 15 px offsets), 1440 band 1350–1800 9.5 % (callouts image object-position).
- Footer text weight looks heavier than the live at 360 (same 400 face; rendition).

## Motion
- None measured on the page besides accordion/tab interactions (not reproduced, above).
