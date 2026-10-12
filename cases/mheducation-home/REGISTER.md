# mheducation-home — register

## Triage (as authored after `first`)
| # | live section | authored as |
|---|---|---|
| 0 | global banner (alert above the header) | default content, section 1; absolutely placed at the page top (it sits above the header on the live page) |
| 1 | hero (video, h1, sub, 2 CTAs) | default content; poster picture as the background, 40 % black veil |
| 2 | "We're Here for…" carousel (4 slides) | default content (eyebrow, h2, p, CTA) + `carousel` block with the 3 cards of slide 2 (Higher Ed) |
| 3 | Latest News | default content + `cards` (3 rows: picture | h3, date, text, Read More, tags) |
| 4 | Our Culture | default content + `culture` block (3 cards: text|picture, picture|text, text) |
| header / footer | nav doc (logo, 3 items, search group, tools) / footer doc (4 columns + bottom) |

## Deviations
- Carousel: only slide 2 (Higher Ed) authored; slides 1 (PreK-12, the load state), 3 (Medical), 4 (International) are not in the document; no autoplay, dots or pause control. At 360 the capture shows slide 3 → the 360 residual (NOTES).
- Hero: the background video (annas-story reel, webm) is not played; the poster image is shown; the video link is in the document but hidden.
- Banner close button, header icons (cart, user, globe, search glyph replaced by the site's search icon), the hero pause button and the cookie launcher are not reproduced; the cart badge and "…" are text approximations.
- "Item N of 3." screen-reader labels dropped from the news cards.
- Our Culture at 360: the live shows "Our Commitment to DE&I" (a responsive duplicate), the document has the 1440 text "Our Commitment to Belonging".
- Banner text "7:00-8:00" authored with a non-breaking hyphen (U+2011) to dodge the icon-token pass.
- Unmeasured values: banner link blue rgb(13 110 253), search placeholder #6c757d, header bottom border rgb(217 217 217) (from the spec's border list, not tied to the header).

## Motion
Carousel autoplay and the hero video are not reproduced (static).
