# REGISTER — natixis about-article (`/en-intl/about/diversity-equity-and-inclusion`)

Source: https://www.im.natixis.com/en-intl/about/diversity-equity-and-inclusion (no locale redirect; 200 at the same URL; headless Chromium accepted).
Overlays: `--consent #onetrust-accept-btn-handler` (OneTrust, no reload); no dismiss, no locale pin, no `--require`.
Content root `div.root.container` (dump key); header `header.ntx-header`, footer `footer.ntx-footer`. 53 shadow hosts, all in the header (iconify icons, `ntx-search-wrapper`, `ntx-navigation`) — the page body has none.
Section selector (`measure-page --sections`): `main > div > div > .breadcrumb, main > div > div > .container > div > div > div` → 13 sections + header + footer (= the spec's and the gate's split).
Cap: **shell** — `.cmp-container-content-wrapper` 1256 (padding 16) → content 1224 at 1440 and 2560 (x668..1892), 328 at 360. `main { max-width: 1256px; padding: 0 16px }`; bands bleed with `margin: 0 calc(50% - 50vw); padding-inline: calc(50vw - 50%)`.
Fonts: Montserrat 300 / 400 / 500 / 500 italic / 600 / 700 (static TTFs from clientlib-main, bytes unchanged in `/fonts`). The variable face `0ba081b76521874cf46c.ttf` 404s on clientlib-main (the stitch "FONT LOAD FAILED" warning); its clientlib-react-shared duplicate loads. Body 16px/24px 500 #343a40; headings 600 #212529.

## 1 · Triage (step 2 — the content model, before any block)

