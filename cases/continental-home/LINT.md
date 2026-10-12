# LINT — continental-home

`npx stardust-lite lint migration/cases/continental-home/doc/` (davids-model-lint) on the authored document, before any block: **PASS — 0 🔴, 1 🟡**.

- 🟡 D1 `cards (facts)`: single-column, 3-row block holding only prose — kept as a block: each row is a painted box (#f0f0f0, pad 24, 397×349) with a title, a centred figure in #ffa500 and a text; default content cannot carry the box. Justified.

`css-lint` before the first harness: 18 findings (`css-lint.txt`); fixed: two `.cards` rules in columns.css (moved to cards.css). Left: the module cap `main > .section > div` (intended: the wrappers are the module), the bg-image picture rules (a section style placing its own picture), footer `.footer` as the block element (a grid on the block itself), three specificity inversions on disjoint elements.
