# Notes — rbc-home field run

## (a) Tool friction (one line each: what · minutes · what would have removed it)
- `author` drafted sections 2–5 badly: the 3-panel band became loose default content + a `cards` of chevron icons as pictures (each a 300 px chevron), the careers/community band a `cards` of chevron pictures, the about and operations bands `carousel` with the accordion items and the six operation items missing (digest: MISSING rows) · ~4 min to re-author by hand · treat a list-marker SVG (ui-chevron-*) as decoration, not a card picture; a 3-callout band (`[(h2 [picture a p]…)]×3`) is one cards row per callout.
- nav document lacked the main nav (Our Company…Insights), the logo, search / Contact / EN; the footer document carried each chevron as a picture paragraph and the social icons as `:facebook:` + "Learn more" pairs · ~2 min · keep the sub-header link row and drop list-marker images in the chrome draft.
- spec-to-css drafts were tied to the drafted DOM (`main .section:nth-of-type(n)` + wrong blocks), so after re-authoring none of them applied; sections-draft.css import removed and the page rules written in styles.css · ~1 min · drafts keyed by section style rather than nth-of-type would survive a re-author.
- EDS `decorateButtons` strips `<strong>` (p.button-wrapper > a.button), so `strong a` selectors missed at r1 (unstyled buttons) · ~0.5 min · a one-line hint in the cards (the drafted control rule already used a.button, I did not).
- harness "text not in the capture" warned on the news items because a `<br>` + date joins the li text — noise, no cost.

## (b) My own time (five largest non-tool chunks)
1. Re-authoring rbc-home.html, nav.html, footer.html (model decisions + writing) — ~3 min (21:15–21:18).
2. Writing styles.css / columns.css / cards.css / header.css / footer.css from the card values — ~3 min (21:16–21:19, overlapped with 1).
3. Reading the first digest, the side-by-side and the cards (0–4) + content-1440 text rows for the missing items — ~1.5 min.
4. r1 → r2: reading 360 tiles, fixing the button selectors, news link colour, operations h3 at 360 — ~1 min.
5. r2 → r3: grey section top padding at 360, callouts third column width (margin inside a 370 track shrank it to 340 → an extra wrapped line), tab row alignment — ~0.6 min.

## (c) Per round
- before r1 (after `first`): document re-modelled (banner columns; grey 3-panel cards; callouts columns image|careers|community; about = h1 + list + 2 article cards in a two-column section; operations = h2 + tab list + 6 icon cards), nav/footer rewritten, all CSS written from the cards. The digest named Δh in every section and the MISSING rows; it could not say "wrong model", I read that off sbs-1440.
- r2: buttons (a.button), news/learn-more link colour, 360 operations heading 18/27, select row h3 margins at 360. The digest named "Visit My Money Matters" at 360 (165×19 vs 330×56) — that row pointed straight at the button. 360 went up (10.91 → 16.39) because fixing the hero's −52 exposed section 2's +45 below it (the offset no longer cancelled).
- r3: grey section padding-top 0 at 360 (digest: "Where We Operate" +30), select row gaps, careers/community bottom padding at 360, callouts column 3 track 400 (digest at 1440: careers Δh +26 — the community paragraph wrapped one line more), tab row left-aligned at 360 (digest: Canada x15 vs 76). All named by the digest rows.
