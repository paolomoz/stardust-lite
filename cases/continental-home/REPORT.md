# REPORT — continental-home (www.continental.com/en/, `exp/five-min` @ 0decf6c)

## Clock (minutes from t0 = 10:00:06Z, probe-load start; TIMING.log END stamps)

| milestone | min |
|---|---|
| setup (repo, fstab, Code Sync, seed, install, init, push) — before t0 | 1.0 |
| brief read (after a consent-modal re-measure) | 3.0 |
| triage done | 3.6 |
| fonts.css written | 3.9 |
| document authored + lint clean | 6.8 |
| CSS written + css-lint | 10.9 |
| first prototype served | 11.2 |
| r1 / r2 / r3 / r4 / r5 / r6 / r7 | 12.6 / 15.3 / 17.3 / 18.6 / 21.0 / 22.4 / 25.1 |
| `stop:` (r7) | 25.1 |
| pushed + synced | 25.7 |
| served gate | 27.8 |
| leak both | 28.4 |
| probes | 30.2 |
| close (documents, commit) | 32.5 |

## Rounds (pixel %, 360 / 1440 / 2560)

| round | 360 | 1440 | 2560 | what changed |
|---|---|---|---|---|
| r1 | 28.32 | 10.96 | 12.78 | first prototype |
| r2 | 19.88 | 10.55 | 15.57 | letter-spacing per spec row (body normal, rich text 0.2 px), 360 header icons, h1 at 360, teaser gaps, garage grid 397 / 827 |
| r3 | 13.27 | 13.74 | 16.14 | facts 360 type and gaps, garage 360 gaps, card link gap, the header bar capped at the 1920 page |
| r4 | 13.27 | 4.36 | 10.09 | the spacer shrinks 20 px when the bar pins (measure-page's note) |
| r5 | 12.86 | 4.05 | (10.09) | social icons (sampled colours, 360 icon grid), footer accordion at 360, news section bottom; the 2560 build capture FAILED (scroll stall) and the gate reused r4's png |
| r6 | 12.86 | 4.85 | 10.40 | body padding while pinned (keeps the document height) — the stitch completes, the chunks drift — reverted |
| r7 | 9.27 | 4.97 | 9.49 | 360 header row spacing (logo 150, 13 / 14 gaps), card link gaps — `target 10 %: REACHED`, `stop:` |
| served | 8.97 | 4.91 | 9.34 | same document and code on `blocks-first`, `/drafts/continental-home`; cap-probe PASS at 2560; leak 0 differing lines of 20 selectors |

## Split

- Instruments between t0 and the stop: 604 s (10.1 min of 25.1); to the served gate 734 s (12.2 of 27.8). Model (reading, deciding, writing) ≈ 15.5 min to served.
- A three-width round: 57–64 s (live cached, cap-probe skipped); served gate 107 s; probes gate 100 s.

## Residuals (REGISTER)

The 2560 hero (D1: the live froze the other slide — 5.6 of the 9.34 points), the garage video poster (D3), the header panels (D5), the scroll-to-top button (D8), motion M1–M3. No polish round was run.
