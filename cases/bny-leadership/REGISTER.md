# REGISTER — bny leadership (triage, deviations, motion)

## Triage (step 2) — source section → model

| # | live section (1440) | default content | block · shape · collection · rows × cols | section style / metadata |
|---|---|---|---|---|
| 0 | `div.web-refresh-header-light` 1440×88 (unassigned band, no `<header>`) | — | **header** (nav fragment: brand `:bny-logo:`, 4 items, tools search / Investor Relations / Client Access / **Contact Us**) | fixed, hides at scrollY > 0 |
| 1 | `div.tertiaryHeroBanner` 1440×384, h1 "OUR LEADERSHIP" | `h1` | — | `style: tertiary-hero` (navy band, Druk 100/88 teal) |
| 2 | `div.generalContainer` 1440×2645 — tabs "Executive Committee" / "Board of Directors", each panel a biolist grid + a Quick Links container | per panel: `h3 Quick Links` + link paragraphs | **tabs** — auto-built from the sections' `tab` metadata (configuration, no authored table) · **cards.leadership** · container · BC cards · 20 × 2 and 12 × 2 (picture \| h3 name, p title, p link) | one section per panel: `tab: Executive Committee`, `tab: Board of Directors` (the Board one hidden at rest) |
| 3 | `footer` 1440×390 | footer doc: one list (14 links), `p United States`, 4 icon links, legal `p` | **footer** (default content, simplest shape) | — |

Source classes kept for the inventory: `tertiaryHeroBanner ddl-hero-tertiary`, `tabs-component tabs-on-top tabs-link tablink tabs-container-detail`, `leadershipGridComponent biolist-container leader_photo leader_bio leader-name leader-designation leader_link`, `dynamicLinkComponent dynamic-link`, `footer-container footer-links footer-country-selector social-handle-container`.

Model note: the source holds two sections (hero, general container). The build has four (hero, tabs bar, EC panel, Board panel): the gate's section table pairs the live container with the EC panel only and prints "#2 Δh −78" (= the 52 + 26 tabs-bar section) at every width while the page Δh is 0 — a pairing artefact of the split, registered, not a round.

## Deviations (source feature → decision → pixel cost)

| source | decision | cost |
|---|---|---|
| `BNYM_CORPORATE_Publico_Pro` (h3 names, weight 300) has **no loaded face** on the source (brief: faces loaded = `…Publico_Pro_Roman` only); the names render in the browser's fallback serif | the build declares no face for that family either (the measurement is the fallback); the Roman woff2 serves `…Publico_Pro_Roman` (Quick Links) | 0 (declaring the Roman face wrapped "Joseph Pizzuto" and "Emily Portney" to two lines at 360: +64 px, 360 at 9.9 %) |
| Userway accessibility widget (fixed 44×44 orange button, every live chunk; `--dismiss` clicks, cannot hide it) | third-party layer, not authored | ≈ 0.6 % per 360 band, ≈ 0.1 % per 1440 band — the whole 360 residue (2.62 %) |
| Trailing empty `<p>` (24 px + 16 margin) in every leader bio, `verticalSpace` components (16/8/8/8/48) under the Quick Links | not authored (spacer anti-pattern); the block's `padding-bottom: 40px` on the body and the panel wrapper's `88px` carry them | 0 |
| Nav items' caret (`::after` border-top 4 px, no side borders → 0 px wide, nothing painted) | not drawn | 0 |
| Nav mega-menu panels (hover/click reveal), search panel, mobile menu drawer, region selector dropdown, footer `Manage Cookies` (OneTrust) | not authored this run (chrome behaviours; page scope) — hamburger / toggle buttons exist without panels | 0 at rest |
| Quick Links rule (1 px #c4c5c6, 32 px around) | `border-bottom` + padding on the heading (an `<hr>` is a section delimiter, lint 🔴) | 0 |
| "Meet X `arrow_forward`" / Quick Links arrows (Material Icons ligature in an `<i>`) | the icon is the block's: `::after` ligature from the source's own Material Icons woff2; the authored text is "Meet X" | 0 |
| Painted bands are a 1440 shell (hero navy, tabs white, footer grey: `extent` at 2560 → x560–2000) while the content caps are 1312 / 1400 / 1280 | `max-width: 1440px; margin: 0 auto` on the hero section, the footer block and the header wrapper; module caps on the wrappers | 0 (was 35 % of the 2560 top band in r5) |
| Hero h1 `<b><span style="color">` | plain `h1`; weight and teal are the section style's | 0 |
| Live header `top: -height` at any scrollY > 0 (scroll-probe-1440/360.txt), no direction logic, transition unmeasured | same function in header.js, no transition | 0 (its absence put the build header at the top of every capture chunk: 2–4 % per band in r3) |
| Footer links 4 columns `repeat(4, auto)` stretched (228/216/201/284) | same rule; 14 links split 4/4/4/2 by the decorate | 0 |

## Motion / states

| state | live | build | parity |
|---|---|---|---|
| header scroll | `#sticky-header` top 0 at y 0, −88 (1440) / −76 (360) at any y > 0, down and up | identical function (`scroll` listener) | ✓ (capture parity: Δ 0 px per chunk) |
| tab click (1440) | panel 2 shows: 12-card grid 1205 px + Quick Links 282 px; `aria-expanded` null on the live link | `click-state`: panel 2 shows (cards 1190 + wrapper 298), `aria-selected` on the tab | ✓ |
| dropdown (360) | "Category" box 320×68; open: navy list 320×128, items 64 (pad 20) white 16/24, chevron flips | identical boxes (`click-state` 360: list [20,464,320,128], items 64) | ✓ |
| hover `a.tablink` | border-bottom-color → navy | same | ✓ |
| hover footer link | border-bottom-color → black (2 px border present at rest) | same | ✓ |
| hover Quick Links | spans underline | `text-decoration: underline` | ✓ |
| hover `a.leader_link` | height 24 → 27 (a 3 px border enters the layout) | `box-shadow: 0 3px 0` (no layout change, METHOD step 4) | ≈ (visual same, layout differs by design) |
| hover Contact Us, nav items, Client Access, photo | no change | no change | ✓ |

Served page (gate-served, origin = gate-r9): 2.62 / 0.23 / 0.13; `leak` 35 rows × 1440: 0 differing lines; hover-diff and click-state rows identical to the prototype's.
