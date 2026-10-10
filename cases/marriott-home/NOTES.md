# marriott-home — notes (five-minute loop field run)

## (a) Tool friction (what · minutes · what would have removed it)
- Header inside `<main>`, no `<footer>` element: measure dumped no header / footer root, author wrote no nav / footer, harness exited 4 on the missing nav fragment · ~5.5 min (diagnose + two hand measure-page runs + a `first` re-run) · `first` passing `--header` / `--footer` through to measure-page, and probe-load proposing them (it already saw `header.m-header` pin fixed); splitSections' footer key test (`/^footer\b/`) forced the `'footer, div.footer.aem-GridColumn'` selector hack.
- Port 8990 held by another project's `serve` (cwd /tmp/first-test): harness refused, `first` re-ran · ~1.5 min · `first` picking a free port (or the harness serving on the next free one) instead of refusing.
- The source's header leaves the flow when the search bar pins: every live chunk after the first is shifted up 53 / 112 px, so the dump / spec boxes and the stitched live PNG disagree; the digest's pair rows (dump boxes) pointed the wrong way and I sized cards and the footer from the PNG for two rounds · ~6 min · a gate note when a fixed layer / header collapse changes the document between chunks (probe-load already reports "pin fixed / sticky").
- stitch-shot freezes animations (`animation-play-state: paused`), so a CSS scroll-driven pin does not progress; had to write it as a scroll listener · ~2 min · a note in CHECKLIST (motion: scroll-timeline is frozen in captures).
- spec-to-css wrote the three carousel drafts and the brands grid all under `.carousel` (last one wins) and an accordion draft for the header; drafts were discarded and rewritten scoped by section · ~2 min (part of r1) · per-instance scope (section nth-of-type or a variant) in the draft.
- The hero's art direction (portrait Classic-Ver below 768) was not in the media manifest (only the 1440 rendition fetched) · ~1.5 min · media-fetch collecting every width's rendition of the same picture.

## (b) My own time — the five largest chunks
1. r1 CSS: read the drafts and both screenshots, rewrote header / hero / carousel / styles / footer · ~5.5 min (20:15:51–20:21:33).
2. Section 7 + footer analysis from side-by-sides, the r2 edit (cards, lists, dark band, footer doc) · ~3.5 min.
3. Diagnosing the header-collapse shift and the pinned bar (r3–r5): crops, pixel probes, stitch-shot source · ~3.5 min.
4. Diagnosing the missing nav / footer (first output, author.mjs, splitSections, structure dump, screenshots) · ~2.5 min.
5. 360 residual (r7–r10): hero rendition, veil luminance probes, carousel gradient, member card · ~3 min.

## (c) Per round
- first (79 / 64.8 / 46.8): drafts colliding under one `.carousel`, cards stacked, hero 810 high, nav duplicated in main.
- r1: doc — accordion removed from main (lists → nav.html), search bar as 4 paragraphs; CSS — header, hero, carousel (flex, one / three / two per view), section heights from the spec, member card, section 7, footer. Digest named Δh per section; it did not name the drafts colliding.
- r2: footer doc cleaned, section 7 cards / brands / lists / dark band, hero veil — partly built on the shifted PNG (card 252, s7 1489, footer + black), which the digest's pair rows contradicted.
- r3: scroll-driven pin for the bar — frozen by stitch-shot, no gain (digest: luminance / veil rows only).
- r4: the pin as a scroll listener (`--sy`, `.bar-pinned`) — the live bars appear in the build at the same chunks.
- r5: the header leaves the flow when pinned; spec heights restored (cards square, s7 1482 / 2533, footer 207 / 355); hero picture placed as measured (16:9, top −148 / −176) and text top by width. Big drop (13.5 at 2560).
- r6: `overflow-anchor: none` (scroll anchoring had moved chunk 2 by −112, a black band), hero section background none at 360.
- r7: carousel gradient only at the bottom, h2 max-width (wrap) — found by a luminance probe, not by the digest.
- r8: hero portrait picture below 768 (art direction).
- r9: hero veil at 360, bar height 75.
- r10: veil re-fit by luminance probes, card gradient `calc(100% − 160px)`, hero p max-width, member card padding / label heights → stop.
