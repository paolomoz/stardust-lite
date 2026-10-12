# okta-home — notes

## Capture fix check (chat launcher hiding)
**Not effective on okta.com.** The live captures still carry the Okta "Ollie" chat at every width, repeated in every viewport of the stitch:
- 1440 / 2560: an expanded chat *panel* (~290×580 at 2560: avatar, greeting, "Start a free trial" / "Get support", "Ask Ollie a question", disclaimer) fixed at the right edge — not a small box, so a "small fixed box in a bottom corner" rule does not match it.
- 360: a greeting bubble ("Hi there! Okta helps organizations…") plus an "Ask Ollie" pill at the bottom.
See gate/live-360.png, live-1440.png, live-2560.png and cards 0/7 crops. The live sticky header (pill nav) also repeats in every viewport of the live stitch.
Both inflate the live side of every band: a noise floor the CSS cannot reach.

## (a) Tool friction
- Live chat panel not hidden (above), whole run: the % floor at every width; a size-independent rule (fixed + z-index + iframe/`[id*=chat]`/`[class*=ollie|chat|drift|intercom]`) would remove it.
- Block drafts load after styles.css, so my page rules in styles.css lost to the drafts' grid rules (columns #2 / #6 / #8 drafted as 3-col grids on a 2-cell authored row) — ~2 min (r2/r3 no-ops); the digest named Δh but not "the draft's grid fights the authored shape". Fix: draft no grid when the authored row shape ≠ the measured unit count.
- Author lost the 3 identity cards of #2 (Agentic / Workforce / Customer identity: MISSING in pair rows) — content, not CSS; section #2 stays 61–81 % (would need a triage edit + re-run of `first`, not allowed past round 1).
- Hero (#1): the bg grid and the logo picture authored in the reverse order of the visual — 1 min to spot from sbs.
- `leak` needs a `--sels` file; not run (time).

## (b) Own time (non-tool, t0 → stop ≈ 3.7 min of 11.5)
1. Reading first digest + sbs-1440-1 + triage, deciding the 3 first sections (hero carousel / hero / columns): ~1.5 min
2. Writing r1 CSS (sections 0–2, header band): ~1 min
3. Reading cards 5/6/8 + crop 6, writing r2 CSS: ~1 min
4. Finding the draft-vs-styles cascade conflict (grep), deleting drafted grid lines: ~0.5 min
5. Reading crops 0-360 / 7-360 and writing r6/r7: ~0.7 min

## (c) Per round
- r1: header band 184/136, #0 one slide behind text, #1 panel, #2 picture-behind panel — the digest named #0/#1/#2 Δh; Δh fixed (#0 0, #1 2, #2 0 at 1440).
- r2: #4 logo row (marquee), #5 one story card, #6 grid, #8 tiles — Δh for #4/#5 fixed; #6/#8 lost to drafts.
- r3: #0 text position, #1 swapped picture roles, #2/#5 width — small.
- r4: removed the drafted grids in columns.css (#2, #6, #9) — 1440 −11 pts, 2560 −12.
- r5: #3 default content heights, #2 360 height 2162 — 360 Δh fixed.
- r6: #0 outlined secondary link (the decoration made both links `a.button`), 360 veil — small.
- r7: page background #fbfbfa, #7 tabs list + card eyebrow — small.
