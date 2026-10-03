# REGISTER — canonusa support-article (`https://www.usa.canon.com/support/about-consumer-support`, final URL identical, no redirect, 200 in Chrome / 403 in headless Chromium)

## Triage (step 2 — `triage.md`, edited rows → `triage.json`; lint PASS before any block)

| # | live section (1440) | default content | block · shape · collection · rows × cols | section style |
|---|---|---|---|---|
| 0 | `header.cmp-header` 1440×160 fixed + promo bar 1440×40 in the flow (`div.header` 200) | nav document: tabs list, tools list, logo, search placeholder, 8 nav links, 4 right links, promo text (7 sections) | `header` (fragment decorate; no block rows) | — |
| 1 | hero 1440×249 `h1 p` | `h1` (ABOUT **CANON SUPPORT**), `p` | — | `hero-dark` |
| 2 | "Committed to Service & Support Excellence" 1440×1645 | picture (logo), `h2`, `h2`, `h3` MORE SUPPORT | `columns (icons)` · container · BC columns · 1 × 3 (picture + h3 per cell); `cards (list)` · container · BC cards · 5 × 2 (icon \| bold title + line) — two blocks in one authored section (one source section) | `about-support` |
| 3 | "Manage your Canon products…" 1440×382 `[picture h3 a]×3` | — | `cards (overlay)` · container · BC cards · 3 × 2 (picture \| h3 + italic link = outlined button) | `more-support` |
| 4 | bumper gradient 1440×237 (experience fragment) | footer document §1 | `columns (bumper)` · 1 × 3 (eyebrow, text, italic link) | `bumper` |
| 5 | footer 1440×661 (experience fragment; not in the spec — see NOTES) | footer document §2: `h3` + `ul` × 5 (link groups), `p` of social links, copyright `p` | `footer` decorate groups h3+ul (accordion rows at 360) — a 5-column block was 🟡 D10 and remodelled | `dark` |

Novelty 100 % (empty inventory): blocks written `header`, `footer`, `cards` (variants `list`, `overlay`), `columns` (variants `icons`, `bumper`).

## Deviations (source feature → decision → cost)

