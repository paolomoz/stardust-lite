# REPORT — scotiabank personal (v2.9 method, stardust-lite f2903b1; one agent, autonomous, 2026-10-03)

Page: https://www.scotiabank.com/ca/en/personal.html → `blocks-first--sdt-scotiabank--aemcoder-adobe.aem.page/drafts/personal`.
Setup (eds-new-site 1–9 + init --foundation + branch) 08:51:54 → 08:53:50 = **2 min**. t0 (first instrument on the page) **08:55:30**.

| milestone | UTC | min from t0 |
|---|---|---|
| measure done (3 widths, noise floor, caps, hidden panels, media, fonts) | 09:10:33 | 15 |
| triage table written | 09:21:51 | 26 |
| documents authored + lint clean + previewed | 09:25:54 | 30 |
| first harness prototype served | 09:36:53 | 41 |
| first gate < 10 % at the three widths (round 4: 5.96 / 2.28 / 1.77) | 09:49:53 | 54 |
| code pushed and synced (6f2ceff; sync-poll 1 s) | 10:00:32 | 65 |
| probes pass — cap-probe PASS, motion 11 parity, content 109/109 (round 9) | 10:02:39 | 67 |
| first served gate (1440 2.35 / 2560 1.80 within; 360 7.97 — a pipeline normalisation) | 10:05:07 | 70 |
| final served gate after the spacer-line fix (360 2.84 / 1440 2.35 / 2560 1.80) | 10:12:54 | 77 |

**Final**: prototype 360 **2.63** / 1440 **2.28** / 2560 **1.77** %; served **2.84 / 2.35 / 1.80** %; Δh 7 / 2 / 2 on both; noise floor
0.00 / 0.00 / 0.00; cap-probe PASS (module 1500 + 1140, shell fluid, probe 2560); leak table identical at 360 and 1440; lint 0 🔴.
Rounds: 1 table round (the triage draft's rows were right, only the labels and the two fragments were edited), 11 gate rounds (3 at the
base width, 1 at three widths, 2 at 360, 3 at three widths with probes, 2 at 360 for the served difference). Blocks: `hero` (simple
4 × 1), `cards` with variants `compass` (3 × 3) and `marketing` (6 × 4, six blocks), `tabs` (6 × 3, adopts the following cards blocks),
`header` and `footer` (fragments `/drafts/nav`, `/drafts/footer`).

## What the method got right here

- `measure-page` in one call per width (17 s, parallel) gave every table the rounds used; `deep-probe --children` on ~40 selectors per
  width was the real reading (paddings, flex rules, pseudo-elements, the −48 overlap, the 50 % hero panel).
- Triage before code (step 2) and lint on the authored document found the model clean; the content check named every authored text in
  the dumps (109/109) at every harness run.
- Round discipline: each round changed only what the section table / pair named (round 1: the 513 column, the h2 margin collapsing
  out of the band, the −48 inside a BFC, the `<p><picture>` gap; round 2: the collapsed CTA margins, footer specificity losses; round 3:
  the 360 tab list and compass gaps; round 5: the mobile hero rendition; round 6: the component's bottom padding).
- The served page met the prototype's numbers at 1440/2560 on the first served gate; the 360 gap was a pipeline rule the leak table
  named in one run (−24 on `.cards.marketing`).

## What the document got wrong or left out (→ BACKLOG candidates; NOTES.md has the minutes)

1. **A painted band outside header/main/footer is invisible to step 1.** The 49 px mega-menu bar (`header#header + div.mm--container`,
   10 links, 10 dropdowns, 255 texts) sits between the header element and `main`: `probe-load` listed header/main/footer roots, the
   content dump had no row for it, the first look's `mainKids` started at `main`. Found by deep-probing the 152 → 201 gap. The first look
   should flag any painted box between the header's bottom and main's top (and main's bottom and the footer's top) as an unassigned band,
   and `content-dump` should default its roots to the body's painted children.
2. **The harness fold does not apply two pipeline rules**: a bare leading `<br>` in a paragraph and an empty `<p></p>` are dropped by the
   pipeline (served plain.html) and kept by the fold — the prototype and the served page disagreed by one 24 px line at 360 (7.97 vs
   2.63 %). An inner `&nbsp;<br>` survives and reproduces the source's empty first line. Fold rule + an `author`/lint warning.
3. **The harness needs `serve` running and a metadata `nav`/`footer` row before it fetches fragments**; neither is in its usage line. Two
   crashed runs (no serve dir, no server), one refused md5 (a stale server), one blank header (no `nav` metadata → `/drafts/nav.plain.html`
   404). The harness could mkdir, start serve when nothing answers, and warn when the document names no fragments.
4. **Icon-font glyphs** (icomoon, Font Awesome): `deep-probe` prints `content=""` (BACKLOG #90); the 11 codepoints were read from three
   CSS bundles by grep and the glyphs extracted with fontTools (`scripts/font-glyphs-to-svg.py`, em-box viewBox so the icon's box equals
   the glyph's advance at the font size — the social icons measured 21/21/21/24/27 × 24 as on the source). Promote the script.
5. **`scroll-probe` has no width**: the 360 fixed header's scroll states could not be read (none were needed here — the bar is static).
6. **Hidden tab panels**: `click-dump` returned own-text leaves without inline markup; `content-dump --hidden <panel root>` gave the full
   texts with MARKUP in one run and is the authoring source for panels present in the DOM at rest. `--hidden` is missing from the usage.
7. **`media-fetch` names AEM renditions by the rendition file** (`cq5dam-web-1280-1280.png`, `-1.png`): the asset name before
   `/_jcr_content/renditions/` is the name; four files renamed by hand.
8. **cap-probe compare flakes between runs on one build** (PASS 0/6 in rounds 4, 6, 7, 9 and the served 360; FAIL 3/5 in rounds 5, 8 and
   the first served run): the live split reads 5 or 6 sections (the back-to-top button), shifting the by-index pairing (BACKLOG #162).
9. **`author` cannot draft a template page on an empty inventory** (every section NEW stops it): a default recipe per collection shape
   (hero, cards, tabs, columns) would have drafted this document; the case wrote `scripts/author-personal.mjs` (hero / compass / tabs +
   6 cards / closing / nav with nested titled groups / footer) from the dumps.
10. **Per-instance styles the source cannot author per row**: one of six marketing cards does not stretch to its row (486 of 513), the
    Investments lead is a bold paragraph where the others are h3 — the register carries both (D9, D10); the pair found them in one read.
11. **The pairing's multi-section rows** ("#2 Δh −844", "#4 Δh −4843") come from four 0-height live sections (empty experience fragments)
    folded into one build section with their *spans* summed — the per-section heights were 0; the table should sum heights, not spans,
    when the extra live sections are 0-height.
12. **The stitched capture repeats a fixed header per chunk on both sides** (360): a residual Δh of 7 shows as two offset header copies
    in every chunk (bands 5400/6300 at 360 ≈ 4–6 %) — a property of the capture, not the layout; worth masking or noting in the gate.

Open items cited, not re-solved: #90 (icon fonts), #162 (cap-probe pairing), #13/#5 (not hit), #132 (overlay flags recorded in REGISTER
prose — `site-profile init` reads them from there), #135 (section roots as data: the mega-menu root was found by hand).

## Three-width table (the format `site-profile init` reads)

| width | noise floor | prototype | served |
|---|---|---|---|
| 360 | 0.00 % | 2.63 % | 2.84 % |
| 1440 | 0.00 % | 2.28 % | 2.35 % |
| 2560 | 0.00 % | 1.77 % | 1.80 % |
