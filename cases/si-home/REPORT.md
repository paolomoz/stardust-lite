# REPORT — si-home (https://www.si.edu/, template `home`)

Site repo `aemcoder-adobe/sdt-si`, branch `blocks-first`, stardust-lite `35f9b73`. Served draft (preview only):
https://blocks-first--sdt-si--aemcoder-adobe.aem.page/drafts/si-home

## Numbers

| | 360 | 1440 | 2560 |
|---|---|---|---|
| prototype (final, r10) pixel % | 27.76 | 3.44 | 4.51 |
| prototype Δdoc | −90 | +3 | +3 |
| served pixel % | 27.76 | 3.44 | 4.51 |
| served Δdoc | −90 | +3 | +3 |
| first gate (r1, three widths) | 39.15 | 19.52 | 28.66 |

leak (16 selectors) prototype vs served: 0 differing lines. cap-probe: FAIL at 2560 (6 of 7 rows — the live split counts the hidden
`<header>` page title and the unassigned hero band; #162: compare the rows, not the verdict). Motion: 0 parity / 9 missing / 0 out of tolerance.

Clock (minutes from t0 = 07:02:02): first prototype 17.3 · 1440 < 10 % 27.6 (r4) · 1440 + 2560 < 10 % 32.1 (r6) · three widths < 10 %
never (360) · `stop:` never · probes ran 50.9 · served gate 56.7 · leak 57.2. Setup 1.9 min. Instruments ran 1499 s of the 57.3 min (44 %).

## What the method / tools got wrong or left out on this page

1. `measure-page --sections` guessed `article > div > *` (6 sections); the page title is a `<header>` element, so the header selector
   matched it twice and the spec's chrome rows (#1–#5) are page-title duplicates; `spec-to-css` paired drafts by order and every draft
   was one section off (the "cards navigation" draft carried the intro's values). 0 drafts used as written.
2. The hero (an unassigned band outside `main`) is a dump root but not a spec section: no spec row, no draft, `css-lint` flags its
   measured 48 px title as "no spec row"; values came from content-view.
3. `triage --from-md` cannot drop a row and `author` refuses a triage whose row count differs from the dump split (rc 1): the skip links,
   the duplicate hero and an empty hr row were authored, then removed by `scripts/fix-doc.py`.
4. `author --draft-new`: icon text leaks into link text (`Art & Design arrow-right`), a leading space inside every link, `&amp;amp;` in
   query strings, a trailing space inside `<em>Smithsonian </em>` trimmed without moving it out (`Smithsonianmagazine`), a two-column text
   section authored as head + a one-row columns, the membership callout as four default-content paragraphs; nav doc kept the Donate link
   only (#205 open part), footer doc printed the social icon names into the link texts.
5. `media-fetch --fonts` named the four Typekit files `l.woff2` (last path segment) — three faces overwritten; fetched by a case script.
6. The stitcher freezes motion after a fast settle: cards with a scroll entrance below the settled region are captured faded (half the
   360 page). `measure-page` noted "63 spec items read inside an entrance state" and a 5.74 % noise floor but no instrument offers a slow
   scroll before the freeze; `scripts/origin-capture.mjs` did.
7. `gate --round` ignores `--widths` (the first gate measured 1440 only); `gate --origin <dir>` loses to the out dir's cached origin; the
   round digest's section table reads a fresh live load while the pixels read the cached origin (r3: Δdoc −603 in the table, −3 in pixels).
8. The foundation `footer.js` names its inner div `.footer`, which matches the reset's `footer .footer { visibility: hidden }` — an
   invisible footer in r1 (takeda hit the padding twin of this).
9. `decorateButtons` (boilerplate) skips any link holding an `<img>` — after `decorateIcons` every link with an `:icon:` token: three
   buttons were plain links in r1.
