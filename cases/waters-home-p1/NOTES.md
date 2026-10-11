# waters-home — notes

## (a) tool friction (what, minutes, what would have removed it)
- DA turned the nav's brand `<img src=….svg>` into `about:error`: the logo was missing in the harness and would be on the served page. 1 min. Workaround: `:waters-logo:` icon token in nav.html + `icons/waters-logo.svg` (copied from media). Fix: author writes an SVG logo as an icon token, or da-put uploads the SVG before the nav.
- `author` leaked junk text into the documents: inline-SVG `<style>` text (`.st0{fill:none;…}`) as paragraphs/list text in the page and the nav, `:layer-1:` icon tokens (404 icons), and the video poster as a bare `Video` link. 1.5 min to find and strip. Fix: drop `<style>` text and SVG-id tokens in the content dump; write the poster image from media (it was in `media/`).
- `author` wrote the "Shop Online" plain link list as a 9-row `accordion` and the 4 icon tiles as an `accordion`; triage named both `accordion (?)`. Reauthored the list as `<ul>` (0.5 min); kept the tile accordion and styled it as tiles.
- `sections-draft.css` was unusable: a "page cap 608 / calc(60.714vw - 266px)" from a misread content column, section paddings of 0, and rules aimed at a one-column model while #2/#3 sit side by side at 1440. Dropped its import and wrote the section CSS from the cards. 0.5 min to decide. Fix: the cap from the widest repeated container (1266 at x66), not the narrowest text column.
- Live sections #2 and #3 share y1370 (two halves of one row): the split is right but nothing in the drafts says "these two are side by side" — had to read it off the sbs image. Fix: a "same row as #n" flag in the card / digest.
- cards.js classes the streamline title row's text cell `cards-card-body` like a card's, so a card-body width rule wrapped the title (cost one rule in r2).
- The harness port was 8993 (PROMPT says 8990); used the printed command. 0 min.

## (b) own time — the five largest non-tool chunks
1. Reading the first round (sbs 1440 / 360 / 2560, doc, all drafts, header/footer JS): ~3.5 min (21:29:52–21:33:20).
2. Reading the six cards + live header/footer crops + pixel colour samples (teal rule, footer bg, header rules): ~3 min.
3. Writing styles.css (hero box, news grid, the two floated halves, shop panel with drawn inputs, streamline, tiles, quote): ~2 min.
4. Writing cards / accordion / columns / header / footer CSS: ~2 min.
5. Reading r1's 1440 sbs and choosing the r2 fixes: ~0.7 min.

## (c) per round
- r1 (all sections at once, from the cards): hero as an image under a blue box drawn with `::before`; news as a 872 + 277 grid with the BD bar spanning; #2 / #3 floated side by side at ≥651; shop panel as a 619×470 paint, tiles absolutely placed at +322, Quick Order inputs drawn as pseudo-boxes; streamline title bar 66 + three 312-pitch steps + Learn More placed at +1024; tiles 4×277; quote with a 1px #14abb3 rule; header (locale bar, logo, search box drawn, tools, link row) and footer (6-column grid, legal bar) from the live crops. Digest named every section; 360 went under 10 % in one round.
- r2: the digest named #0 (dy -8, a veil) and #4 / #1 heights; the sbs showed the real cause of #0: the live hero starts 32 px below the 171 header → `main { padding-top: 32px }` at ≥651. Also: hero `object-position 50% 58%` (live crop sits lower), news paint +28 (live third card title wraps its external-link icon to a third line), streamline title cell excluded from the card-body width (175 wide), footer links 16px/20.8 (live wraps measured off the crop). → stop.
