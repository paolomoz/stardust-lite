# pgatour-home — notes

## (a) tool friction (what · minutes · what would have removed it)
- triage/author split the main column ×7: 73 sections (rows 5–14 repeated seven times, plus the whole 1332×4059 page grid as row 3, a 1×1 "PGA Tour" picture, a 150×24 "Leaderboard" fragment and the hidden search overlay "Quick Links"); measure's spec had the right 15 sections (`div.css-1kswixv > *`), only the content/triage side multiplied them (content-1440.json key `div` holds 451 entries). The first round authored a 75 000-px page · ~2.5 (diagnosis + a 71 s re-run) · triage reading the same section list as spec-*.json; a guard on repeated identical signatures.
- The round right after a harness re-run captured broken images (alt text in every picture, 16 → 26 % at 360); the next identical round was fine · ~2 (one wasted round) · gate waiting for every `img.complete && naturalWidth` (the aem.page media answer with a 301 to `media_<hash>`) or failing loudly on unloaded images.
- Draft specificity fights: `blocks/cards/cards.css` / `columns.css` drafts use `main .section:nth-of-type(n) .cards` and load after styles.css, so the CHECKLIST's "a rule you write in styles.css wins a tie" does not hold (it is not a tie); header/footer drafts were measured on the wrong chrome (footer `height: 0` at 1440 from the MobileFooter, header `height: 0` at 360) · ~1 · drafts keyed at `.block` specificity, chrome measured on the visible element per width.
- author turned 38 video poster tiles (Player Highlights, Recent Stories) into `<a href="…jpg">Video</a>` links although media-fetch had the posters · ~0.5 (perl swap to pictures) · author emitting a picture when the href is an image.
- Icons 404 in the harness (icon.svg, play.svg, location.svg, pga-tour.svg), no embed.js for the drafted embed block · ~0.3 (copied the measured logo svg to icons/) · `first` writing the svg icons it names and a no-op JS per new block.
- Not counted (setup): DA `list` on a nonexistent folder answers 200 `[]`, not 404.

## (b) own time (non-tool, approx.; clock 17.05 min, tools 8.6 min)
1. Reading the spec item dump (1440 / 360 / 2560) and writing round-1 CSS (frame 1292/996, ten section heights × 3 widths, Latest grid, carousels, columns grid, footer): ~4.5 min
2. Diagnosing the ×7 split and editing triage.md (drop 63 rows): ~1 min
3. Side-by-side at 360 after r1, deciding the poster swap, finding the harness command line: ~1 min
4. Side-by-side + DOM positions at 1440 after r3 → the 12-px header-gap specificity miss: ~1 min
5. Diagnosing r2's regression (images not loaded in the capture, fine in a direct check): ~0.7 min

## (c) per round
- r1: everything in styles.css (frame, section heights pinned to the measured 360/1440/2560 values, headers, Latest grid, carousels, weather band, columns 2×3 grid, footer grid); cards/columns drafts blanked. The digest named only Δh per section; the layouts came from the spec item dump.
- r2: header/footer selectors bumped to `.block` (drafts set height 0); Latest grid hid the wrong `p`s (digest named "Thomas…" +470 and "Scott…" −87 at 360 — it did name this); doc: 38 "Video" links → poster pictures, harness re-run. Capture regressed on broken images — not CSS.
- r3: no change; re-capture confirmed r2's regression was the capture (9.40 / 10.35 / 4.43).
- r4: section-header gap 24 at ≥768 (48 above Watch Now) — the `:has()` rule lost to the nth-of-type ones; More News category pinned to the card bottom (+13), Watch category +12 (digest named "Features" −12 at 360); Watch Now logo overlays shown; header logo from the measured svg. The 1440 digest is not printed (only 360) — the 1440 fixes came from DOM positions vs the spec.
