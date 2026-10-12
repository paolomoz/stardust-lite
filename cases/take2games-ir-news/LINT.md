# LINT — take2games ir-news

`davids-model-lint` on the three authored documents (step 2, before any block existed; re-run after every edit):

- `doc/ir-news-borderlands-4.html`: PASS — 0 🔴, 2 🟡
  - 🟡 D1 `ir-nav`: single-column, 1-row block holding only prose elements. Justified: a sticky sub-navigation bar whose three items open menus on click (chevrons, aria-expanded, outside-click close) — behaviour default content cannot carry; the authored cell is the list an author would type (nested lists are the menus).
  - 🟡 D1 `figure`: single-column, 2-row block holding only prose elements. Justified: the picture floats left of the following paragraphs with a smaller caption; default content has no float.
- `doc/nav.html`: PASS — 0 🔴, 0 🟡
- `doc/footer.html`: PASS — 0 🔴, 0 🟡

`harness --content`: 57 texts, 14 "not in the capture" — all 14 are paragraphs whose words sit inside Business Wire inline elements (`<org>`, `<location>`, `<chron>`, `<person>`, `<money>`) that `content-dump` split out of the parent text (register D7). They were typed from the capture's text (`measure/dom-1440.html`), not from memory; `capture-paragraphs-1440.json` holds the typed list.
