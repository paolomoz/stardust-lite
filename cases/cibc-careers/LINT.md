# cibc-careers — David's Model lint

`node node_modules/stardust-lite/tools/lint/davids-model-lint.mjs migration/cases/careers/doc/` at step 2 (2026-10-03T10:41Z), re-run by
every harness build: **PASS — 0 🔴, 4 🟡** on `careers.html` (6 🟡 across the three documents; full output in `lint.txt`).

| rule | row | reading |
|---|---|---|
| D1 🟡 | `section-nav`: single-column, 1-row block holding only prose | a genuine widget: the source's sticky sub-navigation (`nav#blq-sub-nav`, 61 px at ≥ 900, hidden at 360, pinned on scroll). Default content cannot be sticky or hide per width; the block holds one list of links. |
| D1 🟡 | `hero`: single-column, 3-row block holding only prose | a hero with two crops (desktop background, mobile inline image) and a text card over the band; default content cannot place the card on the picture. Rows: picture, picture, text. |
| D3 🟡 | `tabs`: rows have differing cell counts (1, 4) | the container shape as David defines it — own rows (the tab label, one cell) then one row per child (the card: picture · title · text · cta, four cells). Aligning the rows would mean repeating the tab label in every card row or nesting a block; both read worse to an author. |
| D4 🟡 | 24 (+1 +1) authored SVG media references — verify pure vector | verified: no `data:image` and no `<image>` in any of the 27 fetched SVGs (`grep` over `media/*.svg`); all previewed 200 on the branch host. |

Nothing cited from BACKLOG #13 (no video link inside a container row: the hero's video is a default-content link in the hero text,
the lint accepts it).
