# Five-minute loop — the fan-out run (L21 →): the agent's pass split across owners working at once

L1–L20: the tools went from ≈ 12–27 min a run to ≈ 2–4; the agent's own pass (5–26 min) is serial — one agent reads and writes every
section, header and footer in turn, ≈ 8 s a model turn. The fan-out keeps the tools and splits the pass: after `first`, one OWNER per
file set works in parallel and checks its own section with `section-view` (≈ 5 s, the build fresh, the live side from the round's capture).

## Roles
- Orchestrator (the loop's own session): setup through a setup agent (not counted), then the clock — `first`, the owners, the rounds.
- Owners, spawned in ONE message after `first`:
  - `page`: `styles/styles.css` (body, fonts, headings, the cap, every default-content section), the page document, the harness re-run.
  - one per block name in the split (`blocks/<name>/<name>.css`, `blocks/<name>/<name>.js` only if the decorate is wrong).
  - `header`: `blocks/header/header.css` and the nav document; `footer`: `blocks/footer/footer.css` and the footer document.
  A small page (≤ 3 blocks) folds the blocks into `page`.
- An owner edits ONLY its files. A document edit is followed by `./hx` (the exact harness command `first` printed, behind a lock: owners
  never run it at once). No owner runs the gate.

## The clock (t0 = `first`)
1. `./tl first -- npx stardust-lite first URL --slug SLUG`.
2. The owners (one message, parallel), each with the owner brief below. Wait for all.
3. `./tl rN -- <the round command first printed>` (three widths). `stop:` → the clock ends.
4. Otherwise a second wave: only the owners whose sections the digest names, each given its digest rows. Then a round. Hard stop 60 min.

## Owner brief (filled per owner)
You own <FILES> of the EDS prototype of <URL> in <REPO> (sections <#i …> of the round digest; live sections in `brief` marked
‹<block>›). Make the build match the live page at 1440 and 360 (2560 follows the 1440 rules unless the brief says the cap moves).
Read: the draft (your CSS file already carries measured values — keep what is right), `npx stardust-lite brief migration/cases/home/measure
--triage migration/cases/home/triage.json | grep -A8 '<block or HEADER / FOOTER>'`, and the view:
`npx stardust-lite section-view migration/cases/home/gate http://localhost:<PORT>/<SLUG>.harness.html --section <i|header|footer>` →
`migration/cases/home/gate/view/view-<i>-<W>.png` (live | build) with Δh and %. Edit, re-view, at most 4 views. Never copy the source's
DOM or CSS (values from the measurements); never touch another owner's files. ≤ 4 min. Return: 2 lines — what you changed, the last
view's % at 1440 / 360, and any document change another owner needs.
