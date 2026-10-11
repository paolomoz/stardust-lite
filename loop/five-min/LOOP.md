# Loop — five minutes to a page under 10 %

Branch `exp/five-min`. Target: from the first instrument (t0) to a prototype under 10 % pixel difference at 360 / 1440 / 2560 in **5 min**.
Up to 20 iterations, started 2026-10-10. Each iteration: change what the last run's clock says is the bottleneck, check it on the replay bench
(`scripts/bench.mjs`) when it touches the gate, the capture or the generator, then one timed field run on a page never run, alone on the machine.
A change stays only if the clock or the bench says it removed time; otherwise it is reverted and the row says so.

Sites: the Exec Forum Boston campaign shortlist (`~/stardust/2026-09-exec-forum-boston/campaign/migration-shortlist.csv`), already-run and
on-EDS sites excluded, order drawn with seed 20261010; a site that refuses the crawl at the precheck is skipped and named. Home pages.
Repos `aemcoder-adobe/sdt-<slug>-lite` (an `sdt-<slug>` repo may belong to another project), work dirs `~/stardust/2026-10/sdt-<slug>-lite`.

Order: Marriott, Publicis, Tory Burch, Deloitte, BMS, Equitable, WPP, PGA TOUR, Revlon, Sherwin-Williams, Hasbro, Intel, NFL, Nike, Merck,
McGraw Hill, Santander US, United Rentals, Telus, RBC, Wyndham, Waters, Omnicom, Lenovo, …

## Clock per run (minutes from t0)

