# NOTES — friction, takeda-about-article (minutes from the TIMELINE timestamps, not estimates after the fact)

## Tool friction (one line each: what, minutes, what would have removed it)
- `author` flattened every card into one paragraph ("Title Desc LEARN MORE" + the picture in cell 2) and dropped the FY2020 `.gif` card (note "background-image URL cut … no picture written"): the source unit is ONE `<a>` wrapping picture, h3, text and label and `author` reads a link as one leaf. 6 min + a 90-line case script (`scripts/fix-doc.py`, 3 iterations incl. a mis-pairing of images by order). Fix: descend into a unit-wide `<a>` (card-as-link) in `leaves()`, keep an `<img>` whose src the dump has.
- `triage` proposed `accordion (?)` for all 10 grids ("media 0 %") for the same reason — 14 rows flipped by hand, 2 min.
- `spec-to-css`: the hero / columns / cards drafts carried the type styles, the grid (3 cols, gap 36), the unit paint (bg, radius) and the image boxes; they did NOT carry the unit's inner padding (34 / 24 / 46.96 from the h3 offset), the pinned label, the line-clamp, the 2560 fraction (3 % gap), the 360 inner values, nor any chrome; `sections-draft.css` wrote 24 near-identical `:nth-of-type` rules and read the hero's panel inset as `main .section { padding: 422px 0 32px }`. 14 min of reading `spec-view` at 360/2560 and writing CSS by hand. Share of the final block CSS from the drafts: ≈ 35 % of the declarations (fonts, colours, grid, radius, image boxes); the rest from spec-view / brief / dump.
- Two third-party fixed layers (OneTrust floating button, a BackToTop widget injected on scroll) sat in every live chunk; no table named them (the DOM capture has no BackToTop node; `scroll-probe` saw only the header). 9 min: 2 crops, 3 greps, a 12-line `scripts/fixed-layers.mjs`; then `overlays.hide` + `--recapture-origin` (one round). Fix: `probe-load` lists visible `position: fixed` elements after a scroll in the tier line and proposes `--hide`.
- `site-profile init` overwrote `overlays` (consent null, hide dropped) — BACKLOG #132 — 1 min to restore from a copy; would have silently broken the served gate.
- `gate --round` digest: the h2 rows read "Δh -1114 … a height" every round (the live split folds heading + grid, the build keeps them apart) and every block row reads "+50" (gap as padding vs margin) — noise I had to learn to skip. The actionable lines were right for the cta (−24 → pair found the 4 px/24 px), but "Δh 0 but pixels: paint or position" did not name the line-clamp (r1), the footer (r2, found with deep-probe), the pinned label (r4) or the 1 px sub-pixel offset (r5, found by reading the section table + a diff crop). 4 reads × ~2 min.
- Footer selector collision: the pipeline's block element is `div.footer.block`, so `footer .footer {padding}` applied twice (+64 px) — 1 round, 3 min. The foundation footer.js could name its inner div differently, or css-lint could flag a block-name class used as an inner selector.
- aem.js here adds `.button` to the link but no `.button-container` to the paragraph — 1 round, 3 min (deep-probe showed `class=""`).
- motion probes: the gate's live hover read nothing on `a[aria-label]` / `a.group` (advisory) where `hover-diff` saw the change (#42-like resolution difference) — 1 min reading, no change.
- Waits: measure 3 min; each base round ≈ 2.5 min (live "cached" still opens 30–48 s); 3-width gate 9 min; served gate 9 min; sync 23 s. ≈ 36 min of the 77 were instruments running.
- Mine: a zsh `*.png` glob aborted a whole `da-put` line (1 min); grepping `upload 201` on an overwrite that answers 200 (1 min); `--media-host` not passed on the first `author` (40 🔴, 2 min).

## Own reading and deciding (which output, minutes)
- brief (156 lines) + content-view (673 lines, read twice) → model decisions: 7 min (22:33 → 22:40).
- author stderr + document inspection + writing/debugging fix-doc.py: 6 min (22:43 → 22:49).
- drafts (4 files) + spec-view at 360/2560 (6 sections) + foundation code (header/footer/styles) → writing 6 CSS files + 2 decorates + icons: 14 min (22:50 → 23:04).
- gate digests r1–r5 + pair/deep-probe/crop reads: ≈ 12 min across rounds (23:08 → 23:26, minus run time).
- hover/motion tables: 3 min. Closing documents: ~8 min.

## Answers
- Did the checklist replace METHOD? Yes for the sequence (12 steps, one command each; I opened METHOD only for the `recipe` row, 1 min). What it did not say: `--media-host` is needed by `author` (step 6 lists it without the host), `site-profile init` overwrites overlays, and the pipeline's `div.footer.block` class.
- Did `gate --round`'s digest name the fix each round? r1 partly (cta height yes; the clamp and the margin collapse I read from the rows line), r2 no (footer: deep-probe), r3 no (fixed layers: crop), r4 no (pinned label: dump re-read), r5 no (1 px: section table + crop). It did say when a round was within tolerance.
- Did css-lint catch anything? Yes: 5 foundation selectors that would have beaten the blocks' longhands (specificity) before the first harness — fixed with `:where()`; it never flagged the `.footer` collision.
- Share of block CSS from `spec-to-css`: ≈ 35 % (type, colours, grid shape, radius, image boxes); ≈ 65 % derived from spec-view / brief / dump (inner padding, gaps as fractions, pinned label, clamp, mobile, chrome, hover, transitions).
