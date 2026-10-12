# NOTES — wpp-home field run

## (a) Tool friction (what · minutes · what would have removed it)
- `author` lost structure and content: the hero h1 came out as three line `p`s, "Latest insights" heading and intro merged into one `p`, the sustainability heading/body as five line `p`s, and the careers CTA ("Explore careers at WPP", named as a closing link in triage.md) is absent from the columns block · ~1.5 min (doc edit + harness re-run) · join line spans of one text block into one element, keep the heading role of display-class spans, keep closing links inside the block they close.
- spec-to-css drafts unusable for three blocks: cards `grid-template-columns: repeat(1, …)` at 1440 (Δh +8582 — "1 per row" read from the 2-span video card), an over-broad `.cards div { text-align: center }`, and `sections-draft.css` gave the 360 careers section `padding-bottom: 342px` (an inset read through the navy panel) · ~2 min (rewrote cards / columns / carousel CSS) · derive the column count from the repeated small unit, not the first unit; don't turn an inner panel's height into section padding.
- Video media authored as plain "Video" links with no runtime to render them (no video decoration in the foundation) · ~0.5 min · a foundation `decorateVideos` (mp4 link → muted looping video). My first version wrapped it in `div.video`, which `decorateBlocks` loaded as a block "video" (404s) — fixed by keeping the `p`.
- The WPP logo SVG was not fetched (no `icons/icon.svg`): header and footer render without the logo · 0 min (registered) · media-fetch should rasterise / keep inline SVG logos for the chrome.
- 360 live capture of the sustainability band is an entrance state (video scaled 0.85, card invisible) — the gate compares to an animation frame · ~0.5 min reading the crop · settle scroll-driven entrance states before the capture.
- `first` moved to port 8991 (8990 busy) — PROMPT's round command names 8990 · ~0.1 min · none needed; `first` prints the right command.

## (b) My own time, five largest non-tool chunks
1. Reading after `first`: digest, INDEX.md + card 1, sbs tiles 1440, spec-view for sections 0–7 at 1440/360/2560 — ~1.5 min.
2. Writing styles.css page/section rules + cards / columns / carousel CSS from the spec rows — ~1.5 min.
3. Reading the 360 tiles after round 1 (careers padding, insights wrap, sustainability entrance state, footer) — ~0.8 min.
4. Footer CSS (grid at 1440, stack at 360) + round-1 fixes — ~1 min.
5. Document edit (h1 / h2s / careers CTA) + video decoration — ~0.5 min.

## (c) Per round
- Round 1 (after doc edit + harness): full CSS for every section from the measured rows — hero h1 + video box, our-work header and the 4-col grid with the 2-span video card, careers 50/50 full bleed with the cap-aligned text column, slider title rows / 654 tracks / the 56 + 44 + bottom rhythm, the sustainability band (video under a 456 card), the fixed header pill. The digest named every section as a Δh — the cards Δh +8582 was the grid draft; the rest was the missing structure.
- Round 2: named by the 360 digest (careers Δh +294 → the 342 px bottom padding in sections-draft; sustainability 39 % → the captured video box 306×476; hero Δh +35 → the h1 wrapping five lines, letter-spacing −0.4 px; insights p wrapping four lines, −0.36 px) plus the footer (not a digest row; seen in the 360 tile: links stacked unstyled) and the carousel chips / track. 1440 / 2560 were already under 2 %.
