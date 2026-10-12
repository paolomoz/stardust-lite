# mfs-home — REPORT (template `home`, site sdt-mfs, branch `blocks-first`)

Source https://www.mfs.com/corporate/en/home.html → prototype http://localhost:8973/home.harness.html → served
https://blocks-first--sdt-mfs--aemcoder-adobe.aem.page/drafts/home (preview only; documents at `/drafts/home`, `/drafts/nav`, `/drafts/footer`,
media under `/drafts/media/`). Method stardust-lite c4a4940. One operator run, 37 min from t0 to the served gate (TIMELINE.md).

## Numbers

| | 360 | 1440 | 2560 (probe) | Δh | cap-probe | motion |
|---|---|---|---|---|---|---|
| noise floor (live vs live, 1440) | — | 0 % | — | 0 | | |
| gate r1 (first three-width gate, after 4 table-only CSS rounds) | 2.23 | 4.54 | 1.36 | 21 / −3 / −3 | PASS 0/4 | 1 parity, 0 missing |
| gate r2 (footer icons fill, cookie item, utility caret) | 1.19 | 4.48 | 1.33 | 5 / −3 / −3 | PASS | parity |
| gate r3 — **prototype** (hero `fit=fill`) | **1.19** | **2.29** | **1.33** | 5 / −3 / −3 | PASS | parity |
| **served** (`/drafts/home`, origin = r3's) | **1.20** | **2.29** | **1.34** | 5 / −3 / −3 | PASS | parity; hover-diff + click-state on the served page |
| leak (27 wrappers, prototype vs served) | | identical (0 differing lines) | | | | |

Hottest bands (r3): 1440 band 1350 4.7 % and 450 3 % — the three insight JPEG renditions and the role-box text (anti-aliasing + the register's
role-link rhythm), no displacement in `crop --vs`; 360 band 2700 2 % — the drawn social glyphs. Section tables: intro 0 / 0 / 0, insights +1 at
the three widths, footer 0 at 1440 / 2560 and −5 at 360; the hero row's +15 / −78 / −78 is the live section root carrying the nav margin
(REGISTER row 1). Stop rule met at r3: every row within 2 px, residuals named.

## Rounds

- table rounds (sections + pair, no gate): r1 hero mobile picture shown at every width (a `picture` type-selector rule outranked the
  class rule — specificity, not a measurement); r2 role name wrap (174), link rhythm, footer link line boxes, nav baseline, 455 → 453;
  r3 footer 360 grid (social overflow row, 50 % columns); r4 footer grid `minmax(0, 1fr)`.
- gate rounds: r1 → r2 (icons fill, cookie centring, utility caret + uppercase), r2 → r3 (hero image fill). Three gates, one served gate.

## What this page taught

1. **A hero inside `<header>`.** The AEM Sites template puts the hero banner in the header parsys: the default `--header header` of every
   instrument would have measured a 1041 px chrome and `main > .section` would have missed the hero. Two `probe-structure` runs found it;
   the first look could flag a `header` taller than the viewport (or list its children with heights).
2. **Triage/author read the dump's collapsed classes, not the DOM's.** `--sections` selectors are matched against the content dump, which
   collapses single-child wrappers (`.aem-wrap--rich-text.section` → `.rich-text`), so the selector `measure-page` took is not the one
   `triage` takes; and a chrome node inside the same root (the utility bar's `.container-content-full-width`) matched the asset list's only
   class. The run pruned the header's chrome nodes out of a copy of the dump (`content-1440-main.json`) so the split was 3 = 3 (BACKLOG #135).
3. **One section, two blocks.** The triage row names one block; `--draft-new` drafted the cards and left the hero as default content, and
   the hero's second rendition came from the 360 dump by hand. A row that names `hero + cards (roles)` (or a recipe `defaultContentBefore:
   ['hero']`) would have made the draft the document.
4. **`fit=fill` is a measurement.** The hero image is stretched (1600×400 → 1440×400); `object-fit: cover` cost 7 % in the top band for
   two gates. The spec prints `fit=fill` per image — the brief could repeat it next to the media line.
5. **Fixed chrome repeats in every capture chunk** (both sides alike): the live header appears three times in `live-1440.png`; the gate
   is blind to it as long as the build's bars are fixed with the same heights.

## Blocks written (shapes)

| block | shape | authoring | CSS values from |
|---|---|---|---|
| `hero` | simple 1 × 1 — desktop picture, mobile picture, h1, h2 | `doc/home.html` | spec img rows, `.header-text-container`, stripe extent |
| `cards.roles` | container 3 × 2 — [name p, description p] [“Take me to:” p, list] | `doc/home.html` | `.role-box*` deep-probe at 360 / 1440 / 2560, pair |
| `cards.insights` | container 3 × 2 — [linked picture] [title link] | `doc/home.html` | `.col-lg-4` / `.image-container`, pair |
| `header` | fragment: brand, sections list, tools list (icon token, bold link = button) | `doc/nav.html` | `.utilityNav*`, `.navHeader*` deep-probe, hover-diff |
| `footer` | fragment: brand, three lists, social list (icon tokens); section 2 disclosure | `doc/footer.html` | `.footer-global*` deep-probe --children at 360 / 1440 / 2560 |

Foundation: `styles/styles.css` (module cap 1800 with the gutter inside — 48 / 24 —, tokens, three section styles), `styles/fonts.css`
(five faces at 400, bytes in `/fonts`), `scripts/scripts.js` (+ `decorateIconTokens` / `inlineIcons`), `icons/` (7 drawn SVGs).
`migration/site.json` (site-profile init) and `migration/blocks.json` (block-inventory scan) written at the end.
