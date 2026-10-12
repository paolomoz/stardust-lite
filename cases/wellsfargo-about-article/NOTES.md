# NOTES — friction, wellsfargo about-article (one line per wait / retry / re-read / hand fact; minutes measured from TIMELINE, not estimated after the fact)

## Tool friction (ranked by minutes)
1. **Rounds 2–4 of `gate --round` named no property (≈ 12 min).** Three digests in a row said "Δh 0 but pixels: paint or position — the hottest band line / shift-probe"; the shift-probe said "dy=4 displacement". The causes were in `pair` (header tools +4/+6, button Δw −31, links −32 pinned to the card bottom, footer −1 px per link) and in a deep-probe of both pages with fractional heights (hero img 549.6 natural ratio vs 550, card img 373.5 = 16:9 vs 374, link paragraph line 23.04 vs 22). Round 3 was a no-op from my guess at the digest. Would remove it: the digest running `pair` for a Δh-0 row and printing the fractional box heights live vs build for the section's children.
2. **Block CSS written from probes, not drafts (12 min 22:40 → 22:52, of which ≈ 5 reading/deriving).** The header and footer have no draft (chrome): sprite positions, the 4 px yellow border, the fat nav's 42 px gaps, the tools' y, the footer rules came from 3 deep-probes, a spec-view and 2 crops (≈ 6 min). The drafts gave rounded aspect ratios (1400/550, 664/374) and read a collapsed margin as an inset step ("p m23" → +23, 1 round).
3. **Unassigned band never reached triage/author (≈ 5 min).** The breadcrumb (22 px between header and main) was dumped as an extra root `nav` (which also matched every other `<nav>`), `triage --sections` kept measure-page's split (2 runs), the block was typed by hand into the document. Would remove it: extra roots as triage rows.
4. **`author` nav/footer "simplest shape" (≈ 3 min).** The nav dropped the six fat-nav links and the search control; nav.html rewritten by hand (brand / sections / tools).
5. **`author` card recipe (≈ 3 min).** Picture-less units put the title alone in cell 1 (a different shape from the picture rows), titles as `<p>`, the outlined control as `<strong>`, a ZWJ paragraph for the decorative line, a `#` href dropped — 5 edits on the document by hand.
6. **`npm i github:…#a7cebff` failed (2 min)**: the sha is on a local branch, not the remote; packed a tarball from the checkout.
7. **Motion probes format (≈ 4 min)**: no CHECKLIST/METHOD row gives `hover <live> => <build>` — read from gate.mjs; my build selector `p:last-child a` also matched the button → 1 rerun (2.5 min).
8. **Fonts and body typed by hand (2 min)**: fonts.css (4 faces, one family per weight), `--body-*` tokens; the brief had the values, no instrument writes them.
9. **`triage --from-md` crash (1.5 min)**: my edit lost a trailing `|` on 3 rows → TypeError (a message exists for a wrong cell count but the crash came first).
10. **OneTrust floating button (1 min + a recapture)**: the tier line said "no third-party fixed layer" (it appears after consent); `--hide` set by hand at the end.
11. **Stale server on :8982 (1 min)**: the harness named the owner (Python 33783); moved to 8992.
12. **Mobile marquee rendition (2 min)**: `media-fetch --extra` of the plain URL returned the same bytes; a register row.
13. **crop scale is a divisor (1 min)**: first footer crop came out at 1/4.
14. **Deep-probe lines cut at 300 chars by my own `cut` (1 min)**: one rerun for a sprite position (own).
15. **Drafts deleted by hand then regenerated (1 min)** (own).
16. **No wait of note**: Code Sync 1 poll (10 s), sync-poll 13 s / 11 s, DA puts instant, measure 71 s, gate rounds ≈ 2.5 min each (live cached after round 1), the 3-width gate 4.5 min, served gate 2.5 min.

## Own reading and deciding minutes (honest)
- probe-load tail + a probe-structure (to name the two unassigned bands): 2 min.
- brief: 1 min; content-view (two reads: roots, then main): 3 min — needed to see the breadcrumb and decide cards vs columns.
- triage edit: 2 min. Reviewing the three authored documents and deciding the edits: 4 min.
- Reading the foundation header/footer JS + styles.css: 3 min.
- Deriving the CSS (rhythm arithmetic from brief + spec-view 360 + deep-probe): ≈ 5 min reading/arithmetic + 7 min writing.
- Gate digests: ≈ 1 min × 8 runs; pair tables 2 × 2 min; 5 crops × 1 min.
- Reports (this folder): ≈ 10 min after the served gate.

## Answers
- **Block CSS from the drafts**: ≈ 35 % of the final block/section CSS lines carry a draft value unchanged (hero fonts at both widths, the 360 hero/cards fonts, card paint, grid gap 32, mobile breakpoint, page-title/mid-title/footnote paddings, footnote p). ≈ 65 % came from deep-probe / spec-view / pair / crops (all of header.css and footer.css, hero positioning and the 360 card, card body rhythm and pinning, breadcrumb, image ratios corrected, controls' fixed width). Two draft values were wrong (rounded ratios) and one misleading (the +23 inset).
- **Checklist replaced METHOD**: yes — METHOD was opened once by grep (probes) and the answer was in gate.mjs, not METHOD.
- **`gate --round` digest named the fix**: round 1 yes (the band and the shift pointed at the footer; the cause — `.footer` matching twice — was mine to find); rounds 2–4 no (generic "paint or position"); rounds 5–6 named the remaining band correctly as paint.
- **css-lint caught**: nothing at the first harness; one real finding later (a 3-compound foundation rule into a block's area) before the push.
17. **`site-profile init` lost data the run had (1.5 min)**: `overlays.hide` reset to [], `noise.floor1440` null (measure said 0 %), header 1440 height 79 (masthead only; the fat nav makes 139) — patched by hand (BACKLOG #132).
