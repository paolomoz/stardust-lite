# equitable-home — notes

## (a) tool friction (what · minutes · what would have removed it)
- `first` guessed the section selector `div#container-ea0d388465 > *` (2 sections: all of main + the footer XF) · 2.5 (re-run 71 s + DOM spelunking) · prefer the children of main's single wrapper (`main > div.cmp-container > *`, 8 sections) over an ancestor of main.
- The footer experience fragment (a sibling of main inside the root container) became two content rows (#1, #2); `footer` in the triage block column only drops the row — `doc/footer.html` stays `<div></div>` · 2 (footer doc authored by hand from content-1440.json) · author the row marked `footer` into footer.html (lists → ul, paragraphs, the disclaimer).
- nav.html: brand and tools sections empty, "Sign in" (no href) put as a bare li in the links list, "Careers opens in a new tab" kept the screen-reader text · 1 · split the header capture into brand / sections / tools; drop `.cmp-link__screen-reader-only` text.
- Specificity / order traps: the sections-draft writes section padding as `:where(...)` (specificity 0), which loses to the foundation's own `main > .section { padding-bottom: var(--section-gap) }` (hero lost 252 px, announcement 36 px — r1 → r2), and rules put ABOVE the mark lose to same-specificity draft rules BELOW it (mobile h3 / h1 font-size, section 4 / 5 padding — r2 → r3) · 2 rounds (≈ 1.5 min) · emit the draft above the author's rules or drop `main > .section` padding from the foundation when a draft exists; the protocol's "put your rules ABOVE the mark" needs "with higher specificity".
- triage label `hero` on row 4 was ignored (author still emitted `columns`) · 0.3 · honour a known block name or warn.
- New block `feedback` without a CSS file → harness 404 + "failed to load block" · 0.2 · scaffold an empty block CSS / JS for a NEW block named in triage.
- Each `first` started a new serve port (8993 → 8994 → 8995) and left the previous servers running · 0.3 · reuse the port the case already serves on.
- The harness re-uploads an edited nav / footer but not the edited page document → served page needs a manual `da-put` · 0.3 (after the clock) · re-upload the page doc too, or say so.
- The round digest's #0 row kept pairing against the stale automatic live split (live 193–2155, Δh -1601) after the selector changed · 0 (ignored) · rebuild the live split when `--sections` changes.

## (b) my own time (five largest non-tool chunks)
1. 4.9 min (23:27:44 → 23:32:38): reading content-1440/360.json and spec rows for header, announcement, hero, video, feedback, footer; writing nav.html, footer.html, the feedback block, styles.css, header.css, footer.css in one pass.
2. 0.7 min: side-by-side view after `first-sections`, deciding the triage edits (footer / drop / hero / default).
3. 0.5 min: r1 diagnosis (side-by-side at 1440: hero short, GE stamp wrapping).
4. 0.4 min: DOM skeleton of `#container-33b6ce21a1` to find the right selector.
5. 0.3 min: r2 diagnosis at 360 (draft rules winning over mine).

## (c) per round
- r1 (after harness): whole first CSS pass — chrome (header 76 / 194, footer grid 320 | 320 | 1fr, 297 row, hr, disclaimer), hero cover image + title, vimeo 16:9 blank box, transcript clamp + toggle, feedback grid 784 | 1fr | 184, page cap 1370 / 1920 at 2560. Digest named every section; the chrome was not in the digest (judged as chrome) but was most of the pixels.
- r2: removed `main > .section { padding-bottom }` (zeroed the drafts' :where paddings), hero title column 760, GE stamp nowrap. The digest named #0 / #1 heights (Δh) — the cause (a specificity-0 draft rule losing) was not named.
- r3: 360 h3 / h1 sizes and sections 4 / 5 / 1 paddings raised above the draft's specificity. Digest named #0 Δh, #3 / #4 positions and #5 — correct sections, not the cause.
