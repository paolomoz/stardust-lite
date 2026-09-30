# Bain Capital home page — blocks-first prototype (2026-09-29/30)

Source: https://www.baincapital.com/ (home only). Content: `/drafts/home` (+ `/drafts/nav`, `/drafts/footer`, `/drafts/media/*`) on
da.live `aemcoder-adobe/sdt-baincapital`, previewed on branch `proto` only — never published.
Served: https://proto--sdt-baincapital--aemcoder-adobe.aem.page/drafts/home

## Gate (pixel % vs live stitched capture, |Δh| px) — all three widths, --settle on both sides

| width | prototype (harness page) | served page (branch) | live vs live (noise floor) |
|---|---|---|---|
| 360  | 34.6 % · Δh +7   | 34.4 % · Δh +7   | n/a |
| 1440 | 27.2 % · Δh −15  | 23.8 % · Δh −15  | 1.65 % · Δh 0 |
| 2560 | 23.3 % · Δh −37  | 23.6 % · Δh −37  | n/a |

cap-probe compare at 2560: PASS (fluid on both sides, 0 of 10 rows failed) for prototype and served page.
Section-height table (DOM, lag-free) @1440: every section within 4 px of the source except the hero (+4, the source's
smooth-scroll offset) and the doc height (+15). @360 doc Δ −2 (at the spec's 800 vh), @2560 doc Δ +154 → +37 after round 5.
Leak table: 71 wrappers, prototype vs served identical (no pipeline leak after round 6).

What the pixel number is made of (bands read on diff-1440.png):
- live stitched captures carry the source's GSAP ScrollSmoother lag: chunk 2 shows the un-scrolled header (128 px) and every
  section's fixed-layer colour switch lags one chunk; the same capture of the live page against itself differs by 1.65 %.
- hero slide state at freeze time (autoplay 5.5 s) — session-variable: 24–36 % in bands 0–900 on the prototype, 1–3 % on the served page.
- people section: photo slideshow image is chosen per session (outcome-bg / bc24-people-b…), and the source's GSAP stagger entrance is
  captured mid-flight (copy ~180 px low): 67–75 % in that band on every side.
- advantages copy parallax: implemented from measurement; residual is the chunk lag.

## Motion register (observed on live with motion-observe + a deep hover diff; verified with motion-compare and a state probe)

| element | trigger | observed on live | decision | verified |
|---|---|---|---|---|
| header | scroll > 10 px | `scrolled`: utility bar stays, brand row 90→58, logo 358→188 (0.5 s), nav rule off; height 128→96 | implemented (header.js/css) | motion-compare: scroll-morph parity (Δ32 px) |
| header | scroll down / up | `hide` (top −100, opacity 0, 0.3 s) / `show` | implemented | class `hide`/`show`/`scrolled` parity; state probe |
| section backgrounds | section top crosses ≈70 % vh | fixed colour layer switches (0.3 s); people swaps in a photo (0.2 s) | implemented (scripts/backdrop.js) | state probe: cream→lightblue→…; transition background-color parity |
| main nav link | hover | 4 px underline grows from centre (`::before`, 0.3 s); mega-menu opens | underline implemented; mega-menu decided-out (nav authoring for the whole site, rest-state cost 0) | hover-diff served: ::before width 0→100 % |
| utility links | hover | text → white, panel scales up (`::before` scaleY 0→1) | implemented | hover-diff served: 11 changes as live |
| outline buttons (hero, people, news) | hover | fill with border colour, text/arrow white (0.15 s) | implemented (.bc-btn) | hover-diff served ✓ |
| green report button | hover | bg rgb(220,245,78)→rgb(225,244,107) | implemented | hover-diff served ✓ |
| news headline | hover | colour → rgb(0,71,187) (0.3 s) | implemented | ✓ |
| footer links | hover | 1 px rule → transparent | implemented | ✓ |
| social icons | hover | bg → rgb(0,26,255) | implemented | ✓ |
| spotlight card | hover | image scale 1.1 (0.3 s ease-in-out) | implemented | ✓ |
| platform wheel sector | hover / click | label → rgb(171,202,233); click: `active`, content panel slides in from the right, "Back" returns | implemented (wedge hit areas, panel 0.3 s) | state probe: panel 1376→720 px, back restores |
| ESG commitments | click item / prev-next | active item leaves the list, card swaps (tab-pane opacity 0.15 s); nav buttons fill navy on hover | implemented | state probe + hover-diff ✓ |
| presence region tabs | click | `listing-view-active`: map hides, office grid shows | implemented (`is-listing`) | state probe: 6 Americas offices |
| hero slider | autoplay 5.5 s / click nav title | slide fade 0.5 s, tangram fade, progress line fills | implemented | state probe: click → slide 3, autoplay advances |
| advantages copy | scroll | translateY = clamp(0.2·(posterTop − 0.3256 vh), ±101) | implemented | parallax probe: identical table live vs build |
| play video (advantages) | click | Vimeo player replaces poster (`modal-open` on live) | implemented inline (iframe swap) | click works; no modal class (renamed) |
| hero video button | click | modal with Vimeo player | implemented (bain-hero-modal) | ✓ |
| business filter dropdown | click | max-height/margin 0.35 s, filters offices | decided-out (filter over the location dataset, not home content) | motion-compare MISSING (3 transitions) — accepted |
| more menu / search overlay | click | full-page overlays (`popup-open`, `search--open`, caret blink 3.5 s) | decided-out (site chrome beyond the page) | MISSING blink, opacity 3.5 s — accepted |
| stagger entrances (`.stagger-anim`) | scroll | GSAP opacity/translate reveals | decided-out (JS-driven; freeze-proof capture impossible) | pixel cost: people band |
| platform circle `animated` | scroll | class only, no measured paint | decided-out | — |
| spotlight caption parallax (82.8 px at rest) | scroll | 0 when in view | decided-out (rest-only offset) | — |
| people photo slideshow / name tags | time | image + captions vary per session | authored one image + two tags | session-variable |

## Deviations register (decided while authoring)

| source feature | decision | pixel cost |
|---|---|---|
| fixed scroll-driven background layer | same mechanism (backdrop.js), threshold 0.7 vh | chunk-lag bands only |
| section spacing 100/150/0 | section styles band / band-first / band-tail / band-open (60 @360, 5.556vw ≥1824) | 0 |
| hero tangram (SVG clip-paths, GSAP intro) | CSS clip-path polygons from the measured shapes (rounded corners kept, 11 points); slide 1's off-screen third shape placed at the top slot | ≤ 2 px per edge |
| hero 100 vh, grows with content @2560 (1191) | min-height max(100vh, 46.52vw) | 0 |
| advantages asymmetric rows (85/549 | 732/533 and 64/533 | 631/549) | grid fractions of the container; px offsets ≥1824 | 0 |
| advantages copy parallax | implemented (see motion) | lag only |
| platform intro paragraph inside the wheel row | decorate moves the section's lede into the block | 0 |
| platform content panels off-canvas | same, 0.3 s slide | 0 |
| ESG active item removed from the list; card 601 right-aligned | same; section min-height card-driven ≥1824 | 0 |
| ESG "Explore" button (mobile-only on source) | authored once, hidden ≥992 | 0 |
| news: first story both featured and first in list | list = all five, featured = first (clone) | 0 |
| news mobile duplicate list (d-lg-none) | one authoring, CSS reflows | 0 |
| people photo slideshow | one image (outcome-bg.jpg), two tags | session-variable band |
| contact amCharts map | static PNG capture per width (1440/2560/360), text hidden before capture | marker/projection identical; no hover |
| contact business filter | decided-out | 0 at rest |
| footer col-md-9 wrap | max-width calc(75% − 6px) | 0 |
| fonts Martina Plantijn / Inter | self-hosted woff2 copies of the source's files | 0 |
| images | CDN URLs authored; the pipeline copies them to the media bus (750/2000 renditions) — blocks paint the 2000 rendition | 0 |

## Rounds
0 measure (live spec 360/1440/2560, cap-probe, motion-observe, hover diff, autoplay, parallax, tangram probes) · 1 header out of flow, nav
spacing, hero offsets, advantages lede/grid, platform labels, news list, footer (Δh 64→14) · 2 mobile commitments (Chrome block
`justify-self` shrink), wide people/hero/platform/commitments · 3 mobile platform/spotlight/news/footer (360 Δ −2) · 4 mobile 100 vh
bands, wide advantages/news, header search href · 5 header morph on the header element + transition parity, backdrop photo as <img>,
parallax · 6 (served) pipeline `<picture>` renditions → largestSrc(); platform wedge hit areas.
