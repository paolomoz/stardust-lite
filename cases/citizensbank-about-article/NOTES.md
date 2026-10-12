# Friction notes — citizensbank about-article

Minutes are from TIMELINE.md stamps (a milestone line is written at the START of the next command, so it includes my reading of the
previous output). Page work t0 22:26:35 → served motion gate 23:29:40 = 63 min; plus ≈ 12 min of case documents after.

## Tool friction (one line each: what, minutes, what would remove it)
| # | what happened | min | would remove it |
|---|---|---|---|
| 1 | `npm i -D github:paolomoz/stardust-lite#a7cebff` → "pathspec a7cebff did not match", then an npm 404 on the registry fallback; installed from `git archive a7cebff` of the local clone | 3 | push the sha before pinning it (BACKLOG candidate: `init` says which ref it installed) |
| 2 | probe-load first run printed the 403 "Access Denied" page at three widths, then the tier line `--chrome`; a second run with `--chrome` was needed to see the real first look (header, footer, breakpoints) | 1 | probe-load re-runs itself with the tier it names and prints that first look |
| 3 | measure-page's default `--sections` matched nothing; the guess was the three layout rows (`#ls-canvas > .ls-row`: header folded into row 1, a 2442 px blob). `structure-1440.txt` is 7 lines deep (BACKLOG #135); 4 live `probe-structure` calls to find `.iw_placeholder > .iw_component`, then a second measure with `--noise` | 6 | the guess should walk down to the deepest level with ≥ 3 same-class siblings of module height, or print the candidate levels (count, heights) so the choice is one line; structure dump to module depth |
| 4 | the checklist's step-9 gate command has no `--triage`; round 1 paired 2 live sections (hero Δh −200 = the header folded in). With `--triage` the live split still read "automatic: body (no main) did not resolve" — no live row ever paired; I judged from the build rows, Δ doc and `pair` | 2 (+ a misleading digest line) | the gate should take the measure's `--sections` (summary.json has it) for its live split; checklist: add `--triage` |
| 5 | `author` nav = "simplest shape": brand + the 3 utility links. The live header is three rows (utility, primary + search + Log in, section sub-nav); hand-authored from `content-view … header` | 5 | author emits one nav section per header row (every `ul`/link group of the header root, in order) |
| 6 | `author` exit 2: 🔴 D15 script text in the copyright (the live writes the year with a script; the dump kept the `<script>` text as copy); 🟡 D1 the hero's h1 + p left as default content, the picture alone in a 1×1 columns. Hand-fixed both in the document; decided to move the disclosure into the footer document (live DOM order: footer → disclosure) | 3 | content-dump drops script text (D15's own remedy); the columns recipe takes a heading + text cell beside a picture |
| 7 | spec-to-css drafts: section padding = the inset to the first TEXT, so sections starting with a picture got `214px 0 67px` (grey), `134/148` (feature), `170/171` (hero) — re-read as the module's own `pad=32px 0px 64px` from the PAINT rows; the flat `p { margin: 0 0 18px }` was the glyph box (16 by line boxes) and cost half of round 2 | 3 | use the PAINT row's padding when the section's first child is a picture; margins from line boxes, not glyph boxes |
| 8 | no chrome drafts: header.css (≈ 95 declarations) and footer.css (≈ 70) written by hand from `spec-view … 0 9` at 1440 and 360 — the single largest block of the run | 12 | spec-to-css emits header/footer drafts (rows → grid areas, the x/y of each text row) |
| 9 | icons: the live uses `<use>` into two sprites (`cbds-icons-ui.svg`, `cbds-icons-brand.svg`); `media-fetch --extra` got the sprites, `scripts/svg-symbols.mjs` cut 10 symbols to `icons/` (BACKLOG #103 again: a case script) | 4 | `media-fetch --symbols name,…` or a toolbox `svg-dump` |
| 10 | port 8983 held by a stale Python (33785): checked with lsof before the harness, used 8993 | 0.5 | — (the instruction foresaw it) |
| 11 | harness printed one `console: 404` without the URL; checked the 10 icons by hand (all 200) — never found which | 1 | print the failing URL |
| 12 | css-lint caught 1 (the cap rule at 0,0,3) and missed three specificity traps that each cost a round: `footer .footer > div` (0,1,2) outranking `footer .footer-1` (0,1,1) in the same file (round 1: footer 240 px instead of 566, Δ doc −323); the same selector matching the block element `.footer.block` so the whole footer was boxed to the cap (round 3); `.columns.hero > div` (0,2,0) outranking the mobile `.columns > div` (0,1,1) (round 3: hero −312 at 360) | 8 (two gate runs + diagnosis) | css-lint rules: "an earlier rule in the same block file outranks a later/mobile rule on the same property"; "a chrome selector that also matches the block element" |
| 13 | round 1's Δ doc −323 sat in the chrome ("#8 Δh 56 … not judged"); no digest line named the footer; found with deep-probe | 2 | the digest names chrome Δh too (the footer is a block) |
| 14 | the 360 hero text cell precedes the picture in the document, so `.columns-img-col + div` never matched (−32/−32); found with `pair` at 360 | 1 | — (my CSS; pair named it in one read) |
| 15 | first three-width gate's summary: "4 dead or unobserved on live — not required" while `motion-compare.txt` had the two buttons "MISSING on build (live changes self.background, self.boxShadow)". I wrote the register from the summary, then re-read the file: one extra motion round | 4 | the summary line counts "missing on build" before "dead on live" |
| 16 | hover-diff: "NO VISIBLE MATCH" for all four selectors at 1440 (the controls sit below the 900 px viewport). The hover values were already in the gate's `motion-live.json` (before/after per probe) | 1 | hover-diff scrolls the selector into view before the visibility test; the gate prints the before/after it has |
| 17 | the gate with `--probes` masks the header/footer bands (2.69 vs 2.42 at 1440) — the same page reads differently between the step-9 and step-10 tables | 0.5 | one table definition, or a column that says masked |
| 18 | block-inventory listed a `hero` block from the boilerplate's unused `blocks/hero` | 0 | ignore block dirs no document uses |
| 19 | the 360 residual (6 broken live images painted as alt boxes) was in the measure notes at t0 + 4 but its pixel cost only appeared at the first three-width gate; quantified with a diagnostic run (pictures hidden) | 3 | gate: mask or name the bands of the measure's broken-image boxes |

Waits: measure 2 × ~1.5 min (the second with the module sections); 7 gate runs ≈ 2–3 min each (live cached after the first);
sync-poll 12 s and 11 s; code sync of the new repo immediate; no 401, no WAF retries (the chrome tier worked everywhere; curl media 200).

## My own reading and deciding (honest minutes, ≈ 50 of the 63)
| output | min | decided |
|---|---|---|
| CHECKLIST, BACKLOG open rows, `list --usage` | 3 | the command per step; which open rows apply (#1 tier, #5 icon tokens, #103 sprites, #135 structure depth, #189 author NEW, #200 section selector) |
| probe-load ×2, brief ×2, structure + 4 probe-structure | 5 | the module-level `--sections`; no consent/dismiss; cap 1216 fixed |
| triage.md, content-view texts, `--from-md` parser source | 4 | collection shapes (columns hero / cards flat / columns / cards), section styles with the inset per style, disclosure → footer doc |
| author stderr + the three documents + header root dump | 6 | the hero cells, the nav's four sections, the copyright text |
| spec-view 1440 (1 4 5 7, 0 9) and 360 (same), the three drafts, foundation header.js/footer.js/styles.css/reset.css, scripts.js | 14 | every header/footer value and grid; which draft values to keep (≈ 10 %) and which to re-read |
| gate rounds 1–4 digests, pair ×2, deep-probe ×2, serialized proto | 9 | the specificity traps, the footer scoping, the 360 insets |
| motion-compare.txt, motion-live.json | 2 | the hover rules |
| writing REPORT / REGISTER / LINT / NOTES / README | 10 | — |

## The questions asked
- **Share of the block CSS from the `spec-to-css` drafts** (counted by declaration in the final files, ≈ 263 declarations across
  columns.css 36, cards.css 50, section styles 12, header.css 95, footer.css 70): ≈ 27 verbatim from the drafts (10 %: the text styles,
  picture aspect ratios, the card paint, the grid columns/gap, grey-title/grey-text paddings, the disclosure font); ≈ 8 more draft-informed
  but corrected (3 %: the grey/feature/hero paddings read back to the PAINT rows, 18 → 16); ≈ 87 % derived by hand from spec-view, pair and
  deep-probe rows — the chrome alone is 63 % of all the CSS and has no draft. Restricted to the four content blocks: ≈ 30 % verbatim.
- **Did the checklist replace reading METHOD?** Yes: METHOD.md was not opened. The checklist's command column ran as written except
  the gate (`--triage` missing, see 4) and the harness port. What it did not carry: the gate's live split needs the measure's sections.
- **Did `gate --round`'s digest name the fix each round?** Round 1: no — the real defect (footer −326 in the chrome) was outside its
  rows; it named "Δh −200 hero" which was its own split artefact. Round 2: partly — "Δh 0 but pixels" on four sections, the fix came
  from `pair` (18 → 16) and arithmetic (footer 32). Three-width runs: the rows named the sections (hero −312, flat −14, cards +26);
  the cause came from deep-probe/pair. The digest located, it did not name.
- **Did `css-lint` catch anything?** One finding (the 0,0,3 cap rule), real. It missed the three specificity/scoping traps that cost
  rounds 1 and 3 (see 12).

## Setup (7 min 15 s)
Guard 200 `[]` (free) · repo from template, 1 commit after 5 s · fstab commit + push · Code Sync PUT 204 · `aem.js` 200 on the first poll ·
config.json contentSourceUrl right · seed 3 × 201 + preview 200 · h1 "Congrats" · the npm pin failure (1) · playwright chromium download ·
`init --foundation --force` · branch pushed. Nothing waited except the chromium download (~1 min) and the npm retries.
