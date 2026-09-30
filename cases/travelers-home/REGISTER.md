# travelers.com home — triage, deviations, motion (blocks-first v2, 2026-09-30)

Source: https://www.travelers.com/ (no bot manager: curl and headless Chromium get the page; no consent banner shows — OneTrust SDK
is present but paints nothing). Doc height 6048 at 1440 and 2560, 12358 at 360. Cap-probe: shell max-width 1440 (`#main-content >
.tds-container`, holds 100 % of the text), 4 module caps (1440 ×2, 1104 hero card, 875 h1), probe 2560. Body bg transparent
(white), text rgb(107,109,113) 18/27, headings rgb(39,42,45), links rgb(0,115,149) underlined, brand red rgb(224,23,25), dark blue
rgb(0,45,75), grey bands rgb(242,245,247) / rgb(246,246,246), rules rgb(218,219,219). Fonts BattersonSans 400 / 600 / 700
(cdn.travelers.com/fonts/2.1). Noise floor (two 1440 captures): **0.00 %**, every band 0 — the page is deterministic except the
tracking phone number (see deviations).

## Triage table (step 2, before any block existed)

| # | section (live) | default content | block · shape · collection match · rows × cols | section style |
|---|---|---|---|---|
| 0 | header: top hat (6 utility links, hidden at 360 → inside the mobile menu), logo, 4 primary items with full-width mega menus (3 levels, editorial column breaks), search icon, "Log in" small button | nav doc, 4 sections in reading order: top-hat `ul`; brand link `:travelers-logo:`; 3-level nested `ul`; tools (`:search:` link, `Log in` italic link) | `header` · BC **header** (fragment `/drafts/nav`) — Travelers look in header.css, header.js assigns tophat/brand/sections/tools by section order | — |
| 1 | h1 (875 px, centered) · hero: 1440 × 494 photo, white quote card 1104 × 252 overlapping the photo bottom (primary: eyebrow, h2, product select + ZIP + "Start a quote*", "Continue a quote", "or call…" tel; secondary dark-blue panel: eyebrow, h2, ghost "Find solutions") · quick-links band (4 icon links, full-bleed, 1 px bottom rule) | `h1` | `hero (quote)` · simple · BC **hero** · 3 × 1 (picture · personal panel: `p strong` eyebrow, `h2`, `p` label, `ul` of 16 product links, `p` label, bold button link, link, `p` with tel link · business panel: `p strong`, `h2`, italic button link) — the block builds `<select>` + ZIP `<input>` from the list, the two label paragraphs and the button; `quick-links` · container · no BC shape · 4 × 1 (`:icon:` + link) | — |
| 2 | panel 50-50 "Travelers personal insurance" (text 438 px left, photo 666 × 500 right, radius 6) | — | `columns (feature)` · container · BC **columns** · 1 × 2 (text: `p strong` eyebrow, `h2`, `p`, `p strong` "Explore products", `ul` 13 links (2 CSS columns), bold button · picture) | — |
| 3 | panel 50-50 "Travelers business insurance" (photo left, text right) | — | `columns (feature)` · 1 × 2 (picture · text, `ul` 10 links) | — |
| 4 | "Industries we protect" head (centered) · 4 cards (photo 315 × 177 + link title) · "Explore all industries" secondary button | `p strong` eyebrow, `h2`, closing italic button link | `cards` · container · BC **cards** · 4 × 2 (picture · `h3` link) | `center` |
| 5 | inline CTA band (146 px photo · h3 + p · primary button right; 1 px rules top/bottom full-bleed, 36 px padding) | — | `columns (cta)` · 1 × 3 (picture · `h3` + `p` · bold button link) | `bordered` |
| 6 | Claim Center: text left (eyebrow, h2, p, primary button) · 2 × 2 solid tiles right (72 px illustrative icon + bold link) | — | `columns (feature, tiles)` · 1 × 2 (text · `ul` of 4 `:icon:` links) | — |
| 7 | "Why Travelers" head (left) · 4 cards (photo, link title, p) · "More about Travelers" secondary button | `p strong`, `h2`, closing italic button link | `cards` · 4 × 2 (picture · `h3` link + `p`) | — |
| 8 | "Featured content" stripe (grey full-bleed, 48 px padding; h2 · photo 432 × 243 left · h3 + p + link right) | `h2` | `columns (story)` · 1 × 2 (picture · `h3` + `p` + `p` link) | `grey` |
| 9 | "Prepare & Prevent" head (source: h2 eyebrow + **h3**; authored h2) · 4 article cards (photo · eyebrow · link title · p · clock + read time, equal height, read time pinned to the bottom) | `p strong`, `h2` | `cards` · 4 × 2 (picture · `p strong` eyebrow + `h3` link + `p` + `p` `:clock:` read time) | — |
| 10 | footer: curved grey top (ellipse), logo + 5 social icon links + trademark p · 4 link groups (h2 + ul) · disclaimer p | footer doc, 3 sections: picture-less brand `:travelers-logo:` link, social `ul` (icon + visually-hidden name), `p`; 4 × (`h2`, `ul`); `p` | `footer` · BC **footer** (fragment `/drafts/footer`); decorate wraps each `h2 + ul` pair into a group | — |

