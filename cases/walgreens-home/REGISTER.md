# www.walgreens.com/ home — triage, deviations, motion (blocks-first v2.2, 2026-09-30)

Source: https://www.walgreens.com/ (Akamai bot manager present — `_abck`/`bm_sz` cookies — but headless Chromium with the real-Chrome
UA gets HTTP 200 and the full page; no `--headed` needed; OneTrust SDK loads with 0 px, no consent bar for an EU visitor; no geo
redirect, `lang=en`). Light-DOM AEM Sites page (`main#page-content > .hpcontainer`, 0 shadow roots), React header/footer portals.
Doc height 5875 at 1440 and 2560, 6423 at 360 (composition A, see below). cap-probe: **shell fluid, module cap 1440** (every section
container is centred at 1440 and its band colour bleeds full width), probe 2560; the Target alert is a 1140 cap outside the section
tier. Type: Inter 400/600/700/900 (Google Fonts v20 variable file), Tiempos Headline 400/300 (walgreens.com livestyleguide v5 woff2);
Source Sans Pro 700 is declared and requested but used by no visible node. Body 16/24 rgb(65,61,60); accent rgb(230,38,0); plum
rgb(98,0,46) / rgb(98,1,47); taupe rgb(152,144,144); beige rgb(244,242,239); sand rgb(222,213,208); button red rgb(163,42,51);
badge blue rgb(41,110,163). Card shadow rgba(65,61,60,.1) 0 2px 4px 2px, radius 8; pills radius 45, 44 px.

**Session-variable composition.** Three loads, three pages: (A) Adobe Target alert `#at_close_alert` (133 px with margins) + the
personalised "Offers just for you" coupon carousel (539) + a Google Ad Manager slot (153) — 5875 at 1440; (B) alert + a Zepbound
sponsored banner in the same slot instead of the carousel + GAM slot — 5360; (C) no alert. Two 1440 captures in a row gave A and B:
**noise floor 33.6 %** (bands 1000–3500 at 42–63 %, height Δ 515) — the pair is the composition variance, not capture noise; the
1440 and 2560 origins were both A on the first capture and are cached; the 360 origin was picked with `origin-pick` (8 tries, best
region 12.2 % — the coupon set itself changes per session, see below). The build models composition A.

## Triage table (step 2, before any block existed)

