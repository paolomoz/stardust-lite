# REPORT — bmc home (www.bmc.com, `main` @ bca633b, prototype only)

## Clock (t0 = 10:57:53Z, `first` start; TIMING.log)

| milestone | min |
|---|---|
| setup (boilerplate clone, stardust-lite install, `init --foundation`, live view opened) — before t0 | ≈ 2 |
| `first` r1 (harness stopped: no branch host for the fragments) → local fragments, harness, gate r1 | ≈ 3 |
| the sticky announcement bar found in every capture chunk → `dismiss` in the profile, re-measure | ≈ 5 |
| document, nav, footer authored by hand; styles, blocks, chrome written; r2 | — |
| r3 `stop:` | 14.2 |

## Rounds (pixel %, 360 / 1440 / 2560)

| round | 360 | 1440 | 2560 | what changed |
|---|---|---|---|---|
| r1 (`first`) | 62.69 | 72.11 | 76.18 | the draft; the live capture still carried the sticky announcement bar in every chunk |
| r2 | 13.40 | 4.88 | 4.96 | re-measured with the bar dismissed; document re-modelled; all CSS / chrome written |
| r3 | 8.86 | 4.42 | 4.70 | buttons (`a.button.primary/secondary` — the foundation's decorate drops the strong/em), letter-spacing per spec (headings -0.02em, eyebrows 1.12px, body 0), 360 lockup, logos h2 width, hamburger — `target 10 %: REACHED`, `stop:` |
| r4 (polish) | 6.02 | 3.12 | 3.75 | the highlights paragraph -0.02em (one line less at 1440) |

## Lessons

- **`first --no-da` cannot finish without a branch host**: the harness exits 4 on the fragments. A local-only run needs the chrome documents
  folded to `<serve>/drafts/*.plain.html` (`scripts/local-fragments.mjs` here) and the harness without `--fragments` — worth a `first --local`.
- **A fixed announcement bar (`#bmc-sticky-banner-top`, `data-push-body`) was stamped into every capture chunk** and pushed the page 90 px;
  `probe-load` listed it under `fixed` but wrote no dismiss. Read the `fixed` list at t0; a dismissible bar is a `dismiss` in the profile.
- The foundation's `decorateButtons` replaces the `strong` / `em` with the link (`a.button.primary` / `.secondary`): style those classes, not
  `strong > a` (r2 → r3: 4.5 points at 360).
- The content dump records letter-spacing only when non-zero: a body-wide `-0.02em` taken from the headings rewrapped the stats and the
  highlights; set it per text family from the dump.
