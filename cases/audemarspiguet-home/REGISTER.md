# www.audemarspiguet.com/ch/en/home — triage, deviations, motion (blocks-first v2.5, 2026-10-01)

Source: https://www.audemarspiguet.com/ → geo-redirects to `/ch/en/home` (the visitor's country; pinned by using that URL with
`--locale en-GB` on every instrument). One overlay: OneTrust bar (`#onetrust-accept-btn-handler`, no reload); no geo modal. Static
assets 406 a `curl` that sends the Chrome UA with a Referer (WAF); the headless sessions were never blocked, `--headed` not needed.
Doc height 8224 at 1440, 9034 at 2560, 8828 at 360. Light-DOM AEM Sites page with React (navigation, footer language selector) and Vue
(carousels, lookbook, text-image) islands; `main` present; 0 shadow roots. Cap-probe: **shell fluid, content cap 1920 (module cap, 3
capped sections)**, probe 2560. Type: Helvetica Neue Web 100 / 200 / 300 / 400 / 500 (woff2) + Times Now ExtraLight Italic (otf/woff,
no woff2 on the source) + icomoon (social glyphs); heading-1 = 56/56 w100 uppercase ls −0.56 with a serif `<i>` 60/49.8 w250 italic
uppercase ls −1.2 (40/40 + 44/36.52 below 900); body 17/22.95 w300 ls 0.26 (16/23.04 at 360); card text 16/24; line link 14/24 w500
ls 0.21; footer links 14/20 w300; footer titles 12/16 w500 uppercase ls 1.8. Colours: page rgb(0,0,0), text white / rgb(246,245,243)
on the text-image blocks, hover grey rgb(191,191,191), button hover rgb(117,117,117), footer rgb(43,79,79), rules rgb(139,140,140).
Gutters 20 / 32 / 92.5; the content grid is 12 columns of the inner width (104.58 at 1440, 144.58 at 2560).
Noise floor (two 1440 captures, videos frozen at t = 0 by stitch-shot): **0.00 %** — deterministic page.

## Triage table (step 2, before any block existed)