| # | section (live, 1440) | default content | block · shape · collection match · rows × cols | section style |
|---|---|---|---|---|
| 0 | promo bar 1440×40 beige (3 bold links) · top bar 73 (logo 38, search 725×47 pill, store 151 N State St, Account, cart) · menu bar 40 (6 dropdown titles with chevron + 3 links + Español; dropdown panels 228 wide, 28 px rows, hidden at rest); 360: hamburger drawer 350, store + Account in the lower bar; header sticky below 900 | nav doc, 5 sections in reading order: promo `ul` · brand link with the logo picture · tools `ul` (`:search:`, `:pin:` store, `:account:` + nested account menu, `:cart:`) · main menu `ul` (nested `ul` = dropdown; `---` = rule) · language link | `header` · BC **header** (fragment `/drafts/nav`); header.js assigns the sections by order, builds the search form, dropdowns (hover opens, click pins), the account drawer (right, 350) and the mobile drawer (left, 350) | — |
| 1 | Adobe Target alert 1140×83 beige, 1 px sand border, radius 8, 17/25.5 text with bold lead and link, close ×; 25 px above and below; 360: 360×160 full width | — | `alert` · simple · no BC shape · 1 × 1 (rich paragraph) — dismiss remembered in sessionStorage as the source does | — |
| 2 | 4 quick-link pills 332×40 on the taupe band (icon 20 + 12/15 700 label), 2×2 at 360 (160×55, icon above label) | — | `cards (quicklinks)` · container · BC **cards** · 4 × 2 (picture · `p` link) | `taupe` |
| 3 | slim banner 1392×154 plum (98,1,47): heading Tiempos 28/35 centred + 14 px sub + secondary pill · image 40 % (557×137 cover); 360: stacked, image 328×81 | — | `banner (dark)` · simple · no BC shape (a 60/40 band, not a hero) · 1 × 2 (`h2` + `p` + em link · picture) | — |
| 4 | 3 promo cards 428 tall, first 680 wide, plum, white text: eyebrow 12/15 700 · heading Tiempos 36/45 (28/35 small) · copy 16/24 · "Apply codes" pill · image pinned to the bottom | — | `cards (promo, dark, feature-first)` · container · BC **cards** · 3 × 2 (`p` eyebrow + `h3` link + `p` copy + em link · picture) | — |
| 5 | "Offers just for you" 22/27.5 600 + "View all" · glider of 10 coupon cards 241×431 (dashed border, expiry badge, image 155, title 18/1.3 600, brand 14, type 12, "Clip" pill), arrows 30 px red circles; personalised per session | `h2`, `p` link | `carousel (offers)` · container · BC **carousel** · 10 × 2 (picture · `p` badge + `h3` + `p` + `p` + em link) — the block moves the head link into its header row | — |
| 6 | Google Ad Manager slot `/22301037185/walgreens/homepage` 970×90 in a 985×105 safeframe, 129 px band (12 + 105 + 12); 335×65 at 360 | — | `ad` · key-value (slot, size, network) · no BC shape — reserves the slot geometry, loads no ad | — |
| 7 | plum band: 4 light promo cards 332×388 (rgb 234,233,238; eyebrow/heading/copy + image 249) · slim banner 1392×129 white: "Shop all Halloween" 36/45 + primary pill · image 696×160 overflowing the band by 15 px top and bottom | — | `cards (promo)` · 4 × 2 + `banner (light)` · 1 × 2 | `plum` |
| 8 | "Because your health matters" h2 Tiempos 36/45 (61 px band) · 4 media-top cards 332×467 (square image, title 22/27.5 600, copy) on rgb(243/244,242,238/239) | `h2` | `cards (media-top, health)` · container · BC **cards** · 4 × 2 (picture · `p` eyebrow + `h3` link + `p`) | — |
| 9 | "Capture cozy season" h2 flush with the section top (57 px band) · 3 promo cards 350, first 680, pastel per card (218,209,200 / 241,218,204 / 237,232,228) | `h2` | `cards (promo, feature-first, photo)` · 3 × 2 | `compact-head` |
| 10 | "Deals of the Week" (icon 36 + Tiempos 36 with "of the" 28/300 and red "Deals") + "View all" · store line "Deals for 780 WAUKEGAN RD **expires in 4 days!**" · glider of 13 product cards 241×288 (image 150, price 18/22.5 **900**, copy 14/21) | `p` picture, `h2` (`strong` + `em`), `p`, `p` link | `carousel (deals)` · container · BC **carousel** · 13 × 2 (picture · `h3` link + `p`) | — |
| 11–12 | "Buy again" and "Recently viewed" personalisation carousels: empty for an anonymous visitor, 24 px containers (12 + 0 + 12; 16 at 360) | — | `/widgets/buy-again.html`, `/widgets/recently-viewed.html` links → this repo's **widget** auto-block (the site's own convention for dynamic, signed-in content) | — |
| 13 | "Explore more" h2 · 4 white media-top cards 332×318 (16:9 image 187, title, copy) | `h2` | `cards (media-top)` · 4 × 2 | — |
| 14 | Criteo sponsored slot, empty: 48 px (12 + 24 + 12) | — | `ad` · key-value (slot, network) | — |
| 15 | "Featured categories" 22/27.5 600 rgb(10,20,20) · 17 round tiles 125×133 (10 shown, 6 at 360) + "See more" | `h2` | `cards (categories)` · container · BC **cards** · 17 × 2 (picture · `p` link) | — |
| 16 | "Beauty deals you'll love" — a 48 px text component painted white on white above an empty Criteo sponsored-products module | — | `ad` · key-value (slot, network, title) — the title renders visually hidden while the slot is empty | — |
| 17 | footer: sign-up band 114 sand (pill 262×44) · logo band 84 beige (173×36) · 4 link columns on beige (bold 14/21 heading links + 16/24 lists, 371) · legal 3 links + © (138) · bottom 559: "View all products by:" 20 chips with rules, "Top photo products:" 8, disclaimer + PRICING PROMISE; 360: sign-up, logo (60, no band), 3 bold links + 4 legal + © (314), columns and bottom hidden | footer doc, 9 sections: em link · logo picture link · 4 × (bold heading link + `ul`, repeated) · legal `ul` + `p` · 2 × (`p strong` + `ul`) · 2 disclaimer `p` | `footer` · BC **footer** (fragment `/drafts/footer`); footer.js lays the bands out by section order and strips the button classes decorateButtons puts on the bold heading links | — |

