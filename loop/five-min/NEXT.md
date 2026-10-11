# Five-minute loop — the next phase (started 2026-10-11 19:20Z, report due 2026-10-12 02:20Z)

Asked: run the full plan hands off, iterate on as many sites as needed, stop at 02:20Z with a report of what was achieved and updated
charts (`loop/metrics/charts.html` from `runs.csv`).

## Method (why not one field run per change)
On the same code the loop's time to < 10 % ranged 8–35 min by page: a field run on a new page measures the page. So:
1. Machine-side changes ONE AT A TIME on the replay bench (`scripts/bench.mjs`, the finished loop pages, no agent, deterministic):
   kept only when the median first-round % improves and no page breaks.
2. Agent-side changes on a FIXED PANEL of already-run pages (fresh repo, fresh agent, same protocol), each compared with its own
   earlier clock — a paired comparison cancels the page's difficulty. Panel: santanderus (8.0), wpp (9.7), rbc (14.7), waters (33.7),
   lenovo (34.8). The field agent is not given the old case notes.
3. New pages only as the final check (Nebraska Furniture Mart, Bank of America, Cisco).

## Items (status in the log below)
1. bench as the gate for every generator change — rebuild the bench (its scratch was in /tmp), baseline
2. draft anchoring: spec-to-css drafted every section from one wrapper node (lenovo), drafts aimed at the wrong sections (waters)
3. missing content rows: live text in no section listed in the first digest (lenovo: three rows found by hand)
4. one reading card per section from `first` (live crop, box, fonts, colours, gaps, the draft) — agent-side, panel
5. hybrid fan-out: one agent's first pass, parallel owners for residual sections — agent-side, panel
6. machine rounds for geometry (a per-section search over measured properties, scored by section-view)
7. a faster model for the field agent / rounds — agent-side, panel
8. section-view with `drop` rows ("no live partner" on every lenovo section)
9. prototype vs served drift (lenovo 8.2 local, 11.1 served at 360)
10. keep every round's results (gate.json overwritten; widths under target not printed)
11–12 (user's decision, not run): second page of a migrated template; animation regions out of the %.

## Log
