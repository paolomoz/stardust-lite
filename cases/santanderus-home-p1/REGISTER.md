# REGISTER — santanderus-home

## Triage (accepted draft, one document edit)
| # | live | block | note |
|---|---|---|---|
| 0 | header (fixed layer: tophat 30 + bar 72; the welcome banner rides in the layer, absolute) | header | nav.html rewritten: logo picture (brand), 5 nav links (sections), tophat items (tools), welcome banner (4th section, `.nav-extra-3`) |
| 1 | hero c-hhero | default (picture, h2, h1) + carousel | the three 150×150 thumbnails moved from default content into the carousel rows (cell 1); the authored doc had them loose and the image cell empty |
| 2 | Our Purpose | default content | |
| 3 | About Us | columns | |
| 4 | News & Media | default + carousel | |
| 5 | footer | footer | |

## Deviations
- Hero carousel is static: first slide shown, the progress indicator is a painted gradient; no autoplay (motion not reproduced).
- Hero down-arrow button is a section `::after` (not a control).
- Welcome banner: no close (×) icon or dismiss behaviour; it is authored in the nav fragment, so it shows on every page using the nav.
- External-link icons (tophat, banner button, Careers, footer links) and the tophat chevron are omitted.
- Stock ticker is the static text "Loading stock data..."; Search is a label, not a control.
- 360 hamburger drawer not styled (only the bar icon); news slider has no swipe/controls (overflow hidden).
- Footer scroll-up button omitted.
- Logo width set by eye (128 px / 112 px at 360), not from a spec row.

## Motion
- Hero featured-news carousel autoplay + progress bar fill: not reproduced.
- News & Media slider (360 swipe): not reproduced.
