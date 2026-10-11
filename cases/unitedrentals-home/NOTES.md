# unitedrentals-home — notes

t0 → stop 32.4 min; tool time t0 → stop 742 s (first 116, two harness 22, nineteen gate rounds ≈ 31.5 s each = 604); the rest (≈ 20 min) is reading / deciding / writing.

## (a) tool friction (what · minutes · what would have removed it)
- `first` authored no 360 pictures although all 26 mobile renditions were fetched (`*-1.webp`): author's `mobileMap` is all-or-nothing (returns empty when the 1440 and 360 image counts differ — here 360 has lazy/zero-size slides) · ~3 min to find + hand-author 30 `| mobile <768` pictures (360: 15.0 → 14.3 after the margin fix) · pair per image by stem instead of bailing on a count mismatch.
- Fleet icons authored as `:aerial-work-platforms:` etc. but `icons/` only had search.svg; the SVGs were in media/ under other names · 2 min (mapped in order, copied into icons/) · author could write the icon names from the fetched file names, or write the icon files.
- Nav document has no logo (brand section = "Shopping cart"), header/footer drafts unusable as is (header 80 vs 113, nav one row) · 3 min · nav brand from the header's first image.
- spec-to-css page cap `min(2312px, 89.44vw)` is wrong at 2560 (live 2314 = 91.6vw − 31px); fixing it alone took 2560 from 11.4 → 7.6 · 1 min to see, but 8 rounds lived with it · cap-probe/spec-to-css should fit the cap linearly from the 1440 and 2560 boxes, not a vw fraction of one.
- Block CSS loads after styles.css, so page rules written in styles.css for block wrappers silently lost (r3/r4 360 margins had no effect) · ~2 min · the round digest could flag "rule unchanged in computed style".
- Folding a mobile picture made the picture `<p>` a `p:last-child`, so text-paragraph margins from my own rules hit it (lien 1440 1.7 → 14.8 %) · 2 min · stardust.js could mark folded picture paragraphs (class) so block CSS can exclude them.
- Drafts from spec-to-css for cards/carousels gave per-section fixed widths/paddings with negative insets ("-369 below the picture") — I rewrote the three block CSS files rather than edit · ~6 min writing.
- `first` picked port 8997 (8990 busy) — the PROMPT's round command names 8990; used the printed one · 0 min.

## (b) my own time — five largest chunks
1. Writing the round-1 CSS (all blocks, header, footer, page rules) after reading drafts and doc: ~6 min (05:14 → 05:19:40).
2. Reading the first output, sbs images, doc outline, DOM dumps (build structure): ~4 min (05:12:49 → 05:16).
3. Safety banner placement at 2560 (fit model guessed, r7 made it worse, reverted): ~3 min — the media record (`fit: cover`, nat 1712×312) said cover; the remaining diff is a live veil/placement I could not model.
4. Lien slider at 360 investigation (live capture shows slide "Explore emissions"): ~3 min (≤ 10 min box).
5. 360 drift chasing r13–r18 from the digest rows (dy +4…+8 per row, dx +2 everywhere → 14 px gutter): ~5 min across rounds.

## (c) per round — what changed and whether the digest named it
- r1: everything first-pass: section gaps 72/40 (live table), eyebrow + 44 px h2, tabs row, carousels as 4-up tracks, fleet 6-up grid / 2-row slider at 360, news overlay, career cards, header two-row navy, footer band + columns. Digest named heights (Δh −485, +2442, +1307) — yes.
- r2: used section 144 below (live span vs box), hero halves fluid 1fr/1fr, carousel 4-up `calc((100% − 48px)/4)`, news picture fill, 360 slide widths. Named by the section table (Δh) — yes; the 2560 hero shortfall came from the table, not a row.
- r3: desktop card heights interpolated 1440→2560, used card min-height; tools auto height (regressed 1440 +16). Section table — yes.
- r4: tools height calc, More: was caught by the eyebrow rule (uppercase) — seen in the sbs crop, not the digest.
- r5: safety photo placement + veil (digest: "paint over the picture on the live side"), news ramp, sign-in bullets. Partly named.
- r6: picture elements inline → fill (seen in DOM dump; digest only said pixels).
- r7: 360 fleet tiles 162×70 / news card text; safety 2560 model (worse; reverted in r8).
- r8: equipment picture centred & 232→256 (media-2560 box) — from media JSON, not the digest.
- r9: page cap fluid `calc(91.6vw − 31px)` — from the 2560 crop (x 123 vs 135); digest rows showed dx but at 2560 were not printed (only 360 digest). Biggest single win at 2560.
- r10/r11: 360 used-equipment geometry from the crop (wrong: −18), fixed from the digest row in r11.
- r12 (after doc edit): mobile pictures; r13/r14: picture paragraph margins (specificity) — found by DOM dump.
- r15–r18: 360 drift from the digest rows (dy/dx per row): 14 px gutter, tools/safety/career offsets, More: links centred, 20-tall link boxes. Named — yes, rows.
- r19: luminance of the used picture veil and the news ramp (digest: luminance ratio 0.95; I measured mean luminance live vs build per region) → stop.

## Live capture
- 360 promo slider (live section #9): the captured 360 DOM has a 3-slide track (1020 px, translate 0, no clones) whose order is *Explore emissions / Run a smooth… / Submit lien*, while 1440/2560 start with *Submit lien* (with slick clones). So the capture is not mid-animation — the 360 slider's first slide differs (likely a different slider instance/order on mobile, or random start). Build keeps the document order; that section stays at ≈ 44 % at 360 (≈ 2.5 points of the page). Registered, not faked.
