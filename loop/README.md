# Loop — a blocks-first page in five minutes

Branch `loop/five-minute-page`, started 2026-10-03 from `24d1d36`. Ten rounds; each round is one page of one site never run before, migrated by a
fresh agent in a new site repo with stardust-lite installed from this branch, gated as METHOD says. After the gate passes, the round's notes drive one
improvement pass here. Targets: first prototype under 10 % at 360 / 1440 / probe within **5 min** of the first instrument, every probe passing, and the
method's prose (`npm run prose`, `prose-baseline.json`) within +10 % of the baseline. Metrics per round in `METRICS.md`; the running log is the GitHub
issue on paolomoz/stardust-lite. Sites drawn with seed 20261003 from the campaign list, excluding migrated, on-EDS and already-run sites.

## Result (10 rounds, 2026-10-03, `f2903b1` → `dbb0687`)

Minutes from the first instrument (t0): first prototype 41 → 25 → 21 → 32 → 48 → 22 → 31 → 17 → 20 → 28; under 10 % at the three widths 54 → 52 →
30 → 43 → (never at 360: a source quirk) → 27 → 43 → 29 → 43 → 51; served gate 77 → 59 → 37 → 52 → 83 → 32 → 62 → 45 → 56 → 84. The target of 5 min was
not reached; the best round (covermore) reached under 10 % at 27 min. Instrument time per step is now one or two minutes (measure-page 40–70 s for
three widths and the noise floor, a gate round 1–2 min); the clock is the agent's reading, deciding and CSS rounds (~4 min each), and the origins' own
defences (a WAF, a cookie gate, shadow DOM) — the rounds that ran over 60 min were those. Fidelity held or improved every round: served pages at
0.2–4 % at 1440 and 1–6 % at 360 (one 15 % registered). What changed in stardust-lite is BACKLOG 181–204; prose +8.3 % against the +10 % cap.

## The high-impact pass (branch `loop/high-impact`, 2026-10-04)

Checklist, `spec-to-css`, `gate --round`, `css-lint`, the tier line with a profile at t0, and the author / probe fixes (BACKLOG 205). Three
validation rounds ran in parallel on one machine (a pessimistic clock): wellsfargo first prototype 26 min and the base width under 10 % at the first
round, citizensbank 28 min, takeda 36 min; served at 60 / 56 / 77. Against rounds 1–10 the first prototype is in the band of the best rounds, the
drafts carried about a third of the final CSS, the checklist replaced reading METHOD, and the agents' own reading fell to the CSS itself and the
round diagnostics. What the three agents asked for next is in the row, and most of it landed right after them.
