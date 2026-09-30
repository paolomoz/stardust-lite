# stryker.com/ch/en home — triage, deviations, motion (blocks-first v2.3, 2026-09-30/10-01)

Source: https://www.stryker.com/ch/en/index.html — light-DOM AEM Sites page on Bootstrap 3, `--locale en-CH` pinned (status 200, no
geo redirect, no geo modal), OneTrust consent bar (`#onetrust-accept-btn-handler` **reloads the page**; the measurement instruments
take `.onetrust-close-btn-handler`), 0 shadow roots, no `main` (`div.wrapper.bootstrap`). Doc height 4354 at 1440, 5023 at 2560,
6205 at 360. Cap-probe: **shell fluid, module cap 1410** (`.container`, 15 px gutter → content 1380 at x30; full-bleed panels span the
viewport), probe 2560. Body text Humanist 712 for Stryker 14/20 black; headings Futura for Stryker 700 28/37.8 (14.4/19.44 below
992); ledes Egyptienne for Stryker Light 21/28.35 (10.8 in a 30 px line at 360); gold rgb(255,181,0), teal rgb(76,125,122) (buttons,
links; hover rgb(47,77,76) / button bg rgb(57,93,91)), light gray rgb(237,238,236), rule gray rgb(178,180,174), footer rgb(84,88,87);
icon font `strykericons` (search `\e003`, chevron `\e250`, up `\e260`). Noise floor (two 1440 captures): **0.00 %**, every band 0.

## Triage table (step 2, before any block existed; documents previewed 23:59:53 CEST)

