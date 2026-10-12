# Friction notes — mfs-home (one line per wait / retry / re-read / long command / discovery; minutes = wall clock lost)

## Setup
- 0.5 min | `git push` of fstab rejected: the template copy added a second commit ("chore: cleanup repository template") after the clone; `git pull --rebase` fixed it. The skill could say "pull --rebase before the fstab push" or poll for 2 commits.
- 0.0 min | DA folder guard returned 200 with `[]` (empty) — the skill's guard says 200 = stop; an empty list is free. Guard should test for content, not status.
- 0.0 min | `timeout` does not exist on macOS zsh (coreutils not installed) — one failed command; the method's examples never use it, my habit.

## Step 1 (measure)
- 2.0 min | METHOD.md is 39 KB (268 lines of dense prose) — reading it took ~2 min of wall clock; most of it is lessons for cases this page does not have. A one-screen "procedure only" page with links into the lessons would halve it.
- 1.5 min | Open BACKLOG rows: 30 rows, 1.5 min to read; ~10 are `[case-specific]` and did not apply.
- 1.0 min | `list --usage` is 120 lines; it was useful once (flags), but `measure-page`/`gate` usage lines are each 3 lines wide and wrap.
- 1.5 min | Two extra `probe-structure` runs before `measure-page` because the hero lives INSIDE `<header>` (header.js-main-header is 1041 px at 1440): the default `--header header` would have swallowed the hero and `--sections main > .section` would have missed it. A first look that lists the children of `header` with heights (or warns "header is 47 % of the page") would have made the selector choice one read instead of two runs.
- 1.0 min | port 8973 held by a stale serve.mjs of another case (sdt-audemarspiguet, pid 99462) → harness refused; killed it. harness could say whose server it is (it printed the pid) and offer --kill-stale.
- 1.5 min | harness started serve with --site . (the case dir) because --site <repo> is read as the profile file and rejected (EISDIR); aem.js 404 → 30 s wait timeout. Started serve by hand with --site <repo>. harness should pass the repo to serve independently of the profile flag (or detect the repo from the case path).

