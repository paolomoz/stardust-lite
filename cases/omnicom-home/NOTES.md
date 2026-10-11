# omnicom-home — L21, the fan-out run (https://www.omc.com/)

Clock: `first` 1.4 min (55 / 62 / 50 %), then a stall of 102 min in the orchestrating session before the owners were spawned (excluded),
then 43.4 min of six owner waves and nine rounds. Stopped by hand at ≈ 45 min: 11.83 / 6.77 / 7.65 % (360 over). Served 11.72 / 6.59 / 7.44.
Tools 8.1 min (first 85 s, rounds 42–52 s). Desktop under 10 % at r4 (≈ 33 min).

## Waves (owner minutes; the wave lasts as long as its slowest owner)
| wave | owners | min / median / max | round after |
|---|---|---|---|
| 1 | page, cards, carousel, columns, header, footer | 3.3 / 5.0 / 10.4 | r1 33.8 / 32.6 / 41.2 (r2 after a gate fix, same %) |
| 2 | cards, carousel, columns (whole sections) | 3.0 / 4.4 / 8.8 | r3 31.5 / 11.9 / 14.7 |
| 3 | carousel band, 360 hero + cards, 360 columns | 1.7 / 2.2 / 7.8 | r4 21.6 / 6.8 / 11.2 |
| 4 | investors, carousel | 1.1 / – / 1.3 | r5 17.8 / 6.8 / 7.7 |
| 5 | 360 carousel, 360 news | 1.2 / – / 1.7 | r6 12.4 |
| 6 | 360 carousel, 360 investors | 1.2 / – / 1.7 | r8 12.2, r9 11.8 (two offsets by hand) |

## What the run says
- The fan-out parallelises (median owner ≈ 3.5–5 min in the first waves) but the clock is the slowest owner: the carousel (a scroll-driven
  track over a photo band) set waves 1 and 2, the 360 wheel wave 3. A page with one hard block is not faster split six ways.
- Owners overran a 4-min box 2–2.7×; one returned an unviewed last edit three times.
- `section-view` (≈ 5 s per check) was used by every owner and is the run's keeper — but it inherits the gate's pairing: with the split wrong
  its live half was wrong (the 360 live split merges cards + omni).
- Ownership gap: default content inside a block section (heading, View All) had no owner in wave 1 — wave 2 gave each owner its whole section.
- 360 stalled at 11.8: two Lottie animations (the hero's orange ring, the investors' dotted arc), the italic face's rendering, a news section
  30 px long whose cause is in the stride to the footer, not the margin the owner set.

## Tool defects (fixed in iteration 23 unless noted)
- The gate kept a `drop` row in the live split: counts differed by one, the pairing fell to anchors, two sections folded (−1096 px read on a
  −113 px section). Fixed mid-run (r2), the run's numbers after r2 use it.
- author wrote the live footer's own band ("Stay connected") as a page section too — now dropped when its anchor is the chrome row's.
- The collector read a heading with a picture child as own text only: the h1 lost its `<em>marketing</em>` / `<em>sales</em>`.
- The harness compared a chrome document by text and picture count: the footer split into labelled columns was not re-uploaded.
- section-view crashed on `--section footer` when the last live section reached the capture's bottom.
- Not fixed: the 360 live split merging two sections; the art-directed 360 investors photo arrived as a CSS background (author's mobile
  pairing did not pair it — a register deviation).