| # | section (live) | default content | block · shape · collection match · rows × cols | section style |
|---|---|---|---|---|
| 0 | header: white bar 87 (logo 188×47, utility links Careers · IFUs · Imprint · Contact 12 px with "\|" separators, globe + "Switzerland/English", search input 220×41), gold bar 60 with 4 items (click-to-open mega menus 1440×502, 205 px columns, 51 px rows); 360: bar 89 + 1 px rule, logo 100×25, hamburger, language, search icon; off-canvas gold panel 342 wide, 61 px rows | nav doc, 4 sections in reading order: linked logo picture · utility `ul` + globe picture + language link · nested `ul` (L1 → L2 bold links, a heading opens an L3 group) · search link | `header` · BC **header** (fragment `/drafts/nav`); header.js assigns brand / utility / menu / search by section order, builds the search form from the link, panels from the nested lists | — |
| 1 | hero: Dynamic Media video 1440×488 in a W/3 (480) clipped box, autoplay/loop/muted; at 360 a different asset (1440×1741 collage, 360×435) | — | `hero (video)` · simple · BC **hero** · 3 × 1 (desktop poster picture = the frame the live capture shows, 2× · mobile picture · the source's own player URL as a link; the block plays it on click) | — |
| 2 | "What we do" panel 500: white shadowed box (665×196, top offset 20 %, padding 6/5/4 %) with heading 28/32.25 + lede 21/22.26, teal button; 674×500 picture right; 34 px gold band below | — | `columns (boxed)` · container · BC **columns** · 1 × 2 (h2 + p + bold link · picture) | `gold-band, flush` |
| 3 | "Latest news" headline (28/37.8 in a 46 px block) · 4 cards 307×184 picture, Egyptienne h3, Humanist p, "Read More" chevron link; 1 px gray rule under the row; 30 px own margin | `h2` | `cards (news)` · container · BC **cards** · 4 × 2 (picture · h3 + [p] + p link) | — |
| 4 | "Our focus" (40 px top padding in the XF) · 3 cards: bordered picture 440×207 linked, white box overlapping by 8 % (padding 5/8/7 %; card 2: 3 % bottom on the source), gold Futura title, Egyptienne subtitle, Humanist p | `h2` | `cards (focus)` · 3 × 2 (picture · h3 link + p em + p); the block gives the picture the title's link | `padded` |
| 5 | "People are at the heart…" heading + lede + button (text column top offset 20 %), 674×385 picture right (+30) | — | `columns` · 1 × 2 (h2 + p + bold link · picture) | — |
| 6 | Corporate responsibility: full-bleed 1440×380 picture (360: 360×415 other asset), copy in the right column at 10 % of the height (left 2 % + centred 1410 container), teal button; 30 px (20) below | — | `hero (banner)` · simple · BC **hero** · 3 × 1 (desktop picture · mobile picture · h2 + p + bold link) | — |
| 7 | Awards: light-gray band, heading + lede, 6 badges 205×205 (2 × 150 at 360), button | `h2`, `p`, closing bold link | `cards (awards)` · 6 × 1 (picture) | `gray` |
| 8 | reference code "COMM-GSNPS-SYK-1057827_Rev-3" 11.2/13.44 in a 46 px XF; then 264 px (144 at 360) of empty separators (4 invisible `hr` + an empty column control) before the footer | `p` | — | `fine-print, flush, page-end` |
| 9 | footer 210 (301): © Humanist 14/20 + 4 uppercase legal links with "\|" separators (link padding 5 15), 2 social PNG icons 50×50 right-aligned (left at 360), recall list 2 × 30 rows 10 apart | footer doc, 3 sections: `p` + `ul` · two linked pictures · `ul` | `footer` · BC **footer** (fragment `/drafts/footer`); footer.js lays legal + social in one row | — |

Hidden DOM not modelled: three more `.secondary-nav` panels' `back` links (mobile), `div.overlay`, a country/language modal, the Scene7
player chrome (share panel, hidden play/pause icon), OneTrust. Configuration: `title`, `description`, `nav: /drafts/nav`,
`footer: /drafts/footer` in the metadata block. Single template → no body class (BACKLOG #47).

## David's Model lint at step 2
See LINT.md (0 🔴, 2 🟡 — the two hero instances, justified).

## Deviations register (step 3, costs from the r7 gate)

| source feature | decision | pixel cost |
|---|---|---|
| Hosted Dynamic Media video (blob HLS, protected AVS) | poster = the frame the live capture shows (`scripts/hero-frame.mjs`: player paused at t = 0, 2×, 2880×976, uploaded to `/drafts/media/hero-frame.png`); the entry poster (`…-AVS?fit=constrain`) is another frame; link = the s7 VideoViewer URL, click opens it in an iframe | 1440 band 0: 0.1 %, 450: 1.4 % (frame resampling); **2560 bands 0/450: 5.8 / 6.9 %** — the live player scales its 2584-wide frame, the poster is the 1440 crop re-scaled from the 2000 px rendition |
| Hero clipped 8 px (player 488 in a W/3 box) | `.hero.video .hero-media { aspect-ratio: 3/1; overflow: hidden }` | 0 |
| Mobile hero and CR banner use different assets on the source (not renditions) | authored as a second picture row in each hero (content, not configuration) | 0 |
| Gold 34 px band under the "What we do" panel (an empty full-bleed panel on the source) | section style `gold-band` (`border-bottom: 34px solid`) — an empty section would be dropped by the fold | 0 |
| Section rhythm: invisible `hr` + 30 px margin between modules (20 at 360); the news module carries its own 30/20 px margin; the Our-focus XF a 40/10 px top padding | foundation `--section-gap` 31/22 px, `flush` where the source has none; `.section:has(> .cards-wrapper > .cards.news)` padding-bottom 30/20; section style `padded` 40/10 (an authored spacing on the source) | 0 |
| 264 px (144 at 360) of empty separators before the footer | section style `page-end` on the fine-print section | 0 |
| Focus card 2's box has a 3 % bottom padding on the source where cards 1 and 3 have 7 % (per-instance AEM style); card 3's subtitle span carries a different class (`fontsize-1-5em`) and sits 4 px higher | uniform 7 % (the majority value); at ≥ 768 the box margin-bottom is 11.6 % instead of 15 % so the **row** height matches (the tallest card is card 2), the box edge itself is 20 px lower than the source; at 360 the cards stack and the chain below Our focus is **+23 px** (13 padding + 6 subtitle + rounding) | 1440 band 2250: 4.3 % (card-2 box edge, card-3 rows +6/+7); **360 bands 3600–6228: 15.7 / 26.6 / 13.7 %** (the +23 shift doubles every glyph in People, CR, Awards, footer) |
| Percent geometry (box offsets 20 %, paddings 6/5/4 %, 5/8/7 %, overlay 10 % / 2 %) | kept as percentages of the same containing blocks; the People text column's 20 % is of the column *content* (`calc((100% - 30px) * 0.2)`) | 0 at 1440 / 2560 |
| CR banner copy column: overlay at left 2 %, a 1410 container centred in the rest, copy in its right column | `left: calc(2% + max(0px, (98% - 1410px) / 2) + 705px)`, `top: 10%`, width 705 with 30 px right padding (copy measures 675) | 0 at 1440 (Δ0), 1 px at 2560 |
| Lede line pitch at 360: 10.8 px glyphs on a 30 px line (the source p keeps its desktop line-height) | `--lede-lh: 30px` below 992; h2 → lede 8, lede → next 18 (27 at 1440 → 30) | 0 |
| Mega-menu columns are editorial (About: 9 / 4 / heading + 8 / 5 items) | one nested list per menu; header.css lays L2 out in `columns: 205px 6` with `column-fill: auto` to 501 px — the breaks differ from the source; row heights 51 (2-line rows 76 vs 72) | 0 at rest (hidden); verified open by click-state: panel 1440×502 at y147, bg rgb(237,238,236), 1 px black rule, active item bg rgb(84,88,87) white |
| Mobile L2: the source slides a secondary pane; the build toggles the panel under the L1 item | accepted (hidden at rest); mobile panel verified: 342 wide, 61 px rows, white rules, utility list with a top rule | 0 |
| Language selector opens a country modal (JS) | authored as a link to the page anchor `#language-country` (a fully qualified URL for D4); the globe is the source's PNG as a picture in the same paragraph | 0 |
| Search: form GET /ch/en/search.html?q= | built by header.js from the authored link (input + icon-font button) | 0 |
| Social icons are PNGs (not an icon font) | uploaded bytes, authored as two linked pictures in their own paragraphs (a picture in a link in a list item is split by the pipeline — METHOD step 5) ; floated right on the source (DOM order Facebook, LinkedIn → visual LinkedIn, Facebook at ≥ 992, DOM order at 360) → `flex-direction: row-reverse` at ≥ 992 | 0 |
| Footer "\|" separators: `::before` on the list items + a whitespace text node on the source | `li + li::before` with 9 px right padding at ≥ 992; `li::after` 4/5 px at 360; `ul { font-size: 0 }` to drop inline whitespace | 0 (Δx 0 on every link) |
| OneTrust floating cookie button (green, 50×50, fixed bottom-left, appears after consent in every capture chunk) | third-party layer, decided out | ≈ 0.2 % per width at 1440 (5 chunks), ≈ 0.8 % at 360 (7 chunks, over the "GET TO KNOW US" button) |
| Back-to-top (fixed 40×40 black, right 29 / bottom 18, icon `\e260`; class `u-anim-fadein` only while scrolling **up** below ≈ 500 px — `scripts/btt-ladder.mjs`) | scripts.js `buildBackToTop` with the same rule (`back-to-top-in` on scroll-up and scrollY > 500, 0.2 s opacity) | 0 (never in a downward capture on either side) |
| Fonts | five woff2 + the icon woff from etc/designs/stryker/fonts → `/fonts`, `fonts.css` **imported by styles.css** (the boilerplate's lazy `loadFonts` left the 360 harness measurements font-dependent between runs) | 0 |
| Images | 23 files, bytes unchanged (jpg/png as served by media-assets.stryker.com presets), uploaded to DA `/drafts/media/*`, previewed; pipeline renditions (`?width=2000/750`) serve both prototype and served page | the residual in photo bands: 1440 900–1800 at 1.4–2.9 %, 2560 ≈ 1–2 % |
| Card 2 description: my first authoring guessed the text past the 160-char content-dump viewer truncation (three cards) | corrected to the captured text (r2); the register keeps the lesson: the viewer truncates, the JSON does not | 0 |
| Title glyph boxes: Futura 28 px spans measure 44 px in 37.8 px lines, Egyptienne 21 px 21 in 28.35 — pair Δy of +3 / −4 on heading / lede rows means aligned | read as such; no pin | — |
| Header at 2560: utility right edge, search, language identical (module cap) | — | 0 |
| The pipeline's empty metadata section on the served page | `main > .section:not(:has(> *)) { display: none }` from round 0 (METHOD step 7) | served = prototype |

## Motion register (motion-observe live 1440 → `gate --probes` compare on prototype and served; deep hover diffs `hover-diff` live vs build; click-state both sides; scroll ladder)

| interaction | live | build | status |
|---|---|---|---|
| teal button hover | bg rgb(76,125,122) → rgb(57,93,91), border rgb(66,109,107) → rgb(43,71,69) | styles.css `a.button:hover` | **verified**: parity (motion-compare) + deep diff identical |
| "Read More" hover | color → rgb(47,77,76) incl. `::after` chevron | cards.css | **verified**: parity + deep diff identical (self and ::after) |
| footer legal / recall link hover | color → black, bg → gold | footer.css | **verified**: parity (2 rows) + deep diff |
| footer social link hover | `color` on the `a`/`img` only (PNG: no pixel) | generic footer hover minus background | **verified**: parity (name) — no pixel on either side |
| main nav item hover | bg rgb(84,88,87), color white (deep diff; the frame sampler read it dead) | header.css | **verified**: deep diff identical; motion-compare "dead on live — not required" |
| main nav click → mega menu (`.active`) | panel 1440×502 at y147, bg rgb(237,238,236), 1 px black bottom rule, active item bg rgb(84,88,87) white, 205 px columns, 51 px rows | header.js `aria-expanded`, header.css | **verified** by click-state on the build (same box, bg, rule, item state); motion-compare "class active MISSING" = the source's class name, not the behaviour |
| language selector hover | `color` on the `a` (the visible span stays black) | none | decided out (no pixel on live) — motion-compare MISSING by name |
| logo hover | `color` on the `a` (image) | same | decided out (no pixel) |
| search icon hover | the live `a` is 0×0 (unmeasurable); icon colour static | none | decided out |
| news card / title hover | no change | — | decided out (dead on live) |
| header on scroll | static (147, `position: static` throughout) | — | decided out (dead on live, both sides) |
| back-to-top | `u-anim-fadein` while scrolling up below ≈ 500 px, opacity 0.2 s; never during a downward capture | scripts.js `back-to-top-in`, same threshold and transition | **verified** by the ladder on live; motion-compare: transition opacity parity, class names differ (MISSING `u-anim-fadein` / advisory `back-to-top-in`) |
| hamburger → off-canvas menu (360) | panel 342 wide, gold, rows 61 (a 60 + 1 px white rule), utility list below with a top rule | header.js / header.css | **verified**: click-state on prototype and served page (same rows, borders, fonts) |
| hero video autoplay/loop | Scene7 player, muted autoplay | poster + click-to-play iframe (hosted-video rule) | decided out as motion (the frame is the registered residual) |
