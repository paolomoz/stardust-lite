# dentsu.com home — triage, deviations, motion (blocks-first v2.6, 2026-10-01)

Source: https://www.dentsu.com/ — the origin serves the **Switzerland edition** at `/` to this operator's IP (title "dentsu", header
"Switzerland", links `/ch/en/…`); `curl` with `Accept-Language` en-US / de-CH / ja-JP returns the same edition (server-side geo, not
language negotiation) and `/?global=true` is another page ("Award Winning Creative & Media Solutions | dentsu"). The URL does not change,
so there is nothing to pin: every instrument ran with `--locale en-CH` for the record and from one IP. Light-DOM Kentico site, no shadow
roots, no `main`-less structure (`main#main-content` holds every module except the hero, which sits before it in `div.main-container`).
Headless Chromium gets status 200 everywhere. One overlay: OneTrust bottom bar (`#onetrust-accept-btn-handler`, no reload on consent)
plus its persistent floating cookie button (50 × 50, bottom-left, in every capture chunk). Doc height 5509 at 1440 and 2560 (identical
layout: the content containers are 1180 / 1200 and the hero, promise panel and tile grid are viewport fractions), 5830 at 360.
Cap-probe: 7 modules, content cap 1200 (module kind) ×5, 380 ×1, full-bleed ×1, shell fluid, probe 2560. Colours: ink rgb(0,0,20)
(headings, dark bands, buttons), body rgb(38,38,38), chrome rgb(50,50,50) (panels, footer), white type on dark. Fonts Halcom-Regular /
Medium / Bold woff (www.dentsu.com/assets/fonts; all weight 400 — the promise paragraph's `font-weight: 700` is a synthetic bold on
both sides). Noise floor (two 1440 captures): **0.84 %** — every band 0.0–0.1 except 3500–4500 at 3.0 / 6.1 %, the featured-article
parallax image (see deviations: rellax at freeze time); 2560 self-pair (the gate's cached origin vs the step-1 capture): 0.00 %.

## Triage table (step 2, before any block existed)

| # | section (live) | default content | block · shape · collection match · rows × cols | section style |
|---|---|---|---|---|
| 0 | header: absolute bar over the hero (120 / 70 px), logo 152 × 32, market trigger "Switzerland ⌄", "Menu ≡"; two full-viewport slide-in panels (rgb 50 50 50): markets (2 group headings + 32 markets in 3 columns) and primary menu (7 items, 2 expandable) | nav doc, 3 sections in reading order: brand picture link; market label `p` + two `h2` (Global (English); Dentsu Group (English \| 日本語)) + `ul` of 32 market links; nested `ul` menu | `header` · BC **header** (fragment `/drafts/nav`) — header.js assigns brand / markets / menu by section order, builds the two triggers and panels | — |
| 1 | hero 1440 × 900 (100vh; 400 at 360): Tokyo photo cover, h1 "Innovating to Impact" 115.2 px (8vw) in a 1180 container pinned to x 0, bouncing scroll-down chevron linking to the intro | — | `hero` · simple · BC **hero** · 1 × 1 (picture · `h1` · `p` link "Go to Introduction" → `#we-are-dentsu`; the block makes the picture the background and the link the arrow) | — |
| 2 | "We are dentsu" 100 px + 480-wide lede, 60 px above and below (195 below at 360 for the overlapping picture) | `h2`, `p` | — | `intro` |
| 3 | client promise: photo 55 vw left (drifting, rellax 1.7), dark panel from 27 vw to the right edge overlapping the photo by 28 vw, text column at 57 vw (h2 36, p 20/29.6 bold-synth, white button) | — | `columns (promise)` · container · BC **columns** · 1 × 2 (picture · `h2` + `p` + italic link = white button) | — |
| 4 | quote 64 px Halcom-Bold, 980 wide in the 1200 container, 40 px above/below, drifting (rellax .8 / .5) | — | `quote` · simple · BC **quote** · 1 × 1 (the quotation) | — |
| 5 | 6 photo tiles 480 × 360 (33.3 vw × 360; 360 × 250 at 360), whole tile a link, gradient veil, title 24/36 bottom-left (68 % wide), thin chevron bottom-right (25 % cell); the 6th is a dark call-to-action tile (36 px text, bigger chevron) | — | `cards (tiles)` · container · BC **cards** · 6 × 2 (picture · link; the CTA row `(empty) · link`) | — |
| 6 | quote 2 (same module, 384 tall) | — | `quote` · 1 × 1 | — |
| 7 | featured article: text 540 (h2 36 max 480, p 20/30 with `em`, dark 300-wide button) · portrait picture 594 wide right-aligned in a 660 column, −40 top, drifting (rellax 1 / .5); column-reverse at 360 | — | `columns (feature)` · container · BC **columns** · 1 × 2 (`h2` + `p` + bold link · picture) | — |
| 8 | "Our network" centred head (65 px pad), 5 brand logos in 179 × 178 cells, centred 300-wide button, 120 px before the footer | `h2`, closing bold link | `cards (logos)` · container · BC **cards** · 5 × 1 (picture) | `center` |
| 9 | footer: rgb(50,50,50), 70 / 130 padding, 4 groups of 25 % (Policies + 4 links; Contact; Sitemap; Connect + 5 round icon links), 2 legal lines 13.5/20.25 | footer doc, 5 sections: `h3` + `ul`; `h3` link; `h3` link; `h3` + `ul` of `:icon:` links; 2 `p` | `footer` · BC **footer** (fragment `/drafts/footer`); decorate puts the four `h3` sections in one row | — |

Hidden DOM not modelled: skip link, `.full-bg-video` (the hero's video slot — this edition has `no-video`), `.featured-article-image-back`
(display none), OneTrust SDK and its floating button, GTM / Clarity / Bing / Pardot pixels, the a11y-hidden "Language Menu" / "Main Menu"
headings (the block adds its own `aria-label`s). Configuration: `title`, `description`, `nav`, `footer` in the metadata block; no
template body class (one template — BACKLOG #47). Section styles authored: `intro`, `center`; the module rhythm (60 px at ≥ 900, 20 px
below; 80 after the feature, 120 before the footer) is section padding in `styles.css` / the block CSS, never a block margin.

## David's Model lint at step 2
See LINT.md: 0 🔴, 3 🟡 (hero and quote are the Block Collection shapes).

## Deviations register (step 3)

| source feature | decision | pixel cost |
|---|---|---|
| Geo edition: `/` serves the CH edition to this IP; `Accept-Language` ignored; `?global=true` is another page | the CH edition is the page measured and authored (texts, hrefs `/ch/en/…` made absolute to www.dentsu.com); `--locale en-CH` on every instrument for the record (no effect on the origin) | 0 (deterministic from one IP; both 1440 captures identical outside the parallax band) |
| rellax parallax on 4 elements (`data-rellax-speed` 1.7 / .8 / .8 / 1, `data-rellax-percentage` 0 / .5 / .5 / .5): translateY = speed × 100 × (1 − (scrollY − top + vh) / (h + vh)) − base; scroll-probe ladder 0–1580 at 1440: blockquote 129 → 17, feature image 223 → 127 (`motion/scroll-probe-1440.txt`) | `scripts/parallax.js` with the same formula and speeds; base = speed × 100 × (1 − percentage), or the measured rest offset 175 for the promise picture whose "0" rellax reads as unset (gives 62 at 1440 / 58 at 2560 = live); desktop only (no transform on the source below 900) | **instrument artifact, both sides**: stitch-shot captures each 900 px chunk at another scrollY, so an element spanning a chunk boundary is torn by the Δ of the function (quote 2: 22 → −34 across 3600; feature image 5 → −50 across 4500); the live noise floor is 3.0 / 6.1 % in bands 3500–4500 for the same reason; residual in the gate ≈ 2–4.5 % in band 4050 at 1440 / 2560 |
| hero `::after` rgba(0,0,0,.2) at z −1: measured luminance live/build ratio 1.25 at 1440 (the veil does NOT paint over the photo there — `.full-bg-video` sits above it) and 0.80 at 360 (it does) | veil below 900 only | band 0–900 at 1440: 10.2 % → 0.4 % after reading the ratio (one round) |
| tile fade-in (`li.cs-image-list-block` opacity transition 0.25 s, class-driven on scroll): the live capture shows the tile that straddles a chunk boundary mid-fade — Heineken top 212 px at 1440 (lighter, no gradient yet), Eurostar at 360 — in **both** noise-floor captures (deterministic for stitch-shot's 450 ms chunk wait, BACKLOG #9) | not reproduced: the build paints the tiles at opacity 1 | band 2250 at 1440 ≈ 11.7 % of the band (≈ 1.0 % of the page), 2250 at 2560 ≈ 11.6 %, band 1800–2700 at 360 ≈ 18 % (≈ 2.8 % of the page) — the largest residual |
| OneTrust persistent cookie button (50 × 50 at bottom-left of every chunk) and bottom bar (dismissed) | decided out (third-party) | ≈ 0.05 % per chunk ×7 |
| header fixed? No: `position: absolute` at every width, static across the scroll (motion-observe headerTimeline, probe-load at 360 / 1440 / 2560: no fixed layer but OneTrust) | absolute bar, `header { height: 0 }` | 0 |
| hero h1 container 1180 wide but not centred (x 0 at 1440 **and** 2560: `.full-bg-video-container` has `max-width` without `margin: auto`) | `.hero-content { max-width: 1180px }` left-aligned; h1 `max-width: 90%`, 8vw / 1.2, margin 100 0 0.67em; 44/48.4 at 360 with 20 px gutters | 0 |
| hero scroll chevron: `chevron-large-icon` sprite symbol in a 41 px square inside a container rotated 90°, `arrow_bounce` 1.8 s infinite (translateX 0 / −30 / 0 / −15 / 0 in the rotated frame) | `icons/scroll-down.svg` rotated 90° by CSS, same keyframes on the icon; captures pause animations at the 0 % frame (box [702,829,41,41] at 1440, [162,329] at 360) | 0 in the gate |
| promise picture: natural 960 × 540 capped by `max-width: 100%` — 792 × 445.5 at 1440, **960 × 540 (not stretched) at 2560** in a 1408 column; 360 × 225 (fill, 8:5) at 360, 200 px above the panel (the intro section pads 195 below for it) | `width: auto; max-width: 100%` at ≥ 900, `aspect-ratio: 8/5` fill below | one round at 2560 (band 1350: 23.9 % with the stretched picture) |
| promise panel geometry: starts at 27 vw (margin-left −28 vw on a 55 vw picture), padding 120 / 40 / 40 / 30 vw, text 380 max at 57 vw + 20 | vw fractions, `calc()`-free | 0 at 1440 and 2560 |
| promise paragraph `font-weight: 700` on a 400-only face (faux bold), button inherits it at ≥ 900 | the same declaration (synthetic bold renders alike) | 0 |
| cta-btn: inline-block anchor holding text + an inline `svg` with a whitespace gap (≈ 4.4 px) + `margin-left: 5px` | `a.button` inline-flex, arrow icon appended by `scripts.js` (`decorateButtonArrows`) with `margin-left: 9px` | "Find out more" 172 → 176 wide |
| promise panel 628 tall vs the build's 626.4: the live button's inline-block line box (42.4 px box on a 29.6 px line → ≈ 44 px) | not chased: a −2 px chain from section 3 to the footer at 1440 / 2560 (stop rule) | Δh −2 |
| tiles: `li` `flex: 1 0 33.3333%`, 360 tall; title `span` 68 % wide, margin 0 0 20 20; chevron cell `flex: 0 0 25%`, 28.8 tall, margin-bottom 30, the `use` 22.3 × 28.8 centred; CTA tile: text 36/43.2 max 170 with margin 0 110 20 20, chevron cell 100 × 43.2; gradient `::after` rgba(5,5,30,.2) → rgb(0,0,20); whole tile is the link | cards.js builds one anchor per tile (picture, title, chevron); the gradient lives on `a::after` (inside the link's stacking context — on `li::after` it painted under the picture: round 3) | 0 |
| tile pictures: live `img` cover 480 × 360 over an identical `background-image` on the `li` | picture only | 0 |
| feature column: text `flex: 1 0 40%` (540), picture column 55 % (660), picture 90 % right-aligned (594 × 742.5) in a `div` with margin-top −40 that drifts; column-reverse at 360 with the picture 288 × 360 and 30 px below | columns.css feature variant; the authored order stays text → picture (reading order), CSS reverses it below 900 | 0 |
| brand logos: `li` 179 × 178 fixed (padding 20 20 0, margin-right 20), `img` 139 wide; at 360 two per row (48 % + 4 % gap, padding 20, auto height) | cards.css logos variant | 0 |
| "Our network" h2: padding-top 65 + margin-top 29.88 that collapses out of the section (the 80 px gap after the feature is the feature's margin) | padding-top 65, margin 0; the gap is the feature section's padding-bottom 80 | 0 |
| footer legal 1169.53 wide (99.11 % of 1180) | 100 %: each paragraph is one line at both widths; the build's 1169.38 wrapped the second line once (round 1) | 0 |
| footer `h3` margin-bottom 40, but 20 when a list follows at 360 | `h3:has(+ ul)` | 0 |
| footer legal: two `<p>` on the source (live-spec merged them as a 2-line paragraph) | authored as two paragraphs | pair row "Notwithstanding…" reads Δh −21 (the merge), 0 px |
| market list entries "Africa (English)" with the edition in a smaller span (27/54 + 17/34; 16/40 + 12/30 at 360); two-edition markets "Benelux (Nederland \| English)" | authored as plain link text (and two links for two editions); header.js wraps the parenthesised part in a `span` for the smaller size | 0 (hidden at rest) |
| markets panel heading "Dentsu Group ( English \| 日本語 )" wraps to two lines at 360 (58 tall) on the source; the build's single line pushes the list 28 px up | accepted (hidden state) | 0 at rest |
| primary menu expand buttons: the pipeline wraps the item's own text in `<p>` when it holds a nested list (BACKLOG #86) — the first build dropped the label | header.js reads text nodes **and** `p` children | 0 (found by `click-state` on the build) |
| menu items: live `a` inline in a 79.2 px line (glyph box 49 at +15); an inline-block `a` read 4 px high | `display: inline` | 0 |
| hamburger: 4 spans 30 × 3 at 0 / 10 / 10 / 20 (the X animation) | same 4 spans, rotate ±45° when open | 0 |
| "Menu" label hidden at 360 (hamburger only, 30 × 25 at x 310); market trigger 16/18.4 with a 17 px chevron | header.css below 900 | 0 |
| icons: sprite symbols (`div.svg-sprite`, `<use href="#…">`): chevron-icon, chevron-large-icon, arrow-icon ×3, chevron-thin ×6, 5 social | `scripts/svg-dump.mjs` lifts the used symbols into `/icons/*.svg` with the measured fill baked in (white; `arrow-dark` rgb(38,38,38) for the white button) — img-based `decorateIcons` cannot inherit colour (travelers-home gap 5) | 0 |
| media: Kontent CDN renditions (`?q=75&fm=jpg&w=960`, the hero `w=1920`, logo PNGs) | fetched unchanged (`media-fetch`, a-z0-9 names), 14 files + the header logo uploaded to DA `/drafts/media`, previewed; documents reference the branch preview URL | photo renditions: the pipeline serves `?width=2000/750` webply; residual ≈ 1–2 % in photo bands |
| fonts | Halcom-Regular / Medium / Bold woff → `/fonts`, `@font-face` in `fonts.css`, imported from `styles.css` while gating (BACKLOG #51) | 0 |
| `:icon:` tokens in the footer (`:instagram:` …) | the pipeline converts them; the harness fold does not (BACKLOG #5) — the harness takes the footer from the pipeline (`--fragments`), so no fold is needed on this page | 0 |
| the pipeline's empty metadata section | `main > .section:not(:has(> *)) { display: none }` (BACKLOG #24) | 0 |
| 360 intro paragraph: one line reads red in the diff, sbs identical, shift-probe mean 3.75 and no shift | glyph anti-aliasing | ≈ 0.1 % |

## Motion register (motion-observe on live and build via `gate --probes motion/probes.txt`; `hover-diff` on both sides;
click-state on both sides; `scripts/css-props.mjs --anim` for the keyframes)

| interaction | live | build | status |
|---|---|---|---|
| dark button hover (feature "Download", network "Find out about our Network") | background rgb(0,0,20) → rgba(38,38,38,.5), 0.25 s ease-in-out | styles.css `a.button.primary:hover` | verified: motion-compare parity ×2, hover-diff identical |
| white button hover ("Find out more") | no change (hover-diff: outline only) | — | decided out (dead on live) |
| tile hover | no change | — | decided out (dead on live) |
| footer link hover (Policies links, Contact, Sitemap) | text-decoration underline | footer.css | verified: hover-diff identical on build (motion-compare reads "dead on live" — text-decoration is invisible to the frame sampler, BACKLOG #19) |
| social icon hover | opacity → 0.5, 0.25 s | footer.css | verified: parity + hover-diff |
| header trigger hover (market, menu) | opacity → 0.8 | header.css | verified: hover-diff identical on both (motion-compare "extra on build — advisory" for the market trigger: the frame sampler read no diff on live; the deep diff does) |
| menu trigger click | `#primary-nav` translateY −900 → 0 in 0.25 s, body `m-modal-active` (overflow hidden), logo + market trigger `m-hide`, hamburger `m-active` (X), "Menu" → "Close" | header.js `menu-open` / `nav-open` / `.nav-panel.open` | verified: click-state on the build at 1440 (panel 1440 × 900, ul at y 100, 7 items 79 tall at 49.5/79.2 right-aligned, `aria-expanded=true`, body overflow hidden) and at 360 (ul at 100, 48 px rows); motion-compare lists the source's class *names* as MISSING and the build's as advisory — names only |
| market trigger click | `#global-nav` slides in; `.header.m-global`; menu trigger hides | header.js `markets-open` | verified: click-state on the build (heads at 120, list at 213 in 3 × 389 columns at 1440; one column 40 px rows at 360) |
| "Who we are" / "Our thinking" expand | `aria-expanded`, sub-list 24/48 right-aligned (hidden, `inert`) | header.js button toggles `aria-expanded`, CSS shows the sub-list | verified on the served page (`gate-served/click-primary-1440.txt`: "Who we are" 334 × 81 / "Our thinking" 352 × 81 buttons with labels and chevrons; live 336 / 354 × 81) |
| hero scroll chevron | `arrow_bounce` 1.8 s linear infinite (0 % 0, 40 % −30 px, 50 % 0, 60 % −15 px, 80 % 0) | hero.css `hero-arrow-bounce` on the rotated icon | verified by css-props on live; captures pause at 0 % on both sides |
| tile fade-in on scroll (opacity 0.25 s) | fires once per tile when it enters the viewport | not implemented | decided out — an entrance, 0 px at rest; it is what the live capture shows mid-flight (deviations) |
| rellax parallax (4 elements) | scroll-linked translateY, see deviations | scripts/parallax.js | verified: same function, same rest offsets (62 / 129 / 200 / 223 at scroll 0, 1440) |
| header on scroll | static (absolute, no class change, motion-observe headerTimeline flat) | — | decided out (dead on live) |
| `transition: all` on tiles and links | fires with no visual change on hover | — | decided out |