| run | site | code | first prototype | under 10 % (stop) | served | rounds | round s | model / tools to served (turns) | main bottleneck read from the run |
|---|---|---|---|---|---|---|---|---|---|
| I1 | si.edu home | 35f9b73 | 17.3 | never | 56.8 | 10 | 103–119 | 37.9 / 26.6 to close (119) | capture unstable, polish past the target |
| I2 | acs.org about | d58b9f8 | 15.8 | 35.1 | 38.1 | 8 | 75–79 | 16.4 / 21.7 (108) | CSS by hand 10 min, WAF fonts, document repair |
| I3 | continental.com en | 0decf6c | 11.2 | 25.1 | 27.8 | 7 | 57–64 | 14.3 / 11.6 (102) | rounds (7 × ≈ 2 min), ≈ 100 turns, document repair |
| L12 | nfl.com international | 2dc1ee6 (main stays root, 60 % split, origin-mode builds, digest rows by overlap) | 4.4 after 2 × `first` (55 / 52 / 39 %) | 28.0 | 31.2 | 9 | 26–40 | own ≈ 18.7 min, tools 9.3 to stop | a main column + right rail re-ordered on mobile: no model, the document re-authored by hand (≈ 13 min); the gate found no build section under a wrapper and printed a false `stop: clean` at 22 %; harness re-runs without --local-media / --sync-chrome (stale chrome, 404 media) |
| L11 | intel.com | 5611ea7 (content root without main, unique chrome guesses, fonts subset / variable, object-position) | 8.8 after 2 × `first` (33 / – / – %) | 17.1 | 21.7 | 4 | 27–28 | own ≈ 12.6 min, tools 4.5 to stop | the root climbed above a large main (header + footer fragment inside: 3 sections, ≈ 7 min); repeating units authored weakly (≈ 4 min); a stitched origin (scroll-driven scenes) against a one-shot build — the sticky header in one capture only |
| L10 | sherwin-williams.com | c6073fd (fonts by use, nav brand, picture-count sync, sbs thumbnails) | 5.2 after 3 × `first` (46 / 40 / 38 %) | 26.8 | 29.2 | 12 | 20–35 | own ≈ 17 min, tools 9.6 to stop | no `<main>` (AEM Sites): `body > *` guessed, two re-runs and `--main` by hand ≈ 4 min; empty chrome documents (a --footer key not named footer); Open Sans from a cyrillic subset, a variable face as two static weights ≈ 3 min; crops swept by hand 2.5 min |
| L9 | revlon.com | b250798 (one-band extra roots, local media, concurrent local builds) | **1.17** (78 / 59 / 43 %) | **10.45** | 12.5 | 2 | 20–21 | own ≈ 8.5 min, tools **1.95** to stop | tools solved (first 70 s, rounds 20 s); the clock is the agent: reading 3, writing 2.5, re-modelling a carousel split into 7 tables 1.5, diagnosis 1.5; fonts.css missing the used families (round 1 in serif), an empty nav brand |
| L8 | pgatour.com | f5d4a51 (split of tall containers, da-put pool, 2-width probe) | 5.5 after 2 × `first` (48 / 36 / 19 %) | 17.05 | 19.2 | 4 | 55–64 | own ≈ 8.4 min, tools 8.6 to stop | a bare `div` extra root (451 nodes) became the content root: 73 rows, 63 dropped by hand; a round of broken images (aem.page 301s after a harness re-run); block drafts load after styles.css and won |
| L7 | wpp.com en | 07bd330 (generated CSS imported first, chrome from triage rows, block folders, section guess) | 3.4 (59 / 76 / 53 %) | **9.7** | 12.0 | 1 | 48 | own ≈ 5.4 min, tools 4.3 to stop | one `first` (204 s: the media upload 58 s on the critical path), one round; the agent's pass ≈ 5 min — the drafts' block layouts wrong (a spanning first card, a bleeding slider, a fixed bottom pill header), headings authored one paragraph per line |
| L6 | equitable.com | 36c5b34 (token file, section boxes at specificity 0, gif still, protocol: work from the digest) | 4.5 after 3 × `first` (34 / 39 / 46 %) | **12.0** | 13.6 | 3 | 31 | own ≈ 7 min, tools 5.2 to stop | the section guess (2 re-runs ≈ 3 min), empty nav / footer documents (≈ 3 min), the section boxes at specificity 0 losing to the foundation and the drafts winning ties over the agent's rules (2 of 3 rounds); the agent's CSS pass down to 4.9 min with the digest-first protocol |
| L5 | bms.com | 54f7deb (triage drop, edited triage applied, block sections kept, nav by position) | 2.5 (34 / 30 / 17 %) | 18.8 | 20.8 | 4 | 35–37 | own ≈ 13.8 min, tools 5.0 to stop | one `first`, a better first round; the agent's CSS pass ≈ 12 min (4.5 reading spec rows at three widths, 3 writing); a lost DA_TOKEN in a new shell, 360 paddings in block files, a 49.6 MB gif |
| L4 | deloitte.com us | c9bd927 (modals hidden, videos at frame 0) | 6.9 after 3 × `first` (81 / 91 / 91 %) | 21.2 | 23.8 | 3 | 40–46 | own ≈ 13.6 min, tools 7.6 to stop | the split: a nested grid picked, a header row in main that triage.md could not drop, `first --skip` re-running triage over the edit, the harness silently dropping an empty video section (≈ 8 min together); reading + writing the CSS ≈ 7.5 min |
| L3 | toryburch.com en-us | 16f69d6 (unroll, section coverage, empty chrome, fast local captures) | 9.6 after 3 × `first` (62 / 83 / 79 %) | 32.6 | 35.1 | 4 | 67–69 | own ≈ 17 min, tools 15.3 to stop | two popups (locale, a delayed welcome modal) measured as sections — two extra `first` runs, ≈ 9 min; a hero video frozen on a different frame per width ≈ 4 min; the CSS pass on a 5-section commerce page ≈ 10 min |
| L2 | publicisgroupe.com en | eb6b282 (one-shot capture, chrome guess, free port, scoped blocks) | 4.6 (72 / 60 / 48 %) | **9.8** | 11.8 | 2 | 40 | ≈ 5 min own + 4.9 min tools to stop | 3.5 of the 9.8 min were `first` failing: a page scrolling inside main (captures 900 px tall), the hero missing from the split, no footer (author wrote none, da-put / harness exit), a busy port (IPv6 listener) |
| L1 | marriott.com en-gb | e0e3428 (`first`) | 7.2 (79 / 65 / 47 %) | 34.0 | 36.5 | 10 | 54–57 | 18.3 / 15.7 to stop (104) | a first round at 47–79 %: header in main / no footer element (no nav, no footer), stitched live chunks shifted 53–112 px by a header that leaves the flow, carousel drafts on one selector |

