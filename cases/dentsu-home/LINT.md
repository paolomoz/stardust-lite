# David's Model lint at step 2 (before any block existed)

```
$ npx stardust-lite lint doc/home.html doc/nav.html doc/footer.html
🟡 D1 doc/home.html: section (unnamed) → block "hero": single-column, 1-row block holding only prose elements — default-content candidate (justify in the conversion log if it is a genuine bespoke widget)
🟡 D1 doc/home.html: section (unnamed) → block "quote": single-column, 1-row block holding only prose elements — default-content candidate (justify in the conversion log if it is a genuine bespoke widget)
🟡 D1 doc/home.html: section (unnamed) → block "quote": single-column, 1-row block holding only prose elements — default-content candidate (justify in the conversion log if it is a genuine bespoke widget)
PASS — 0 🔴, 3 🟡 (rules: ../davids-model.md)
```

home: **0 🔴, 3 🟡**. The three 🟡 are the Block Collection shapes themselves: `hero` (picture + h1 + the "Go to Introduction"
anchor link — the block paints the picture full-bleed at 100vh and turns the link into the scroll arrow) and `quote` ×2 (one cell
holding the quotation — the block renders it as a 64 px blockquote drifting with scroll). Justified, kept. nav, footer: clean.

The first lint of the same document (before the fix) also printed one 🟡 D3 on `cards (tiles)`: the call-to-action tile row had one
cell where the photo rows have two ("span-shaped structure"). Fixed in the model: the CTA row is `| (empty) | link |`, the block reads
a row without a picture as the dark call-to-action tile. The harness re-runs the lint on every round: same 0 🔴 / 3 🟡 throughout.
