# okta-home — notes

## (a) Tool friction (what · minutes · what would have removed it)
- Cached origin bakes the Ollie chat widget + repeated sticky nav into every live tile; the stop line is unreachable at 360/1440 · ~8 min
  (diagnosing + overlay scripts + a failed fresh capture) · `measure` should dismiss known chat hosts (`#q-messenger-frame`,
  `#qualified-multimodal-host`) or the gate should report a per-tile overlay floor.
- `author` draft model was unusable: carousel slides with empty text cells and the text outside the block, the platform cards missing
  entirely, the leader h2 split across sections · ~6 min to re-author by hand · triage/author should keep a slide's text inside its row and
  keep cards whose text is in the capture.
- `sections-draft.css` selectors `main .section:nth-of-type(n)` out-rank `main > .section` in styles.css (the PROMPT says styles.css wins a
  tie — it is not a tie) · ~3 min (r1 Δh +112/+256) · emit `main > .section:nth-of-type(n)` or `:where()`.
- The harness port is 9001, not the 8990 in PROMPT.md · <1 min · keep PROMPT in sync with `first`'s printed command.
- Background pictures inside `<p>` collapse (picture is inline; img height 100 % of nothing) · ~2 min · the foundation could set
  `picture { display:block }` for cover cells.
- `first` authored `desktop-…-platforms-oci` but the 1440 capture shows `…-owi`; mobile card backgrounds (CSS custom properties) were not
  fetched by media · ~3 min · media-fetch should read `--bg-mobile` style variables.
- Header fragment: the harness re-uploads nav/footer every run ("changed locally") even when unchanged · seconds · compare normalised HTML.

## (b) My own time (largest non-tool chunks)
1. Re-modelling the document + writing all block CSS for r1 from the spec dump — ~7 min (00:00:44 → 00:06:29).
2. Reading the spec item dumps (1440 + 360) and the first sbs tiles — ~4 min.
3. Overlay diagnosis (scripts, DOM search for the widget, fresh-capture attempt) — ~5 min.
4. Header + footer CSS (nav doc rewrite, pills, footer grid) — ~3 min.
5. Viewing section-view crops and deciding per round — ~5 min across r3–r12.

## (c) Per round
- r1: whole-page rewrite (doc + carousel/hero/columns/cards CSS) — the digest named every section (55 %, structure wrong).
- r2: Δh +112/+256 named on #0/#8 → sections-draft specificity (dropped the import); hero box full-bleed → capped; header pills.
- r3: #1 Δh −64 named → hero section margin; bg pictures cut (not named, seen in sbs).
- r4: #6/#7/#9 Δh named → leader 360 padding, tabs border, disclaimer padding; closer gradient covered only the h2 (seen in section-view).
- r5: #0/#5 at 360 named (pixels, Δh 0) → mobile renditions.
- r6: #5 at 1440 named → the video; the sticky nav came from the sbs (the digest does not name chrome repeats).
- r7: 2560 caps (seen in sbs-2560, digest silent at 2560 since under 10 % later); #2 at 360 named → mobile card pictures.
- r8–r12: small rows (#0 tabs, logos grey, footer — footer is not in the digest, found via band 5400 at 20 %), leader gap.
