# accenture-home — notes

## (a) tool friction (what · minutes · what would have removed it)
- Hero draft wrong: `first` read the section's content cap from the pause button (columns `max-width: 48px`, "content x66..114"), the animated
  headline spans (transformed off-screen at rest) never reached the document, and the poster img stayed on accenture.com (broken) · 3 min ·
  read the cap from the text column / the `rest` boxes, author the `rest` text, fetch the poster like the other media.
- Carousel draft styled no structure (the harness carousel has no decorate; the boilerplate classes I first wrote matched nothing) · 1 min ·
  the carousel card should name the authored DOM (`.carousel > div > div`).
- Hero draft keyed the backdrop on the local media file name (`img[src*="a1-a-com-careers-module-image-1.png"]`) — fine in the
  prototype, dead on the served page (media_<hash>) → served 1440 7.53 % until fixed · 2 min (post-clock) · key draft rules on the block / cell.
- Awards draft scoped the h2 inside `.cards` (it is default content in the section) and the cards as a 1-col grid of 9 units · 1 min.
- 2560 had no hint that the page is the 1440 layout × 4/3 in a 1920 frame (every box ×1.333) — found by reading spec-2560 · 1 min ·
  a spec-to-css note "2560 = 1440 × k inside a cap" would make it one rule.
- `first` moved the harness to port 9002 (8990 busy) — the protocol text names 8990 · 0 min (read from its last lines).
- The careers module is scroll-pinned; the stitched capture shows a different intermediate state per width (360 two renditions of the
  picture) — ~5 min chasing a crop of an animation state · a motion flag on the card would have let me register it sooner.

## (b) own time (largest non-tool chunks)
1. Reading the r0 side-by-sides + spec-view for 1440 / 360 sections and deciding the layout per section — ~4 min.
2. Writing the r1 CSS (styles.css page / hero / spotlight / awards; cards, columns, hero, carousel, footer) — ~3 min.
3. Careers 360 crop + the settled-picture clone (r3 → r5) — ~4 min.
4. 2560: spec-2560 read, zoom rule, careers 2560 picture box — ~2.5 min.
5. Vidyard poster fetch + document edits + harness re-runs — ~1.5 min.

## (c) per round
- r1: everything at once — black page / white Graphik (the drafts' `--background-color` placeholder was white), hero headline + text
  column positioned from the `rest` boxes, cards 4×276 grid / 360 row, quote grid, spotlight two-column with measured tops, awards
  heights and card offsets, careers, news row, footer row. Digest named every section (Δh up to 3685) — all addressed.
- r2: 2560 `zoom: 4/3` on main (digest: every 2560 row a height ≈ ×1.33); poster image for the spotlight video (1440 band 2250 45 %);
  careers 1440 black panel. 360 careers went up (digest named it: 54 %).
- r3: 2560 section heights (awards / careers / hero) from the 2560 section table; careers 360 crop. Careers 2560 height rule lost to
  hero.css (same specificity, later file) — the digest still said Δh −125.
- r4: careers 2560 rules moved into hero.css; quote 360 width 281 (section-view: 17 %); careers crop rescaled → 360 11.29.
- r5: careers 360 settled picture (hero.js clone) + crop re-aim → 8.37 / 3.81 / 8.47 `stop:`.
