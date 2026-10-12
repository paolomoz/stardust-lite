# bankofamerica-home — notes

## (a) Tool friction
- `first` triage / author: masthead + sign-in + offers in one `cards` block with doubled responsive strings, empty rows, goal tiles as loose
  paragraphs; spec-to-css applied the hero "picture as background, absolute inset 0" rule to every picture in the section (build 11321 px vs
  4069). ≈ 10 min to re-model the document and nav by hand. Would remove it: author splitting a container section at its unit boundaries
  (login / heading / offer ×4) and de-duplicating visually-hidden responsive twins; the background rule scoped to the first picture only.
- `first` nav document: no logo, no menu row (only "Bankofamerica" text, the top links, "search icon"). ≈ 1 min. Would remove it: the
  logo from media (it was downloaded: logo-bofa-flagscape) and the header's second list.
- FDIC strip above the header classified as a main `columns` section while the gate's live split counts it in the header range. ≈ 1 min
  (absolute-position workaround). Would remove it: a "pre-header strip" verdict in triage → nav document section.
- PROMPT says harness port 8990; `first` served on 8999. 0 min (used the printed command). Would remove it: one port in PROMPT.md.
- Harness content check uses content-1440 only → 360-only strings reported as "typed from memory". 0.5 min. Would remove it: check against
  content-360 too.
- Gate digest at 360, round 3–4: section #2 Δh -113 / +58 named only the offset rows at its top, not the tile stride that caused it;
  section-view + my own contact sheet to see it. ≈ 2 min. Would remove it: a per-unit stride row (live vs build) in the digest.

## (b) Own time (non-tool, ≈ 16.5 min)
1. Reading `first`'s output, cards #0–#3, sbs tiles, the doc and the drafts; deciding to re-model — ≈ 5 min.
2. Writing the re-modelled document + nav (python generator) — ≈ 3 min.
3. Writing styles.css + hero.css — ≈ 2.5 min.
4. Writing cards / columns / header / footer CSS — ≈ 2 min.
5. 360 diagnosis after r2–r4 (contact sheets, section-view, tile stride) — ≈ 2.5 min.

## (c) Per round
- r1 (after re-model): new document, nav and every block CSS from the cards' measured values and the live crops. Digest named every
  section (all over), Δh from +786…+3289 to within ±127.
- r2: 1440 #2 Δh +62 (named) → goals h2 margin 90→40, button line box; #3 (named) → news h2 / row paddings, row-2 background fill,
  phone offset; 360 hero background height + image no-shrink (seen in my crop, digest named #1 Δh -23); 360 super phone overlay,
  goals overlay layout (seen in crop; digest named #2 only by Δh); footer lines (not named — footer is not in the digest rows).
- r3: 360 #1 card offset (named: link rows -8) and quick-links height; #2 tile spacing / icon heights / goals gap (digest named Δh only);
  #3 p line-height 28 (named: p 112 vs 96) and h2 padding (named).
- r4: tile stride over-corrected (+58 → -39); super padding wrongly reduced (the -8 in the r3 row was the offset from #1, already fixed).
- r5: super padding back to 40, tile stride +32; footer table rows 28 px vertical padding at 360 (found by section-view footer, the
  digest does not cover the footer) → 9.75 %, stop.
