# sherwinwilliams-home — register

## Triage (as run)
| # | live | authored |
|---|---|---|
| 1 | hero carousel (one slide visible) | default content: desktop picture, mobile picture (shown < 1024), stretched link |
| 2 | "Go To" link row | default content: p + ul of links (triage said accordion — flipped) |
| 3 | Top Colors color carousel ×12 | `carousel` (rows = slides, picture = swatch) + prev/next controls |
| 4 | "Every client" teaser | default content (h2, p, ul, picture) laid out as two columns (triage said accordion) |
| 5 | Performance Coatings slideshow ×9 | `carousel`: rows = picture · h3 label · copy; first slide shown, labels as the tab row |
| 6 | News & updates ×3 | `cards` |
| 7 | Brands ×8 logos | `cards` (image-only) |
| 8 | Get to know our Company | `columns` |
| header / footer | AEM nav / linklist footer | nav.html (logo, 4 labels, 3 tools), footer.html (5 heads + lists, legal list, copyright) |

## Deviations
- Hero: the live carousel prev/next buttons are not authored (one slide); the "Learn more" link is a stretched, text-hidden overlay.
- Header: the 1440 utility bar (Find a Store / Select Region / Sign In) and the out-of-region dialog are not shown (the capture shows the nav row only); nav labels have no mega-menu panels; 360 "details ›" line not authored.
- Performance Coatings: the tab row is static (no tab switching); slides 2–9 authored and hidden; prev/next scroll the block only.
- News cards: the 360 carousel controls are not authored (the section's bottom padding stands in); the duplicate "Learn more" links and the "slide N to M of K" live-region text were dropped from the document.
- Brands: the live lazy logos are broken in the capture (alt text painted; row 2 at 1440, all at 360); the build shows the logos. 360 row 3 is 40 px tall to match the live alt-text wrap.
- Fonts: the SWDropclothVF file renders one instance at every weight here; the light body copy (Every client, Company) uses the source's `swdropclothdisplay-300` face. Open Sans uses the source's latin subset files.
- Photos: object-position values (Every client `left 13%`, Company `left 20%`) fitted to the capture by pixel sweep, not read from the CSS (the live paints them as background images).
- Footer: the live logo is a 1×1 placeholder (not authored); the 360 "+" accordion markers are static.

## Motion
- Hero and Top Colors / News are sliders on the live page; none animates in the prototype (no autoplay).
