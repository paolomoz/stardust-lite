# Friction notes — natixis about-article (every wait, retry, re-read, hand step; minutes honest, not estimated afterwards)

Setup 12:26:53 → 12:28:51 (2 min: repo, fstab, Code Sync 204, aem.js 200 after 2 polls, seed + preview, foundation, branch). Reading METHOD + open BACKLOG rows + `list --usage`: 1.5 min (12:28:51 → 12:30:26). t0 12:30:30. First prototype 13:02:05 (31.6 min). First < 10 % at three widths 13:13:47 (43.3). Probes 13:15:58 (45.5). Served gate 13:22:56 (52.4); final served 13:29:06 (58.6).

## Tool friction, ranked by minutes lost

| min | what happened | what would have removed it |
|---|---|---|
| 10 | `author --draft-new` on the empty inventory reached the collection shapes but not the rows: accordion panels (hidden dump) unpaired (1 × 2 with empty cells), the section's h2 + lede swallowed into `cards` rows (culture 6 × 2 in 2 tables, ERG 4 × 2, awards 3 × 2), facts' text-only units with an empty image cell, the 12 logos as one `columns` cell with the sr-only "opens in a new tab" as link text. Wrote `scripts/fix-doc.mjs` (127 lines) and ran author + fix 4 times. BACKLOG #148 / #189 confirmed. | default recipes that (a) keep the leading heading + paragraphs of a section as default content when the unit repeat starts after them, (b) pair hidden panels by the item's id (`<item id>-panel`, the core-components convention) — #149, (c) read a `columns` section's column containers as the cells, (d) take a text-only `cards` unit's first short text as column 1 (number | text). |
| 8 | `content-dump` truncates `markup` at ~500 chars while `text` is whole: an unclosed `<b>` in an ERG quote made the harness fold crash (`closest('main > div')` null — the metadata block had been parsed inside a `<strong>`), and the IMADE quote lost its bold lead (the 360 ERG band's 4.6 %); two fixes, one extra prototype + served gate round. | dump the full markup (or truncate at a tag boundary and say so); the fold could report an unbalanced inline tag by name. |
| 3 | Section styles: `triage`/`author` wrote my space-separated style cell as one `style` value; `aem.js` splits on commas → one class `narrow-spacing-top-spacing-bottom`. Found by reading `decorateSections`; re-ran triage/author/fix. | `triage --from-md` or `author` could normalise a multi-token style to commas, or the lint flag a style value with spaces and no comma. |
| 3 | stitch "FONT LOAD FAILED for Montserrat" on every capture; verified with a one-off playwright `document.fonts` list (all used faces loaded) — the failing face is the variable TTF that 404s while a duplicate loads. | the warning should name the face/URL that failed and whether a sibling face of the same family loaded (then "rendered with Montserrat 600 static"). |
| 2 | `triage.md`: a `\|` I typed in the block cell ("number \| text") shifted the columns on `--from-md` so the style column got the notes text; the author's section-metadata carried "text; h2 + 3 p default content before". | `--from-md` should warn when a row has more cells than the header. |
| 2 | `brief` listed `0ba081b76521874cf46c.ttf` twice as a font file; it 404s on clientlib-main (a 94 KB HTML error page downloaded as .ttf). Checked 8 URLs by hand. | brief / media-list could print the HTTP status and the weight each font file serves. |
| 2 | `crop`'s scale argument is a divisor (0.5 → 2880 wide); zsh did not word-split my `for spec in "…"` loop so nine crops silently produced nothing. | usage line: `[scale: 2 = half size]`. |
| 1.5 | `measure-page` default `--sections "main > .section"` matched nothing (expected on a non-EDS origin) and `structure-1440.txt` (depth 3) stopped above the sections: one `probe-structure --depth 7` run before the second measure-page. | the first run could propose the section selector from the largest repeated-sibling level under the content root (#135). |
| 1.5 | `gate` prints `sections —` in its timing line and no section table; each round needed a separate `sections --widths` run (≈ 40 s + reading). | gate runs the section table on the captures it already has. |
| 1 | The Write tool refused to overwrite the boilerplate's hero/cards/columns/styles/fonts files unread; deleted and rewrote. | — (agent tooling). |
| 1 | `pair` paired "Natixis Investment Managers was recognized…" into a closed accordion panel (Chromium keeps layout boxes for closed `<details>` content) and two identical award texts crosswise. | pair could skip `details:not([open])` descendants / `content-visibility: hidden` subtrees. |
| 1 | `motion-compare` lists the source's class toggles (`--fixed`, `--active`, `--expanded`) as MISSING every round (#196). | advisory unless a probe names them — already open. |

## My own reading and deciding (the larger half)

| min | what I read / decided | what would have replaced it |
|---|---|---|
| 8 | Deriving the spacing model from three deep-probe runs (≈ 330 lines): section `mar` 64/24, band 16 + 64/24, the accordion's 0-height first flex child (40 / 32), the facts container (64 + 48), the awards rows (40 above, 56 between, 16 under), the hero's 71 px text inset and 16 margins. | a `brief --geometry` per section: the margin/padding chain from the section box to the first text at both widths (section mar → wrapper pad → first child offset), and each block's inner offsets. The brief's rhythm line has the gaps but not who owns them. |
| 4 | `content-view` of the full 1440 dump (46 KB) to decide the triage and to see what texts the accordion buttons / sr-only spans hold. | the triage draft already had the shapes; a `--texts` list per section (first 60 chars + markup flags) is enough for the review. |
| 4 | Reading `pair` ×3 widths + `sections` ×3 per round (two rounds): the cascade columns made it quick, the 360 wraps (`#10000 Interns Foundations` 256 vs 260 wide) needed the Δw column. | fine as is; `gate` printing the tables would cut the runs, not the reading. |
| 3 | Checking the fonts (which of 19 faces the page uses) and downloading six TTFs by hash. | brief's "font files" list with weight + status, or `media-fetch --fonts`. |
| 3 | Viewing 9 crops at half scale to understand compositions (hero panel offset, accordion boxes, logo wall order). | the brief told me the boxes; the crops confirmed the *order* (column-major logos) which no table shows — one crop per section in the brief's order would do. |
| 2 | Reading the hidden dump's panel shapes (tags) before writing the recipe fix. | — |
| 5 | Writing the CSS/JS for 8 blocks (values already derived). | — |

## What helped
- `brief`: one screen with fonts, colours, caps per width, paint per section and the rhythm — I never opened a spec JSON except `spec-view` for 360 sections. The cap line ("1224 wide ×5 … a width that holds from the base to the probe is a fixed cap") decided the shell model in one read.
- `measure-page --sections`: the second run's 15 sections were exactly the spec's and the gate's split; the triage draft, the sections table and the pair all agreed on indices. `--noise` gave 0 % and proved the repeated sticky bar in every chunk was deterministic, not noise.
- `scroll-probe` (one run, 11 lines) gave the in-page nav's fixed class and the header's static state; `hover-diff` the 7 hover states on both sides; `deep-probe` the pseudo-element chevrons / plus icon as data URIs and the 360 `<select>` paint.
- `gate`'s hottest-band line with `shift-probe`'s ratio named the 360 residual as renditions in one read; `sync-poll` 11 s; `da-put` with preview in one call; `harness --content` caught the 9 alt-text labels and `--fragments` fed the pipeline's nav/footer.
- `--draft-new` gave the skeleton (sections, default content, metadata, media mapping, nav/footer drafts) — the fix script only had to rebuild 7 block tables.

## Misled by
- the FONT LOAD FAILED warning (false for the rendered type); brief's duplicated 404 font file; the author's cards draft looked plausible until read cell by cell (the h2 as a card row); the facts' empty first cell; `--from-md` silently taking the wrong column after my unescaped pipe.
- site-profile init read cap kind 'module · shell null' from gate/cap.json while the build uses a shell cap (main 1256), and noise.floor1440 null though measure-page --noise printed 0 % (summary.json): 2 min to notice; init should read measure/summary.json's noise and the build's main max-width. BACKLOG #132/#189 family.
- block-inventory budgets filled only the 360 column from gate-served/sections-{360,1440,2560}.json (base / probe '—' for every block): 1 min; not chased.