## Step 2–3 (triage, author)
- 3.0 min | `triage --sections` did not accept the `measure-page` selector (comma list with descendants → "no sections under body") and then, with simple classes, could not name the asset-list section: the dump collapses single-child wrappers (`.aem-wrap--asset-list-with-links` is gone, only `.container-content-full-width` is left — a class the utility bar shares). Three triage runs + reading `splitSections`/`fingerprint.mjs` to learn the rule. Fix: record the section roots as data at measurement time (BACKLOG #135) so triage/author take `measure-page`'s selectors.
- 2.0 min | `author` refused the triage after I removed the two chrome rows ("the dump splits into 5 sections, the triage has 3"): it re-splits the dump by index. Had to prune the header's chrome nodes from a copy of the dump and re-triage. A `chrome` flag on a triage row (or `--root`/`--sections` that exclude the header subtree) would remove it.
- 2.5 min | The hero band holds two blocks (hero + cards.roles); the triage row names one. `--draft-new` drafted the cards correctly (3 × 2, texts bucketed) but left the hero picture/h1/h2 as default content, dropped the second (mobile) rendition (only in the 360 dump), duplicated the insights picture (image cell and body) and wrote `:icon:` for the five social icons without a name. I restructured by hand (no text typed). A recipe field `defaultContentBefore: ['hero']` and a media rule "same URL twice in a unit → once" would have made the draft the document.
- 1.5 min | `author --nav` lost the utility bar's tools (they sit under the body root, not the header key) and kept "Skip to Navigation"; `--footer` emitted the logo twice. Reviewed and edited both.
- 0.5 min | Reading `recipes.mjs` COLLECTION table to know what `--draft-new` would do with my labels before committing to them.

## Step 4 (blocks)
- 4.0 min | Deriving the role-box geometry from four tables (deep-sels 360/1440/2560 + spec-view + pair) — the longest reading block: the 1-line / 3-line link rhythm (32 vs 80 pitch), the 174-px name box, the 50-px description. A `brief` line per repeating unit (box, pad, bg, text style of each child, per width) would have been one read.
- 2.0 min | Footer link row: five flex items with two 0-width components — found only with `deep-probe --children`; the brief's rhythm line showed the links but not the empty items. Same for the 360 social overflow (168..366 in a 312 container).
- 1.0 min | Font files: nothing records the woff URLs; grepped the source CSS clientlibs by hand (a `media-list`/`measure-page` line listing the loaded font files would do it).
- 1.0 min | The three-colour stripe sits on no node (`::before` not reported, no pseudo content): read with `extent` by colour — worked, but only after viewing the capture.
- 3.0 min | Reading the two live captures (1440, 360) at full length to understand the composition before triage — necessary but the brief + content-view could have replaced half of it (I read them for the stripe, the fixed-header repeats and the mobile role boxes).

## Step 5–7 (harness, gate, deploy)
- 1.0 min | `harness --site <repo>` is read as the profile file (EISDIR) and the serve it starts gets `--site .` (the case dir): aem.js 404, 30 s wait timeout. Workaround: start `serve --site <repo>` by hand.
- 1.0 min | Stale `serve.mjs` from another case held :8973 (harness refused, pid printed). A `--kill-stale` or a "owned by sdt-audemarspiguet" line would have made it 10 s.
- 0.5 min | `readFragmentSections` returns entries, not elements; my decorates called `querySelector` on them (2 harness runs). The foundation README says so; I had not read it closely — my error.
- 2.0 min | gate r0 at 70 % from a CSS specificity slip (`.hero .hero-media picture` outranks `.hero .hero-mobile`): the section table said +1539 and deep-probe said display:block while the stylesheet said none — 3 probes to find it. A `deep-probe --props` that prints the winning rule (like devtools' cascade) would have been one.
- 2.0 min | object-fit: the spec row says `fit=fill` per image but I wrote `cover` from habit; two gates at 4.5 % before the hottest band was read. The brief's media line could repeat `fit=fill` (it prints only the box).
- 0.5 min | `block-inventory budgets` needed `gate --per-section` first (the first `scan` said so) — one more 2-min gate run at the end; `gate --served` could default to per-section on a template run.
- 0.0 min | sync-poll: both pushes synced in ≤ 11 s. da-put: every upload 201 / preview 200 first time. DA token fresh. Headless Chromium accepted everywhere (`--chrome` never needed).

## My own reading and deciding (minutes, what I read, what would have replaced it)
- 2.0 | METHOD.md (39 KB) — a 40-line "procedure + commands" page with links into the lessons.
- 1.5 | BACKLOG open rows (30) — the ~10 `[case-specific]` rows could be folded under one line.
- 3.0 | both live captures (viewing) — the brief with a per-unit line and a `fit` column.
- 3.0 | content-view 1440 (170 lines) + 360 header/hero — needed for the text model; `content-view --texts` would not have shown structure. OK as is.
- 4.0 | deep-probe tables ×5 (360/1440/2560 sels, footer children ×2) → role box and footer geometry by hand.
- 2.5 | pair tables ×5 (360/1440 per round) — the grouped offsets were the useful part; the per-anchor rows for 16 footer links are noise once the group is shown (BACKLOG #196).
- 1.0 | gate crops ×2 — fast and decisive (the 1440 top crop said "stripe + flag + caret", the 360 footer crop said "icons filled, cookie item centred").
- brief: saved time (one screen gave fonts, colours, the 1800 cap, per-section x-ranges at three widths; I never opened a spec JSON except `spec-view` at 360/2560). It did not show `fit=fill`, the repeating-unit internals or 0-width items.
- author --draft-new: saved ~5 min against writing the document by hand (texts, hrefs, media URLs, section-metadata, metadata all right), cost ~2.5 min of restructuring (two blocks in one section, duplicate picture, unnamed icons, missing nav tools). Net positive.
- measure-page --noise: 1 min for the noise floor from the same run — no separate capture; `--chrome` not needed.

## Ranked by minutes lost
1. 4.0 — role-box geometry read from five tables by hand (brief: no per-unit line).
2. 3.0 — triage `--sections` vs the collapsed dump (BACKLOG #135).
3. 3.0 — viewing the two captures at full length.
4. 2.5 — `--draft-new` restructuring (two blocks per section, duplicate media, unnamed icons).
5. 2.0 — `author` index-pairing after chrome rows were removed.
6. 2.0 — `fit=fill` written as `cover` (two gates).
7. 2.0 — specificity slip found with three probes.
8. 2.0 — footer 0-width flex items / social overflow (deep-probe --children only).
9. 2.0 — METHOD.md length.
10. 1.5 — BACKLOG case-specific rows; 1.5 — two probe-structure runs for the hero-in-header; 1.5 — nav/footer draft edits.
11. 1.0 each — harness `--site`, stale :8973, fonts URLs, stripe by extent, usage listing.
12. 0.5 each — fstab push race, readFragmentSections misuse, budgets needing per-section, timeout on macOS.
