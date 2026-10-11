# wyndham-home — register

## Triage (as authored)
| # | section | model |
|---|---|---|
| 1 | promo banner (×3 identical slides in the source) | default content, one paragraph |
| 2 | booking: tabs, search widget, hero image + card | default content (ul, picture, mobile picture, h2, p, link); the search widget is not content |
| 3 | Deals & Discounts | default content |
| 4 | offers slider (5 slides; 13 with slick clones) | carousel |
| 5 | Join Wyndham Rewards | default content |
| — | 3 px rule (an empty live section) | not content — drawn as Our Brands' `::before` |
| 6 | Our Brands | default content |
| 7 | brand logos | cards |
| 8 | See All Brands (collapsed list of 20) | default link + carousel (list hidden) |
| 9 | Featured Hotels heading | default content |
| 10 | hotels slider (10 slides; 21 with clones) | carousel (rows: picture / h3, location, text, link) |
| 11 | Discover Thousands of Hotels | hero |
| 12 | Where will you go next? | default content |

## Deviations
- Booking search widget (destination, dates, rooms, special rates, search) not built: a 73 px #f4f4f4 band holds its place. Dynamic feature.
- Slider controls (arrows, dots) are painted placeholders; the sliders have no JS (`carousel.js` is empty) and show slide 1 at rest.
- See All Brands does not expand (the list is hidden by CSS = the live rest state). Footer accordions at 360 are drawn collapsed, no toggle.
- Header: no mega-menus, no globe/language picker; the 360 ACCOUNT / BOOK labels are pseudo-elements without icons.
- Footer brand logos are text links (the footer document carries names, not logo pictures).
- 360 promo banner: the live shows only a 28 px navy strip (text hidden under the bar); drawn as a header `::before`.
- `x2-points-for-new-hotels.png` downscaled to 1200 px (source 7500×5000, 34 MB > the 20 MB preview limit).

## Motion
- Sliders autoplay in the source; captured and built at slide 1, no motion implemented.

## Capture defects (see NOTES)
- at.js flicker control (body opacity 0) — overridden through the profile's hide list.
- Lazy pictures grey in live-360 / live-1440 (Join Rewards, hotel slide) — 360 stays over target because of them.
- Sticky booking bar repeated in live-2560.
