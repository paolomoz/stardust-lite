# hiltongrandvacations.com home — triage, deviations, motion (blocks-first v2, 2026-10-01)

Source: https://www.hiltongrandvacations.com/en (Angular app, light DOM with 21 shadow roots — Osano consent and `swiper-container` —
none holding content; headless Chromium gets the page, status 200, no bot manager; Osano consent bar at the bottom, `--consent
button.osano-cm-accept-all`, no reload; no geo modal, `--locale en-US` pinned; `/en` is the US edition). Doc height 10124 at 1440, 10754 at
2560, 12027 at 360. Cap-probe: shell fluid, modules capped 1440 ×6 (the `inner-content-container` with a 136 px gutter → 1168 of content),
one 1733 (the ticker row's outer flex container) and one 1168 (the tabs card), 2 full-bleed (hero, footer); probe 2560. Body bg white, text
rgb(83,86,90) 14/28 at 1440 and 13/24 at 360, headings rgb(32,43,70) Gotham Book (weight 325; the source's Gotham maps 325 = Book, 400 = Bold,
700 = Black), navy rgb(32,43,70), pink rgb(206,50,98) / price rgb(201,49,94), teal rgb(1,130,137), grey bands rgb(241,241,241) and footer
rgb(234,234,234), rules rgb(222,223,223). Fonts: Gotham ttf served by the site (`/media/Gotham-*.ttf`) → `/fonts`; Font Awesome 6 Pro
(a licensed kit) for every icon — not downloadable, see deviations. Noise floor (two 1440 captures): **0.10 %**, bands 0–500 1.4 % and 500–1000
0.7 % (the hero Vimeo loop: a different frame per capture), every other band 0.0 — deterministic apart from the hero video and the two
count-up numbers (see deviations).

## Triage table (step 2, before any block existed)

| # | section (live) | default content | block · shape · collection match · rows × cols | section style |
|---|---|---|---|---|
| 0 | header: hamburger (FA bars), centred logo 98×30, user icon link (sign in); 94 tall, fixed, hides on scroll down / shows on scroll up; the menu is a 416 px navy drawer (full width at 360) with 5 items, a language row, and a second white panel per item | nav doc, 3 sections in reading order: brand picture link; `ul` of 5 items (4 with nested `ul`); tools (`Sign Into Your Account` link, languages `ul`) | `header` · BC **header** (fragment `/drafts/nav`); header.js assigns brand / sections / tools by section order, builds the drawer and the sub-panels | — |
| 1 | hero: Vimeo autoplay loop 1440×810 (16/9; 100 vh at 360 with another video), navy 72 % veil, h1 38/56 centred (a second headline cross-fades: "Your Lifetime of Travel Has Arrived"), white pill, "Scroll to Explore ↓", "Pause" | **default content**: two posters in `<p>` (desktop, mobile), the player link (text ≠ URL), `h1`, bold link, the label paragraph | `hero (video)` auto-blocked by `scripts.js buildHeroBlock` · simple · BC **hero** | — |
| 2 | "Timeshare membership…" h3 28/38 centred in 576 with a 1 px rule 48 below · two columns (p + outline pill) · "Already purchased…" uppercase line with a link | `h2`, closing `p` with inline link | `columns (intro)` · container · BC **columns** · 1 × 2 (p · italic link each) | `intro` |
| 3 | navy band: count-up "200" 160/200 · "Global Resorts" · p · outline pill · dotted world map 744×474 (map first at 360) — then the white "Trending Destinations" card 1168×560: badge, 3 tabs (Hawaii / Florida / Las Vegas) with a teal 4 px underline, panel (photo 547×308 right, h3 + tags + p + link left); the card's lower half over light grey | `p` "Trending Destinations" (the badge, moved into the card by tabs.js) | `ticker` · simple · no collection shape (a count-up statistic) · 5 × 1 (number, label, text, italic link, picture) · and `tabs` · container · BC **tabs** · 3 × 2 (label · picture + h3 + "a \| b \| c" tags + p + link) | `destinations` |
| 4 | offers slider (slick, navy): 5 slides of photo 1168×640 + white card 480 wide over its right half (pink banner, eyebrow, h3 "3 NIGHTS IN …", price + struck retail, points, pink pill, terms); prev / "1 / 5" / next bottom right; clipped at content edge + gutter | — | `carousel (offers)` · container · BC **carousel** · 5 × 2 (picture · `em` banner, eyebrow p, h3, `strong` price + retail, points p, bold link, terms p) | `navy` |
| 5 | resorts coverflow (Swiper, grey band): h2 38/56 left + p right; 5 slides, the centre one 412×550, neighbours 340×454 at ±394, 278×371 at ±730, 225×301 at ±1019; caption "3 / 5", name, subtitle, location, underlined "Explore Resort", prev/next beside it | `h2`, `p` | `carousel (coverflow)` · container · BC **carousel** · 5 × 2 (picture · h3 + p + p + link) | `grey` |
| 6 | Hilton logo 157×73 · "105+ Years of Excellence" 28/38 · p, centred | picture, `h2`, `p` | — | `heritage` |
| 7 | photo band under a 90 % navy veil: count-up "720,000" · "Travel enthusiasts" · p · white pill · 3 navy quote cards 379×427 (quote, avatar 36, name, since, rule, "Read Article →") · "VIEW ALL" | closing `p` link ("View All", moved into the cards' control row) | `ticker` · 4 × 1 · and `cards (quotes)` · container · BC **cards** · 3 × 2 (avatar picture · quote p, `strong` name + since, link) | `stats` + section-metadata `background` (URL) |
| 8 | "Our Members Prefer to Vacay Their Way #myHGV" h3 · "Follow us on Social Media" + 5 icon links · swiper of 576×576 tiles (video poster + play, photo, quote over photo in a 2 px white frame, video, quote); prev / "1 / 5" / next; clipped at content edge + gutter | `h2`, `p`, 5 `p > a > picture` | `carousel (social)` · container · BC **carousel** · 5 × 2 (picture · player link, or quote p + `strong` author, or empty) | `social` |
| 9 | newsletter: h3 · p · italic "All fields are required." · 3 inputs with uppercase labels · checkbox + consent paragraph · navy "Sign Up" pill | `h2`, `p`, `p > em` | `signup-form` · container · no collection shape (the BC `form` block takes a JSON definition link) · 5 × 2 (label · type; Consent · p; Submit · label) | `signup` |
| 10 | footer (inside the source's `main`): About / Contact (heading is a link) / Legal groups · 3 pills (one holds the WhereNext logo) · 5 social icons · Hilton tagline logo · 26 brand logos as grey silhouettes · Honors logo · 10 legal paragraphs | footer doc, 4 sections: `h2` + `ul` ×3; italic links, picture link, 5 `p > a > picture`; 28 picture paragraphs; `p` ×10 | `footer` · BC **footer** (fragment `/drafts/footer`); footer.js groups h2 + ul pairs, builds the CTA column, masks the logos | — |

Hidden DOM not modelled: the alternate hero headline (rotating region, below), the drawer's destination accordion (US states behind a nested
accordion) and sub-menu descriptions, the Osano consent and preference drawer, the keyboard-shortcuts help button (fixed, bottom right, 42×48),
`app-alert-bar` (empty), skip links, the language flags (19×10 avif). Configuration: `nav`, `footer`, `title`, `description` in the metadata
block; section-metadata `style` on 8 of 10 sections and `background` (a URL) on the stats section.

## David's Model lint at step 2
See LINT.md.

## Deviations register (step 3)

| source feature | decision | pixel cost (est.) |
|---|---|---|
| Hero is a Vimeo autoplay loop (923348410 at ≥ 900, 1190586344 at 360) inside an iframe; the capture freezes `<video>` only, an iframe keeps playing — the two origin captures differ in the hero (noise floor 1.4 / 0.7 % in bands 0–1000) | hosted video → poster + the player link (METHOD prerequisites): `scripts/hero-poster.mjs` screenshots the frame the live page shows at load with the veil, text and controls hidden (1440×810 and 360×900); `video-frame.mjs` needs a `<video>` and crashed on the iframe (gap 7); the authored link keeps the player URL (text ≠ URL for the lint); "Pause" is rendered as the source's control (toggles its label) | **rotating region**: ≈ 15 / 12 % in bands 0–450 / 450–900 at 1440, 28 / 16 / 13 at 2560 (the 1440-wide poster scaled to 2560), 17.7 at 360 — the largest residual of the run |
| Second hero headline "Your Lifetime of Travel Has Arrived" cross-fades with the first (`app-rich-text.fade-out-with-animation`) | decided out: one h1 per page; the capture shows headline 1 at every width | 0 at freeze (the pair lists it MISSING) |
| Count-up numbers: "200" and "720,000" animate linearly 0 → N in 3.75 s once in view (`scripts/ticker-ladder.mjs`: 16 steps of 313 ms); the live capture caught 52 and 372,200, the live spec read 16 / 250,000 | ticker.js reproduces the function (linear, 3750 ms, IntersectionObserver); the build capture catches its own intermediate value | **live entrance caught mid-flight**: band 1500–2000 1.9 %, band 5400–5850 4.0 % at 1440 (160 px digits) |
| Font Awesome 6 Pro glyphs (bars, circle-user, arrow-left/right, arrow-down-long, circle-play 96 px, arrow-up-right-from-square, square checkbox, chevron-right, xmark-large) from a licensed kit; `deep-probe` prints `::before content=""` for them (BACKLOG #90) | 11 SVG files in `/icons` drawn to the measured glyph boxes (20×16, 16×16, 11×12, 11×16, 96×96, 11×11, 16×16, 8×13, 10×10) with the measured colour baked in or `currentColor` where the img context resolves it to the parent's colour; `:privacy-options:` is the site's own svg | anti-aliasing of 10 small glyphs, ≈ 0 |
| Media are Contentful avif renditions (`?fit=scale&w=1000&fm=avif`) — 29 photos plus 36 svg | downloaded unchanged (`media-fetch`), uploaded to DA `/drafts/media` (201), preview 200: the branch host 301s `…/image.avif` to `media_<hash>.avif` and serves `image/avif` (83 675 bytes = the uploaded bytes); the document references the preview URL so prototype and served page share one document | renditions ≈ 1–2 % in photo bands (4050, 7200 at 1440) |
| Two social video tiles show the Vimeo player's poster (the iframe is 1037 px wide centred in the 576 box) | Vimeo oEmbed thumbnail (1152×648) as the tile picture, `width: 180 %` centred; the player link is the tile's row (BACKLOG #13 lint 🔴, see LINT.md) | ≈ 0.5 % in band 7200 |
| Section backgrounds: the stats band's photo under a 90 % navy veil | section-metadata `background` = URL (a picture value is a D14 🔴); `scripts.js decorateSectionBackgrounds` sets `background-image`, `.stats::before` paints the veil | 0 |
| The ticker + tabs band is one source section (navy 666 px, then a 632 px block with a 50/50 navy/grey gradient behind the white card) | one authored section `destinations` holding both blocks; `linear-gradient(navy calc(100% − 316px), grey …)` (342 at 360) | 0 (section row Δ0 at 1440 / 2560, −2 at 360) |
| Content cap: `inner-content-container` 1440 with a 136 px gutter; the ticker row's container is 1733 at 2560 and the heritage band's 1168 | `main > .section > div { max-width: 1440px; padding: 0 136px }`; `.heritage > div` 1168; the 1733 box is not reproduced (the ticker's content sits in the same 1168 either way) — cap-probe PASS 11/11 after the heritage cap | 0 |
| Offers and social sliders clip at the content edge + one gutter (slick-list 1304 wide at 1440 → 2000 at 2560), not at the viewport | `.carousel-viewport { width: calc(100% + var(--gutter)); overflow: hidden }` at ≥ 900 | 2560 band 3600 22.2 → 2.4 %, bands 7650–8100 10–13 % (r4) → see REPORT |
| Offer cards at 360 are a fixed 378 px (slick equal heights) while slide 5's four-line title overflows them | `.offer-card { height: 378px }` below 900 — a measured box of this composition, registered as the one pinned height | 0 (section row 925 = 925) |
| "$249 /STAY" is two elements with a flex gap on the source (158 wide) | one `strong`, `word-spacing: 1px` | ≤ 1 px |
| Tags "Beaches \| Tropical \| Coastal" are three spans with 1 px dividers | authored with ` \| ` as the separator, tabs.js splits them | 0 (the pair lists the merged text MISSING) |
| Resort captions exist only for the active slide on the source (read with `scripts/click-dump.mjs` through the five "Next Slide" clicks); tab panels Florida and Las Vegas likewise | authored per row; the block renders all, shows the active | 0 |
| Footer brand logos are `mask-image` silhouettes (bg rgb(83,86,90)) of the brand svgs; at 360 they wrap centred in rows of 3/5/5/5/5/3 at ≈ 23 px | footer.js replaces each picture with a masked box (ratio from the loaded img), 1 px rules through the Hilton and Honors logos; 360: `gap 24px 25px`, height 23, `max-width 60` | band 9450 4.2 % at 1440 (silhouette anti-aliasing); 360 band 10800 11.7 % (r4) → see REPORT |
| Footer links are `display:block` 120 wide on the source; the pipeline's list items | `li > a { display: inline-block }` so the row is 18 / 36 px | 0 (the pair reads Δw) |
| Keyboard-shortcuts help button, fixed bottom-right 42×48 navy circle (every capture chunk) | decided out (an app widget) | ≈ 0.1 % per width |
| Header hides on scroll down from y ≥ 20 and shows on the way up (translateY(−100 %), 300 ms) — in the chunked capture it is in chunk 0 only | header.js `nav-hidden` by scroll direction, same transition | 0 (chrome band 0.2 % at 900) |
| Mobile hero: a different video (1190586344, 1600×900 cover) | the second authored poster is the 360 frame, shown below 900 | in the hero row |
| Mobile-only copy: none found (the same texts at 360, re-flowed) | — | 0 |
| The pipeline leaves the metadata block behind as an empty section (served only) | `main > .section:not(:has(> *)) { display: none }` (METHOD step 7) | served 1440 Δh 1 = prototype |

## Motion register (motion-observe not run: the hover and click probes below cover every interaction the source has at rest; the page's
scroll-driven states are the header and the count-ups, read with `scroll-probe` and `scripts/ticker-ladder.mjs`)

| interaction | live (hover-diff / scroll-probe / click-dump) | build | status |
|---|---|---|---|
| outline pill hover (intro, footer CTAs) | background → rgba(32,43,70,0.1) | styles.css `.button.secondary:hover` | verified: hover-diff identical on prototype and served page |
| white outline pill hover (ticker "Explore Destinations") | background → rgba(255,255,255,0.15) | ticker.css | verified (both) |
| pink pill hover (offers "Explore Offers") | live: no change read (the hover probe's first match was off-screen); white bg / pink text on the build | carousel.css | **build-only**: the live probe read nothing — accepted |
| carousel arrow hover (coverflow) | bg → navy, icon → white | carousel.css | verified (both) |
| text link hover ("Explore Resort", "VIEW ALL") | colour → rgb(158,162,173) | carousel.css, cards.css | verified (both) |
| play icon hover (social video tile) | opacity 0.8 → 1 | carousel.css | verified (both) |
| quote card hover ("Read Article") | underline on the label (`hover:underline`) | cards.css | verified: span underline on hover |
| footer link hover | underline | footer.css | verified (both) |
| newsletter "Sign Up" hover | bg → rgb(18,25,42) | styles.css `.button.primary:hover` | verified on prototype (the submit is a `button.button.primary`; hover-diff read "no change" because the probe diffs `a`-level props on a `button` — the rule is the same as the footer primary) |
| hamburger, user icon, social icons, tab buttons, "Explore Hawaii" | no change on live | — | decided out (dead on live) |
| header on scroll | hidden (`-translate-y-full`) at y ≥ 20 going down, shown at the first upward step (scroll-probe ladder down 0/20, up 9000/8980) | header.js | verified: the build's chunks below the first show no bar, like the live capture |
| count-up numbers on scroll into view | linear 0 → 200 in 3.75 s (ticker ladder: 16 / 313 ms) | ticker.js | reproduced; the captured intermediate values differ by chunk timing (register row) |
| hamburger click | drawer 416×900 navy from the left, close row 74, items 70 tall (24/48 padding, 14/22 bold uppercase, chevron), language row with a 1 px top rule | header.js | verified: click-state on prototype and served page — same boxes ([0,74,416,70] …, [48,98] text), `aria-expanded=true`, body overflow hidden |
| drawer item click | second panel 416 wide beside the drawer: uppercase title link, description, links 45 px apart | header.js `.nav-subpanel` | built; `click-state` cannot chain two clicks (the item is inside the closed drawer: "waiting for locator") — a 2-step probe is gap 9 |
| tab click | underline slides to the tab, panel swaps | tabs.js | built (aria-selected); not probed |
| carousel prev / next | slide, counter | carousel.js | built; captions verified against the five live captions |
| hero "Pause" | pauses the Vimeo loop | hero.js toggles the label | design parity only (no video plays on the build) |
