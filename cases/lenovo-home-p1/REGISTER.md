# REGISTER — lenovo-home

## Triage
| live row | decision |
|---|---|
| 1 "You've Got Points to Use!" 269×406 | drop — a personalised promo popup over the hero, not page content |
| 2 "Sign In / Create Account" 1440×228 | drop — the header band captured inside main (header is the nav document) |
| 13 "About Lenovo" 1440×985 | drop — the footer duplicated in main (footer is the footer document) |
| 3 hero, 4 discover, 7 fueling, 8 browse | carousel (one block, variants by section) |
| 5 powering, 9 rewards | cards |
| 6 powerhouse, 10 promotions, 12 formula | columns |
| 11 innovation in action | default content |

## Deviations (residuals at stop)
1. Hero category strip (PCs & Tablets … Deals, 7 icons) is not in the authored document (`author` left it out; media exists as media/category-*.png); its height is reserved as section padding (368 / 384). Largest residual at 360 (#0 29.8 %).
2. Hero carousel shows slide 1 statically; the source autoplays (the 360 capture shows slide 3). No controls, no autoplay JS.
3. Discover (#1): prompt chips are static paragraphs; the "Start Over" / "Users like you…" paragraphs are hidden (source shows them after interaction); 3 chips hidden at 360 as the source does. Box paint offset ~16 px at 360 remains (12–19 %).
4. Card / tile icons (red outline icons in powerhouse / promotions, chevrons in card labels) not authored — the slot is reserved as padding.
5. Card descriptions hidden at ≥768 (source reveals them on hover); link paragraphs hidden (the card is the link in the source).
6. Formula (#9): tabs are static (first story only); "How they did it" list (Asset Recovery Services …) is not in the document; the impact quote has no #f2f5f9 tile; stats tiles approximated. Δh +59 at 1440 / 2560.
7. Header: the nav document carries only logo, account links, "Join Lenovo Pro"; search, nav links row, promo strip text are not authored — painted bands only (#ededed / #fff / #e6f4fa) at measured heights.
8. Footer: social icons and the country flag render as broken images (icon names `:lenovo-facebook-30-alternate-med:` etc. not resolved); email and country controls are static boxes.
9. Served 2560 band 3150–3600 at 30 % vs 6.5 % on the harness (fueling / browse tracks — likely image loading or the fluid track at the served origin); not investigated (post-clock).

## Motion
Hero autoplay carousel, fueling / browse sliders (arrows + progress), formula tabs, discover chip interaction — none implemented (static first state).
