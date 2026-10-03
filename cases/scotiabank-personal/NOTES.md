# Friction notes — scotiabank personal

Format: `minutes | what happened | what would have removed it`

2 | `init --foundation` skipped styles.css and fonts.css because the boilerplate's exist; the skeleton has to be copied by hand from node_modules and the boilerplate's unmeasured rules stripped (METHOD step 4). | `init --foundation --force` (or write `styles.skeleton.css` next to the boilerplate's and say so).
3 | Printing 25 instruments' usage one by one to learn flags (`npx stardust-lite <x>` each ≈ 2–4 s of npx start-up). | `stardust-lite list --usage` that prints every usage block in one call; or a USAGE.md shipped in the package.
1 | `scroll-probe` has no width argument (positional `360` silently ignored, read at 1440); the 360 fixed header's scroll states could not be read. | `scroll-probe <url> [W]` like every other instrument (`openPage` already takes a width).
2 | The noise floor is not part of `measure-page`: a second stitch-shot per width + pixel-compare had to be typed (3 + 3 commands). | `measure-page --noise` (second capture per width and the self-diff table in summary.json); gate could read it as the floor.
3 | `media-fetch` names AEM renditions by the rendition file (`cq5dam-web-1280-1280.png`, `-1.png`, `cq5dam-web-2000-2000.jpg`): the asset name is lost and two assets collide by suffix; renamed by hand + manifest edit. | name from the segment before `/_jcr_content/renditions/` (or `jcr:content`), keep the rendition size as a suffix.
4 | The header content root (`header#header`) missed the mega-menu bar (`header#header + div.mm--container`, 49 px, 10 links + 10 dropdown panels, 255 texts): the first look listed only `header`/`footer`/`main`, the content dump had no row for the band between header bottom (152) and main top (201). Found by deep-probing the gap after noticing the 49 px. | `probe-load` / `measure-page` should flag every painted box between the header's bottom and main's top (and between main's bottom and the footer) as an unassigned band; `content-dump` should take `--roots` defaults = body children, not header/main/footer only.
2 | `deep-probe` prints `::before content=""` for icon-font glyphs (PUA codepoints) — BACKLOG #90 — read 11 codepoints from the site's three CSS bundles with grep. | print the codepoint as `\\eXXX` when the content is a single PUA char, with the font-family; an `icon-font` sub-command that lists class → codepoint → family for the page.
2 | `click-dump` of the tab panels (6 states) returned only own-text leaves (no inline markup, no hrefs on `a`? partial); `content-dump --hidden` on the panel roots gave the full texts with MARKUP in one run — the method's step-1 text sends you to click-dump first. | METHOD step 1: for tabs/accordions whose panels are in the DOM at rest, `content-dump --hidden <panel root>` is the source; click-dump for panels that are injected on click. Make click-dump carry `markup`.
1 | `content-dump` usage does not list `--hidden` (it works). | print it in the usage line.
2 | `click-state` at 360 found "no visible panel" for the hamburger drawer (the drawer root is not `header + div`); the drawer's DOM root is unknown from any table. | `click-state` could print the elements whose display/visibility changed after the click when the panel selector matches nothing (a "what changed" fallback).
1 | `author` cannot write a template page with an empty inventory (every section NEW stops it); the document generator is written per case. | ship a default recipe per Block Collection shape (hero, cards, tabs, columns) so `author` drafts collection matches without an inventory.
1 | `spec-view` without args crashes with a stack trace instead of usage. | guard the arg.
1 | `timeout` (GNU) is not on macOS; my own slip, cost one round of usage printing. | —
1 | `harness --serve <dir>` does not create the dir: ENOENT after the lint, content check and media warm-up had run. | mkdirSync(serveDir, { recursive: true }).
1 | `harness` wants `serve` already running on the port (two crashed runs + one refused md5 before the flow was clear); the SKILL text reads as if the harness served. | harness starts serve itself when nothing answers (or prints the two-step in its usage).
2 | The harness fold keeps a paragraph's leading `<br>` and an empty `<p></p>` that the pipeline drops: the served page was 24 px shorter than the prototype at 360 (one card), found by the leak table after the served gate (7.97 % vs 2.63 %). | fold rule: strip leading `<br>`s and empty paragraphs in a cell (as the pipeline does); `author`/lint: warn on a leading `<br>` in authored text.
3 | Working out which fragment the harness fetches: the header rendered blank in the gate (no `nav`/`footer` row in the metadata block → `/drafts/nav.plain.html` 404); a crop of the build's top band and `grep` in harness.mjs found it. | harness: warn "document names no nav/footer — fragments not fetched"; `author` writes the two metadata rows by default.
2 | The served 360 gate came back 7.97 % vs 2.63 % prototype: a leading `<br>` the pipeline drops (see the fold line above). Two extra gate rounds (10, 11) and two da-puts. | fold parity with the pipeline, or a `da-put --check` that diffs the served plain.html against the fold's output before the served gate.
2 | cap-probe PASS/FAIL alternated on one build (5 vs 6 live sections) — three runs read as failures before the pattern was clear. | the gate prints the live split count next to the verdict and marks a count change between runs as advisory (BACKLOG #162).
1 | `click-state` on the live tabs needed the panel id (`#accounts-panel`) that only the DOM shows; the build's panel ids are generated. | `tabs` recipe: stable ids from the label (`tab-accounts`) so probes can name them on both sides.
1 | The pairing table's "#2 Δh −844 / #4 Δh −4843" rows (0-height live sections folded into one build section, spans summed) read as 7 rows off on every round although every real row was within 2 px; the verdict never reached CLEAN. | sum heights, not spans, when the extra live sections are 0-height; let `gate --skip-widths-when-clean` apply.
1 | Reading the 360 bottom bands: the fixed header repeats per stitched chunk on both sides, offset by Δh — three crops to understand 4–6 % bands that were a capture property. | note it in the gate's band line when a fixed layer exists at that width (probe-load knows).

## Ranked by minutes lost

| min | item | fix |
|---|---|---|
| 4 | mega-menu bar outside `header#header`, invisible to the first look and the content dump | flag unassigned painted bands between header/main/footer; default dump roots = body children |
| 3 | 25 usage prints to learn the flags | `list --usage` / USAGE.md |
| 3 | `media-fetch` rendition names | name from the asset segment |
| 3 | blank header: fragments fetched only for metadata `nav`/`footer` rows | harness warning; `author` writes the rows |
| 2 | foundation skipped styles.css / fonts.css | `init --foundation --force` or a `.skeleton.css` |
| 2 | noise floor is a separate 6-command step | `measure-page --noise` |
| 2 | icon-font codepoints by grep (BACKLOG #90) | print PUA codepoints; promote `font-glyphs-to-svg.py` |
| 2 | click-dump vs `content-dump --hidden` for tab panels | METHOD step 1 text; click-dump carries markup |
| 2 | served/prototype 24 px pipeline difference (two rounds) | fold parity with the pipeline |
| 2 | cap-probe PASS/FAIL alternation | print the live split count; advisory on change |
| 2 | click-state found no mobile drawer panel | "what changed" fallback |
| 1 | `scroll-probe` has no width argument | add `[W]` |
| 1 | harness: serve dir not created; serve must be running (3 runs) | mkdir; start serve |
| 1 | `author` has no recipes on an empty inventory | default recipes per collection shape |
| 1 | hidden `content-dump --hidden` not in usage; `spec-view` crashes without args | usage lines |
| 1 | tab panel ids differ live/build for click probes | stable ids from labels |
| 1 | pairing rows for 0-height live sections never CLEAN | sum heights when the extra sections are 0-height |
| 1 | 360 fixed-header chunk repeat read as a layout band | gate band note when a fixed layer exists |
| 1 | `timeout` missing on macOS (own slip) | — |
1 | `site-profile init` left cap, header heights (360: 0), noise floor and pages null although `measure/cap-probe.txt`, `measure/probe-load-*.txt`, the gate's `pixel-*.json` and the noise self-diffs were in the case dir — it reads other file names and a REPORT table with a fixed header; patched `site.json` by hand. | document the files/table it reads in its usage, or read cap-probe.txt / probe-load-<W>.txt / noise/*.json as written by the step-1 instruments.
