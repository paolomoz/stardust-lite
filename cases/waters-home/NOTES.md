# waters-home — notes

## (a) Tool friction (what · minutes · what would have removed it)
1. **spec-to-css mapped the block drafts to the wrong sections** · ~10 · `cards.css` targeted the hero (default content, section 2) with
   `.cards`, `accordion.css` targeted the cards section, `columns.css` a spacer; `sections-draft.css` set a page cap of 608 px
   (`calc(60.714vw - 266px)`) while the live modules are 1266 at 1440 / 1286 at 2560 (container 1460, grid +66 / -80). Every draft was
   discarded and the CSS hand-written from `spec-*.json`. Fix: key each draft by the authored section's own block (not the n-th block of a
   type), skip empty rows when counting, and take the cap from the module boxes (all 1266 here), not from a text column.
2. **The 360 gate is a 500 px layout on both sides** · ~6 · with the headed Chrome tier the one-shot capture (CDP `captureBeyondViewport`)
   lays the page out at Chrome's minimum window width (500) and crops to 360. Evidence: the gate's build-360.png matches my build rendered at
   500 (mean |Δ| 2.47) and not 480/504/520 (38–68); the live-360.png shows the desktop-size logo (127 px), the header icons +140 px right of the
   spec's x, the hero title on one line where the spec has two (h72); a fresh live re-capture is byte-identical. `measure` (DOM) is at a true
   360, so fixed px from the 360 spec diverge in the picture. Fix: in the `--chrome` tier set the window ≤ width or stitch at narrow widths.
   I worked around it by writing the ≤650 rules fluid (% / auto) so both widths hold.
3. **Empty leading section kept by the harness, stripped by DA on serve** · ~4 (post-clock) · row 1 ("Back To Top", triaged default
   content) was authored as an empty `<div>`; the harness keeps it, the served page drops it (later empty sections survive) → every
   `section:nth-of-type` off by one, served 46 / 55 / 61 %. Fix: author drops an empty section at the top (or harness folds it the same way).
4. Author output defects · ~2 · SVG `<style>` text leaked as text (`.st0{fill:none…}`) in nav and page; the video authored as a text link
   "Video" to the poster; the nav brand authored as text although the logo was fetched (media/waters-logo-black.svg); icons referenced
   (`:layer-1:`, `:icon:`, `:waters-logo:`) with no SVG in icons/.
5. Round digest pair rows at 360 are DOM boxes at 360 while the pixel % is the 500 px picture — the two disagree (row says Δ 0, picture 9 %).

## (b) My own time (largest non-tool chunks)
1. Writing the section CSS (styles.css: cap/grid model, hero, cards, two-column row, panels, tiles, quote) · ~8 min
2. Reading the spec: dump script for spec-*.json, structure-*.txt, per-section rows at 1440 / 360, footer at both · ~6 min
3. Diagnosing the 360 capture (crops, fresh re-capture, rendering the build at 480/500/504/520) · ~5 min (+1 min tool)
4. Reading `first`'s output, the doc, the drafts; finding the drafts mis-mapped · ~3 min
5. Header + footer CSS and the nav doc fix · ~3 min

## (c) Per round
- r1: everything — the drafts were unusable (a1), so one large write: main as a 2-column grid (sections 5/6 side by side at ≥651),
  per-section rules from the spec, header (util bar / logo+search+tools / nav row), footer (6 columns + bottom bar), nav doc fixed.
  The first-round digest named every section; it did not say the drafts were mis-targeted (it said "Δh a height").
- r2: 360 only — fixed px widths → fluid (hero panel, banner, Shop Online panel as backgrounds on the wrappers instead of a 678 px pseudo),
  mobile footer (three columns hidden, 48 px rows, stacked legal links). The digest named hero / cards / Shop Online / video; the cause
  (500 px layout) it did not name.
- r3: external-link glyph (third card title wraps to 3 lines on the live), steps image as 22.8 % (scales like the live's at 500),
  "Contact Waters" hidden, s8 bar spanning the full row at ≥651 + steps grid padding, the 8 px rule above "What would you like to do?",
  logo 127 from 480 px. The digest named s7 (Streamline) and s10; the s8 1440 issues came from my own crop, not the digest rows.
