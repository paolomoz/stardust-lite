# REGISTER — revlon-home

## Triage (as authored after the re-model)
| # | live section | model |
|---|---|---|
| 1 | hero slideshow (4 slides) | `carousel`, row = slide: [desktop picture, mobile picture] / [heading, text, Shop Now] |
| 2 | Best Sellers | default content (h2, h3) + `carousel`, row = [badges] / [picture] / [title, shades, price]; a red badge = bold |
| 3 | Care for your color-treated hair | `hero` (picture, h2, p, button) |
| 4 | New (after color) | `carousel`, row = [picture] / [badge, linked title, price, review count] |
| 5 | Featured Categories | h2 + `carousel`, row = [picture] / [linked name] |
| 6 | 20 px spacer | dropped (a margin on the next section) |
| 7 | newsletter (Klaviyo) | default content, section style `newsletter` |
| — | header / footer | nav.html (logo added to the brand section) / footer.html |

## Deviations (residuals at stop: 360 8.95 %, 1440 1.70 %, 2560 0.96 %)
1. Slideshow frozen on slide 4 ("Spice things up"), which is the slide the cached capture showed. No rotation, pause control, dots or arrows. Spice band is still 25.6 % at 360 because the mobile picture is the source's 531 px file scaled up.
2. Mobile slide art direction: the source's `medium-up--hide` mobile images (not fetched by media-fetch) were fetched by a case script and authored as a second picture per slide. CSS shows one picture per breakpoint.
3. Carousel arrows (best sellers, new, featured) and drag are not built. The rows overflow and get clipped.
4. Product-card hover state (red title and rule on one card in the capture) is not reproduced.
5. Star ratings are a CSS `★★★★★` before the review count. The source draws 4.5-star SVGs.
6. The newsletter form is static: the input is a bordered paragraph, the checkbox is a drawn box, and nothing submits (Klaviyo embed not built).
7. Footer: the social icons are red dot placeholders (the icon SVGs were not fetched) and their labels are hidden. The country list is collapsed behind a CSS "Global Sites" label with no dropdown. The bottom logo is inverted with a filter because the SVG has no fill.
8. Care-for-your-hair hero at 360 is still 27 %. The text matches, but the picture rendition and crop differ.
9. Featured categories at 360: Δh +32 inside the band. "Tools" is missing its "All Beauty Tools" second line.
10. The OneTrust cookie badge is not reproduced.

## Motion
The slideshow autoplays and the cards use AOS entrance animations on the source. Neither is built. The gate compares at rest.
