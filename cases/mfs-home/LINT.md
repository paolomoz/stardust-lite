# mfs-home — David's Model lint (step 2)

`davids-model-lint.mjs doc/home.html` (and `harness` before every fold): **PASS — 0 🔴, 1 🟡**.

| rule | row | verdict |
|---|---|---|
| D1 🟡 | block `hero`: single-column, 1-row block holding only prose elements — default-content candidate | kept as a block: the cell holds **two renditions** (the 1600×440 desktop crop and the 750×840 mobile crop) that default content cannot express without the block choosing by width; it is the Block Collection's hero shape (one cell: picture(s), heading, text). |

Lint clean before any block existed (2026-10-03T11:59:43Z, see TIMELINE). The nav and footer documents are the simplest shapes
(`author --nav/--footer`, edited: tools list added to the nav, duplicate logo removed and icon tokens named in the footer).
