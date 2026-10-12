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
