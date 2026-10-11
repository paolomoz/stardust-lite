# rbc-home — notes

## (a) tool friction
- `author` modelled the page poorly (~2.5 min to rewrite the document by hand): the three callouts (Where We Operate / Investor Day /
  Latest News) became default content + a 3-row `cards` of the news items with the chevron SVG as each card's image (rendered at intrinsic
  width: the build +8000 px at 1440, 94 % on that section); the Careers + Community pair became default content + two `cards` of chevrons;
  the About RBC accordion + article cards and the Operations tabs + icon grid both became `carousel`, the operation icons lost (`:40:`
  placeholders), and an article picture authored as `https://www.rbc.com/undefined` (the live src is literally `undefined`). Would remove it:
  author never takes an inline chevron/arrow glyph (< 16 px rendered) as a card image — it is link decoration; a `button`-controlled
  panel group is tabs/accordion, not a carousel; icons in media/ authored as pictures, not `:name:` placeholders.
- nav / footer documents (~1.5 min to rewrite): the nav brand is the text "RBC" (rbc-logo-shield.svg fetched but not used), the main link
  row (Our Company … Insights) and the tools (search, Contact Us, EN) missing, the tophat country row in nav-sections with "You are in:" in
  a link; the footer chevrons authored as their own paragraphs and the social links as `:facebook:` + "Learn more". Would remove it: chrome
  author keeps the header's link rows by row (tophat / tools / main), the first svg/img in the header as the brand, decorative chevrons dropped.
- `sbs-360.png` is a 372 px wide thumbnail of the whole page (6079 tall) — unreadable at 360; composed my own live | build crops with PIL
  twice (~1 min). Would remove it: sbs per width at 1:1, split into ~2000 px tiles.
- Decoration rewrites a lone `strong > a` into `a.button.primary` (strong removed) — my `strong > a` selectors missed the hero / Go
  buttons in r1 (the digest named it: "Visit My Money Matters [..328,56] vs [..165,19]"), ~0.5 min. Would remove it: the drafts name the
  decorated selector (`a.button.primary`) in their comment.
- Draft page cap said 1128; the measured content edges (cards 135..1305) are 1170 — used 1170.
- Live capture: fine. The first About RBC article card is blank on the live page (img src "undefined") — reproduced as an empty cell.

## (b) own time (non-tool, t0 → stop ≈ 11.5 min)
1. Writing the CSS in one pass (styles.css, columns, cards, header, footer): ~4 min.
2. Rewriting the page, nav and footer documents (python heredoc): ~2.5 min.
3. Reading round 0 (digest, sbs, live crops at 1440 / 360, colour samples): ~2 min.
4. Round reviews at 360 (composed crops, deciding r2 / r3 offsets): ~2 min.
5. Checking the decorated button DOM in proto/rbc-home.html: ~0.5 min.

## (c) per round
- r0 → r1: one pass on everything (document re-model, chrome docs, all CSS). 1440 / 2560 under 10 % from r1 on (8.4 / 6.1).
- r2 (360 only): hero picture panel (background on the picture cell, picture first), card paddings 15, careers h2 18/27, empty article
  image cell 150, tab sizes, `a.button` selectors. 360 went UP to 21.3: the hero section padding-bottom 54 pushed every later section
  +30 (the grey band starts inside the live hero section) — the digest's Δy column named it (+30, +105, +158).
- r3: hero padding 24, About RBC h1 / gaps 15, ops tabs gaps, footer link weight 300 + 360 legal bar rule. 13.4 %; digest named
  "Where We Operate" Δh +95 with the Select-a-Region row.
- r4: Select-a-Region h3 line-height 19 / margins, select p margin 0, card paragraph gaps 15, bottom link padding 14 → 7.55 % stop.
  The digest named exactly that row (Δh +95 → +25).
