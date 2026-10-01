# www.usta.com/en/home.html — triage, deviations, motion (blocks-first v2.4, 2026-10-01)

Source: https://www.usta.com/en/home.html (no bot manager; headless Chromium gets the page; OneTrust floating consent at bottom-left,
accepted with `--consent '#onetrust-accept-btn-handler'` — no reload; no geo redirect, no locale pin needed). Light-DOM AEM Sites origin
(0 shadow roots, no `main`: content under `div.mainWrapper`). Doc height 6733 at 1440, 6754 at 2560, 11509 at 360. **Fixed header**
`#header-container` 244 px at ≥ 900 (top bar 64 · account banner 40 · main bar 110 · breadcrumb 30), 145 px at 360 (banner 60 · bar 45 ·
breadcrumb 40), z 1030: it repeats in every 900 px chunk of the stitched captures, so the build's header is fixed with the same heights.
Cap-probe: shell fluid, module cap 1920 (hero band, wheelchair band), content containers 1200 centred, probe 2560. Body bg white, text
rgb(51,51,51) 16/22.857 Graphik Regular; headings Graphik XXCond Bold (76/83.6, 90/99 hero h1); Semibold labels; links rgb(3,87,184);
accent lime rgb(207,255,5); teal rgb(146,191,183); sage rgb(220,223,207); orange rgb(240,170,84); sky rgb(85,203,249). Fonts: three
family names with one face each (Graphik-Regular-App, Graphik-Semibold-App, GraphikXXCondensed-Bold-App woff2) — the source synthesises
bold on them (`fw=900` on Graphik Regular at 360); "USTA Sans" is declared but never loaded → Tahoma fallback (coaching band).
Noise floor (two 1440 captures): **0.00 %**, every band 0 — the page is deterministic (no rotating hero, no personalised slot in the
logged-out state; the GAM ad slot was empty in every capture).

## Triage table (step 2, before any block existed — checkpoint 01:33:12 CEST: three documents previewed, lint 0 🔴 3 🟡)

