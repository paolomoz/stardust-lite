# Rollout — page N of a site whose template is approved

Read this instead of METHOD.md for a page after the template. The site's state is data: `migration/site.json` (overlays, cap, chrome heights, DA,
port, noise, the template pages' numbers) and `migration/blocks.json` (every block + variant with its recipe and budget); every instrument reads both
as its defaults from the site repo's root — no overlay flag is typed. The page's working dir is `migration/pages/<slug>/` (captures, media and the
serve dir regenerate — gitignored); its evidence is one row and one screen (below).

## Procedure, in order (every command from the site repo's root; `<url>`, `<slug>`, `<docPath>` from `pages.json`)

`npx stardust-lite page-run <slug> [--sections <css>] [--main <css>]` runs steps 1–7 in one call and stops where judgement is needed: after the
triage draft (exit 5 — review `triage.md`, then `page-run <slug> --resume`; `--accept-draft` to go on as drafted), at a template candidate (exit 6), and
at the end with the section verdict (exit 0 CLEAN, 1 rows off — the rounds start there); the numbered steps stay as the reference and for a resume by hand.

1. The profile check runs inside `measure-page` (step 2: one `profile check: PASS|WARN|FAIL — …` line from the page's own sessions, `profileCheck` in
   `summary.json`); run `npx stardust-lite site-profile check migration/site.json` on its own only when it says FAIL. PASS or WARN continues; FAIL (an
   overlay control gone, a chrome height off) is site work: fix the profile or the chrome first, it is not this page's round.
2. `npx stardust-lite measure-page <url> --out migration/pages/<slug>/measure` — once with the default sections, read `structure-1440.txt` for the
   source's section selector, once more with `--sections <css>` (and `--hidden <css,…>` for modals at rest, `--main` when the profile's content root does not hold the page).
   It also writes `live-<W>.png` from the same settled session (the stitched capture the gate reads as its origin — the live page is loaded once for
   measurement, prototype gate and served gate; `--no-capture` to skip).
3. `npx stardust-lite triage migration/pages/<slug>/measure/content-1440.json --blocks migration/blocks.json --spec migration/pages/<slug>/measure/spec-1440.json --out migration/pages/<slug>/triage.json --md migration/pages/<slug>/triage.md`,
   then `npx stardust-lite block-inventory diff migration/pages/<slug>/triage.json`. Read the novelty line and the diff before anything else
   (the escalation rule below). A draft with one row per paragraph, or two modules in one row, is the automatic split, not the page: re-run
   `triage` with `--sections <dump node selectors>` (`tag.class` from `content-view`) — the gate splits the live page the same way. Review
   `triage.md`: flip a wrong match, name the block of a weak one, set a section style — in the markdown — then
   `npx stardust-lite triage --from-md migration/pages/<slug>/triage.md --out migration/pages/<slug>/triage.json`.