Hidden DOM not modelled: mobile duplicates of the store selector and nav, the store-selector drawer (search + store list, needs the
store API), the search typeahead portal, OneTrust SDK, the Kampyle "Feedback" tab (fixed, right edge, in every capture chunk), Criteo /
Bing / Branch pixels, ReactModalPortals, the hidden nav `.dropdown__side` third-level panels (Prescriptions › …), the `b2b-coupon`
modal, `#store-selector-list`. Configuration: `template: home`, `nav`, `footer`, `title`, `description` in the metadata block; section
styles authored: `taupe`, `plum`, `compact-head`; every other section is default (12 px rhythm ≥ 900 / 8 px below, foundation CSS).

## David's Model lint at step 2
See LINT.md (0 🔴, 2 🟡 home; 0 🔴, 1 🟡 nav; clean footer; unchanged through the rounds).

## Deviations register (step 3, completed through the rounds)

| source feature | decision | pixel cost |
|---|---|---|
| **Session-variable composition** (Target alert on/off; offers carousel vs Zepbound sponsored banner; per-session coupon set) | composition A authored (alert + coupon carousel + GAM slot), origins captured/picked in A; the coupon cards carry this session's 10 offers | 0 at 1440/2560 (both origins A); at 360 the picked origin's coupon set differs from the authored one (region 12 % in `origin-pick`): bands 1800–2700 at 360 |
| Google Ad Manager creative ("FREE 1-Hour Delivery on $35") in the 985×105 safeframe | third-party ad: the `ad` block reserves the slot (129 / 81 px band), loads nothing; the creative is not content | 1440 band 1350: 12.7 %; 2560 band 1350: 7.2 %; 360 band 1800 part of 10.1 % (≈ 1.0 % of the page at 1440) |
| Adobe Target alert (`#at_close_alert`, `sessionStorage at_close_2020457`) — 2 of 3 loads | authored as the `alert` block (content the visitor sees), dismiss stored the same way | 0 (in the cached origin) |
| "Deals for 780 WAUKEGAN RD expires in 4 days!" — store-specific text (the store differs per session/visitor) | authored as seen (session-variable *text*, BACKLOG #25) | 0 this run |
| Coupon "Clip", "Apply codes", "See more", "Sign in / Create an account" — JS actions on the source | authored as links (offers page, sitewide-codes product list, login/register); "See more" is the block's own toggle | 0 |
| Kampyle "Feedback" tab: fixed 35×125 at the right edge in every capture chunk | decided out (third-party widget) | ≈ 0.1 % per width |
| Mobile footer: the source shows 3 bold quick links (Contact Us, Your Privacy Choices, Privacy Center) and a 4-item legal list instead of the columns | not authored (would duplicate links the doc already has); the mobile footer shows sign-up, logo, the 3-item legal list and ©, columns and product lists hidden as on the source | 360: footer 389 vs 488 (−99 px, Δh 96 of the page), bands 6300 (9.1 %) |
| Per-card pastel backgrounds in the photo row (3 colours) and the health row (243 vs 244) | variant `photo` colours by `nth-child` in the block CSS (the look of the variant, not authored per card); health uses the 244 value | 0 |
| Header at 2560: promo links spread with a gap that grows with the viewport (110 at 1440, 146 at 2560) | `gap: calc(3.214vw + 63.7px)` (linear through both measurements) | 0 |
| Bands full-bleed at 2560 with the content capped at 1440 (`main` fluid; `.section > div` max-width 1440) | `main > .section > div { max-width: 1440px }`; cap-probe PASS (module 1440, shell fluid = live) | 0 |
| Nav dropdown hover: the source's `::after` bar stays off-screen on hover (`left/right −9999`), the label underlines; colour of the title flips red → taupe on nothing visible | hover underlines the label; the red 3 px bar marks the open (pinned) menu — an interpretation, the open state was not deep-probed for the bar | 0 (hidden at rest) |
| Secondary pill hover: bg rgb(163,42,51), text white, border rgb(10,20,20) (deep diff on banner, coupon and sign-up buttons) | `a.button.secondary:hover` | 0 at rest |
| Footer links: no hover change on the source | no hover rule (the boilerplate underline removed) | 0 |
| Store selector drawer (search field, "Use my location", store list) and search typeahead | store = link to the store locator; search = a plain form to `/search/results.jsp` | 0 at rest |
| Coupon title line box: spans read 22.5 px line-height but the block lays 5 lines in 117 px (parent `line-height: 1.3`) | `h3 { line-height: 1.3 }` | 0 (rows within 1 px) |
| Banner sub line: a 14 px span in a 24 px line box (the `p`'s line-height, not the span's 21) | `line-height: 24px` (22 at 360) on the sub paragraph | 0 |
| Photo section head sits flush on the section padding (57 px band vs 61 elsewhere) | authored section style `compact-head` | 0 (4 px without it) |
| The "Beauty deals you'll love" white-on-white heading (48 px) above an empty Criteo module | `ad` block with `title`: an `h2` rendered `visibility: hidden` at 24 px in a 48 px band | 0 |
| Featured categories: the source's images are 480×480 stretched into 125×133 ellipses (`object-fit: fill`, radius 50 %) | reproduced (125×133, fill) | 0 |
| Enterprise-a card 1 has no href (the button applies codes by JS) | the button links to the sitewide-codes product list `N=20007799` (the promo bar's link for the same codes) | 0 |
| Icons: Walgreens sprite symbols (`symbol-defs.svg` v5: menu, avatar, cart, arrows, dismiss, pin, search, check, locate) | lifted as `/icons/*.svg` with `currentColor`; the slick arrows, the coupon plus and the See-more chevron redrawn from the inline paths; the CCPA toggle icon redrawn as vector (`privacy-choices.svg`) | 0–1 px on the toggle |
| `:icon:` tokens (BACKLOG #5: the harness fold does not convert them) | `decorateIconTokens()` in scripts.js before `decorateIcons` | 0 |
| The pipeline unwraps a single paragraph in a cell (`<div>text</div>` without `<p>`) and splits a picture out of a link into its own paragraph | cards/carousel/banner/alert decorate wrap loose text nodes; the footer icon is a token moved into the link by footer.js | 0 (28 px on the served page before the token) |
| Media: 66 files (jpg/png/svg, the bytes the browser fetched) | uploaded unchanged to DA `/drafts/media/*` (lowercase), previewed on the branch, referenced by the branch preview URL (the pipeline redirects `/drafts/media/<name>` → `/drafts/media/media_<hash>`); the pipeline serves optimised renditions | photo bands 0.5–5 % (product PNGs 1000×1000 vs 750 renditions: deals band 3150 at 5 %) |
| Text anti-aliasing (same glyphs, same boxes) | residual on every text band | 0.5–1.5 % per band at 1440; 6–11 % at 360 where text fills the width |
| The pipeline's empty metadata section | `main > .section:not(:has(> *)) { display: none }` from round 0 | 0 (leak tables identical) |
| `main img`, footer link hover, boilerplate button styles, `overflow-wrap: break-word` on links (broke "myWalgreens®" into 3 lines at 360) | foundation rewritten from the measurements; overflow-wrap removed | 0 |

## Motion register (motion-observe live vs prototype via `gate --probes`; deep hover diff `hover-diff` live and build; click-state probes)

| interaction | live | build | status |
|---|---|---|---|
| header on scroll | static at 1440 (`headerTimeline`: position relative, 113 px at every y); `position: sticky` below 900 | static; sticky below 900 | verified: motion-compare "header scroll-morph: dead on live — not required" |
| menu title hover | label underline (deep diff: `text-decoration-line: underline` on the `a`; the `::after` bar stays off-screen; colour red → taupe on the `a`, invisible) | `.header-menu-title:hover > span { text-decoration: underline }` | verified (deep diff on both sides); motion-compare "dead on live" (the sampler's first match is a hidden duplicate) |
| menu click | panel 228 wide under the bar at the title's x (Pharmacy: [10,153,228,178], 5 rows of 28, 14/16 600, padding 18 0), border rgba(0,0,0,.2), shadow rgba(64,64,64,.07) 0 4px 6px 1px | hover opens, click pins; click-state on the build: [10,153,228,178], rows 28 at the same x/y | verified (click-state both sides); motion-compare classes `show-next-lvl`/`hide-prev-lvl` MISSING = the source's class names |
| account click | overlay rgba(0,0,0,.7) + right drawer 350×viewport: "Account" head 51 px beige, rows 40 (16/24 600, pad 8 16), rule after "Your Account" | same drawer; click-state rows at 245/285/325/365 on both | verified; motion-compare "class account/show MISSING, header-account-open/header-locked extra — advisory" = class names |
| mobile hamburger (360) | left drawer 350: logo band 65 beige, Sign in / Create an account / Account (+rule) 38 px rows, 6 menu titles, 3 links, Español | drawer with the same rows (38 px; menu links 36 before the round-3 fix) | verified (click-state both sides) |
| promo bar link hover | underline | underline | verified (deep diff) |
| card hover (promo, media-top, quicklinks, deals) | underline on the card's heading text only (`:hover *` reset, heading `p` underlined) | `.cards-card-link:hover h3` underline | verified (deep diff: live `self underline`, build `h3 underline`) |
| category tile hover | label underline | `.cards-card-body` underline on hover | verified (round 3) |
| "View all" hover | 1 px underline via the span's border-bottom | text-decoration underline | verified (1 px position class) |
| secondary pill hover (banner, coupon Clip, sign-up) | bg rgb(163,42,51), text white, border rgb(10,20,20) (+ underline on sign-up) | same (round 3) | verified (deep diff identical on both sides) |
| footer link hover | no change | no change (round 3) | verified |
| account trigger hover | underline | underline on the label | verified |
| carousel arrows | glider: prev disabled at 0.25 opacity, next scrolls one page; transitions `transform` 300 ms on the track | scroll-snap viewport, `scrollBy` one page, disabled state by scroll position | decided in: same control, no measured pixel at rest; motion-compare "transition transform MISSING" = the glider's track transform vs native scrolling |
| menu/drawer transitions (`opacity`, `visibility`, `z-index` 300 ms; classes `position-fixed`, `move-home-link`) | fire on open | no transition (instant) | decided out (300 ms fades on panels hidden at rest — no pixel in any capture) |
| alert dismiss | hides, sessionStorage flag | same | verified by code (not probed) |
| "See more" (featured categories) | reveals 7 hidden tiles | toggles `.expanded` | verified by code |