| # | section (live, 1440) | default content | block · shape · collection match · rows × cols | section style |
|---|---|---|---|---|
| 0 | fixed navigation 1440×112 (hamburger · logo 143×30 · watch / pin / user icons), transparent over the hero; hides on scroll down, returns with a white sheet and black glyphs on scroll up; off-canvas drawer 1014 wide: 4 categories (Collections, Savoir-Faire, Our World, Services) with link panels, 5 important links with 24 px icons, language selector | nav doc, 3 sections in reading order: brand link (`:logo:`); categories as a 3-level list (category → group title or ungrouped link → links); tools (`:watch:` Find your watch, `:pin:` Boutiques, `:user:` Login or sign up, `:mail:` Contact us, `:world:` Switzerland / English) | `header` · BC **header** (fragment `/drafts/nav`); header.js builds bar, drawer, panels, scroll state machine; the first three tools are the bar's icons (two at 360) | — |
| 1 | hero 1440×900 (100vh): muted looping Dynamic Media mp4 (1920×1080), h1 "A NEW ROYAL OAK" + serif "DESIGNED WITH SERENA WILLIAMS" in the first third, vertically centred under a 120 px band, line link; pause control 30×20 bottom-right (60 / 66) | — | `hero` · simple · BC **hero** · 2 × 1 (video link · h1 + `<em>` + link) — the block builds `<video>`, the pause/play control and the background parallax (translateY = −0.2 × offset) | — |
| 2 | hero 2, same composition + a paragraph 17/22.95; the player paused until in view | — | `hero` · 2 × 1 (video link · h1 + p + link) | — |
| 3 | "Our 2026 / novelties" h2 + "Explore our novelties" link in the first 35 % column; 18 watch cards in a swiper 504 → 1440 (4.6 per view, 10 gap, 196 × 259 pictures, title 16/24 500, copy 16/24 300, line link), 48 px round prev/next, 104 / 64 vertical padding; mobile 1.2 per view + 18 indicators | `h2`, `p` link (moved into the block's heading column by the decorate) | `carousel (compact)` · container · BC **carousel** · 18 × 2 (picture · h3 + p + link) | — |
| 4 | "Crafting time / since 1875" h2 over the full width, lede 17/22.95 indented one column (104.6) and four wide (412); 100 / 50 padding | `h2`, `p` | — (default content) | `indent` |
| 5 | lookbook 1255 × 538 black mat (5 / 100 padding): two picture stacks (258: portrait 349 + landscape 171) around a 524 × 528 square mp4 with its thumbnail poster and a play mark; the mat is 2:1; mobile: video first, then two 132 columns | — | `columns (lookbook)` · container · BC **columns** · 1 × 3 (2 pictures · video link + poster picture · 2 pictures) | — |
| 6 | 0-height `textimage` container (margin 0) | — | nothing to write (live-spec: 0-height, margin 0) | — |
| 7 | two text-image teasers 628 wide (picture 623 × 415 · h2 + copy 412 wide · link): Musée Atelier, Watchmaking Experiences; 147 / 100 padding (the source's empty section title keeps its 46.5 margin) | — | `columns (teasers)` · container · BC **columns** · 1 × 2 (picture + h2 + p + link each) | — |
| 8 | "AP CHRONICLES" text (cols 2–4) | picture (cols 7–11); 100 / 50 padding | — | `columns (feature)` · container · BC **columns** · 1 × 2 (h2 + p + link · picture) | — |
| 9 | "Our / Services" h2; 5 service cards (3.2 per view, 286 × 377) | `h2` | `carousel` · 5 × 2 | — |
| 10 | "Find a boutique": picture (cols 1–7) | text (cols 9–11) | — | `columns (feature)` · 1 × 2 (picture · h2 + p + link) | — |
| 11 | newsletter white band 480 (140 / 180 padding): h2 "Get the / Latest News", lede, black 320 × 64 "Subscribe" button, bottom-aligned on one row | `h2`, `p`, bold link | — (default content) | `newsletter` |
| 12 | footer rgb(43,79,79) 795: three partner logos (56 / 56, 1 px rule), language link + 4 link groups on the right half (4 × 159), social glyph row · ICP · copyright; 360: logos stacked, accordion rows 37 tall, 2 × 5 glyphs | footer doc, 4 sections: logo pictures in links; `:world:` link + 4 × (`h4`, `ul`); social `ul` (link text = network name, the glyph comes from the href); 2 legal `p` | `footer` · BC **footer** (fragment `/drafts/footer`); footer.js groups h4 + ul, accordion below 900, icomoon glyph per host, logos × 1.16 from 900 | — |

Hidden DOM not modelled: the drawer's language / currency panel (country + language selects, "Apply"), the locale and masterclass
banners (0 height), OneTrust, Teads / Google pixels, the hero video controls' i18n key text ("Pause ap.commons.ui.comp.video.label"),
the reveal-effect line splitting (every paragraph is one `<p>` in the document). Configuration: `title`, `description`, `nav`, `footer` in
the metadata block; section styles authored: `indent`, `newsletter`; everything else is default (the carousel / columns sections carry
their padding by block container class).

## David's Model lint at step 2
See LINT.md: 0 🔴, 3 🟡 (2 × D1 hero — the Block Collection hero shape: media row · copy row; the block is a genuine widget: `<video>`
from the link, pause/play control, parallax; 1 × D4 — three footer SVG logos, verified pure vector, 0 data URIs).

## Deviations register (step 3, completed through the rounds)

| source feature | decision | pixel cost |
|---|---|---|
| Hero videos: Dynamic Media mp4 (`/is/content/…`, `video/mp4`, 8 MB, no poster on the source) | authored as the source's own URL; hero.js renders `<video autoplay muted loop playsinline>` from the link (a picture in the same cell would be its poster). Not re-hosted: the pipeline serves an uploaded mp4 as `application/octet-stream` (BACKLOG #31) and 8 MB in git is not a media path | 0 at rest (stitch-shot freezes both sides at t = 0; the decoded frame is the same) |
| Hero 2 player paused until scrolled into view | both heroes autoplay; the control reflects the element's paused state (▶ when the capture pauses it, ⏸ while playing) | 0 (frozen frame either way) |
| Hero background parallax: `translateY(−180)` on the band at y 900 at scroll 0 (−0.2 × offset) | hero.js, rAF on scroll, same function | 0 (every capture chunk starts at a band edge: offset 0) |
| Hero control text "Pause ap.commons.ui.comp.video.label" (a leaked i18n key) | icon-only button with `aria-label` Pause/Play video; `pair` reports the live text MISSING | 0 |
| Reveal effect (`js-reveal-effect`): copy fades in and rises 20 px per line when entering the viewport | `is-revealed` class via IntersectionObserver on hero, carousel body (opacity / translateY 20 → 0, 0.6 s); no per-line split | 0 after settle; the **live spec** captured several links mid-flight (tf 6–17 px): the pair rows "Discover more" (teasers) −7 and "Explore all boutiques" −17 are live-measurement artefacts (deep-probe on live: `tf=matrix(…, 6.0551)` / `15.4283`), real Δ −1 / −2 |
| Carousel = Swiper with `autoHeight`: the track is as tall as the tallest of the slides in view **plus the next one** (novelties 643 = card 1 at 1440; services 618 = card 3 at 360 with 1.1 per view) | carousel.js sets the viewport height on every move from `ceil(perView) + 1` slides; `align-items: flex-start` | 0 (round 3 +24, round 5 −49 at 360 before the rule was read) |
| Carousel geometry: heading column = 35 % of the capped wrapper minus the gutter (411.5 / 579.5), track from there to the viewport edge (936 / 1568), slide = (track + 10) / 4.6 − 10 (195.6 / 333) or / 3.2 (285.6) | CSS `calc(35% − 0.3 × gutter)` + `width: calc(0.65 × min(100vw, 1920px) + (100vw − min(100vw, 1920px)) / 2)`; JS slide width | 0 (card boxes at the live x / w at 1440, 360, 2560) |
| Carousel arrows: 48 px circles at 40 from the track edges, vertically on the picture's centre − 2; prev hidden (opacity 0) at the start; hover rgb(191,191,191) + rgba(0,0,0,.5) | carousel.css / js (`--img-h`) | 0 (the ring is visible; the 16 px chevron glyph is `fill: none` + stroke on the source — rendered the same) |
| Mobile carousel indicators: one per slide (18 / 5), 6 px rings, active 24 × 12 pill, 19 above / 1 below in a 36 px row | carousel.css | 0 |
| Carousel cards 8–18 and services 4–5 are lazy on the source (42 px placeholders, no `src` at dump time) | pictures fetched from the `data-src` renditions (`size=470`), the same bytes as the loaded cards | 0 (never visible at rest) |
| Lookbook: three columns 258 : 524 : 258 with 7.5 gaps, mat 2:1 (height = inner / 2), left stack portrait over landscape, **right stack landscape over portrait**, rows split 2577 : 1262; mobile centre first (aspect 1535 : 1516), two 132 columns with 8 gaps | `columns (lookbook)` CSS: `aspect-ratio: 2 / 1` grid, absolute pictures (an intrinsic-size image defeats the ratio), per-column row templates | 0 (528 / 268) |
| Lookbook video (`CODE_UNIVERSELLE_brandCampaign.mp4#t=0.001`, 720 × 720, poster `lb_thumbnail.jpg`) | video link + poster picture in the centre cell; the block renders `<video>` with the poster and a play mark | the poster differs from the decoded t = 0.001 frame by compression only: band 3150 at 1440 5.2 % together with the stacks' resampling |
| Text-image copy colour rgb(246,245,243) on headings and paragraphs, white on the serif accent and links | `columns (feature|teasers)` colour rules | 0 |
| Feature layout: text-first → text cols 2–4, picture cols 7–11; picture-first → picture cols 1–7, text cols 9–11; mobile picture first with the h2's 33 margin above it (83 / 50 padding) | one variant, geometry by the cell order (`columns-picture-first`) | 0 |
| Teasers: 147 top padding = 100 + the source's empty section-title h2 margin 46.48 | section padding 146.48 / 100 (83 / 50 at 360) | 0 |
| Heading line boxes: the serif accent is an inline `<i>` whose 60 px glyphs over the 56 px strut make a 58 px line (114 per two-line heading, 285 for 2 + 3 lines) | `<em>` kept inline, broken onto its own line with `em::before { display: block }`; `line-height: 47.8px` reproduces the 58 px line (49.8 gave 60) | ±2 on the 3-line hero heading and the 3-line Musée heading (283 / 170 vs 285 / 172) — font metrics |
| Indent band: h2 + lede with two non-collapsing margins (37.5 + 16.5) on the source's flex children | `h2 { margin: 37.52px 0 54px }` (adjacent margins collapse in default content) | 0 |
| Newsletter row: h2 (46.48 top margin) · lede at 50.6 / 105.7 from its column start, 380 / 430 wide · 320 button, bottom-aligned | grid 3 × 1fr, `align-items: end`; lede `margin-left: calc(34.44% − 93.5px)`, `width: calc(31.25% + 249.3px)` — exact at 1440 and 2560, linear in between (unverified) | 0 at the three widths |
| Footer right half: 4 × 158.75 columns at 50 % + 5 (725; 1285 at 2560) | grid `1fr 1fr` with 10 gap (a float next to a flex box resolved the margin from the float's edge: −215 for one round) | 0 |
| Footer partner logos: natural SVG sizes at 360, × 1.16 from 900 (164 × 16, 103 × 65, 165 × 56) | footer.js sets `width = natural × 1.16` ≥ 900; row grid `1fr` rows (56 each) with 48 gaps at 360 | 0–1 |
| Footer social icons: icomoon glyphs (`.icon-instagram::before { content: "\e905" }` …, 21 px) | the links are authored with the network's name; footer.js maps the href host to the glyph class, text → `aria-label`; icomoon.woff2 in `/fonts` with the codepoints read from the site's `main-b1c836b3` CSS | 0 |
| Footer accordion at 360: titles 37 tall (16 + 20 padding + 1 px rule) with "+", 32 gaps, collapsed | footer.js buttons (`aria-expanded`), CSS | 0 closed; open state not measured |
| Footer link hover: colour → lch(99.99 … / 0.5) and opacity 0.56 | opacity 0.56 | 0 at rest |
| Drawer language panel (country / currency / language selects) | decided out: `Switzerland / English` authored as a link to the site root | 0 (hidden at rest) |
| Media: 27 + 17 renditions — avif (`fmt=avif-alpha`, size 470 / 1920), jpg (`size=1490`), 3 svg logos, as the browser fetched them at 1440 | uploaded unchanged to DA `/drafts/media/` (lower-case, `_` and `.` → `-`: a name with an underscore uploads 201 and previews **404** — see REPORT), referenced by the branch preview URL; the pipeline serves optimised renditions | photo bands 1–7 % at 1440 (resampling / rendition edges: lookbook 5.2, AP Chronicles 7.1, boutique 7.9), 2–3 % at 2560 |
| Images on the prototype load from the aem.page media host: the first renditions took seconds and one gate captured blank cells (round 2: 9.98 %) | every media URL pre-warmed with `curl` before gating | 0 after pre-warm |
| Fonts: Neue Helvetica 25 / 35 / 45 / 55 / 65 woff2, TimesNow-ExtraLightItalic otf + woff (the source has no woff2: the .woff2 URL is a 404 HTML page), icomoon woff2 | `/fonts`, `fonts.css` imported from `styles.css` | 0 |
| Icons: the navigation and hero SVGs (logo 183 × 39, mark 29 × 28, menu, close, watch, pin, user, mail, world, pause, play, chevron) | `/icons/*.svg` extracted from the live DOM dump; `scripts/icons.js` inlines them so `currentcolor` carries the scroll-state and hover colours (`:icon:` tokens in the documents; the harness fold does not convert them — scripts.js `decorateIconTokens`, BACKLOG #5) | 0 |
| Content cap 1920 (module), gutters 20 / 32 / 92.5 (breakpoints between the gated widths assumed 640 / 1200) | `main > .section > div { max-width: 1920px; padding: 0 var(--gutter) }`; cap-probe PASS 0 of 5 rows from round 0 | 0 |
| Empty metadata section on the served page (METHOD step 7) | `main > .section:not(:has(> *)) { display: none }` | 0 (leak diff 0 lines) |
| Text anti-aliasing on a black page (thin 100-weight glyphs) | residual in every text band (0.2–1.7 % at 1440; 1.3–7 % at 360) | see the three-width table |

## Motion register (hover-diff live and build, nav-scroll ladder live / build / served, click-state drawer live / build / served, motion-observe via `gate --probes`)

| interaction | live | build | status |
|---|---|---|---|
| navigation on scroll | at rest transparent, white glyphs; scroll down (y > 44) `--scrolled-down`: bar translateY(−112); scroll up `--scrolled-up`: bar back, white sheet (`scroll-bg` translateY −112 → 0, 0.3 s), glyphs rgb(0,0,0); at y 0 transparent again | header.js state machine (`scrolled-down` / `scrolled-up`), `.nav-bg` 0.3 s, colour 0.3 s | **verified**: identical ladder on build and served (`motion/nav-scroll-*.txt`: rest / 30 / 60 … / up 1100 … / 0, and the 0.1 s mid-transition sample at −37) |
| hamburger → drawer | white sheet 1014 wide over a blurred page; close × at (100,24); categories 38/46 at 168 / 235 / 302 / 369 (57 tall, active grey rgb(117,117,117) with a 1 px rule); panel column at 507: links 14/20 at 184, 212, group title 12/16 uppercase at 272, links at 304 + 28; important links at 510 + 40 with 24 px icons | header.js drawer, click-state build / served: drawer 1014 × 900, categories 168 / 235 / 302 / 369, panel links 184 / 212, "Watches" 272, important 510 | **verified** (`motion/click-*-drawer-1440.txt`); the overlay blur approximated (`backdrop-filter: blur(20px)`, not measured) |
| category click | panel swaps, active category grey | header.js (`aria-expanded`) | verified on the build (panel content per category = the live dump) |
| line link hover (hero, carousel, text-image, drawer) | `::before` rule 48 → 12 px, `transition: width 0.3s` | same | **verified**: hover-diff identical on both sides |
| button hover (Subscribe) | background rgb(0,0,0) → rgb(117,117,117), 0.3 s ease-in | same | **verified** |
| carousel prev / next hover | colour → rgb(191,191,191), ring background rgba(0,0,0,.3) → .5 | same | **verified** |
| carousel next click | track slides one card (Swiper) | carousel.js translateX, 0.4 s, autoHeight | verified on the build (click moves the track; the live widget poke read "not found" in motion-observe — the buttons sit below the fold at sample time) |
| carousel swipe (mobile) | Swiper touch | touchstart / touchend ±40 px → one slide | decided-in, not measured |
| footer link hover | colour → white 50 %, opacity 0.56 | opacity 0.56 | **verified** (same rendered result) |
| nav icon hover (watch / pin / user), language link hover | colour → rgb(191,191,191) | same | **verified** (hover-diff `.nav .nav-tool-1`, `footer .footer-language a`) |
| social glyph hover | not measured on live (`#ap-footer a[target=_blank] svg` had no match: the glyphs are font characters) | colour → rgb(191,191,191) like the other icon links | decided-in by analogy |
| reveal effect (`js-reveal-effect-animation`, `--animated`: 39 class additions on live) | lines rise 20 px and fade, staggered | `is-revealed` on the block (3 additions): opacity + translateY 0.6 s, no per-line stagger | partial parity — motion-compare: `transition opacity` **parity**, `transform` timing 350 vs 600 ms (out of tolerance), `js-reveal-effect-*` MISSING (class names), `is-revealed` extra advisory |
| hero pause / play | control toggles the player; ▶ when paused | same (`is-paused`) | verified on the build (the capture shows ▶ on both sides after the freeze) |
| hero parallax | background translateY(−0.2 × band offset) | same | verified by construction (hero 2 bg at −180 at scroll 0 on the build: deep-probe) |
| lazysizes / drawer / scroll-lock classes (`lazyloaded`, `ap-drawer--open`, `scroll-locked` …: 10 MISSING rows) | third-party / implementation class names | own class names (`is-open`, `scrolled-*`) | decided-out as names; the behaviours are the rows above |
| `transition color` 242 events on build, none on live | the build transitions colours on every icon path (`currentcolor` inheritance) | — | advisory; the live icons are SVGs with the same transition on the anchor |
