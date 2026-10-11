# lenovo-home — register

## Triage
| row | live | decision |
|---|---|---|
| 1 | "You've Got Points to Use!" callout 269×406 (absolute overlay under the header) | drop — a personalised pop-over, not page content |
| 2 | header XF repeated inside main (y0 h228) | drop — the chrome's own band |
| 11 | footer XF repeated inside main (y6962 h985) | drop — the chrome's own band |
| 3 / 7 / 8 | hero carousel, "Fueling", "Browse devices" | carousel (one slide in view / a 396-wide track) — no decorate, CSS only |
| 4 | "Discover How Lenovo Can Help You" prompt | carousel (as triaged); the answer panels stay authored but hidden (shown on a chip click live) |
| 5 / 6 / 9 / 10 | events cards, powerhouse, promotions, the winning formula tabs | cards / columns |

## Deviations
- Authored content the split missed (added to the document, values measured): the category row (7 × 150, in the hero section), the
  "My Lenovo Rewards" band (in the browse section), the "Lenovo Innovation in Action" title + link (in the formula section). Section boundaries
  therefore differ from the live split by the title row (promotions Δh −88/−126, formula +88/+137: a split artefact, pixels aligned).
- Hero: the live capture shows a different slide per width (autoplay: 1440 "A New Vision", 360 "Smarter AI"); the build shows slide 1 at all
  widths; at 360 its wordmark is hidden and the copy holds a 112 px min-height so the band stays 668.
- Hero / slider controls (prev / next / progress / pause) are not built: their space is padding. Carousel behaviour (autoplay, swipe) not built.
- Discover: band background image approximated by a linear gradient (peach → lilac at ≥ 768, lilac at 360); chip clicks do nothing.
- Powerhouse / promotions icons (32 px, red mask icons) not authored: 72 px top padding keeps the title position.
- Card descriptions (≥ 768) hidden as live (hover reveal not built); "Learn more" style links in cards/slider labels hidden (the chevron link).
- Header: height only (228 / 391), nav unstyled and clipped — the header was not in a section row and was not worked.
- Footer: band, columns and legal row approximated; newsletter field, socials and country selector not styled to spec.
- Winning formula: tab panel clipped to the live height; tabs not interactive; quote / stats cards not laid out.

## Motion
- Hero autoplay carousel, slider tracks, discover chip → answer panel, card hover reveal: none built (static).
