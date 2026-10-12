# toryburch-home — notes

## (a) tool friction
- Overlays not found at t0: probe-load profiled only the OneTrust consent; the geo **locale popup** (#locale-popup, a fixed bottom sheet) was stitched into the page as a section, and after hiding it the **welcome-email layover** (#layover-modal / mobile-sheet) opened and was measured as content (11 sections, duplicated rows). 2 extra `first` runs + diagnosis ≈ 9 min. Would have removed it: probe-load listing every `role=dialog` / fixed layer > 30 % of the viewport after consent, at every width, as `hide` candidates.
- Gate live capture cached across a site.json overlay change (first-2 compared against the popup capture) — `rm -rf measure gate` by hand, ≈ 1 min. Would have removed it: key the live cache on the overlay profile.
- Hero video not frozen at t = 0 in the live capture: the frames were t ≈ 2.58 s (1440), 0.62 s (2560), 2.09 s (360). `video-frame.mjs` took the first `<video>` (hidden at 360 → "no video"; at 1440 it reported `paused:false t 3.54` with the layover over it). Wrote `scripts/case/hero-frames.mjs` (visible video, seek sweep, modals hidden) + a python frame match, ≈ 4 min. Would have removed it: stitch-shot freezing every visible `<video>` at t = 0 (BACKLOG #33 sibling), video-frame picking the visible video and honouring site.json `hide`.
- Source images on s7.toryburch.com return an HTML bot page to plain curl; need a browser UA + `Accept: image/jpeg` (else AVIF). ≈ 1 min.
- The authored nav document was nearly empty (skip link, an empty `li`, `:heart:`, `:user:`, `:bag:` icons with no svg) — rewrote `doc/nav.html` by hand (4 sections) and previewed it, ≈ 1.5 min.
- spec-to-css drafts: `#322d2d` section backgrounds on the hero and Bunny Knot sections (the banner's own paint under the image, not the section's); columns draft put `min-height` / flex on the block itself; carousel draft a 6-col grid for a 5-up slider. Rewritten, ≈ 0 extra rounds but read time.
- gate cap-probe on the served pass flags "content cap 280px at 2560" (module caps 280/444 px — likely text measure inside tiles): not a real cap; registered.

## (b) own time (non-tool), five largest
1. 21:45 → 21:55, ≈ 9.8 min — reading spec-360/1440/2560 (≈ 3.5 min) and writing all CSS + the nav doc in one pass (≈ 6 min).
2. 22:04:35 → 22:06:55, ≈ 2.3 min — 360 order decision (Shoes after Bunny Knot), section merge, mobile pictures, s7 download.
3. 21:56 → 21:58, ≈ 2 min — hero frame: BACKLOG rows #31/#33/#60, video-frame, writing hero-frames.mjs.
4. 22:01:28 → 22:03:26, ≈ 2 min — r2 digest → carousel name width/gap, footer 360 spec, 2560 frame sweep.
5. 21:38 → 21:42, ≈ 1.5 min (in two gaps) — the popup / layover diagnosis (dom grep, site.json edits).

## (c) per round
- r1: everything from the spec at once (the first round's CSS was the tool's draft). Digest at 360 named the header logo, carousel and the 360 cards; the 1440/2560 bands named the hero (61 %) — not CSS: the video frame.
- r2: hero posters from the video at the frames the live capture shows (METHOD hosted-video row). The digest did not name the cause (it reads text rows); the bands did. 1440 → 3.09.
- r3: digest named the carousel names (wrap width 78 vs 52 → padding 0 10px, gap 9) and the shift below it (+41 px); footer 360 from the spec rows. 360 → 20.14.
- r4: digest row #3/#4 (cards Δh +343, Bunny Knot 58.9 %) — the 360 layout orders Bunny Knot between Handbags and Shoes and uses `_MOB` crops: merged the two sections (grid + `display: contents` at < 1024), added the mobile pictures; the 2560 band 0–1350 (61–82 %) was the hero frame again (t 0.62 s at 2560) → a wide poster ≥ 1920. stop.
