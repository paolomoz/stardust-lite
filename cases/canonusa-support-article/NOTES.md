# Friction notes — canonusa support-article

One line per wait / retry / re-read / hand work: minutes lost, what would have removed it.

- probe-load: `head -150` on the tee'd output killed the 2560 pass (SIGPIPE) — 1 min re-run. probe-load could write a file per width itself (`--out`) so nobody pipes it.
- measure-page: `--footer 'a,b'` (two footer experience fragments, no <footer> element) put only the first match in the spec (5 secs; the 661 px footer has no spec rows → no sections/pair rows for it). The dump and deep set hold both. ~2 min to notice; the roots line in the summary table should list every footer match or take a list.
- probe-load / measure-page: a 40 px (59 at 360) PROMO BAR with a gradient sits between the fixed header and the hero inside main's first experience fragment — not in the header root, not in the content root; `unassigned: []` and no section lists it; found only in the top crop (~3 min: 2 crops, a content-dump re-read). The unassigned-band check should include main's children outside the content root.
- harness: a stale Python server owned :8981 (harness named it, 1 min kill + re-run).
- measure-page: the 1440 live capture holds the hide-on-scroll header 15 px up (mid-return after the settle ladder; probe-load at rest says 0). The pair table printed every header row Δy +15 and the first top diff drew the logo twice; 3 min to attribute. A capture should re-settle the fixed layers at the top before chunk 1 (or the spec should mark a fixed layer whose rest box differs from probe-load's).
- measure-page note "header … GONE after one viewport of scroll" at 1440 was wrong: at 1440 the bar goes compact (top −36, h 100, 64 px visible; scroll-probe), only at 360 it is gone. 2 min of crops to re-read; the note should carry scroll-probe's top/height.
- media-fetch --browser: every usa.canon.com asset (5 PNG icons, 6 font files) came back "unreachable" (the WAF refuses a top-level navigation too); wrote `scripts/asset-capture.mjs` (the page's own responses) — 6 min. media-fetch could record the page's responses as a third tier.
- author --draft-new on section 2 (two blocks in one source section): the cards(list) recipe split the five units across two tables and dropped the bold titles; the page document was written by hand from content-view (the triage row says so). 8 min. Known open row (loop r3: two blocks in one section).
- author --nav wrote 3 of the 7 header sections (logo, tabs, cart) and --footer nothing (the dump's footer key is the comma selector); both typed from the content view: 7 min.
- triage.md: an unescaped `|` in my row shifted the style column into a section style ("h3 + outlined link…"); the tool warned, 1 min.
- Boilerplate class name: button paragraphs are `.button-wrapper` in this boilerplate, not `.button-container` — two block rules missed silently for 2 rounds (bumper margins, card buttons), ~5 min. The foundation README could name the runtime's class.
- The fold drops the `<p>` of a single-paragraph cell: `.card-head > p:first-child` matched nothing (bare `<picture>`), one void 360 round (+181 px), 4 min — METHOD says it; a harness line "cells unwrapped: N" would have reminded me.
- Live float/inline reading: the list title's inline run (img vertical-align middle + inline bold) took deep-probe of span.h5 (display/vertical-align) to see — flex, then float, then inline: 3 rounds at 360, ~12 min. The brief's unit line could print `display` and `vertical-align` of a repeating unit's first two leaves.
- Shell cap: cap-probe FAIL 4/4 at 2560 until the wrapper modelled the live 1440 container-fluid with 108 px padding; the fix then outranked my own `.cards-wrapper { padding: 0 108px }` (same element) — one more 1440 round (3.52 → 4.37 → 3.50), 6 min.
- sync-poll: `--trigger needs DA_TOKEN` — launched in a subshell without the token, exited at once; noticed 10 min later. It should fall back to polling without the trigger (the push synced on its own).
- gate motion sampler reads the build's static `header` element for the scroll-morph (MISSING) while `.nav-wrapper` morphs exactly like the live (scroll-probe); parity had to be shown by scroll-probe, 3 min. The probes file could name the build's header layer.
- site-profile init wrote nulls for fragments, media folder, serve port, noise floor and `--hide` (BACKLOG #132: flags from prose), 1 min, not fixed by hand.
- Vendor "MISSING" motions (lozad fade, bootstrap collapse classes, `loaded` ×9) fill the motion summary every round (11 of 21 lines); 2 min per read.
- My own reading: brief + content-view + spec-view 360/2560 + 2560 footer ≈ 9 min before the triage; the pair tables ≈ 2 min per round × 6; the crops ≈ 1 min each × 6; writing the four blocks' CSS from the numbers ≈ 10 min (header alone 5). The brief's `inset` line and `rhythm` line were the right summary for the sections; what it lacked: the promo bar (not a section), the footer (not in the spec), unit `display`.

## Ranked by minutes lost
1. 12 — list title layout read as flex → float → inline (3 rounds at 360); a `display` / `vertical-align` column in the brief's unit line.
2. 10 — sync-poll exited on a missing env token and nobody noticed; fall back to plain polling.
3. 8 — `--draft-new` mangled the two-blocks-in-one-section draft; document typed by hand (open row loop r3).
4. 7 — nav/footer documents typed by hand (author wrote 3 sections, no footer root for a comma selector).
5. 6 — WAF-blocked assets: media-fetch has no in-page response tier; wrote asset-capture.
6. 6 — shell cap round (cap-probe 4/4 FAIL, then my own rule outranked).
7. 5 — `.button-wrapper` vs `.button-container` (boilerplate class not named anywhere I read).
8. 4 — bare `<picture>` after the fold (p:first-child selector).
9. 3 — promo bar between header and content root not in any table (crops).
10. 3 — live header captured 15 px up at 1440 (mid-flight), attributed via pair + diff.
11. 3 — header scroll-morph MISSING in the sampler though at parity (scroll-probe).
12. 2 — measure-page "GONE" note at 1440 (compact, not gone).
13. 2 — footer not in the spec (comma `--footer`).
14. 1 — probe-load piped through `head` killed the 2560 pass; 1 — stale :8981 server; 1 — triage `|` escape; 1 — site-profile nulls.
