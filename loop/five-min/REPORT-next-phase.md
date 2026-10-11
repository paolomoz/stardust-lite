# The next phase — report (2026-10-11 19:20Z → 2026-10-12 02:20Z, hands off)

Asked: run the full plan of `NEXT.md` hands off, iterate on as many sites as needed, stop at 02:20Z with a report and updated charts.
Charts: `loop/metrics/charts.html` (data `loop/metrics/runs.csv`, tonight's rows are period D). Log: `loop/five-min/NEXT.md`.

## Result in one line
<!-- FILL -->

## How it was run
- Machine-side changes one at a time on the replay bench (no agent, deterministic, 23 finished loop pages), each from a frozen checkout.
- Agent-side and combined changes on a fixed PANEL of already-run pages, re-run on fresh repos by fresh agents with the same protocol,
  each compared with its own earlier clock (a paired comparison: the page's difficulty cancels). Then new pages.

## The panel: the same page before and after
| page | loop run (old code) | panel re-run | Δ |
|---|---|---|---|
| santanderus | L16 8.0 | P1 8.8 | +0.8 |
| wpp | L7 9.7 | P2 9.5 | −0.2 |
| rbc | L18 14.7 | P3 11.0 | −3.7 |
| waters | L20 33.7 | P4 13.3 | −20.4 |
| lenovo | L22 34.8 | P5 33.4 (without the bands) | −1.4 |
| lenovo | L22 34.8 | P6 16.5 (with the bands — P5's field A/B) | −18.3 |
<!-- FILL new pages -->

## What changed (kept)
<!-- FILL -->

## What was rejected or not testable
<!-- FILL -->

## The finding about the method
<!-- FILL -->

## Where the clock goes now / next
<!-- FILL -->
