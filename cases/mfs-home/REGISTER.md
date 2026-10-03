# mfs-home — register (triage, deviations, motion)

Source: https://www.mfs.com/corporate/en/home.html (AEM Sites, body `home solid-header`). Measured 2026-10-03 at 360 / 1440 / 2560
(`measure-page --noise`, consent `#onetrust-accept-btn-handler`, headless Chromium accepted — no `--chrome` needed). Noise floor 1440: 0 %.

## Triage (step 2 — `triage` draft, edited; `triage.md` / `triage.json`)

| # | source section (1440) | default content | block · shape · collection · rows × cols | section style |
|---|---|---|---|---|
| chrome | `.utilityNav-container` 1440×40 (fixed, 0×0 at 360) + `.navHeader` 1440×80 (fixed; 360×79 at 360) | nav document: brand picture, `ABOUT MFS` / `CAREERS`, tools `:flag-us: United States` / `Contact Us` / **Sign In** | `header` (fragment decorate) | — |
| 1 | `.heroBannerWithRoleContainer` 1440×921, inside `<header>` | — | `hero` · simple · BC hero · 1 × 1 (desktop picture, mobile picture, h1, h2) **and** `cards (roles)` · container · BC cards · 3 × 2 ([name, description] [“Take me to:”, list]) — one authored section, two blocks | `hero-roles` |
| 2 | `.rich-text` 1440×274 | h2 (strong), h3 (strong) | — | `intro` |
| 3 | `.asset-list-with-links` 1440×453 | closing link “Learn More :arrow-right:” | `cards (insights)` · container · BC cards · 3 × 2 ([linked picture] [title link]) | `insights` |
| chrome | `footer.no-print` 1440×464 | footer document: brand picture, three lists, social list (icon tokens), disclosure paragraph | `footer` (fragment decorate) | — |

Novelty 67 % (2 new of 3 content sections; the inventory was empty). The two role-box columns are the two properties an author types per
role (who / where to); the role links are `javascript:void(0)` role-gate controls on the source and are authored as list items (no href).

## Deviations

| source feature | decision | pixel cost |
|---|---|---|
| Hero lives inside `<header>` (header.js-main-header is 1041 px at 1440; `.js-hero-banner-with-role-container` y40 h1001 carries the 80 px nav margin) | authored as the first `main` section; the section table reads the live row as +80 (1440 / 2560: Δh −78 ⇒ band +2) and at 360 as +15 (live row y0 h950 holds the 60 px margin; build 60 + 965 = main at 1025 = live) — an artefact of the live section root, not a layout gap | 0 (band 923 vs 921 at 1440; 965 = 890 + 75 at 360) |
| 75 px gap between the hero band and `main` at 360 (band ends 950, main at 1025); 0 at ≥ 900 | `hero-roles` section padding-bottom 75 at < 900 | 0 |
| Hero image `fit=fill`: 1440×400 from a 1600×400 (stretched), 2560×640 natural; 360: the 750×840 mobile crop at 360×403 | two authored pictures in the hero cell, `min-height: 400px`, no object-fit (r7: cover had cost 7 % in the 1440 top band) | rendition residual 0.3 % band 0 at 1440 |
| Three-colour stripe over the hero top (extent: y120–141, thirds #4a0531 / #cd143e / #00b5d0; absent at 360) — no node carries it | `.hero-media::before` 21 px gradient at ≥ 900 | ≤ 1 px edge |
| `a.link-name` 174 wide at 1440 and 360 for card 1 (190 / 226 for cards 2–3) — the box width the pair read; cause not in any table | `max-width: 174px` on the role name (centred text, so the box width is invisible) | 0 |
| Role description card 2: live 50 tall for one 18 px line in 10 px padding (cards 1/3: 56 = 2 lines); the source adds 12 px no table explains | not reproduced (the boxes stretch to 516 anyway) | 12 px × 250 inside card 2 at 1440 |
| Role links rhythm: 1-line pitch 32, 3-line box 66, 3-line pitch 80 (margin varies 10–14 by lines) | `li` line-height 22 + margin 12 (card heights −4…−10 inside the stretched 516 box) | ≤ 9 px per link row inside the cards |
| `ABOUT MFS` is a `javascript:void(0)` mega-menu opener (hover/click panel, hidden DOM at rest) | authored as a text item; the panel is not authored (no click-dump run — time-boxed) | 0 at rest |
| Hamburger drawer at 360 (source: a slide-in menu; not dumped) | the header's own drawer shows the sections list and tools (`click-state` on the served page: `aria-expanded` toggles, CAREERS visible at y129) | 0 at rest |
| Utility bar “United States” flag (sprite) and caret; social icons (sprite `social.png` 30×30); “Learn More” arrow (inline SVG) | drawn SVG icons (`icons/flag-us.svg`, `facebook/x/youtube/linkedin/email.svg`, `arrow-right.svg`), inlined by `inlineIcons` for `currentColor` | glyph detail inside 30×30 / 18×18 boxes (band 2700 at 360: 2 %) |
| Social row at 360 overflows its 312 container (168..366 > 336) | `grid-template-columns: 128px minmax(0, 1fr)` with the social cell `justify-self: start` — reproduces the overflow | 0 |
| Footer link row: five flex items incl. two 0-width components (`gap 5 %`, `space-between`) placing the columns at 243 / 653 / 826 | the decorate emits the two empty spacers (layout, not content) | 0 (Δx 0 on every column at 1440 / 2560) |
| `Manage Cookie Preferences` is a `<button>` (OneTrust) centred in its column | last list item, centred by CSS; no handler | 0 |
| `MFS Investment Management®` is an `<a>` without href | list item text | 0 |
| Footer last row: band bottom 64 below the button at 360 (48 pad + 16) | 48 pad + 12 item margin | 4 px at 360 (disclosure Δy −5) |
| `{assetDetails.imageAltText}` leaked alt text on the three insight images | authored alt = card title | 0 |
| Breakpoint: source hides the utility bar and stacks everything below some width between 360 and 1440 (not measured) | 900 px | 0 at the three gated widths |
| Pipeline rendition of the hero and card JPEGs (branch host optimises) | kept (bytes uploaded unchanged) | the 1440 bands 450 / 1350 (3 / 4.7 %) are photo renditions + text anti-aliasing (crop --vs shows no displacement) |
| OneTrust banner | consent clicked on the live side; no banner on the build | 0 |

## Motion

| state | live (hover-diff 1440 / scroll-probe) | build | parity |
|---|---|---|---|
| Sign In hover | background #bd173d → #89163e | same (`.nav-signin-button:hover`) | gate motion: 1 parity; hover-diff served: same |
| role name hover | `text-decoration: none → underline` | same (`.cards-role-name:hover`) | hover-diff served: same |
| nav links, role links, card titles, footer links, utility links | no paint change (outline 3px → 0 is the focus ring; `display inline → inline-block` on nav links) | no change | 6 dead on live — not required |
| header on scroll | both bars fixed, no state change over the whole page (scroll-probe: one state) | fixed, no state | parity |
| hamburger (360) | drawer (not dumped) | drawer with the sections + tools | served `click-state`: opens |
