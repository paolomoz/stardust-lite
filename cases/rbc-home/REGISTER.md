# rbc-home — register

## triage (as run; the document re-modelled by hand after `first`)
| # | live | block |
|---|---|---|
| 0 | header: tophat country row, blue bar (logo, search, Contact Us, EN, Sign In), white main-link row; 360 bar + hamburger | header (nav doc: brand / sections / tools / tophat as nav-extra-3) |
| 1 | hero "Introducing My Money Matters": text + laptop picture on an energy-lines background | `columns` (text · picture); background on the section (360: on the picture cell) |
| 2 | three callouts: Where We Operate (region select), Investor Day, Latest News | `cards` (one body cell per callout) |
| 3 | Careers (picture + text) + In the Community | `columns` (picture · text · text) |
| 4 | About RBC: accordion of 3 + two article cards | default content (h1 + list) + `cards` (picture · text) in a 2-column section grid |
| 5 | Our Operations: tab buttons + 6 icon link groups | default content (h2 + tab links) + `cards` (icon · text) |
| 6 | footer: 4 link columns, legal bar with social icons and Top | footer (two sections) |

## deviations
- Region select is a static box ("Canada") with the Go link; no dropdown.
- About RBC accordion items are links (no expand); Operations tabs are anchor links, Canada's panel only.
- First article card image blank, as on live (live src "undefined").
- The header search is a link styled as the search field; Other Sites and language are links without menus.
- The hero background png is served via a 301 to the media bus (works; noted).
- 1440 / 2560 residual 8 / 6 %: Careers row 22 px taller, Operations grid and footer ±8 px (not polished — past the stop).

## motion
- None on this page beyond hover states (not reproduced).
