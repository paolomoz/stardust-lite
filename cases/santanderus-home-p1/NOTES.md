# NOTES — santanderus-home field run (t0 20:24:20Z, stop 20:33:07Z, 8:47)

## (a) Tool friction (what · minutes · what would have removed it)
- nav document from the chrome was unusable (brand as text instead of the logo image in media/, nav links as plain-text li, tophat items mixed with nav items, the welcome banner absent) · 1.5 · author the nav from the header's structure rows (logo img → brand, link row → sections, tophat → tools) and include absolute layers that live inside the fixed header.
- the hero's three 150×150 thumbnails were authored as loose default content and the carousel rows' image cell left empty · 1 · pair a repeating unit's picture with its row in `author`.
- spec-to-css drafts had to be rewritten rather than edited: the hero draft set a section background-image AND kept the inline picture (double image); carousel text rules on bare `div` (every cell) and 80 px card padding; `.columns` rules unscoped; footer `div { font: 700 20px }` on every div · 2 · scope drafts to text cells and choose one picture strategy.
- the live 1440/2560 captures repeat the fixed header + welcome banner in every viewport chunk; only a one-line note in the measure output, I had to read structure-1440.txt to see the banner is a child of header.c-header · 1 · the card for #0 / the header row should say "the banner is in the fixed layer: author it in the nav".
- `first` downloads fonts/*.woff2 but leaves them untracked; the first push missed them (caught by git status before the served gate) · 0.5 · `first` should git-add fonts or print a warning.
- digest pair rows at 360 report preheading boxes as x −84 (padding inside the build box vs the text box live) — noise rows, not defects · 0.3 · compare text boxes on both sides.

## (b) My own time (five largest non-tool chunks)
1. Reading `first` output, the 1440/360 side-by-sides, card 0, triage.md and the authored doc — ≈ 2 min.
2. Reading structure-1440/360 + footer crops and deciding the layout model (fixed header layer, module cap 1200/16, preheading rule) — ≈ 1.5 min.
3. Writing page + hero + purpose + about + news CSS (styles.css, carousel.css, columns.css) — ≈ 1.5 min.
4. Writing header + footer CSS and the nav rewrite — ≈ 1.2 min.
5. r1 → r2: two section-views (#0, #3), the fixes — ≈ 1.4 min.

## (c) Per round
- r1 (after harness re-run): wrote all sections from the cards + structure rows: header fixed (tophat 30 + bar 72; 73 at 360) with the welcome banner absolute inside it; hero h795/600, text +350/+120, card 487×152 right/bottom 50; purpose 568 centred; about 30 % white | red (360: 94 px white); news #f5f9fb band 446/523, 497|430 grid, 3×367 cards; footer two columns + legal row. The digest named every section by Δh (+747 hero, +451 about) — all were "unstyled", so one pass covered them. 52 % → 12.4 %.
- r2: the digest named hero (luminance ratio 0.66 at 360 — "veil") and news Δh +12. section-view showed the hero picture not filling (picture element not height 100 %, not a veil) and the banner type 13 px vs measured 16 px; news cards 13 px low (header gap 88 → 75), 360 card image 172 → 192 (the date row −20 in the pair rows), link row black/400 with red arrow. 12.4 % → 5.65 / 3.05 / 4.10 — stop.
