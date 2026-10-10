# deloitte-home — notes

## (a) Tool friction (what · minutes · what would have removed it)
- The auto section guess picked a sub-grid (2 sections, footer as content) · 2.5 · `first` falling back to the children of the body grid that holds `#maincontent` (AEM: `.bodyresponsivegridcontainer > .aem-Grid > div`) before a grid-depth guess.
- With the explicit split, the header (inside `.breadcrumb-language-container`) was triaged as an `accordion` section, and every spec-to-css `nth-of-type` was then off by one · 3 · triage recognising a section that contains `header`/`.cmp-header` as chrome; spec-to-css indexing the authored sections, not the live rows.
- Marking that row as `header` in triage.md did nothing: `triage --from-md` did not set `chrome`, and `first --skip …,triage` ran triage again and overwrote triage.json · 2 (plus one 71 s `first`) · a triage.md "chrome"/"drop" verb that `author` honours; `--skip triage` doing what it says.
- An empty block (the video `embed`, no URL in the capture) and the nav's empty brand section were dropped by the harness fold (no text and no img), silently. The gate then paired the hero with live hero+video, and the nav brand slot got the link list · 3 · `author` writing a placeholder row for a media-only section, and the harness warning "section N dropped (empty)".
- The harness serves the nav from `proto/drafts/nav.plain.html` and does not regenerate it from `doc/nav.html` · 1 · rebuild the fragments from doc/ when there's no `--fragments`.
- The spec-to-css draft centred the title bars (`max-width: 110px; margin: 0 auto` from the text width) when they are left-aligned at the cap · 0.5 · a short single-line default-content row should get the cap with text-align, not a max-width.
- A served gate without `--triage` reports 21 rows "off" (the live split is 8, the build 9), although its pixel numbers match the prototype · 0.5 · use the triage by default when it's next to `--origin`.

## (b) My own time (non-tool, t0 → stop ≈ 13.6 min)
1. Writing the global and seven block CSS files from the spec: ~4.5 min
2. Reading the spec dumps at 1440 / 360 / 2560 (a compact printer script): ~3 min
3. Finding out why the header row stayed and the video section and nav brand disappeared, then hand-editing doc and nav: ~3 min
4. Diagnosing the split (structure dump, DOM outline) and editing triage: ~1.5 min
5. Round-3 diagnosis (side-by-side, build boxes, live video luminance profile) and edits: ~1.4 min

## (c) Rounds
- r1: hand-edited the document (removed the header row, careers as `columns`, a video `embed` placeholder, nav logo). Then wrote all the CSS from the spec: title bars, hero, cards (4-up, then stacked), carousel (first slide only, 41.5/58.5 grid), columns, header, footer. The digest named the right sections but not the cause, which was a dropped section. The gate's "live y 948–1848 located in no authored section" line was the clue.
- r2: harness rebuilt (the video section is back). The big drop is from the pairing being right.
- r3: what the digest and side-by-side named. Hero under the header (live: a fixed hero at y0, a 48 px white strip), careers image 50 % (664, not 636), carousel text 79.5 % of its column, card title and description clamps (the live dot-ellipsis, desc ≤ 80), and the video stand-in gradient fitted to the live first-frame luminance per width.
