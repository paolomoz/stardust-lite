# wpp-home — register

## Triage
Accepted as drafted: hero (default), our work → cards, careers → columns, latest insights → carousel, sustainability (default), latest news → carousel; header/footer as chrome documents. No row dropped.

## Deviations
1. Header pill: the WPP logo (svg) is not authored — the brand cell is the "Home" link set in 24 px uppercase; the "Menu" control is a list item with a drawn dot-grid icon; no menu panel.
2. Footer logo absent (the chrome document holds an empty `:icon:` token); its box is reserved.
3. Carousels are static tracks (no slide controls, no swipe); the progress bar is drawn by CSS.
4. Video play/pause buttons are not rendered; videos are muted autoplay loops (the gate freezes both at frame 0).
5. Sustainability at 360: live crops the video to a 306 × 765 window with a parallax scale (432 × 1080) — approximated by the window alone; the card text is shown at rest (live captured it inside an entrance state).
6. Document: insight tags split into one paragraph per tag by the tag names seen on the page; careers CTA href taken from the capture (/en/careers/search-and-apply).

## Motion
Entrance fades (sustainability card, slides) and carousel autoplay are not reproduced.
