# NOTES — lenovo-home timed run

## (a) Tool friction (what · minutes · what would have removed it)
- `sections-draft.css` and every block draft mapped ALL sections to one live container (responsivegrid y228 h6734: "section 8 ← live section #2"), so every section got the hero's 48/143 padding + #f1e1ed background and the hero h1 / 150×100 image rules; every block draft was scoped to `nth-of-type(1|2|5|9…)` with the wrong values. Unusable — rewrote styles.css and four block CSS files by hand from the cards. · ~14 min · measure/spec-to-css should use the gate's live split (the cards had the right ranges) instead of the outermost DOM container.
- `first` split put a personalised popup, the header band and the footer in main (3 triage rows to drop + a 69 s re-run). · 2 min · drop a section whose signature equals the header / footer signature, and an overlay narrower than 30 % of the viewport.
- `author` left out the hero category strip (7 linked icons) although media-fetch downloaded category-*.png — largest residual at 360. · 0 min spent (registered) · author every unit the triage row's signature counts (`[a p]×5`… was the strip).
- Montserrat is a variable font (wght 100–900) but fonts.css declared it as two fixed 400 / 700 faces → 600 rendered as 700 (wider chips, wraps at 360). · 2 min · media-fetch --fonts should read `fvar` and write a weight range.
- Gate per-section % is page-aligned: fixing #1's Δh (+39 → 0) made #4 / #5 jump from 3–5 % to 21–30 % because #2's −40 was no longer compensated; section-view showed 5 % for the same section. · 3 min confusion · the digest should say when a section's % is driven by an upstream Δh.
- `section-view --section #6` with a `#` produced files named `view-#6-*.png` (works, but `--section 6` is the form). Footer icon names (`:lenovo-facebook-30-alternate-med:`) did not resolve to images in the harness. · 1 min.

## (b) Own time (largest non-tool chunks)
1. Writing block CSS from scratch after diagnosing the broken drafts (carousel, cards, columns, styles.css, header, footer): ~13 min (22:05–22:18).
2. Reading cards 0–9 and the doc / nav / footer documents, deciding the layout model per section: ~5 min.
3. Diagnosing 2560 (cap 1440, fluid tracks) from pixel scans of live-2560.png: ~2 min.
4. 360 footer (five overflowing columns, tiny type) reading + two passes: ~3 min.
5. Triage review (sbs image, three drop rows) + re-run decision: ~2 min.

## (c) Per round
- r1: everything (drafts unusable). The digest named every section with large Δh; it did not say the drafts were mis-mapped — found by reading sections-draft.css.
- r2: rewards / discover backgrounds (the "hidden" standalone picture was the gradient under the helix overlays — the build crop showed grey arcs), 360 card labels show the description (crop), discover chips. Digest named #2/#4/#5/#6 at 360; the cause came from section-view crops.
- r3: 2560 — cap 1440 (not 1344), fluid card track, clip at cap, 4 equal tiles; digest named #6 Δh +587 at 2560 (the text column collapsed: % padding on an absolute-free wrapper). Pixel scan, not the digest, gave the cap.
- r4: variable Montserrat, 360 tile bottoms (+98), formula accordion order, footer 5-col grid at 360, innovation spacing. Digest named Δh −98 / +364 / +48 correctly.
- r5: footer 360 band + type, discover padding 16 at 360. Footer was not in the digest rows (page Δh only) — found with section-view footer.
- r6: #2 bottom 136 at 360 (Δh −40 named by the digest), footer columns narrower → 8.04 % at 360, stop.
