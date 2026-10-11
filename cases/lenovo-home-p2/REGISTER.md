# lenovo-home — register

## Triage changes
- Row 1 ("Sign In / Create Account", an experience fragment in main = the header) → `drop`; the nav document rewritten by hand
  (brand / sections: 6 + 4 links / tools / top bar / promo strip) because `first`'s nav doc had an empty sections list.
- Row 12 ("About Lenovo", the footer fragment in main) → `drop` (the footer document carries it).
- Hero section: the category strip (7 cards, live y848–1216 at 1440) was in the live section range but not authored —
  added as `cards (categories)` after the hero carousel (images from the media manifest, links from the measured DOM).
- Discover section: the hidden prompt-answer panels ("Start Over", "Users like you…", bento cards and five inner carousels,
  +6897 px) removed from the document; only the heading and the nine prompts stay.

## Deviations (residuals)
- R1 Hero carousel shows the first slide only — no autoplay, arrows, progress bar or pause (live autoplays; the 360 capture
  showed slide 3, so #0 stays ~25 % at 360).
- R2 Card sliders (hero, fueling, browse, category strip at 360): no controls / progress line; no decorate JS yet.
- R3 Header: the search field is a drawn frame (no form); rewards / cart / accessibility / support icons missing (no icons/*.svg);
  the 360 nav row breaks words like the live one but without hyphens; promo strip single message, no arrows.
- R4 Discover prompts are static text, not buttons; the prompt flow (answers) is not migrated (dynamic).
- R5 Card title boxes: the chevron icon missing; desktop hover-reveal of descriptions not reproduced (descriptions hidden ≥768).
- R6 4-up cards (powerhouse, promotions): the 16 px red line icons missing (32 px slot kept empty).
- R7 Case-study panel (Formula 1): tabs static (first one marked); the "How they did it" product list was not in the capture;
  the desktop panel is placed with absolute offsets (fixed 864 height).
- R8 Footer: e-mail field and region select drawn as boxes; social icons missing; app badges kept.
- R9 helix-alpha-light-e/n-background.svg: DA upload 201, preview 409 — the served discover / rewards panels miss the two art halves.
- R10 Served: the fueling slider scrolled sideways (overflow: hidden scrolled by the gate's lazy-image pass) — fix: `overflow: clip`.
- Section heights are pinned per width for sections 1, 4, 5, 6, 8 and the footer (the live heights), overflow hidden.

## Motion
- Hero autoplay carousel, card sliders, hover reveal on cards, tabs: none reproduced (static).
