# LINT — acs-about

`davids-model-lint` on `doc/` (acs-about.html, nav.html, footer.html), run when the document was authored (06:51) and at close:
**PASS — 0 🔴, 3 🟡** at authoring, **0 🔴, 4 🟡** at close (LINT.txt) — the fourth is the bento cards' third cell added in round 4.

| rule | file | finding | decision |
|---|---|---|---|
| 🔴 HR (first run) | acs-about.html | two `<hr>` in the strategy column's right cell (the live rules between Vision / Mission / Core Values) | fixed in the model: no `<hr>`; the rule is a `border-top` on the 3rd / 7th paragraph in columns.css |
| 🟡 D1 | acs-about.html | `hero` — single-column, 3-row block of prose | kept: a bespoke band — row 1 the section's background picture, row 3 the video card (pattern picture, logo, play link); default content cannot place the card's pattern behind the logo |
| 🟡 D3 | acs-about.html | `hero` rows have 1 / 1 / 3 cells | kept: the card row holds three cells by design (pattern, logo, label) |
| 🟡 D3 | acs-about.html | `cards (bento)` rows have 3 / 2 / 2 / 2 cells | kept: the two tall cards carry their background pattern as a third cell (picture · text · pattern); the short cards have none (round 4, a measured paint layer) |
| 🟡 D4 | acs-about.html, footer.html | authored SVGs (`card-bg-*.svg`, logos) | verified pure vector: 0 `data:image` in every media SVG; every preview 200 |

`css-lint .` (css-lint.txt, 66 findings at the first harness): the "specificity inversion" rows compare selectors that never match the same
element (footer link columns vs the e-mail paragraph, header hat links vs the brand link, the strategy image vs the history image); the
"foundation rule reaching into a block's area" rows are default-content section rules (`main > .section.grey .default-content-wrapper`) —
no block of this page sits inside them; three "selector outside the block root" rows are `:is(:nth-child(…))` arguments read as
selectors. None changed a pixel in a round.