| # | source feature | decision | pixel cost |
|---|---|---|---|
| D1 | OneTrust consent banner (fixed, 71/309 px) | `--consent #onetrust-accept-btn-handler` on every instrument; not authored | 0 |
| D2 | UserWay accessibility launcher `#usntA40Toggle` (fixed 48×48 / 36×36, third-party) | `--hide '#usntA40Toggle'` on every instrument (it is in the live captures that `--hide` did not reach: `probe-load` first look only) | 0 in gated captures |
| D3 | Live header captured at y −15 at 1440 (the hide-on-scroll bar mid-return after the settle ladder; both noise-floor captures agree, floor 0 %) | the build's bar rests at 0 (probe-load and scroll-probe at rest say top 0); registered as a live mid-flight state | top band 1440/2560 ≈ 2.3 / 1.4 % (band 0–450) |
| D4 | Header hide-on-scroll: 1440 `up` at scrollY ≥ 60 → top −36, h 100 (tabs out, nav row hidden, 64 px visible), back at ≤ 34; 360 `nav-up` by scroll direction → top −104 | `header.js` reproduces both (threshold on desktop, direction on mobile); verified with scroll-probe on the build (y 60 → compact, y 34 → back) | 0 |
| D5 | Nav link hover (`a.expand-header`, 4 px transparent bottom border at rest) | hover-diff live: NO VISIBLE MATCH; motion-compare: dead on live — no hover written (an earlier red border was removed as invented) | 0 |
| D6 | Header icons (cart, account, search, hamburger) are an icon font (`canon-aem-icons`) | drawn as simple SVG icons in `/icons` (shopping-cart, account-circle, search, menu), inlined via `decorateBlockIcons`; glyph shapes differ | ≈ 0.1 % of the top band |
| D7 | Overlay cards: `::after` rgb(226,33,40) over the photo, the photo shows through | `.card-image::after` red with `mix-blend-mode: multiply` — pixel samples match within rendition noise (e.g. live 117,18,25 vs build 126,20,26) | card band 1440 ≈ 2.8 % (rendition) |
| D8 | Overlay h3 `letter-spacing` 6.79 px at 360, 2 px at 1440/2560 (function unknown) | the two measured constants in the two media ranges | 0 |
| D9 | Bumper text box fixed 84 px at 360, 42 at 1440, 21 (auto) at 2560 | `height: 84 / 42 / auto ≥ 1920` (breakpoint between 1440 and 2560 not measured) | 0 at the three widths |
| D10 | Bumper SUBSCRIBE button: a different class (116×39 at 360, no 200 min-width) | authored like its siblings (200×41 at 360) | one control 84 px wider, 2 px taller at 360 |
| D11 | Footer social icons `icon-lazy` never load on the live settled page (9 broken-image glyphs 32/21 px) | labelled links sized 32×32 / 21×21 painting nothing | ≈ 9 glyphs at 360 and 1440 |
| D12 | Footer accordion (360): `button.col-12` rows 71 px, rules top/bottom only, chevron right | `footer.js` toggler per group (`aria-expanded`), lists hidden until open; `click-state` on both sides: opens, 37 px pitch | 0 |
| D13 | Live 360 footer bottom band 5400–5439 (live luminance 33.9 vs build 0: the copyright's second line sits lower on live; Δ doc 11) | not chased (stop rule) | 13 % of a 39 px band |
| D14 | Icon tile h3 "Factory certified technicians" wraps to 2 lines on live at 259 px, 1 line on the build | row height set by the two 2-line siblings; not chased | 0 layout, a few px of glyphs |
| D15 | The hero `p` colour is a span class on the source (`body-text-medium-white`) | inherited from the `hero-dark` section style | 0 |
| D16 | Harness content check: 3 texts "not in the capture" | the three `<br>`-split lines joined without a space by the check; the dump holds them | 0 |
| D17 | `measure-page --footer 'a,b'` kept only the first match in the spec: the 661 px footer has no spec rows | footer geometry read from the content dump (boxes) at 360 / 1440 / 2560 and from crops | 0 |

## Motion (`gate --probes probes.txt`, motion-compare at 360 / 1440 / 2560; r10 and served)

| probe | live | build | verdict |
|---|---|---|---|
| hover `a.btn.outlined-button` → `.cards.overlay a.button` | bg #fff → #f02f39, text #e22128 → #fff, border → #f02f39, 150 ms | same (hover-diff build) | parity |
| hover `a.bumper-item-button` → `.columns.bumper a.button` | bg transparent → #fff, text/border #fff → #e22128 | same | parity |
| hover `a.quick-link` → `.footer .footer-group a` | underline (hover-diff live) | underline (hover-diff build) | parity by hover-diff (sampler: dead on live, not required) |
| hover `a.expand-header` → nav link | dead on live | none written | not required |
| click `button.col-12` → `.footer-group-toggle` (360) | opens, `aria-expanded=true`, 37 px lines at x9 | opens, same | verified by `click-state` at 360 (sampler at 1440: dead, hidden) |
| click `#toggleConsumerNav` → `.nav-hamburger` (360) | opens the drawer | opens `.nav-sections` | not sampled (hidden at 1440) |
| header scroll-morph | top/height 200 ms, 60 px at depth | `.nav-wrapper` top −36 / h 100 at y ≥ 60 (scroll-probe on the build) | the sampler reads the build's static `header`; parity by scroll-probe |
| transitions color / background / border (150 ms), top / height (200 ms) | 2–6 events | 3–4 events | parity |
| `fadelazy` entrance (lozad image fade-in), vendor class toggles (`collapse`, `loaded`, `show`, `sticky-nav`, `js--canon-requested-scene7`…) | present | absent | MISSING — vendor/loader motions, not reproduced (BACKLOG r2: class toggles advisory) |

Summary (served): 10 parity, 11 missing (all vendor class toggles + the lazy fade + the sampler's header reading), 0 extra, 3 advisory (build classes `compact`, `menu-open`, `open` — the three states above).
