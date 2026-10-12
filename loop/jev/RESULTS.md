# Jev on stardust-lite — step 1, offline replay (2026-10-12, branch exp/jev)

Carried over from the full-stardust research (`~/stardust/2026-auto/260926/REPORT-jev-stardust-1to1-migration.md`, branch
`research/jev-autonomous-migration`): Jev is text-only, ≤ 32k-token state, typed answers only; strong on closed taxonomies, weak on
numbers; "the state is the model"; as a sidecar beside the agent it bought little (the live A/B: faster, less faithful, costlier, its
answers rarely acted on). Method kept: replay recorded decisions offline, keep a decision only above an agreement bar, field A/B after.

## The block decision (section → block) — NO-GO
Corpus: 48 finished cases (33 pages; nfm excluded — a block page), today's `triage` re-run on each dump (the machine's decision as `first`
makes it), each row labelled with the block the agent ENDED with in the final document (`harvest_blocks.py`; a section's label is its
block, `default` only for a section without one — labelling by where the anchor text sat read every cards section with a heading above
it as `default`). 295 labelled rows. One `choice` over 8 options (what / not_for, 3 examples each from OTHER pages only).

| | agreement with the agent's final block |
|---|---|
| today's `triage` (fingerprint rules + inventory) | **70.2 %** |
| Jev, fingerprint fields only (v1) | 54.6 % |
| Jev + the section's content in reading order with positions in words, and a layout line (v2, `outline.mjs`) | 65.8 % |
| Jev at confidence ≥ 0.9 (108 rows) vs triage on the same rows | 74.1 % vs 75.0 % |
| triage with Jev overriding at confidence ≥ 0.9 (3 overrides: Jev right 1, triage right 2) | 69.8 % |
| Jev as a checker, "is triage's block wrong?" P ≥ 0.5 / ≥ 0.7 | precision 44 % / 47 % (base rate of a triage error 30 %), recall 75 % / 17 % |

The input lesson reproduced (54.6 → 65.8 % from readable content and geometry words), but Jev stays below the code at every confidence
level, and neither override nor checker is precise enough to act on. Jev's remaining confusions are geometric (cards ↔ carousel 21,
columns ↔ cards 13): what triage reads from the measured boxes. The labels are themselves noisy (an agent may author a slider as cards).

What it also shows: triage names the block right 70 % of the time; the re-modelling minutes in the field runs (bankofamerica's form +
heading + offers fused into one block, okta's empty slide cells, rbc's dropped accordions) are about SECTION BOUNDARIES and CELL
STRUCTURE, not the block's name.

## The round decisions (fix pattern, invalid round, residual causes) — not measurable offline yet
The gate keeps each round's page % (`rounds/`) but overwrites the per-section table, and the digest is printed, not stored: no round's
state survives except the last. 49 cases keep a final section table and a register of named residuals — enough for a residual-causes
replay on the final round only, with register text as noisy labels.

Cost of everything above: ≈ 1.6 M Jev tokens, under $0.10, median 280–295 ms per request.

## Structure decisions (step 1b, `structure.py`) — split NO-GO, drop MARGINAL
Labels from where each triage row's TEXT ended up in the agent's final documents (397 rows): `dropped` = ≤ 20 % of its text on the final
page (339 labelled, 51 positive, base rate 15 %); `split` = its found text spread over ≥ 2 final sections (201 labelled, 8 positive). Two
nouls per row in one request over the section outline (content in reading order, positions and height in words, its place on the page).

| | precision | recall |
|---|---|---|
| drop — today's rules (empty row, a chrome row's box or anchor) | 89 % (9 flags) | 16 % |
| drop — Jev `not_content` P ≥ 0.7 | 82 % (11 flags) | 18 % |
| drop — rules ∪ Jev P ≥ 0.7 | 80 % (15 flags) | 24 % |
| drop — rules ∪ Jev P ≥ 0.8 | 91 % (11 flags) | 20 % |
| split — Jev `several` P ≥ 0.85 | 6 % (35 flags) | 25 % (base rate 4 %) |

Jev's extra true drops are real non-content (an AudioEye banner twice, a copyright script, a brand strip); its two false flags at 0.7 would
drop real content (a page title, a nav strip). It misses the costly one (lenovo's "You've Got Points" pop-up, P 0.39–0.45). Part of the
`dropped` label is noise: bankofamerica's and okta's sections were rebuilt or lost by the agent, not dropped as non-content.

Time value: a missed drop cost ≈ 2 min (triage.md edit + `first` re-run, lenovo / deloitte); Jev at 0.8 adds 2 correct flags over 33 pages —
an expected saving far below the ≈ ±1 min run-to-run noise, so a field A/B could not see it. Not wired.

## Step 2 — round decisions made measurable
The gate now keeps, per round, `rounds/<time>/sections-<W>.json` and `digest.txt` beside `rounds/<time>.json`: the state each round decision
was made on (which section, which cause, an invalid round). Field runs from this commit on record the corpus a fix-pattern / valid-round /
residual-cause replay needs; the agent's own decision is recoverable from the next round (the section whose Δh / % moved).