| # | source section (1440) | default content | block · shape · collection · rows × cols | section style |
|---|---|---|---|---|
| 0 | header 1440×113 (top bar 32 #662584 + bar 80 + 1 px rule) | nav document: top bar texts, brand, 4 sections, search | `header` | — |
| 1 | breadcrumb 1224×45, full-bleed #f3f4f5 | — | `breadcrumbs` · simple · BC breadcrumbs · 1 × 1 (ol of links) | — |
| 2 | herobanner 1224×484 (panel 734×484 #391958 r8, photo 700×420 right) | — | `hero (image-right)` · simple · BC hero · 1 × 1 (h1, p, picture) | — |
| 3 | in-page-navigation 1224×64 (7 anchors; fixed when scrolled past; select at 360) | — | `in-page-nav` · simple · no collection shape · 1 × 1 (ul of anchors) | — |
| 4 | overview 1016×210 | h3 (bold), p ×2 | — | `narrow, spacing-top, spacing-bottom` |
| 5 | culture band 1440×647 #f3f4f5 | h2, p ×3 | `cards (facts)` · container · BC cards · 3 × 2 (number \| text) | `grey-light, spacing-top, spacing-bottom` |
| 6 | programs 1016×35 | h2 | — | `narrow` |
| 7 | scholarship box 1016×887 #391958 | h3, p, picture | `accordion` · container · BC accordion · 3 × 2 (summary \| panel from the hidden dump) | `narrow, invert` |
| 8 | accordion 808×321 | — | `accordion` · container · BC accordion · 3 × 2 | `slim, spacing-bottom` |
| 9 | ERG band 1440×1663 #e9ecef | h2, p | `cards` · container · BC cards · 5 × 2 (picture \| p ×2) | `grey, tight-bottom` |
| 10 | partnerships 1224×508 | h2, p | `columns (logos)` · simple · BC columns · 1 × 4 (3 linked logos per column, the source's column containers) | `spacing-top, spacing-bottom` |
| 11 | policies band 1440×658 #e9ecef, box 808 #391958 | h2 | `accordion (invert)` · container · BC accordion · 4 × 2 | `grey, slim, spacing-top` |
| 12 | awards 1224×906 | h2 | `cards (awards)` · container · BC cards · 6 × 2 (picture \| h5 + p) | `spacing-top, spacing-bottom` |
| 13 | disclaimer band 1440×224 #f3f4f5 | p ×2 (sup, em, strong) | — | `grey-light, disclaimer, spacing-top` |
| 14 | footer 1440×783 #212529 | footer document: brand + Follow us + LinkedIn; 3 × (h2 + ul); 2 legal p | `footer` | — |

Novelty 77 % (10 new of 13 main sections; empty inventory). Lint: 0 🔴, 3 🟡 D1 (LINT.md).

Section styles are the source's own authoring vocabulary: `spacing-top` / `spacing-bottom` = `ntx-spacing--md` (64 / 24), `narrow` = `container--narrow` (1016), `slim` = `container--slim` (808), `grey-light` / `grey` = `container--has-background` (#f3f4f5 / #e9ecef, padding 16 + the inner 64 / 24), `invert` = the purple box, `tight-bottom` (ERG's 16 + 16), `disclaimer` (44 / 44).

Metadata: title, description, `nav: /drafts/nav`, `footer: /drafts/footer`. In-page anchors are the pipeline's heading ids (`#culture`, `#employee-resource-groups-erg`, …), not the source's `#erg`.

## 2 · Deviations (source feature → decision → pixel cost)

| # | source feature | decision | cost |
|---|---|---|---|
| D1 | logo links in Partnerships carry an sr-only "opens in a new tab" (`span.cmp-link__screen-reader-only`, 1×24 box) | authored as picture + link whose text is the logo's alt (the dump's text; the block makes it the visually-hidden label). `harness --content` flags the 9 alt labels "not in the capture"; `pair` lists "opens in a new tab" MISSING at 360 and 1440 | 0 px |
| D2 | search placeholder "Search" lives in `ntx-search-wrapper`'s shadow root — no dump holds it | authored in the nav document as the 4th section (the only text not from a dump; read from the capture) | 0 px |
| D3 | top bar "What type of client are you?" button at 360 overflows left to x −10 (flex-end, no shrink) | build at x −1 (`pair` ⌗ Δx 9) — the overflow is the source's own layout bug; not reproduced | < 0.1 % of band 0 at 360 |
| D4 | header nav items link to `#` (menu openers) and the mega-menu lives in shadow roots (`ntx-navigation-panel`) | items authored as a plain list; no panel (not on this page's rest state) | 0 px |
| D5 | content-dump truncates `markup` at ~500 chars: two ERG quotes lost their `<b>` lead | rebuilt from `text` + the open `<b>` the cut left, or the spec's inline `b` runs (`scripts/fix-doc.mjs`) | 0 px after round 5 (was the 360 ERG band's bold) |
| D6 | hero section: the source's 40 / 0–32 spacing is a margin on `.ntx-hero-banner` | `.hero-wrapper` margin (collapses through the section as on the source); the section-padding form read Δh +80 in the section table | 0 px |
| D7 | accordion closed panels: Chromium keeps layout boxes for closed `<details>` content | `details:not([open]) .accordion-item-body { display: none }` (the pair paired body texts into them) | 0 px |
| D8 | footer `.ntx-footer__group-logo-image` is a 0-height flex child adding one 40 gap | content padding-bottom 64 + 40 = 104 (80 at 360) | 0 px |
| D9 | awards: the second row container is 406 for 390 of cards (16 under the last row, 1440 only) | `.cards.awards { padding-bottom: 16px }` ≥ 900 | 0 px |
| D10 | 360 ERG / partnerships / awards logo bands 2–4.4 % | the live 360 serves `wid=480` scene7 renditions; the build serves the pipeline's renditions of the 1600 originals: `shift-probe` dx 0 dy 0, luminance ratio 1.006 "same paint: a rendition or anti-aliasing" | 1.06–1.39 % at 360 total |
| D11 | breadcrumb at 360 shows one back-link "‹ About" | CSS: only `li:nth-last-child(2)` with a rotated chevron | 0 px |
| D12 | served-only: footer-legal y 13483 → 13484 at 360 (leak diff, 1 px) | sub-pixel rounding of the column stack | 0 px |
| D13 | `sup` in h5 / p: the live line box does not grow | `sup { line-height: 0; position: relative; top: -0.5em }` | was +2 / +5 per row |

## 3 · Motion (step 6 — measured before code; hover-diff is the parity source, motion-observe reads every hover as dead)

| control | live (hover-diff / scroll-probe / click-state) | build | parity |
|---|---|---|---|
| in-page nav link hover | `border-bottom-color` transparent → #662584 | same | ✓ (hover-diff both sides) |
| breadcrumb link hover | `text-decoration` underline → none | same | ✓ |
| footer list link hover | no change | no change (a hover underline was removed in round 4) | ✓ |
| header nav link hover | no change | no change | ✓ |
| logo link / social link hover | underline → none on the sr-only text only | no visible change | ✓ (invisible on both) |
| in-page nav on scroll | `ntx-in-page-nav--fixed` added once the bar passes the top (≈ y 722; wrapper keeps 64); `--active` toggled 214× along the scroll | `.fixed` added at the same condition (block keeps 64 / 72); `.active` on the last heading above the bar | ✓ equivalent (motion-compare lists the source's class names MISSING and `fixed` as advisory extra — BACKLOG #196) |
| header on scroll | static (scroll-morph dead on both) | static | ✓ |
| accordion click | `cmp-accordion__button--expanded` + panel `--expanded`, `aria-expanded=true`, panel 760×248 (3 p incl. one empty) | `<details open>`, panel 760×232 (2 p — the empty `<p>` the pipeline drops), link 600 #662584 after round 4 | ✓ (`click-state` both sides; `aria-expanded` is `null` on a summary — details semantics) |
| mobile in-page nav | `<select>` 312×39 navigates to the anchor | same select, `change` → `location.hash` | ✓ by construction (no live probe at 360) |
| mobile menu / search buttons | open shadow-root panels | buttons rendered, no panel | not on this page's rest state; register |
