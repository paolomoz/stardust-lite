# REPORT — covermore travel-assistance (v2 blocks-first, stardust-lite 9f925b1, 2026-10-03)

**Page** https://www.covermore.com/travel-assistance (Cover-More USA, Drupal; final URL identical, no redirect, 200). Template `travel-assistance`:
an article page — breadcrumb + rich text in a white card over a body photo, a six-link bar header, a four-link footer card. Document
`/drafts/travel-assistance`, fragments `/drafts/nav`, `/drafts/footer`, media `/drafts/media/` on `aemcoder-adobe/sdt-covermore`, branch `blocks-first`,
preview only. Served: https://blocks-first--sdt-covermore--aemcoder-adobe.aem.page/drafts/travel-assistance

## Numbers

| width | noise floor | r1 | r2 (ship) | served | Δh | cap-probe | section table |
|---|---|---|---|---|---|---|---|
| 360 | — | 10.54 % | **3.65 %** | **3.65 %** | 0 | — | CLEAN (#1 0, #2 0) |
| 1440 | 0 % (Δh 0, two loads) | 6.27 % | **1.95 %** | **1.95 %** | 0 | — | CLEAN |
| 2560 (probe = max(2560, 1170 × 1.25)) | — | 3.50 % | **1.07 %** | **1.07 %** | 0 | wrapper 1170 PASS; module 1/2 PASS; module 2/2 = a Word inline span (D10) | CLEAN |

Rounds: 1 table round (triage draft → default content), 2 gate rounds (r1 → r2: `flow-root` on the article section, `main` as the 1170 container,
hamburger wrapper 35). Motion: 3 hover parity, 1 invisible hover (brand colour on an image) registered, click panel at 360 identical on build and
served. Leak table prototype vs served: identical at 1440 and 360 (19 wrappers). Content check 12/12 texts in the dump.

## Clock (TIMELINE.md)

setup 2.1 min (eds-new-site + init); t0 15:40:03Z → first prototype 22.1 min → first < 10 % at three widths 27.0 min (r2) → probes 27.3 min →
code synced 29.0 min → served gate 31.7 min. Of the 22 min to the prototype, 6 went to finding the section selector (the default matched
nothing), 7 to reading the brief / crops / deep-probes / fonts, 3 to the author draft's four defects and the boilerplate scripts, 2 to writing the code.

## What the page taught

1. **A page with no block.** Both main sections are default content; the triage drafted them as `columns (?) weak` because the fingerprint
   (`a p×2`, `h1 p×3 h2 …`) counted text units. A text-only section with no repeat is default content first.
2. **The region is a formatting context.** The live content region's box (561) includes the h1's 7 px top and the last h3's 7 px bottom margin;
   a pipeline section collapses both through. `display: flow-root` on the section style was the whole of round 1's Δh −14 at every width. The brief's
   inset line (`top 7: section → h1 m7`) held the fact; it reads as "the h1 owns it", not "the section contains it".
3. **The container is the cap, the card is paint.** cap-probe reads the 1170 `.container` as the wrapper cap; the white 1140 `.main-area` is its
   padded inside. `main` at 1170 with the card as one sized white layer passed the wrapper row without a wrapper element EDS does not have.
4. **Fonts as data URIs.** The theme CSS embeds the three faces; `media-list` records the face names and one unrelated font request. A 30-line
   Playwright dump of `CSSFontFaceRule.src` (case script `font-dump.mjs`) got the bytes; the served page renders the same glyphs.
5. **Word paste as content model.** Every paragraph's Arial, size and colour are inline styles from a paste; the authored document has plain
   paragraphs and the `article` section style carries the measured face. The 1 px baseline offset (the live strut is the outer Kohinoor `p`) is the
   residual that colours every text line in the diff — named with `shift-probe` (dy −1), not chased.
6. **Breakpoints are not in the three widths.** A probe-load ladder (640, 768, 900, 992, 1024) read three header states (136 / 113 / 72); the gated
   widths see two. The tablet state is a register row.
7. **Pipeline differences did not appear**: `readFragmentSections` in the footer decorate and `.nav-brand a` / `ul` descendant selectors in the
   header met the pipeline's `.default-content-wrapper` the same way the harness (which took the pipeline's plain.html) did — leak identical.

## Blocked / not done

Nothing blocked. Not reproduced by decision: the AudioEye launcher (third party), the tablet layout (not gated), the brand's invisible hover.
