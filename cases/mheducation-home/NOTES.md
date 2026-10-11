# mheducation-home — notes

## The live capture at 360 is not what a reader sees (stop blocked)
The "We're Here for…" section is an autoplaying 4-slide carousel (PreK-12, Higher Ed, Medical, International; a live probe at
360 shows `.carousel-item.active` = PreK-12 at load, height follows the active slide, no min-height). The cached captures caught
it mid-rotation at different slides: 1440 / 2560 show slide 2 (Higher Ed, dot 2 active), 360 shows slide 3 (Medical, dot 3
active). `first` authored slide 2 from the 1440 dump, so at 360 the section compares Higher Ed against Medical (22 % of its rows,
"Medical Studies … MISSING" pairs) and is +67 px taller, which shifts every band below it (absolute pixel compare). Shifting the
build by 67 px below the carousel gives ≈ 7 % for the rest of the page and ≈ 10 % overall (scratch script `/tmp/mhe-scripts/aligned.py`,
not committed) — the residual is the slide content, not CSS. ≈ 8 min spent on it, then registered; no height was pinned.
Also at 360 the OneTrust floating cookie button (fixed, green) is stitched into the live shot 5 times (y≈851, 1660, 1740, 3100, 7600).

## (a) Tool friction
- Carousel autoplay not frozen before capture (different slide per width, none the load state) → 360 unreachable — ≈ 8 min (live probe, aligned estimate); removed by: probe-load pausing carousels / resetting to slide 1 at every width, and `first` authoring all slides.
- Fixed cookie launcher stitched into every live frame at 360 — ≈ 1 min; removed by: probe-load hiding fixed OneTrust widgets (`#ot-sdk-btn-floating`) with the consent click.
- `first`'s document: hero video as a "Video" text link + origin poster; carousel split into two carousel blocks with the device image orphaned between them; "Our Culture" left as a NEW unblocked section; "Item N of 3." screen-reader text authored as content — ≈ 2 min rewrite; removed by: a media-row recipe for a background video, one block per repeated card group, dropping visually-hidden text in content-dump.
- Nav doc lost the logo, the search group and the tools; footer social icons came out as `:mh-ecomm-img-…:` tokens separate from their links — ≈ 1.5 min; removed by: nav/footer dump reading img + button labels into the links.
- The icon-token pass turned the banner text "7:00-8:00" into an icon `:00-8:` (text lost, /icons/00-8.svg 404) — ≈ 1 min; worked around with a non-breaking hyphen U+2011 in the document; removed by: the token regex requiring a letter first and no digits-only/time context.
- styles.css foundation placeholders (body `sans-serif`, #000, cap 1200) were not filled from site.json although fonts / body were measured — ≈ 0.5 min; removed by: `first` writing the measured body font / colour / cap into :root.
- `first` printed port 8995 while the protocol text says 8990 — none (used the printed command).

## (b) My own time (non-tool), largest chunks
1. Writing all CSS for round 1 (page / banner / hero / three blocks / header / footer): ≈ 3.5 min.
2. Reading first's output, sbs, drafts, brief and live crops (1440 / 360) and deciding the re-sectioning: ≈ 3 min.
3. Diagnosing the 360 carousel residual (live probe of slides, aligned-diff estimate): ≈ 2 min.
4. Rewriting the document, nav and footer: ≈ 1.5 min.
5. Debugging r1 leftovers (banner offset by header margin collapse through a `position: relative` body; hero picture absolute inside a positioned `p`; the icon token): ≈ 1.5 min.

## (c) Per round
- r1: document re-sectioned (carousel = default content + one carousel block of 3 cards; culture block; news cards without "Item N of 3."), nav (logo, 3 items, search group, tools) and footer (4 columns + bottom) rewritten, all CSS from content / spec rows. The digest named heights per section; it could not name the split itself.
- r2: banner absolute at the page top (body was its containing block, offset by the header's collapsed margin), hero picture containing block, icon-token text. Named by #0 Δh −194 and #1 74 %.
- r3: hero first button play / external glyph widths → wraps to 74 px at 360 as live. Named by the "Watch Anna's Story" pair row (Δh −27).
- r4–r6: footer 360 gaps (Get Help → Additional 43, hr +43, © +25) and 1440 bottom list padding — specificity of the skeleton's `> div:not(:first-child)` / `> div ul li` rules ate the first edit. Not named by the digest (footer is chrome, not judged); found by probing the build against content-360.json.
- Stopped: the remaining 360 residual is the capture's carousel slide.
