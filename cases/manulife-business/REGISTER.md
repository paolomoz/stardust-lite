# REGISTER — manulife-business (template `business`, https://www.manulife.com/ca/en/business)

Final URL after load: `https://www.manulife.com/ca/en/business` (no redirect; the site root geo-forwards to `/ca/en/personal`, this page does not).
Origin: AEM Sites, 114 shadow hosts (`gds-*` web components), OneTrust consent (`#onetrust-accept-btn-handler`, no reload), Kampyle feedback tab (fixed, right edge), Medallia survey (opens from that tab).

## 1. Triage (step 2) — one authored section per source section

| # | source section (1440 y, h; 360 h) | default content | block · shape · collection · rows × cols | section style |
|---|---|---|---|---|
| 0 | header 0–172 (360: 80) · `content-header` → `gds-Navigation` (utility bar 44 `#424559`, primary bar 80, tabs 48) | nav doc: 4 sections (selectors + section links + utility links · brand · tabs · tools) | `header` (new) | — |
| 1 | hero 172–616 h444 (360: 636) · `cmp-herolandingpages` → `content-hero-landing-pages` with 3 action tiles | — | `hero` · simple · BC hero · 1 × 1 **+** `cards (tiles)` · container · BC cards · 3 × 2 (title link, description) — one authored section, two blocks (METHOD step 2) | — |
| 2 | product carousel 616–1385 h769 (360: 841) · `cmp-sectioncontainer` pad 56/40 → `content-product-carousel` (h2, p, 3 cards; controls only at 360) | h2, p (moved into the block's header row by the decorate) | `carousel (cards)` · container · BC carousel · 3 × 2 (picture, text: h3 p link) | `padded` |
| 3 | Help your plan do more 1385–2185 h800 (360: 1516) · 2 nested sectioncontainers, 4 `gds-card type=icon` | h2, p | `cards (icons)` · container · BC cards · 4 × 2 (icon, text: h3 p link) | `padded` |
| 4 | Support 2185–2559 h374 (360: 548) · 2 `gds-card layout=left href` (whole card links, 1 px border) | h2 | `cards (icons linked)` · container · BC cards · 2 × 2 (icon, text: h3-link p) | `padded` |
| 5 | Latest insights 2559–3284 h725 (360: 717) · `content-article-carousel` on `bg-surface-default-active #fafafa` pad 64/56, 6 cards, 3 per page ("1 / 2"; 360: 1 per page "1 / 6") | h2 (moved into the block's header row) | `carousel (articles)` · container · BC carousel · 6 × 3 (picture, tag, text: date, authors `<em>`, h4, link) | `surface` |
| 6 | feature banner 3284–3688 h404 (360: 612) · `cmp-extended-feature-banner` `#282b3e` pad 40, picture 588 (49/27) beside text 588 | — | `columns (banner)` · simple · BC columns · 1 × 2 (picture, text: h2 p `<em>` link = outlined button) | `spaced-bottom` |
| 7 | 0-height sectioncontainer 3688–3784 h96 (360: 56) — a spacing measurement (pad 56 + 40 / 16 + 40) | folded into section 6's style `spaced-bottom` | — | — |
| 8 | footer 3784–4350 h566 (360: 690) · `gds-footer` (2 link groups, 5 site links, 2 social, logo, copyright, legal) | footer doc: 3 sections (groups · site + social lists · legal) | `footer` (new) | — |

Novelty 100 % (empty inventory). Section split passed to `measure-page --sections '.cmp-herolandingpages, #main-content > .aem-Grid > .cmp-container > .cmp-container > .aem-Grid > .aem-GridColumn'` (the in-run guess matched nested grid columns, 12 of them; `triage` read 2).

Cap model (cap-probe, brief): module caps under a fluid shell — `main > .section > div { max-width: 1200px }`, sections fluid (hero, insights band and banner bleed); 360 gutter 16, 768–1279 gutter 40 (the source's `px-10`).

## 2. Deviations (source feature → decision → pixel cost)

| # | source feature | decision | cost |
|---|---|---|---|
| D1 | Mega-menus behind the tabs "Group plans", "Wellness solutions", "Insights" (`primary-tab-items` JSON, 40+ links) and the Region / Language popovers | not authored: the nav document holds the tab labels (buttons with chevrons, `aria-expanded=false`) and the two selector labels; hidden content revealed by click, out of the template's scope | 0 px at rest; the `click` probe on the tab is the one MISSING motion (skipped by the gate as chrome, listed below) |
| D2 | Mobile drawer (hamburger at 360 opens the tabs + utility lists) | hamburger control built (toggles `nav-open`), drawer panel not styled | 0 px at rest |
| D3 | Search opens an in-page search layer (`search-config`, Coveo) | authored as a link to `/ca/en/business/search-results` | 0 px at rest |
| D4 | Kampyle "Feedback" tab, fixed at the right edge (35 × 125 at y 360), and the Medallia survey it opens; OneTrust banner | third-party layers, not built; the tab sits in every chunk of the live capture | the residual in every band: ≈ 0.3 % per 360 band, ≈ 0.1 % per 1440 band (noise floor 0 % holds it on both live captures) |
| D5 | Product carousel: all 3 cards fit at ≥ 768 so the source hides its controls; at 360 a slider "1 / 3" | one `carousel` block, `carousel-static` when every slide fits | 0 |
| D6 | Article cards' authors: a nameplate with 3 avatar glyphs (green discs) and "Multiple Authors" when > 1 | authored as the names in `<em>` (the content); the block renders the glyph stack + "Multiple Authors" for > 1 name, the name for 1 | 0 |
| D7 | Icons: 22 inline SVGs (`fill="currentColor"`) inside shadow roots | captured as bytes from `media-list`'s `outer` (1440 + 360 runs) into `/icons`, authored as `:name:` tokens or created by the decorate; `decorateIcons(block)` then the foundation `inlineIcons` so `currentColor` follows hover | 0 |
| D8 | Fonts: 5 woff2, 403 to curl, node fetch and an in-page `fetch()` (WAF keys on the request's destination) | bytes saved from the page's own font responses (`scripts/fetch-bytes.mjs`, Chrome channel + the instruments' UA) | 0 |
| D9 | Hero image: the source serves a 1440-wide rendition at every width (nat 1440 × 427) | the same bytes authored; DA serves its renditions | the 1440 band 900–1350 1.5 % / 2560 0.8 % is image renditions (shift-probe: no shift, luminance ratio ≈ 1) |
| D10 | 0-height trailing sectioncontainer (96 / 56) | section style `spaced-bottom` on the banner section | 0 |
| D11 | Footer link groups collapse to 85-px accordion rows at 360 | built as toggles (`aria-expanded`), lists hidden at 360 | 0 at rest |
| D12 | Utility bar: the Region selector has a globe icon, the Language selector none; widths 119 / 89 | built per measurement; the 2560 pairing still reads −5 px on the section links (icon/text gap) | ≤ 5 px in a 44-px bar, inside the 0.5 % band |
| D13 | `-webkit-font-smoothing: antialiased` added from habit in r1 | removed in r4 (not a spec row; the h2s rendered lighter than live) | — |
| D14 | `<em>` around the banner link: the pipeline's `decorateButtons` turns it into `a.button.secondary` and drops the `<em>` before the block decorate runs | the decorate reads either (`closest('em') || classList.contains('secondary')`) | was +32 at 360 in r3 |

## 3. Motion (hover / click; base width 1440)

| family | live (hover-diff, `>>` into shadow roots) | build | parity read by |
|---|---|---|---|
| utility links (`a.gds-TextLink`) | `text-decoration-color` #fff → `#06874e` (underline) | underline `#06874e` on hover | gate probe (`chrome:` forced) — parity |
| primary tabs (`button.gds-NavigationPrimaryTabsItem`) | bg → `#f5f5f5` | same | gate probe — parity |
| Sign in (`a.gds-NavigationSignIn`) | bg `#c25244` → `#ab302f` | same | gate probe — parity |
| article card (`article.hover:bg-surface-default-hover`) | bg #fff → `#f5f5f5` | same | gate probe — parity (was the 1 MISSING in r5) |
| tertiary button icon (`gds-button >> a.gds-Button`, product + icon cards + Read more) | icon `#c25244` → `#ab302f` | same | hover-diff both sides |
| action tile (`a.gds-Tile`) | box-shadow `0 2px 6px .12` → `0 8px 24px .16` | same (added after the served gate; hover-diff on the served page) | hover-diff |
| footer links | `text-decoration-color` → `#fafafa` | same | hover-diff |
| carousel next (`content-article-carousel >> button`) | click moves the track one page (shadow root: no probe reaches it; `hover-diff` reads no hover change) | `click-state` on the build: track translates, counter 1 / 2 → 2 / 2, `transition: transform 300ms ease` (duration not measurable on live) | advisory |
| tab click | opens a mega-menu panel | nothing (D1) | MISSING by decision |
| scroll | no fixed layers besides the third-party tab; header scrolls with the page at every width | same | probe-load fixed list |

## 4. Gate table (origin cached from measure-page, noise floor 1440 0 % Δh 0)

| round | widths | 360 | 1440 | 2560 | Δh (360/1440/2560) | what changed |
|---|---|---|---|---|---|---|
| r1 17:05 | 3 | 15.23 | 18.30 | 13.31 | 115 / −163 / −163 | first prototype |
| r2 17:10 | 1440 | — | 1.33 | — | — / 5 / — | decorateIcons before inlineIcons; :where() resets (first attempt); carousel heading moved into the block, body/action paddings; icon rows 64; banner gap 24 + ratio box |
| r3 17:13 | 3 | 9.06 | 1.33 | 0.74 | 67 / 5 / 5 | — (first three-width read under 10 %) |
| r4 17:17 | 3 | 2.03 | 0.97 | 0.55 | 0 / 6 / 6 | banner `<em>`/secondary, product section 360 pad, footer li rows, articles h2 26/36, smoothing removed |
| r5 17:20 | 1440 + probes | — | 0.97 | — | — / 6 / — | motion 0 parity 1 missing (6 header probes skipped as chrome) |
| r6 17:24 | 1440 + probes | — | 0.67 | — | — / 0 / — | whole-selector :where() (footer list pad 14, −5 → 0), hover CSS; motion 3 parity 0 missing |
| r7 17:28 | 3 + probes | **2.01** | **0.67** | **0.37** | 0 / 0 / 0 | final prototype |
| served 17:33 | 3 + probes | **2.02** | **0.67** | **0.38** | 0 / 0 / 0 | https://blocks-first--sdt-manulife--aemcoder-adobe.aem.page/drafts/business — leak table identical (34 wrappers, 0 differing lines) |

cap-probe: PASS at 2560 every round (0 of 4 rows). Residual bands named: D4 (feedback tab), D9 (renditions), anti-aliasing of 22/28 and 14/20 text.