4. `npx stardust-lite media-fetch migration/pages/<slug>/measure/content-1440.json --out migration/pages/<slug>/media`, then
   `npx stardust-lite da-put <org>/<site>/<branch> migration/pages/<slug>/media/* --to <media folder>` (both from the profile's `da` and `media`), then
   `npx stardust-lite author migration/pages/<slug>/triage.json --content migration/pages/<slug>/measure/content-1440.json[,clicks.json,hidden.json] --blocks migration/blocks.json --media migration/pages/<slug>/media/manifest.json --out migration/pages/<slug>/doc/<slug>.html`.
   Read the stderr table (what did not fit, the source's spacer paragraphs dropped with their height — a Δh of that size in step 7 is this
   line; `--keep-spacers` is a decision to file) and the lint; exit 3 = a NEW section (escalate). Review the document; never type a text:
   `&nbsp;`, `<strong>` and a root's background picture come from the dump (a `cut` warning is an old dump — measure again).
5. `npx stardust-lite lint migration/pages/<slug>/doc/` — a 🔴 is a modelling defect in the triage, not a reason to edit the HTML.
6. `npx stardust-lite serve proto --port <port> --site .` (the profile's port, one per site) then
   `npx stardust-lite harness migration/pages/<slug>/doc/<slug>.html --serve proto --name <slug> --port <port> --fragments <branch host> --content migration/pages/<slug>/measure/content-1440.json[,clicks.json]`
   — every text the dumps hold must be found; a missing text is a triage or recipe defect.
7. Table rounds: `npx stardust-lite sections http://localhost:<port>/<slug>.harness.html --widths 360,<base>,<probe> --spec-dir migration/pages/<slug>/measure --blocks migration/blocks.json --triage migration/pages/<slug>/triage.json --out migration/pages/<slug>/measure`
   (the three tables in one browser, each row reused / new, then `tables: CLEAN — …` or `tables: n row(s) off — …`; `sections-verdict.json`) and
   `npx stardust-lite pair …` at the three widths before every CSS change. A reused block's rows are expected within 2 px already; what is off
   there is a section style or a recipe, not block CSS — or a block constant measured once on the template page (a parallax rest offset
   read from a stale load-time layout): a page measurement until a second page reads the same value.
8. Delta gate rounds at the base width: `npx stardust-lite gate --live <url> --build http://localhost:<port>/<slug>.harness.html --out migration/pages/<slug>/gate --widths <base> --chrome --budget --triage migration/pages/<slug>/triage.json`
   — the chrome is masked; the per-section table splits the live page as the triage did and pairs it to the authored sections by index
   (`pairing index` in its header — `anchor` means the document has another section count: fix the document, not the CSS); a row's % is
   its share of the page diff, a Δh marked `b` is a boundary the next row cancels, and cap-probe's rows on a one- or two-section page are
   advisory (one module's own columns). A round changes only what the tables name.
   Once clean: the three widths (`--widths 360,<base>,<probe>`), with `--probes` only for a section whose block is new or changed. For a reuse-only
   page whose tables are CLEAN with 0 new sections, gate the prototype at the base width only — `--skip-widths-when-clean migration/pages/<slug>/measure/sections-verdict.json`
   does it and says so — and the served page at the three widths (step 10); a new or changed block keeps the full prototype gate with probes.
   The origin is `measure/live-<W>.png` by default (`origin <W> from …` names it): one origin for measure, prototype and served gates — `--origin <dir>` for another.
9. `npx stardust-lite da-put <org>/<site>/<branch> migration/pages/<slug>/doc/<slug>.html --to <folder of docPath>` (preview only). If a block changed:
   push the code, `npx stardust-lite sync-poll <branch host> . blocks/<x>/<x>.css …` until the bus serves it.
10. One served gate, full page, at the three widths: `npx stardust-lite gate --live <url> --build <branch host><docPath> --out migration/pages/<slug>/gate-served --widths 360,<base>,<probe> --no-chrome --budget --triage migration/pages/<slug>/triage.json`
    (the origin is the measure dir's `live-<W>.png` — the same one the prototype gate read; `--origin migration/pages/<slug>/gate` when the measure dir has none;
    a list: `gate --served-pages … --no-chrome`). The chrome is in this one number on purpose — a leak lives there too; expect the prototype's section rows.
11. Only when a block was added or changed: `npx stardust-lite block-inventory scan --cases --site-repo . --out migration/blocks.json` (recipes;
    every `migration/cases/*` and `migration/pages/*` with a `doc/` is evidence, and it refuses to shrink the file) and
    `npx stardust-lite block-inventory budgets --gate-dir migration/pages/<slug>/gate-served` (the NEW rows' budgets from this page's served table —
    a reused block's over-budget row is a deviation, never a new budget: `--only`, `--all`). A variant's recipe: `block-inventory recipe <name> <variant> --from <doc> --write`.
12. `npx stardust-lite page-report <slug> --first-url-minutes <n> --rounds-table <n> --rounds-gate <n> [--minutes <n>] [--new-blocks a,b] [--deviation "…"]… [--blocked "…"]… [--note "…"]` — the page's row, `migration/pages/<slug>.md`, `migration/site-report.md`; the wall clock comes from the instruments' stamps (measure → served gate) unless typed.

## Stop rule, per page

Every **reused** section (its block has a budget) within its block's budget at the width and within 2 px Δh, at the three widths; every **new** section
gated as in a template run (three widths, probes, within 2 px with the residual named); the served gate shows the prototype's numbers. Then ship: a
further round on a reused block's pixels is site work, filed as a deviation, not spent here.

## Escalation rule

A page whose triage novelty is ≥ 0.5, or that holds a NEW section the inventory cannot name after the review (`author` exits 3), is not a page
run: it is a **template run** — METHOD.md in full, a case folder `migration/cases/<template>/`, `site-profile init` and `block-inventory scan`
at its end, and an improvement item for stardust-lite. One new block on an otherwise known page stays a page run: model it (METHOD step 2),
write it with its recipe (`block-inventory recipe <name> [variant] --from migration/pages/<slug>/doc/<slug>.html --write`), gate its sections at the
three widths, and record it in `newBlocks[]`.

## Evidence a page leaves — and does not

One row in `migration/site-report.json` (`stardust-lite/site-report@1`, `pages[]`), written by `page-report` from `gate/gate.json` and
`gate-served/gate.json`: `slug`, `url`, `template`, `novelty`, `newBlocks[]`, `proto { "360", base, probe }`, `served { … }` (pixel % per width),
`dh` (served Δh at the base width), `budget { proto, served }` (the gate verdicts), `over[]` (the served over-budget sections: index, block, pct,
budget, W), `roundsTable`, `roundsGate`, `minutes`, `firstUrlMinutes`, `deviations[]`, `blockedOrDegraded[]`, `notes[]`, `gate { proto, served }`
(the dirs), `_writtenAt`. And one screen, `migration/pages/<slug>.md`, rendered from that row; `migration/site-report.md` is the site's table.
Not written: no REPORT.md, no REGISTER.md, no LINT.md, no case folder — unless a block or a template was added (then the case folder holds the
block's evidence as METHOD describes, and the page row still exists). A deviation is one line in `deviations[]` with its pixel cost; a step that
failed twice is one line in `blockedOrDegraded[]` with what was tried, and the run continues with every step that does not depend on it.