| # | section (live, 1440) | default content | block · shape · collection match · rows × cols | section style / configuration |
|---|---|---|---|---|
| 0 | header (fixed 244): teal top bar — 2 pill dropdowns "USTA Sites" (8 links) / "USTA Sections" (18 links), location input 520 px, search, language; account banner "New! Lost your account information? Find your account!" + ×; white main bar — logo 237×66, 6 items PLAY · SAFE PLAY · PROVIDERS & FACILITIES · ABOUT · PRO TENNIS · NEWS with ▼ toggles and full-width mega panels (level-2 items with icon + level-3 lists), JOIN ghost 120×40, SIGN IN black 120×40; breadcrumb bar "HOME" | nav doc, 5 sections in reading order: utility (`ul` of 2 items each with a nested `ul`, `p` location placeholder, `p` `:search-icon:` link, `p` `:language-icon:` ENGLISH/ESPAÑOL links); banner `p` (`:tennis-ball:`, `strong`, link); brand (logo picture link); sections (3-level nested `ul`, level-2 items carry `:icon:` tokens); tools (`em` JOIN, `strong` SIGN IN) | `header` · BC **header** (fragment `/drafts/nav`); header.js assigns utility/banner/brand/sections/tools by section order, builds the breadcrumb from the path, the dropdown/mega panels, the mobile menu | — |
| 1 | 9 px blue rule · sage band 700: black campaign card 525×644 (coaching logo, h1 90 px "REGISTER (lime) TO BE FEATURED…", lime pill) · photo 525×644 · black membership widget 330×652 (white logo, h2 35 px, p, icon, outlined "SIGN UP") | — | `hero (campaign)` · simple, 1 cell (photo picture, logo picture, h1 with `em` accent, bold link) · BC **hero**; `promo (membership)` · simple 4 × 1 (brand picture / h2 + p / icon picture / italic link) — site-specific: BC has no text-promo shape | `hero-band` (blue rule via `::before`, sage, 9/12 + 3/12 grid, 1920 cap) |
| 2 | 9 px sage rule · head tile 360×334 "Discover / YOUR TENNIS COMMUNITY" · 3 photo tiles 352×334 with a 70 % black caption strip (YOUTH / COLLEGE / ADULT), each a clickable container | `h2` Discover, `p strong` eyebrow (the section style lays them out as the head tile) | `cards (discover)` · container 3 × 2 (picture · h3 link) · BC **cards** | `discover` |
| 3 | "Localize Your USTA.com Experience" banner 1440×331 over a court photo, centred h4 + 2 lines + black pill "SHARE LOCATION" (geolocation button) | `h3`, `p`, `p`, bold link | — (default content only) | `localize`; `background` / `background-mobile` links in section metadata (the 360 composition uses another photo and white text) |
| 4 | 57 px spacer · topic title (sky circle icon 100 + teal 12 px rule + h2 76 px "Recommended Events") · p · h5 "UPCOMING EVENTS" · share-location message · black pill 270×56 | picture + `h2` (topic title), `p`, `h3`, `p`, bold link | — (the personalised events widget's logged-out state is default content; a signed-in feed would be a widget link — METHOD step 2) | `topic, events` |
| 5 | teal band 312: h2 42 px "How do you play?", label + select (tournaments/programs/courts/coaches), label + ZIP input, grey SEARCH pill | `h2` | `event-search` · key-value 3 × 2 (type label · options; location label · placeholder; button label · search link) — site-specific | `search-band` |
| 6 | orange rules 23 px above/below, white 16 px borders, orange band 365: h2 76 px white "50 Years of Wheelchair Tennis" + white pill "Explore" · logo 258×285 | — | `columns (promo)` · container 1 × 2 (text · picture) · BC **columns** | `wheelchair` |
| 7 | topic title (teal circle) "Membership Benefits" · justified p · 5 white logo tiles (3 × 370 + 2 × 570, radius 16) · black pill "Get Started" | picture + `h2`, `p`, bold link | `cards (benefits)` · container 5 × 1 (picture) · BC **cards** | `topic, topic-teal, benefits` |
| 8 | black band 160: "SERVE YOUR PASSION" / lime "USTA Coaching" (35/40 700 Tahoma) 7/12 · lime pill "Start Now" 5/12 | `p`, `p em`, bold link | — (default content; the section style is the 7/12 + 5/12 grid) | `coaching` |
| 9 | topic title "Tennis News" · 4 article cards 275 (photo 275×138, eyebrow "National", 2-line title link, date, 4-line clamped description, "Read More") · outlined pill "SEE ALL NEWS" 280×40 | picture + `h2`, italic link | `cards (news)` · container 4 × 2 (picture · `p strong` eyebrow + h3 link + p date + p + p link) · BC **cards** | `topic, news` |
| 10 | topic title "Safe Play™" · p 4 lines · 3 course columns (image 270×152, h4 28 px, p, "Learn More") + resources column (h5 + 5 icon-link rows) | picture + `h2`, `p` | `columns (safe-play)` · container 1 × 4 (3 × picture + h4 + p + link · h4 + `ul` of `:icon-player:` links) · BC **columns** | `topic, safe-play` |
| 11 | topic title "We Are Here To Help" · p · 4 text cards (h5 22/44 centred, p, black pill 270×40 pinned to the bottom) | picture + `h2`, `p` | `cards (help)` · container 4 × 1 (h4 + p + bold link) · BC **cards** | `topic, help` |
| 12 | "Advertisement" 12 px label · 728×90 GAM slot (320×50 at 360), empty in every capture | — | `ad` · key-value 3 × 2 (label, size, size-mobile) — reserves the measured slot, loads nothing (METHOD third-party slots) | — |
| 13 | footer XF: 32 px · (newsletter line, mobile only) · grey band 92 "Download the USTA App" + 2 badges · black footer 460: logo 291×48, 12 links in 2 columns of 6 (14 px Semibold uppercase, 40 px rows), 4 social icons, "USTA APPS" + 5 app icons 57, privacy icon 68×70, © line | footer doc, 4 sections: `p` newsletter link; `p strong` + `p` of 2 badge links; logo picture, `ul` 12 links, `p` of 4 social picture links, `p strong` USTA APPS, `p` of 5 app picture links; `p` privacy picture link + `p` © | `footer` · BC **footer** (fragment `/drafts/footer`); footer.js assigns newsletter/download/main/legal by order and splits main into left (logo + nav) / right (socials + apps) | — |
| — | metadata | — | `metadata` key-value: title, description, nav `/drafts/nav`, footer `/drafts/footer` | — |

Hidden DOM not modelled: the 360 duplicates of the membership widget ("BECOME A MEMBER" / "Join USTA to view…" 16 px) and of the
Localize banner copy (same words, white, 22 px), the mobile-menu copies of the two utility dropdowns, the account-recovery modal,
the "Skip Advertisement" link, the Usablenet accessibility toggle and the purple chat button (fixed, bottom-left, third party),
OneTrust. 19 live sections → 12 authored sections + metadata; no body template class (one template, BACKLOG #47).

## David's Model lint at step 2
See LINT.md: **0 🔴, 3 🟡** (D1 hero — the BC hero shape, justified; D4 ×2 — authored SVG references, verified).

## Deviations register (step 3; pixel costs read from the final gates, see REPORT.md)

| source feature | decision | pixel cost |
|---|---|---|
| Fixed 244 px header repeating in every capture chunk at ≥ 900; at 360 the 145 px header is **not** fixed (it scrolls away — read from the live 360 capture, where the chunks below the first carry no header; the 360 deep probe shows no `fixed`) | header block `position: fixed` at ≥ 900 only, `static` below (round 14: a fixed mobile header cost 20 % at 360); `header { height }` reserves the flow space; backgrounds full-bleed, content capped at 1440 and centred at 2560 (measured: top-bar wrapper and main bar `max-width 1440` at x 560) | 0 by the section table (header row Δ0 at the three widths) |
| 360 membership widget is a second DOM instance with other copy ("BECOME A MEMBER", "Join USTA to view personalized content…", 16 px, 3 lines) | desktop composition authored; at 360 the copy paragraph is clamped to the measured 72 px (3 lines, `overflow: hidden`) — the fourth line of the desktop text is clipped where the source shows a shorter mobile text | 0 in the chain (hero band 913 = live); one clipped text line at 360 (an unclamped paragraph cost a +22 px chain = 20 % at 360 in round 11) |
| 360 Localize banner is a second DOM instance (other photo `Localize-MB-2-Plain.png`, white text, no button) | `background-mobile` section-metadata link + `localize` style colour at < 900; the SHARE LOCATION button is authored once and shows at 360 too | ≤ 56 px band at 360 (button over the photo) |
| Membership widget: 652 tall at 1440 (hero card 644), 561 at 2560 (hero 548) — it follows the hero row (+8 / +13) and its four blocks spread over the height; logo and icon scale with the column | promo `align-self: stretch`, `height: calc(100% + 8px)` (13 at ≥ 1920), flex column `space-between`, padding 64/88, logo 100 %, icon 40 % | 0 at 1440 (h2 471, icon 685, button 792 = live); h2 −7, icon −14, button −21 inside the card at 2560 |
| `margin-bottom-small` after the wheelchair band is 32 px at 1440 and 0 at 2560 | `@media (width ≥ 1920px) { margin-bottom: 0 }` (the probe measurement) | 0 at the gated widths; intermediate widths unmeasured `[case-specific]` |
| 9 px blue rule and 9 px sage rule full-bleed; hero band and wheelchair band capped at 1920 | `::before` full-bleed rule on the capped section; bars as section padding | 0 |
| Discover head tile + 3 tiles: head is default content (`h2`, `p strong`) laid out as the first grid cell by the section style | `.discover` grid 1fr 3fr, gap 8 | 0 (Δ0 at 1440/2560) |
| Topic titles: 100 px circle icon (sky / teal), 12 px teal rule with 1 px black top edge, h2 bottom-aligned in a 116 px row | `picture` + `h2` default content; `.topic` grid on the first default-content wrapper; the rule is the picture's `::before` | 0 |
| Text components carry 8 px top/bottom padding on the source (AEM `cmp-text`) | written as margins where measured (hero logo 23 px box, promo brand, coaching p, cards) | 0–1 px |
| News eyebrow "National": the source's inline span reads as a 13 px glyph box at 18/24 | `p strong` 18/24 (≈ line box) | font metrics only |
| News description clamped to 4 lines (`overflow hidden`, 96 px) and title to 2 lines (64 px) | `max-height` / `height` with `overflow: hidden` | 0 |
| Event search is a live form (select + input + disabled grey SEARCH) | `event-search` key-value builds a `<form>` with the authored options and placeholder; the submit links to the play-tennis-near-me page; styled as measured (grey disabled look) | 0 |
| SHARE LOCATION (two instances) is a `<button>` running geolocation | authored as bold links to `#share-location` (a widget hook); no geolocation | 0 |
| Breadcrumb "Home" lives inside the fixed header on the source | header.js renders the bar from the last path segment (`/drafts/home` → "Home"); uppercase via CSS | 0 |
| Nav level-2 icons: 27 files, 10 of them PNG; `decorateIcons` only serves `/icons/<name>.svg` | bytes copied unchanged to `/icons`; header.js rewrites the `src` extension for the PNG names | 0 (hidden at rest) |
| `:icon:` tokens: the harness fold does not convert them (BACKLOG #5) | `scripts.js decorateIconTokens` folds leftover `:name:` text into icon spans (as fidelity/travelers did) | 0 |
| Harness wraps a picture-first cell into one `<p>` (BACKLOG #8) | every standalone picture is authored inside its own `<p>` (`pic()` in the generator) — the form the pipeline produces anyway | 0 |
| Media: 75 files (jpg/png/svg) from usta.com, incl. AEM renditions (`.jpg.thumb.585.1170.png` is a JPEG) | bytes uploaded unchanged to DA `/drafts/media/<lowercase>` with the extension of the actual content type; the pipeline serves `media_*` renditions | photo bands: renditions vs the source's scaled originals (see REPORT three-width table) |
| 5 benefit-logo SVGs embed raster data URIs (lint D4 warning) | previewed fine (200), rendered identically | 0 |
| Live photo tiles / hero photo are CSS backgrounds (`cover`) | authored pictures, `object-fit: cover` | 0 |
| Footer link list: 12 `li` inline-block 258 px in a 533 px `ul` flowing column-major | grid 2 × 6, `grid-auto-flow: column` | 0 (Δ0 per link at 1440) |
| App-store badges in the footer download band are a 1/12 grid column with 15 px padding (90 px wide at 1440, 183 at 2560, band 92 → 129) | `width: calc(100vw / 12 - 30px)` (112 px at 360 as measured) | 0 (footer 616 at 1440, 653 at 2560 = live) |
| News eyebrow, title and "Read More" render uppercase on the source (`text-transform`, invisible in the DOM text) | `text-transform: uppercase` in the news variant (found in the first pixel diff crop, not in the spec — the spec records DOM text) | 0 after round 10 |
| At 360 every pill button and the coaching band copy render uppercase ("GET STARTED", "START NOW", "USTA COACHING") | `text-transform: uppercase` on `a.button` and the coaching paragraphs below 900 (measured on two buttons and one band in the 360 capture) | 0 |
| Safe Play course card 2 carries a per-instance separator (`cmp-separator` after "Learn More") that adds ≈ 15 px only where the cards stack | not authored (per-instance styling, METHOD register kind 4) | −15 px chain from course card 3 to the footer at 360 (bands 8100–11500 at 11–17 %, ≈ 4 of the 9.5 % at 360); 0 at 1440 / 2560 |
| Hero copy card at 2560 is 548 tall on the source, 545 on the build (h1 3 lines + fixed spacings) | — | −3 px chain at 2560 |
| Hover states (nav link colour + 4 px, buttons opacity .7, news title / Read More colour rgb(35,82,124) + underline off, footer links rgb(65,143,222), JOIN bg rgb(230,230,230)) | mirrored in the block CSS (see motion register) | 0 at rest |
| Fixed third-party layers in every chunk: Usablenet accessibility toggle (44×44) and the purple chat button (bottom-left), OneTrust floating shield after accept | decided out | ≈ 0.1–0.3 % per width (every 900 px chunk) |
| GAM ad creative (a US Open "SHOP NOW" banner appeared in the gate's fresh 1440 capture; empty in the first three captures) | slot reserved (728×90 / 320×50), nothing loaded — session-variable third-party content | ≈ 1–2 % of the 5850 band at 1440 (728×90 creative vs an empty slot) |
| Intermediate breakpoint between 360 and 1440 (the source's tablet grid) | one breakpoint at 900 px (unmeasured) `[case-specific]` | 0 at the gated widths |

## Motion register (motion-observe + deep hover diff on the live page; verified on the prototype with the same instruments)

| row | live (measured) | build | verdict |
|---|---|---|---|
| nav level-1 link hover | colour rgb(0,0,0) → rgb(3,87,184), box 25 → 29 px, `transition: all 300ms` | `a:hover { color; padding-bottom: 4px; height: 29px }`, links carry `transition: color .3s, …` | verified (hover-diff both sides; motion-compare reads the build's transition as parity after round 15) |
| mega menu | opens on hover / click of the ▼ toggle (a click while hovered must keep it open — round 12 found the click toggling it shut): full-width white panel at y 214, 1 px top rule rgb(229,229,229), shadow 0 6px 6px rgba(0,0,0,.16), padding 50 0, 3 columns, level-2 18/25.7 900 blue with 45 px icon, level-3 24 px rows (click-state) | same geometry; hover opens on desktop, click toggles | verified (click-state both sides) |
| utility dropdowns | click opens a 400 px white panel (shadow 0 4px 4px rgba(0,0,0,.25), padding-top 40, slogan + links 12 px) | same | verified (click-state) |
| mobile menu (360) | hamburger opens the top bar as a white panel at y 102 (language row 58 px) and the level-1 list (49 px rows, dashed rule rgb(114,114,114), 14/18) with the two dropdown items appended | same | verified (click-state) |
| primary / lime / white pills, SIGN IN | opacity 1 → 0.7, outline-width 0 → 3 px | `a.button:hover { opacity: .7; outline-width: 3px }` | verified |
| JOIN ghost button | background transparent → rgb(230,230,230) | mirrored | verified |
| news title and Read More | colour → rgb(35,82,124); Read More underline → none | mirrored | verified |
| footer links | colour → rgb(65,143,222) | mirrored | verified |
| discover tiles, benefit cards, safe-play links, SEARCH button | no change on hover (dead on live) | nothing | decided out (dead) |
| header on scroll | scroll-probe: the fixed header does not change class, colour or height at any scroll position | nothing | decided out (no state) |
| account banner × | removes the banner (JS) | same (`banner-closed`) | decided out of the gate (click state, not captured) |
| language switcher, location input predictions, search panel, geolocation | JS widgets | hooks only (`#search`, `#share-location`, language panel with the two links) | decided out (widgets) |
