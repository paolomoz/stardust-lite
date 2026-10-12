# wpp-home — notes

## (a) tool friction (what · minutes · what would have removed it)
- The first-round digest was not actionable: its section labels were offset by one (row "#1 our work" listed the hero's lines, "#3 latest insights" listed Careers) and every Δh was a block that had not been laid out at all · ~2 · a digest that names the block's layout miss ("cards drafted 1 per row, live is 4 cols with a span-2 first unit"; "carousel units run past the viewport") instead of Δh.
- spec-to-css drafts got the layouts wrong: cards `repeat(1)` at 1440 (live 4 × 339 + the first card spanning 2), carousel `grid repeat(2)` (live a row of 654-px slides running to the viewport edge), columns 1416 cap (live full bleed, text cell padded to the cap), header an in-flow 50-px bar at the top (live a fixed pill 32 px above the viewport bottom — the spec box at y818 of a 900 vh says so) · ~3 (wrote my own spec dumper, scripts/specdump.py, and rewrote all block CSS) · span detection (a unit 2× the others), "units beyond the viewport = a horizontal track", fixed-position chrome from box vs vh.
- author flattened text: the hero h1 and the sustainability h2 became one `<p>` per rendered line, "Latest insights" + its intro were merged into one `<p>`, insight tags merged into one `<p>` per visual line, the careers CTA "Explore careers at WPP" was dropped, footer "ABOUT WPP"/"INSIDE WPP" columns authored as loose links instead of lists · ~1.5 · author keeping a multi-span heading as one element and keeping an `<a>` whose text sits in a child span.
- No `carousel.js` written for a new carousel block (harness logs a 404 module load) and no video decoration for the `.mp4` links author writes (four videos rendered as "Video" links) · ~1 · `first` scaffolding a no-op JS for every new block; the foundation turning a lone `.mp4` link into a muted autoplay `<video>`.
- Not counted (setup): DA `list` on a nonexistent folder answers 200 `[]`, not the 404 the eds-new-site guard expects.

## (b) own time (non-tool, approx.; clock 9.7 min, tools 4.3 min)
1. Writing CSS — styles.css (6 sections, 2 widths) + cards, carousel, columns, header, footer: ~1.8 min
2. Reading the spec dumps at 1440 / 2560 / 360 and deciding the layouts (span-2 mosaic, track to the edge, full-bleed band, fixed pill): ~1.3 min
3. Looking at live vs build thumbnails (wrote scripts/sbs.py) to see that nothing was laid out: ~0.9 min
4. Document fixes (h1, h2s, tags, careers CTA, footer lists): ~0.7 min
5. Finding the harness command line (in first.mjs) and the gate's video freeze (stitch.mjs) before choosing autoplay: ~0.6 min

## (c) per round
- r1 (only round): doc edits above + video decoration in scripts/scripts.js + every block's CSS rewritten from the spec rows + styles.css section rules. The digest named only Δh per section; the causes (layout of cards / carousel / columns / header) came from the spec dump and the thumbnails, not the digest. Result 4.81 / 3.94 / 2.64 — stop.
