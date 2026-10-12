# sherwinwilliams-home — notes

## (a) tool friction (what · minutes · what would have removed it)
- No `<main>` on an AEM-Sites page: `first` guessed `body > *` (2 sections, whole page one "carousel") · 2 · probe the AEM pattern `.root > .cmp-container > div.responsivegrid > .cmp-container > .aem-Grid > *` (or the largest grid child list) and suggest `--main` with it.
- `--sections` alone was not enough: the content dump keyed its root on `div.container.responsivegrid` (32 matches), so header and footer internals became 16 rows · 3 · derive `--main` from the `--sections` selector's parent, or say in the note that `--main` is needed too.
- Footer document authored empty (`<div></div>`) with `--footer`; nav document without the logo picture or nav labels · 3 · author the chrome from the dump the same way `author` does main (heads + link lists, the logo image).
- fonts.css: Open Sans faces pointed at `open-sans-<w>-normal.woff2` (not the latin subset files media-fetch also saved) → every Open Sans run rendered the serif fallback at 360 · 2 · pick the `latin` src (or the one whose unicode-range covers U+0041) when the source declares subsets.
- fonts.css declares the one SWDropclothVF file as two static faces (400, 100): the light 300 body copy cannot render light; `font-variation-settings` and a `100 900` range face did nothing · 3 · declare a VF as a weight range; flag a "VF" file that has no wght axis.
- No `carousel.js` (block load 404 in the harness console) — the draft named a block without code · 0.5 · ship a no-op decorate with any drafted block.
- spec-to-css drafts mixed sections (the News `cards` draft carried "Every client" / Performance values; the carousel draft for section 5 carried News values) — drafts were replaced, not edited · 2 · key draft rows to the triage row's own subtree.
- Triage proposed `accordion` for two link lists ("Go To", "Every client") · 1 · a link list without panels is default content.
- Round digest: the pair rows print under the next section's heading (off by one), and only the 360 digest is printed though 1440/2560 were over in early rounds · 1 · print the rows under their own section and the worst width's digest.
- `first` "da-put media (background) ✗" — media turned out to be on the branch host anyway (301 → media bus) · 0.5 · say which item failed.

## (b) own time — five largest non-tool chunks
1. Diagnosing the section split and finding `--main` (reading triage, dump keys, contentRootPath): ~4 min.
2. Reading the measurements and writing the doc restructure + first full CSS (page, carousel, cards, columns): ~4 min.
3. 360 layout diagnosis (own Playwright box script, side-by-side crops) and fixes: ~3.5 min.
4. Font debugging (serif fallback → latin files; VF weight experiments): ~3 min.
5. Photo crop fitting (object-position sweeps against the capture) : ~2.5 min.
(Chrome — empty footer / thin nav — authoring: ~2 min.)

## (c) per round
- r1: doc restructure (Go To → list; Performance Coatings → nine slides picture | label + copy; dropped "slide N of M" live-region text and duplicate "Learn more" links; color cards' name as the h5 link; Company CTA added from the dump) + all section/block CSS from content-1440/360. Digest named the height rows; it did not name the empty footer (seen only in sbs).
- r2: nav/footer documents authored from the dump; header + footer CSS; tab-row specificity. Footer was not a digest row (chrome is outside the section table).
- r3: carousel controls (the live prev/next) via carousel.js; served DOM unwraps `p > picture` in cells — selector fix. Digest named "Previous/Next MISSING".
- r4: Open Sans latin files (found by eye: serif at 360); hero desktop aspect-ratio + mobile rendition; 2560 Top Colors heading 72/72 in a 700 column (not named by the 360 digest — read from content-2560).
- r5: Top Colors bottom gap, Every-client picture height, tab specificity. 1440/2560 under 10 %.
- r6–r8: 360 only — section paddings (sections-draft's 360 padding leaked), perf copy width/line-height, picture contain, row-gap overridden by `gap`, brands copy line-height, the 40 px alt-text row. The digest's Δh rows named these sections; the child causes came from my box script.
- r9–r11: header tools row (grid align-items center), link icon gap, VF/light-face body copy — each ~0.1 %.
- r12: object-position fitted on the two photos (Every client: left 13 %; Company: left 20 %) — 360 10.19 → 7.02. Not named by the digest ("Δh 0 but pixels"); found from a diff crop.
