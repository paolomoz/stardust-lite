# santanderus-home — notes

## (a) tool friction
- `first` authored the hero badly: the three featured-news thumbnails landed as default-content pictures outside the carousel and the
  carousel rows got empty picture cells; the hero background became a hot-linked `background-image` to the source host in
  sections-draft.css. ~1.5 min to restructure the document by hand. Would remove it: author pairs a repeating unit's pictures with its
  texts (same unit index) and authors a section background picture as the first `p > picture`, never a CSS url to the origin.
- The nav document mixed tophat items into nav-sections ("Santander Group" first) and duplicated "Santander Banking"; the welcome banner
  (a fixed layer inside the header) was reduced to "hide banner". ~1 min to rewrite nav.html. Would remove it: author the tophat as its own
  nav section and keep a header-owned notice as a section.
- The block drafts were mostly unusable: section-4 carousel draft put padding 80/25 on the card cell (the inner padding is 20/25), h5/h2/p
  rules scoped to `.carousel` that hold default content, columns draft fine. ~1 min reading. Would remove it: the draft's cell rules from
  the unit's content box, not from the section's text extremes.
- `leak` has no default selector list (`--sels` required) — wrote migration/cases/home/leak-sels.txt by hand (~1 min). Would remove it:
  leak derives the wrapper list from the harness DOM.
- Port 8990 busy (another run) — `first` moved to 8996 on its own and printed the right commands; no cost.
- The live capture repeats the fixed header + welcome banner every 900 px at 1440/2560 (it is a real pinned layer, as the measure note
  said). Not a capture defect: reproduced by making the nav fixed from 992 — the bands then matched.

## (b) own time (non-tool, t0 → stop ≈ 5.8 min)
1. Writing the CSS (styles.css, carousel, columns, header, footer) in one pass: ~2.5 min.
2. Reading content-1440/360/2560 flattened (a 20-line flatten script in /tmp) for boxes and fonts: ~1.5 min.
3. Restructuring the page document + rewriting nav.html: ~1 min.
4. Reading the first sbs pictures + live crops (fixed header repeat, red panel at 30 %): ~0.7 min.
5. Round-1 review (sbs crops) and the two fixes: ~0.5 min.

## (c) per round
- r1 (after a harness re-run): whole page — hero as background picture + absolute featured card, preheading rule (64×4 + 20 gap), purpose
  568 cap, About-Us red panel at 30 % (gradient), news grid + card track, fixed header with tophat and banner from 992, footer grid. The
  digest named every section by Δh (499 / -92 / -94 / -65), not the header repeat; the header repeat came from the measure note
  ("a layer that leaves the flow when it pins").
- r2: hero picture did not cover the section (picture height auto inside an absolute p; at 360 the wrapper was the containing block) —
  digest said "luminance ratio 0.693 … paint over the picture", which pointed at the hero but blamed a veil, not coverage; the tophat stock
  text wrapped to two lines (16px measured, but the 141 px box fits ~12px) — found in the sbs, not named by the digest. → stop.