Hidden DOM not modelled: 4 product-disclaimer modals (Travel/Pet/Motorcycle/Flood), "Quotes are not available in AK, FL, HI and LA",
per-product hidden forms (16 duplicates of the quote form), mobile duplicates, skip link, Qualtrics "Give feedback" tab, OneTrust,
StackAdapt. Configuration: `template: home` (body class), `nav`, `footer`, `title`, `description` in the metadata block. Section
styles authored: `center`, `bordered`, `grey`; every other section is default (72 px rhythm is foundation CSS, not per position).

## David's Model lint at step 2
See LINT.md.

## Deviations register (step 3)

| source feature | decision | pixel cost (est.) |
|---|---|---|
| Hero quote card becomes a fixed "Get a quote" bar (class `sticky--top`, `sticky-animate-in` 0.25 s translateY(-100 % → 0), 90 px at 1440 / 75 px at 360, bg rgb(242,245,247)) once the card scrolls above the viewport (scroll-probe: state flips between y 800 and 900 at 1440) | hero.js toggles `hero-sticky` on the same element with a placeholder keeping the space, same animation; stitch-shot pauses animations at 0 % on both sides so the bar is in neither capture | 0 in the gate (frozen); state verified with scroll-probe on the prototype |
| Tracking phone number changes per session (1-855-537-2298 / 1-833-216-2012 / 1-833-810-9925 / 1-855-805-9401 / 1-844-902-0484 / 1-888-493-0471 seen) | document fixes 1-855-537-2298 (the 1440 live-spec run); session-variable region 139 × 24 px | < 0.01 % per width |
| Qualtrics "Give feedback" fixed tab (24 × 93, right edge, appears once per 900 px capture chunk) | decided out (third-party widget) | ≈ 0.02 % per width |
| Mega-menu column grouping is editorial (`mega-colbreak` / `mega-nocolbreak` flags on level-2 items, not derivable from structure) | header.css lays level-2 items out in 3 CSS columns (432 px, 36 gap, `break-inside: avoid`) | 0 (hidden at rest) |
| Hero "Find an agent" auxiliary link exists only in the sticky state (hidden at rest) | decided out (hidden DOM; the sticky bar shows label + form + call/continue only) | 0 |
| Product select: 16 options, 7 quote URLs with a `zipCode={?}` placeholder, 9 plain product pages | authored as a `ul` of links; hero.js builds the `<select>`, replaces `{?}` with the ZIP on submit, navigates directly for plain pages | native select text rendering ≈ 0 |
| Eyebrow lines (source `h2`/`h5` at 16/20 600, 14/21 700) | authored as `<p><strong>` directly before the heading (`p:has(+ h2)`) | 0 |
| "Insights to help you manage risks…" is an `h3` on the source, styled like the other section `h2`s | authored `h2` | 0 |
| Images: webp (one jpeg) from asset.trvstatic.com (tokenised URLs, 17 files) | downloaded and uploaded **unchanged** (`.webp`) to DA `/drafts/media/*` (lowercase), previewed on the branch; the pipeline stores them byte-identical (`media_*.webp`) and serves optimised renditions; the document references the branch preview URL so prototype and served page share one document (BACKLOG #4 path). r1 used re-encoded jpg q90: +1.2 % at 1440 in photo bands vs the webp bytes | see the photo-rendition row |
| Icons: sprite symbols (`/ClientResources/tds-icons/...symbol-sprites.svg`), `currentColor` fills | 19 files in `/icons` with the measured colour baked in (img-based `decorateIcons` cannot inherit colour); logo keeps its own fills | 0 |
| Hero photo renditions (1440 / 1023 / 575 widths, same crop) | pipeline renditions; `object-fit: cover` on a 1440 : 494 box (575 : 197 below 900, see below) | 0 |
| Hero photo at 2560 stays 1440 wide, centred (shell cap); quick-links rule, CTA rules, grey stripe and footer curve span the viewport | section styles paint full-bleed on the section, content stays in the 1440 shell | 0 |
| Footer curved top edge: `.tds-global-footer::before` ellipse 7372 × 1843 (radius 50 % / 921.6 px) at 1440, 921 × 1652 (radius 115.2 px) at 360 | footer.css pseudo-element with the measured geometry (5.12 × viewport width, top radius 0.64 × viewport width) | ≤ 0.2 % (anti-aliased curve) |
| `:icon:` tokens: the harness fold does not convert them, the pipeline does (BACKLOG #5) | scripts.js converts leftover `:name:` text tokens to icon spans before `decorateIcons` (same as fidelity-home) | 0 |
| "Log in" button carries a person icon | header.js appends `:person-circle:` (design, not authored) | 0 |
| Social links are icon-only with aria-labels | authored `:social-fb: Facebook`; footer.css hides the text visually | 0 |
| Top hat at 360 | hidden in the bar; header.css shows the same list inside the open mobile menu (measured: 6 × 44 px rows, 18/24 600) | 0 at rest |
| Card hover, header on scroll, ghost/small-button hover | dead on live (motion-observe) → not implemented | 0 |
| Fonts | BattersonSansUI Regular/SemiBold/Bold woff2 from cdn.travelers.com → `/fonts`, `fonts.css` | 0 |
| Card / panel photos: live serves the 975 px webp scaled down; the build serves the pipeline's `?width=750&format=webply&optimize=medium` rendition (cards.js `createOptimizedPicture`, and the pipeline's own `<picture>` on the served page) | inherent to EDS delivery; same on prototype and served page | the residual in every photo band: 360 bands 6300–9900 at 3.5–9.5 % (photos are 90 % of the width), 1440 photo bands 1.0–2.6 %, 2560 0.5–1.5 % |
| Product link lists (13 / 10 links, two columns, column-major) | authored as one `ul`; columns.js splits it into two `ul`s (ceil(n/2)); rows modelled as measured: 24 px list row (body 18/24) holding an inline-block 15/21 link, 9 px apart, 30 px list margin (21 in a flex item, where the last row's margin cannot collapse) | 0 after r5 (r1–r4 carried the 1–2 px row offsets this model removed) |
| Hero "Continue a quote" / "or call" row: a 16 px link in a 15 px/24 px line makes a 25 px line box on both sides at 1440 (flex row, baseline) and a 24 px box at 360 (block link) | `.hero-links a { display:inline-block; vertical-align: top }` at 360, baseline at ≥ 900 | 0 |
| Footer trademark line + blank line + copyright (one `p` with `<br><br>` on the source) | authored as two paragraphs (18 px padding each = the 72 px block) | 0 |
| Footer disclaimer block is 58 px for a 38 px paragraph (a trailing empty line on the source) | `padding-bottom: 19.2px` | 0 |
| The pipeline leaves the metadata block's section behind as an empty `.section` (the harness fold drops it): with a `.section + .section` rhythm rule the served page had a 72 px gap before the footer — found by the leak table (prototype vs served), not by eye | `main > .section:not(:has(> *)) { display: none }` | served 1440 Δh 72 → 0 |
| Hero photo mobile rendition ratio: the 575 px rendition is 575 × 197 (0.3426) vs 1440 × 494 (0.3431) → 123 px vs 124 px at 360 | `aspect-ratio: 575 / 197` below 900 | 1 px at 360 → 0 |
| "Give feedback" tab also paints over the right edge of every photo it overlaps | in the tab row already | — |

## Motion register (motion-observe --width 1440 on live; same probes on prototype and served via `gate --probes`; deep hover diff
`scripts/hover-diff.mjs` on live and build; scroll-probe for the sticky state)

| interaction | live | build | status |
|---|---|---|---|
| primary button hover | bg rgb(224,23,25) → rgb(175,18,20), border same, box-shadow 0 0 0 2px rgb(175,18,20), 0.25 s ease-in-out | styles.css | verified: deep diff identical on build (motion-compare reads "MISSING" for the hero form `<button>` — its sampler pairs by order and read no diff there; the deep diff does) |
| secondary (outline) button hover | color + border → rgb(175,18,20), box-shadow 0 0 0 2px | styles.css | verified: parity (motion-compare) |
| small "Log in" hover | color + border → rgb(175,18,20), 2 px ring (deep diff; the frame sampler read "no change") | header.css | verified: deep diff identical on build |
| ghost "Find solutions" hover | no change (frame sampler and deep diff) | — | decided out (dead on live) |
| nav toggle hover | bg → rgb(246,246,246); `::before` 2 px underline opacity 0 → 1 (deep diff) | header.css | verified: deep diff identical on build (motion-compare "MISSING": sampler artifact, see above) |
| nav toggle click | mega menu opens (opacity + height 0.3 s); sampler blind (no track transform) | header.js `aria-expanded`, header.css | verified: click-state probe `scripts/nav-open.mjs` — panel 1440 × 646 under the bar, 3 × 432 columns, 44 px rows |
| top-hat link hover | color rgb(70,73,77) → rgb(39,42,45); `::after` 1 px underline coloured | header.css | verified: parity (motion-compare) + deep diff |
| search icon button hover | bg → rgb(246,246,246), `::after` 2 px underline, icon fill → rgb(0,82,107) | header.css (bg + underline; the img-based icon cannot change fill) | verified (deep diff) except the icon fill — accepted |
| teal links hover (quick links, product links, tiles, story link, card titles) | color → rgb(0,99,128), bg → rgba(0,145,235,0.2), 0.25 s | styles.css | verified: parity (motion-compare, 5 rows) |
| footer link hover | color → rgb(0,99,128) + underline appears (deep diff) | footer.css | verified: parity + deep diff |
| social icon link hover | color + bg rgba(0,145,235,0.2) | footer.css (generic link hover) | verified: deep diff |
| card hover | no change | — | decided out (dead on live) |
| hero card → fixed "Get a quote" bar on scroll | classes `sticky--top` + `hide-secondary`, animation `sticky-animate-in` 0.25 s translateY(-100 % → 0); flips between y 800 and 900 at 1440; bar 90 px (1440) / 75 px (360), bg rgb(242,245,247) | hero.js (`hero-sticky` class + placeholder), hero.css (`hero-sticky-in`) | verified: scroll-probe ladder on the prototype identical to live (flip 800→900, bg, top 0); `scripts/sticky-check.mjs` sticks at 900 and releases at 500 at both widths; bar 1440 × 90 / 360 × 75. motion-compare lists the source's class and animation *names* as MISSING/EXTRA — names only |
| button border-radius transitions (4 radius props, 0.25 s) | fire on live with no visual change | not implemented | decided out (no pixel) |
| mega-menu open transitions (height 0.3 s, chevron line-height 0.4 s) | fire on live | not implemented (panel toggles) | decided out (hidden at rest; the click state is verified) |
| header on scroll | static (89 px, position relative throughout) | — | decided out (dead on live, both sides) |
| mobile menu toggle (360) | panel under the bar: 4 toggles, top-hat list, search; toggle bg rgb(246,246,246), label "Close" | header.js / header.css | verified: `scripts/nav-open.mjs` at 360 (panels at 84, 4 × 44 rows, label "Close", bg) |
