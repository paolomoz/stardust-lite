# Case 1 — baincapital.com home (2026-09-29/30), run under v1 of the document

Repo `aemcoder-adobe/sdt-baincapital`, branch `proto`; content `/drafts/home` on da.live, preview only.
Served: https://proto--sdt-baincapital--aemcoder-adobe.aem.page/drafts/home

| | 360 | 1440 | 2560 |
|---|---|---|---|
| prototype (harness page) | 34.6 % · Δh +7 | 27.2 % · Δh −15 | 23.3 % · Δh −37 |
| served page | 34.4 % · Δh +7 | 23.8 % · Δh −15 | 23.6 % · Δh −37 |
| live vs live | – | 1.65 % | – |

Rounds: 6 after the first harness output. cap-probe PASS. Leak table identical prototype/served. Motion-compare: 12 parity, 0 extra;
the 18 "missing" are decided-out overlays/dropdown and renamed classes (mechanisms confirmed by `motion/state-probe.mjs`).

**David's Model lint on the v1 authoring: FAIL — 3 🔴, 5 🟡** (`registers/davids-model-lint.txt`). This is the finding that produced v2:
- 🔴 D1 ×3: Vimeo player URL inside `bain-advantages` rows (a per-card video property).
- 🟡 D3: ragged rows in `bain-hero` (title row), `bain-people` (photo + copy rows), `bain-news` (CTA row).
- 🟡 D10/D3: `bain-presence` with one row per region and 13 office columns.
Not linted but by the rules: hero title and people copy inside blocks (D1), ten `bain-*` blocks with no Block Collection match (D9/D11).

## Triage table the v2 procedure would have produced (step 2)

| section | default content | block | shape | collection match | rows × cols |
|---|---|---|---|---|---|
| hero | h1 | `carousel` variant `tangram` (slides) | container | carousel | 3 × 3 (nav title, copy + link, images) |
| advantages | h2, lede | `bain-advantages` | container | cards (media + text) | 3 × 2 (poster + video link, h3 + p) |
| platform | h2, lede | `bain-platform` | container | tabs | 5 × 3 (name, value p, links) |
| spotlight | h2 | `cards` variant `spotlight` | container | cards | 3 × 2 |
| commitments | h2, lede, bold CTA link, h3 | `tabs` variant `commitments` | container | tabs | 6 × 2 (image, h4 + p + link) |
| people | h2 with em, p, link; `background` in section-metadata | `bain-people` (name tags) | container | — | 2 × 3 |
| news | h2; bold CTA link after the block | `cards` variant `news` | container | cards | 5 × 2 (meta, title link) |
| presence | h2; `map`, `map-wide`, `map-mobile` in section-metadata | `tabs` variant `offices` | container | tabs | 24 × 4 (region, city, address, map link) |

## Files
- `authored/` — v1 documents (`home.html` local media paths, `home.da.html` DA media URLs, nav, footer) and the generator.
- `gates/` — spec JSON per width, cap-probe capture and compares, pixel JSON per width and side, leak tables and selector list, `probes.txt` for `gate.mjs`.
- `motion/` — live/prototype/served observations, compares, deep hover diffs, page-specific probes (hover diff, state probe, tangram, parallax, autoplay, backdrop threshold, map capture) — templates for the next case.
- `registers/` — motion and deviations registers, rounds, lint output.
