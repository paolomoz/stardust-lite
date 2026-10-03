# Friction notes (manulife-business)
- 1 min | my own: piped probe-load through tee|head, head closed the pipe and truncated the 2560 block; re-ran 2560 alone. Fix: never head a tee'd instrument; instruments could write their JSON to a file by default (--out).
- 1 min | my own: zsh does not word-split an unquoted variable; a 'set -- $r' crop loop printed usage 6 times. Also crop's 5th arg is a divisor (first run upscaled 2x unnoticed under tail -1).
- 3 min + 70 s re-run | tool+me: --dismiss clicks the selector; I passed the Kampyle feedback OPENER (#nebula_div_btn) and the Medallia survey modal sat in every chunk of live-*.png (noise floor 0 % because both captures held it). No instrument warned that a dismiss click ADDED a fixed overlay. Fix: probe-load/measure-page should re-run the overlay census after consent/dismiss and print "new overlay after dismiss: …"; or --hide <css> (display:none, no click) for fixed widgets.
- 4 min | tool: measure-page's section guess matched nested aem-GridColumns (12, nested); triage took the top 2 (hero + one 3168 px lump) — a flat 7-section split had to be read from the pierced structure dump by hand. Fix: the guess should drop a match that contains another match (keep leaves, or the shallowest non-overlapping set).
- 6 min | tool: web-components origin (114 shadow roots): content-dump / triage / brief see no text in the product carousel, the hero tiles, the article cards (only <time>) or the footer. probe-structure --pierce (3 runs: default depth too shallow, 26 needed) was the only text reader. Fix: content-dump --pierce (composed tree), and measure-page should pierce when probe-load counts shadow hosts > 0.
- 2 min | me+tool: da-put --as nav wrote a DA source 'drafts/nav' (no .html) → upload 201 but preview 404 twice; the tool's --as takes the full file name. Fix: da-put should append .html when --as has no extension, or warn.
- 0.5 min | tool: harness --content flags 28 shadow-held texts as 'not in the capture' (typed from memory?) — the capture it checks is the light-DOM dump; a pierced dump would clear them.
- 2 min | tool: `--as nav` → DA source `drafts/nav` (no .html) — see above; fixed by re-putting without --as.
- 1.5 min | me: redirected a gate log into gate/r1.log before the dir existed — the gate run died; mkdir first (or the gate could create its --out dir before anything prints).
- 3 min | tool+me: `pair` anchored "Search" on `.nav-tools` (262 wide) and "Sign in" on the inner span in every run (3 tables) while the boxes were right (deep-probe) — I chased it once. A control row should pair the live control with the build element that has the same role (`a`/`button`), not the innermost text holder.
- 4 min | me: specificity — `footer .footer :where(ul)` still beats `.footer-group-list`; `header nav a:any-link` beat `.nav-signin`. Two rounds (r2 partial, r6) for the same trap. METHOD step 4 should say "the WHOLE selector in :where()", and the foundation's reset.css could ship those resets so blocks never write them.
- 3 min | me: forgot `decorateIcons(block)` before `inlineIcons(block)` — every block-created icon was empty in r1; the DOM dump showed it, no table did. A foundation `decorateBlockIcons(block)` (both calls) removes the trap.
- 6 min | tool: fonts — curl 403, node fetch 403, in-page fetch() 403 (Sec-Fetch-Dest), and my first capture script lacked the instruments' UA (the goto itself got the 403 page: "responses 1"). `media-fetch` should have a browser tier that saves the page's own responses (fonts, images) — the case script is 30 lines.
- 2 min | me: zsh `set -- $r` and `rm icons/raw-*` glob errors (no nullglob) — two aborted commands.
- 1 min | tool: `author --draft-new` emits the icon cell AFTER the text cell for icon cards (source order is icon first) and `hero` 1 × 1 as the yellow D1 — fine, but a per-shape default column order would save the hand swap.
- 5 min | me (reading): the 1440 pierced structure dump (330 lines, then 666 at depth 26) read twice to derive card anatomy (paddings 24/8/48, action 72, heights 521/533) — brief's `rhythm` and `inset` lines cover light-DOM sections only; a per-unit "card anatomy" line (box, image box, text insets, action box) in brief for the repeating unit would replace ~4 min.
- 3 min | me (reading): deep-probe output lines are 300+ chars with every border side repeated; I piped through sed each time. A `--compact` (box · bg · bd · pad · gap · font) would cut each read in half.
- 2 min | tool: gate skipped the 6 header probes as "chrome masked" while printing "nothing to mask" in the same run; `chrome:` prefix needed on a template page too (where no profile exists). On a template run (no profile) the header probes should run by default.
- 1.5 min | tool: the gate's section table pairs by first anchor, so "support" reads Δh 56b and the hero −825b every round; the `b` legend is right but the two spec-based lines (`rows at W: #n Δh …`) are the ones to read — they were printed only in r1 (with --origin a measure dir), not when --origin was a gate dir. Print them every round.
- 1 min | tool: `harness` prints `console: Failed to load resource … 404` without the URL (it was /styles/lazy-styles.css or an icon — never found out).
- 0.5 min | tool: `crop`'s 5th arg is a divisor; a `--scale 0.5` habit upscaled 2× silently (the warning promised in #199 did not print at 0.5).

## What helped (minutes saved, honest)
- `--chrome` on every instrument: the origin never 403'd in a browser session; no `--headed` needed. Zero friction after the first look.
- `measure-page --noise` in one run: 68 s for 3 widths + the noise floor; the captures doubled as the gate origin (`--origin measure` then `--origin gate/r1`) — no re-capture all run.
- The in-run `--sections` guess: wrong here (nested), but it named itself (`sectionsSelector`) and the note told me what to pass — 1 run to fix, not 3.
- `brief`'s `inset` chain: named the section paddings (56/40, 64/56, the 0-height 96 = 56 + 40) in one screen; the `padded` / `surface` / `spaced-bottom` styles came straight from it (0 rounds on section spacing).
- `--draft-new`: wrote the skeleton with section-metadata, metadata, and the light-DOM texts in 2 s; I edited rather than typed (the shadow texts were the exception, see above).
- The gate's section tables + `pair`'s Δy·loc: every CSS round changed only what a row named (−60 carousel body, −40 row gap, +372 ratio box, +48 selectors, 24 gap); no void rounds.
- `hover-diff` with `>>`: read 7 hover families through shadow roots in one run per side; the motion table is complete without motion-observe reaching the shadow roots.
- `sync-poll`: 12 s to confirm the branch host served the pushed bytes; `da-put` with preview in one call; the served gate reused the r1 origin — served = prototype to 0.01 %.

## Ranked by minutes lost
1. 12 — shadow-DOM blindness of content-dump / triage / author (texts by hand; 3 pierced runs) → `content-dump --pierce`.
2. 6 — fonts behind the WAF (4 failed fetch paths, UA) → `media-fetch --browser` from the page's own responses.
3. 5 — reading pierced structure dumps for card anatomy → brief's per-unit anatomy line.
4. 4 — `:where()` prefix trap (two rounds) → METHOD wording + foundation resets.
5. 4 — nested section guess + triage lumping → non-overlapping guess.
6. 3 + 70 s — `--dismiss` opened a survey into the origin → overlay census after dismiss / `--hide`.
7. 3 — `decorateIcons` before `inlineIcons` → foundation helper.
8. 3 — deep-probe line length (reading) → `--compact`.
9. 3 — pair's control anchoring (reading) → role-aware control pairing.
10. 2 — `da-put --as` without extension → append `.html` / warn.
11. 2 — gate skipped header probes on a template run → run them when no profile.
12. 2 — my shell errors (tee|head, zsh globs, missing mkdir).
13. 1.5 — spec-based Δh lines printed only when --origin is a measure dir.
Total ≈ 50 min of a 62-min page; the instruments' own run time was ≈ 14 min (measure 2 × 68 s, 8 gates × ~1.7 min, probes/dumps ≈ 3 min).
- 0.5 min | tool: block-inventory scan read the JS-toggled class `carousel-static` as a variant row; site-profile init run before README/REPORT existed read no prose (fragments/da/noise null — BACKLOG #132) and was re-run.
- 1 min | tool: site-profile init read `--dismiss #nebula_div_btn` from the case prose (a sentence saying NOT to pass it) into overlays.dismiss — BACKLOG #132 again: instruments should record their effective overlay options as data; hand-corrected in site.json.