## Iterations


### L1 — `first` (one call to the first round)
Change: `scripts/first.mjs` chains probe → measure → triage → media + fonts → DA → author → spec-to-css → harness → round 1 (≈ 2 min of tools on
continental's replay). Result on marriott: the first round at 7.2 min (3 × `first`: a busy port 8990 held by the orchestrator's own test server,
then a missing nav / footer), but at 79 / 65 / 47 % — ten rounds to the stop at 34.0. Keep `first` (it removed the step-by-step turns:
≈ 2.5 min of tools to the first number); the bottleneck moved to the first round's quality and the capture.

### L2 — one-shot capture, chrome guess, free port, per-section block scope
Change: Chrome's captureBeyondViewport at scroll 0 instead of stitched chunks (marriott's pinned bar and seams gone; takeda's sticky header once);
measure-page guesses header / footer when the page has none outside main; first picks a free port; repeated blocks scoped per section; the gate
never reuses a stale build capture; shadow-root consent hosts hidden; author keeps card-wide links with their call to action. Result on
publicis: stop at 9.8 min, two rounds of 40 s (1440 / 2560 under 3 % after one round). Keep all. Next: the four `first` failures (3.5 min).

### L3 — inner scroller, section coverage, empty chrome, fast local captures
Change: an inner scroller unrolled at settle; the section guess also when the default covers < 70 %; an empty nav / footer document when the
source has none; the dual-stack port check; local builds captured with short waits (≈ 7 s a width, identical pixels). Result on toryburch: no
`first` failure of those kinds, but two popups measured as content (two re-runs, ≈ 9 min) and the hero video frozen at a different frame per
width (≈ 4 min); stop at 32.6. Keep all. Next: popups and videos at the capture (iteration 4: hidden modals, videos held at frame 0).

### L4 — popups and videos at the capture
Change: modal layers hidden (z-index ≥ 10, ≥ 30 % of the viewport, or an open dialog in a fixed layer) at settle, before the capture and in the
tier line; videos held at frame 0 on every live open; `first` clears the last round when it re-measures. Result on deloitte: no popup, no video
drift; stop at 21.2 after three `first` runs and three rounds. Keep. Next: the split and the triage round trip (drop a row, `first` honouring
an edited triage.md), the harness keeping an empty block section, the nav document (iteration 5).

### L5 — the triage round trip and the nav document
Change: `drop` rows in triage.md (author / spec-to-css keep the split aligned), `first` applies an edited triage.md, the harness keeps block
sections and re-uploads an edited nav / footer, the nav document by kind and position, grid columns from fully visible units. Result on bms:
one `first` (2.5 min) at 34 / 30 / 17 % — the best first round so far — stop at 18.8 after four rounds of 35–37 s. Keep. The clock is now the
agent's own pass (≈ 14 of 18.8 min). Next (iteration 6): the token in every shell, section rules that never beat the agent's, oversized gifs,
measurements out of git, and a protocol trial: work from the digest, read spec rows only for the sections it names.

### L6 — token file, gif still, measurements out of git, digest-first protocol
Change: daToken() reads the aem token file; oversized gifs as their first frame; init's .gitignore; section boxes at `:where()`; the protocol:
fix what the digest names, read spec rows only for those sections. Result on equitable: stop at 12.0 — the agent's own CSS pass 4.9 min (12 on
bms). The `:where()` part backfired (the foundation's `main > .section` padding won; the drafts still beat the agent's same-specificity rules
by order): reverted in iteration 7 for an ordering fix (generated CSS in its own files, imported first). Keep the rest.

