# LINT — si-home

`davids-model-lint` on `doc/` (si-home.html, nav.html, footer.html), run at triage time (07:12) and at close: **PASS — 0 🔴, 2 🟡**.

| rule | file | finding | decision |
|---|---|---|---|
| 🟡 D4 | nav.html | authored SVG `drafts/media/logo.svg` | verified pure vector (0 `data:image` in the file); preview 200 |
| 🟡 D4 | footer.html | authored SVG `drafts/media/logo-secondary-white.svg` | verified pure vector (0 `data:image`); preview 200 |

`css-lint .` (css-lint.txt): 7 findings left, all read as false positives — the "specificity inversion" rule compares selectors that never
match the same element (`.carousel .carousel-arrows .icon` vs `.carousel .carousel-slide-content h2 .icon`; `header nav .nav-extra-3 a`
vs `header nav .nav-tools ul a`; `.carousel .carousel-slide-content` vs `main > .section.carousel-container > div`), the hero title's
48px has no spec row because the hero band is an unassigned root the spec does not measure (content-view: `h2.c-slideshow__title 48px/60px 700`),
and `main > :where(.section) > div` is the cap rule itself. The 12 foundation-reach findings of the first run were fixed with `:where()`;
the `footer .footer` block-element finding was fixed (inner `.footer > .footer`).
