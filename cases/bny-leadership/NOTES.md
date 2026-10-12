# NOTES — friction log (bny leadership), ranked by minutes lost

Tool friction (what a tool could have done) and my own reading/deciding are listed apart; minutes are from the timeline, not estimates after the fact.

## Tool friction

| rank | min | what | what would have removed it |
|---|---|---|---|
| 1 | 12 | `author --draft-new` tabs recipe: a 1 × 2 label row, the EC grid as 80 loose elements, the Board panel absent, `arrow_forward` ligature text as `<em>`, the Board panel's Quick Links not taken. I wrote `scripts/doc-from-draft.py` and fixed it five times (member without a title, manifest shape, `<hr>` 🔴, the metadata block leaking into the EC section, the Board quick links). | A tabs/accordion recipe that writes **sections as panels** (section-metadata `tab`), a `cards` table when the panel is a repeating unit, the panel's trailing default content, and strips Material-Icons ligature text from links. |
| 2 | 9 | Fragment wrappers: `readFragmentSections` returns objects (r1: nothing rendered), flex on the section instead of `.default-content-wrapper` (r2, r3: header tools stacked, footer columns packed); one failed text replace cost an extra harness + gate. | A foundation `header` / `footer` skeleton (init --foundation) that already appends `s.section` and styles `> .default-content-wrapper` as the row; or `leak`/`pair` naming "flex container has one child (the wrapper)". |
| 3 | 5 | Build header painted at the top of every capture chunk (the live hides it at scrollY > 0). The gate's hottest band said "rendition / anti-aliasing" on a photo band; the crop showed the nav at y 2610. | `probe-load` / `measure-page` already read `#sticky-header` at top −74 after the settle scroll: print "fixed header hides when scrolled (top −74)" in the first look; the gate: when a fixed layer is visible in a chunk > 1 of the build and not the live, say so. |
| 4 | 4 | Painted bands at 2560 are a 1440 shell (hero, tabs box, footer) while cap-probe PASSed on the modules; found with the luminance ratio + `extent`, two rounds (r5 hero, r8 footer). | `brief`: per section, the **painted bbox at the probe width** next to the content x-range (the hero paint 1440×384 was in the 1440 brief, never its width at 2560). |
| 5 | 4 | `BNYM_CORPORATE_Publico_Pro` has no loaded face (fallback serif on the source); I declared the Roman woff2 for it and two names wrapped at 360 (one round + a deep-probe compare that showed identical computed values). | `brief` "fonts" line: flag a text family absent from "faces loaded" as **fallback-rendered**. |
| 6 | 3 | `probe-structure` depth: four runs (depth 3 → 4 → 14 → tabs root) to reach the tabs component under five wrapper divs. | A "modules" structure view: skip single-child wrappers, print the first node per branch with text/media/bg. |
| 7 | 3 | `triage` read the tabs section as default content ("text run ×2 without media"); `--sections` with finer roots dropped the grid (the dump collapses the wrappers the selectors name). | Triage the controls of a tabs/accordion component as controls + panels (the dump marks `a.tablink` and the hidden roots). |
| 8 | 1 | Userway fixed widget in every live chunk; `--dismiss` clicks (would open it). Residue ≈ 0.6 % per 360 band for good. | `--hide <css>` on every instrument (display: none before the capture). |
| 9 | 1 | My synthetic tabs section carried a `.section-metadata` div the runtime loaded as a block (404). | Documented: the harness fold already converts section-metadata; a synthetic section sets its class directly. |
| 10 | 0 (next page) | `site-profile init` wrote 16 nulls (overlays, cap, body, chrome heights, fragments, media, port, noise) — BACKLOG #132. | Instruments record their effective flags as data. |

## My own reading and deciding

| min | what | what summary would have replaced it |
|---|---|---|
| 8 | Reading deep-probe / spec rows and computing the CSS values by hand (card arithmetic 242+20+32+5+24+10+39+24 vs the measured 170; the Quick Links 27/16/88 rhythm; the footer chain). The 16 px spacer margin I missed cost round 5. | A per-unit **box chain** in the brief: each child of the repeating unit with margin/padding/height, and the unit's own box — the sum checked against the measured height. |
| 4 | Content-model deliberation (tabs cell vs sections-as-panels), including reading `recipes.mjs` to see what `author` would emit. | A documented sections-as-panels recipe (rank 1) makes the decision a default. |
| 4 | Four pair tables at ~1 min each; the group offsets made each one quick. | — (pair is already the right summary). |
| 3 | METHOD.md in full + the open BACKLOG rows + the usage list before the first command. | — (required reading; it paid back: shell caps, `:where()`, hover affordance rule, one section per source section). |
| 1 | My `head -150` truncated the 2560 first look; re-ran one width. | — (mine). |

## What helped (minutes it saved, by my estimate)
`measure-page --noise` (38 s for three widths, specs, dumps, captures and the floor — ≥ 10 min of single runs); `brief` (the inset lines gave the hero padding chain and the quick-links rule in one read); `pair` group offsets (−118 and −16 cascades named at once); the gate's hottest-band line (shift + luminance ratio named the 2560 hero paint and the fallback-serif wrap as "same paint"); `extent` (shell cap in one call); `hover-diff` + `click-state` (parity in one run per side, incl. the 360 dropdown's open geometry); `scroll-probe --up` (the header function in one run); `da-put` (35 media files, one command); `sync-poll` (2 s, no guessing); harness `--content` (92/92) and its lint.
