# lenovo-home — notes

## (a) Tool friction (what · minutes · what would have removed it)
- spec-to-css drafted every section from ONE live node (the page wrapper `responsivegrid` y228 h6734): all eight sections got the same pink
  background, padding 48/143 and a 396-px slider grid; cards/columns drafts were slider tracks · ≈ 8 min (reading, then replacing every draft
  and dropping the sections-draft import) · measure's section split should descend into the wrapper (the split table had the right rows; the spec did not).
- section-view answered "section #N has no live partner in the round's table" for every index tried (0, 2, 3, 4, 5, 6, 9) · ≈ 2 min · its index
  lookup does not match the round table after `drop` rows (or uses a different numbering); fell back to the sbs tiles.
- `first` printed port 9001 then 9002 (8990 busy) while PROMPT.md names 8990 · < 1 min · print one stable port or reuse the running server.
- The round digest omits a width once it is under 10 %, so the per-round 1440 % for r4–r8 is not in the output and gate.json is overwritten
  each round · ≈ 1 min (reconstructing TIMELINE) · keep a rounds.jsonl history with the three %s.
- The triage split missed three visible content rows (the category icon row, the rewards band, the "Innovation in Action" title) — no row,
  no draft · ≈ 4 min to find (live screenshot) and author them · a "gap" warning when two consecutive rows leave > 200 px unexplained.
- `first` ✗ on "da-put media (background)" with no reason printed; media turned out to be served (301 → 200) · < 1 min · print the failure.
- styles.css foundation placeholders (sans-serif body, 80 px header) were not filled from site.json by `first` · ≈ 1 min.

## (b) My own time (non-tool ≈ 23 min of 34.8)
1. Writing the replacement CSS for all blocks + page rules (r1), from content-*.json dumps · ≈ 7 min
2. Reading measurements (a case script `scripts/flat.py` to flatten content-<W>.json by y-range; 6 dumps across 360/1440/2560) · ≈ 5 min
3. Reading the triage table, live screenshot and first sbs tiles to decide drops / missing rows · ≈ 4 min
4. Authoring the three missing rows into the document + their CSS · ≈ 4 min
5. Footer and hero restructure (r5/r6), reading sbs tiles at 2560 and 360 · ≈ 3 min

## (c) Per round
- r1: replaced all drafts — named by the digest only as "Δh / pixels" per section; the cause (degenerate drafts) was read from the CSS files.
- r2: column cap 1440 (2560 x 560..2000), 360 sliders for powerhouse/promotions, 360 label padding — digest named Δh +1047/+837 (columns at 360) and 2560 %s.
- r3: authored category row / rewards / title (digest named browse 53 % at 1440; the cause — a missing band — came from the sbs tile).
- r4: discover chip font/padding + fixed 360 box (Δh +300 named), slider controls space (Δh −35 named), columns bottom (Δh −32 named).
- r5: footer — not named by the digest (footer is outside the rows); 2560 went 10.57 → 10.72, i.e. no gain.
- r6: hero slide grid (the authored slide puts the wordmark in cell 1 and the picture last in cell 2) — seen on the 2560 sbs, the digest said "Δh 0 but pixels"; 1440 11.6 → < 10, 2560 → < 10.
- r7: hid the wordmark at 360 → Δh −75 (named) shifted the page: 360 got worse (16.8 → 20.4).
- r8/r9: 360 copy min-height and 157 bottom padding (Δh −30 named), label title margins → stop.