### L7 — generated CSS imported first, chrome from triage rows, block folders, a deeper section guess
Change: sections-draft.css / elements.css imported at the top of styles.css (:where reverted); style-pass tried and kept opt-in (bms replay:
33.9 / 30.1 / 17.3 → 35.5 / 30.7 / 17.6, no gain); rows marked header / footer become the chrome documents; bare block names in triage.md;
the harness creates a missing block folder; first reuses its own serve; the section guess descends into a dominant child. Result on wpp: one
`first`, one round, stop at 9.7. Keep. Next: the media upload off the critical path (da-put six at a time), the split of tall containers
(A/B on the bench), the 2-widths probe.

### L8 — the split of tall containers, a parallel upload, a 2-width probe
Change: tall sections of heading-led parts split (bench A/B: bms 1440 30.1 → 27.1, equitable 62.4 → 40.5), extra bands deduplicated and placed
by geometry, a copyright-line footer; da-put six at a time; probe-load at 360 / 1440. Result on pgatour: stop at 17.05 — a bare `div` extra
root (measure-page) made 73 rows; a round lost to broken aem.page images. Keep. Next (iteration 9): extra roots name one band, local media in
the prototype (upload off the clock, no host burst), local builds captured at once (a round 64 → 43 s on wpp's replay).

### L9 — one band per extra root, local media, concurrent local builds
Change: extra roots need an id / class and ≤ 3 matches; the prototype serves local media (`--local-media`) and the upload runs in the
background; local builds capture the three widths at once (a round 64 → 43 s on wpp's replay, 20 s on revlon); chrome drafts skip 0 px.
Result on revlon: `first` 70 s, two rounds of 20 s, stop at 10.45 — tools 117 s of 627. Keep. The clock is the agent's own pass now.
Iteration 10: fonts.css from the families the text uses (aliases), the last @font-face src, a nav brand that is never empty, the 360 dump's
media, chrome documents re-uploaded on a picture-count change, slideshow controls not content, sbs-<W>.png per round. A replay of this
iteration re-uploaded a scratch nav over bms's and revlon's real ones (the token file made it possible): both restored from their cases,
and the harness uploads only with `--sync-chrome` now.

### L10 — fonts by use, a brand that is never empty, sync on picture count, side-by-side thumbnails
Change: fonts.css from the families the text uses (+ aliases, the last src), the nav brand from the host when no logo link, the harness
re-uploads on a picture-count change (only with --sync-chrome), the 360 dump's media, slideshow controls not content, sbs-<W>.png.
Result on sherwin-williams: stop at 26.8 — a page with no `<main>` (3 `first` runs), empty chrome documents, subset / variable fonts, crops
by hand. Keep. Iteration 11: the content root without `<main>`, unique chrome guesses, chrome keys named in the dump, the latin subset, a
variable face with its range, a missing decorate created, object-position drafted (replay: 8 sections + footer, the agent's own split).

### L11 — the page without main, unique chrome selectors, subset and variable fonts
Result on intel: stop at 17.1 — the content root climbed above a main that held the content (header and footer inside the split), a
scroll-driven hero captured stitched while the build was one shot. Keep. Iteration 12: a large main stays the root, the tall-section split
at 60 % coverage (intel: hero / news / tiles), the build captured in the origin's mode, pair rows placed by overlap in the digest.

### L12 — the root of a page with a large main, the split at 60 %, builds captured like their origin
Result on nfl: stop at 28.0 — a two-column (main + rail) page the triage cannot model; the gate's `main > .section` missed wrapped build
sections and said "clean" over the target; the agent's harness re-runs lacked the flags `first` used. Iteration 13: build sections under
any wrapper, the stop only from the target, `first` prints the split and the exact harness / round commands, section tops on the
side-by-side thumbnails, carousels drafted as slider tracks (revlon replay: Δh at 360 −8932 → −3728).
