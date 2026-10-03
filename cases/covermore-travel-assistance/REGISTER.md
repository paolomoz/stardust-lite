# REGISTER — covermore travel-assistance (triage, deviations, motion)

Source https://www.covermore.com/travel-assistance (final URL identical, no redirect, status 200; Drupal "cmus" theme, Tailwind utilities).
Sections split as `measure-page --sections "main .main-area > .region"` marked them (the spec's and the gate's split).

## Triage (step 2 — written before any block existed; lint clean 15:56:56Z)

| # | section (live 1440) | default content | block · shape · collection | section style | inset (brief) |
|---|---|---|---|---|---|
| 0 | header 1140×62 (+10 margin → 72; 360: 136) | nav document: brand picture link, `ul` of 6 links | `header` (chrome) — hamburger + in-flow panel at < 768 | — | top 16: ul p5 → a p10; bottom 26: a → ul p5 → .header m10 |
| 1 | region-breadcrumb 1080×15 | one `p`: `Home` link ` / Travel Assistance` | — (default content) | `breadcrumb` (margin-bottom 15, 11px/15.4 #737373) | bottom 0 → nav m15 → section (the 15 is the section style) |
| 2 | region-content 1080×561 | h1, p×3, h2, p×2, h2, h3×3 (`<strong>` label + number / mailto link) | — (default content, no block) | `article` (flow-root; p Arial 14.6667/21.77 #525558 m 0 0 10) | top 7 = h1 m7, bottom 7 = h3 m7 — contained by the region (BFC): `display: flow-root` |
| 3 | footer 1440×221 (pad 85 0 50; card 1140×86) | footer document: brand picture link, `ul` of 4 links, copyright `p` | `footer` (chrome) | — | top 93 = footer p85 + row centring; bottom 66 = p50 + spacer 15.4 |

Novelty after triage: 0 % (2 default sections; triage's draft had called both "NEW columns? weak"). Blocks written: `header`, `footer` (chrome only).
Cap model (cap-probe): shell `.container` 1170 fixed from 992 up (1440 and 2560: x135..1305 / x695..1865), padding 15 → the white `.main-area` 1140;
360: 100 % / 330. `main { max-width: 1170 }` with the card painted as one white layer `calc(100% − 30px)` wide.

## Deviations (source feature → decision → pixel cost)

| # | source feature | decision | cost |
|---|---|---|---|
| D1 | Every article paragraph is a Word paste: `p` Kohinoor Demi 15/21 (#000) holding a `span` with inline `font-family: Arial; font-size: 11pt; line-height: 19.7625px; color: #525558` — measured line box 21.77 px (43.53 / 2 lines, 65.3 / 3) | the `article` section style sets `p { font: 14.6667px/21.77px Arial; color: #525558 }` (an author types plain paragraphs; the paste's inline styles are not authored) | baseline 1 px higher than the live (shift-probe dy −1, the live strut is Kohinoor's): the yellow over every paragraph line — ≈ 1.3 % of the 1440 band 450, ≈ 2 % of the 360 bands. One word wraps differently at 360 in paragraph 2 (same line count, Δh 0) |
| D2 | Breadcrumb separator `span.mx-2` with `margin: 0 5px` | one paragraph `Home / Travel Assistance` — the text spaces are 2.75 px at 11 px | "Travel Assistance" sits 4 px left (shift-probe dx −4); one 15 px line |
| D3 | AudioEye launcher `aside#ae_launcher` fixed 44×48 bottom-right (third-party, z 20000) and its off-screen blurb | not built (third party) | the red disc in every live capture (≈ 0.3 % per width, twice in the 360 stitch) |
| D4 | Footer `<div>&nbsp;</div>` spacer row (15.4 px) under the copyright | `.footer-card { padding-bottom: 15.4px }` (the pipeline trims a trailing `&nbsp;` paragraph — METHOD step 5) | 0 |
| D5 | Tablet layout 768–991 (header 113, nav wrapped) — not a gated width | one breakpoint at 992; below it the mobile header (136) | 0 at 360 / 1440 / 2560; the tablet state is not reproduced |
| D6 | Nav separator: `li.nav-item` background `quote-image-opz.png` (60×825 sprite) at `100% -780px` no-repeat; the last link (`CONTACT US`) is a bare `a` without `li` | the sprite's bytes under `styles/img/`, same position on `li`, `li:last-child` without it | 0 (header band clean at 1440 and 2560) |
| D7 | Body photo `bkg-body-home-us.jpg` 1650×1300, `50% 0` no-repeat, size auto (white beyond x455..2105 at 2560) | the same bytes under `styles/img/`, same rule on `body` | 0 |
| D8 | Mobile hamburger: `.navbar-toggler` 35×54 centred, its 44×34 button overflowing right (x163..207) | `.nav-hamburger { width: 35px }`, button 44 | 0 after round 2 (5 px offset in round 1) |
| D9 | Fonts embedded as `data:` URIs in `dist/themes.css` (`Museo Sans Rounded 500 Regular`, `Kohinoor Demi`, `Kohinoor Medium`, each declared weight 400); `h3 strong` is a synthesised 700 | bytes dumped by `scripts/font-dump.mjs` to `/fonts` as woff, same family names, same synthesis | 0 |
| D10 | cap-probe module 2/2: live reads a Word `span.TextRun` (1073 px, inline) as a module; the build's `.article` section is "full-bleed" (1080 of main's 1080 content) | registered as a cap-probe artifact (an inline leaf is not a module — BACKLOG #162 flavour); wrapper cap 1170 PASS, module 1/2 PASS | cap-probe "FAIL 1 of 3" at 2560 every round |
| D11 | Hidden `h2.visually-hidden "Navigation"` in the nav | not authored (hidden DOM) | 0 |
| D12 | Open mobile panel: live page grows to 1803 (section 180 + nav border 1 overflowing), build/served 1804 | the `nav-sections` section holds the 1 px border | 1 px below the fold when open |

## Motion

| probe (live → build) | live | build / served | verdict |
|---|---|---|---|
| hover `footer a.nav_link` → `footer .footer-menu a` | color #337ab7 → rgb(42,184,232), underline | same | parity |
| hover `.cmus-breadcrumb a` → `main .section.breadcrumb a` | same | same (150 ms transition on live, n/a on build — within tolerance) | parity |
| hover `.field--name-body a` → `main .section.article a` | same | same | parity |
| hover `header .navbar-brand` → `header .nav-brand a` | `color` of the anchor and its `img` → rgb(42,184,232): no visible paint (an image) | no change | MISSING on build — invisible; register, not built |
| `transition color` events (2 on live, the brand's) | — | — | MISSING — the same invisible hover |
| hover `header a.nav_link` | dead (hover-diff prints nothing) | dead | parity (not required) |
| header scroll morph | static | static | dead on live — not required |
| click `header .navbar-toggle` → `header .nav-hamburger button` at 360 | panel `[15,116,330,181]`, border-top 1px #e7e7e7, `ul` bg rgb(19,182,234) 180, 6 × `a` 330×30 pad 10 6 0, white 12/12; scrollHeight 1803 | identical tree and boxes, `aria-expanded=true`; scrollHeight 1804 (D12) | parity (click-state, build and served) |
