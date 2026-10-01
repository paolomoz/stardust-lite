# Rollout — page N of a site whose template is approved

Read this instead of METHOD.md for a page after the template. The site's state is data: `migration/site.json` (overlays, cap, chrome heights, DA,
port, noise, the template pages' numbers) and `migration/blocks.json` (every block + variant with its recipe and budget); every instrument reads both
as its defaults from the site repo's root — no overlay flag is typed. The page's working dir is `migration/pages/<slug>/` (captures, media and the
serve dir regenerate — gitignored); its evidence is one row and one screen (below).

## Procedure, in order (every command from the site repo's root; `<url>`, `<slug>`, `<docPath>` from `pages.json`)

1. `npx stardust-lite site-profile check migration/site.json` — PASS or WARN continues; FAIL (an overlay control gone, a chrome height off) is
   site work: fix the profile or the chrome first, it is not this page's round.
2. `npx stardust-lite measure-page <url> --out migration/pages/<slug>/measure` — once with the default sections, read `structure-1440.txt` for the
   source's section selector, once more with `--sections <css>` (and `--hidden <css,…>` for modals at rest, `--main` when the profile's root does not hold the page).
3. `npx stardust-lite triage migration/pages/<slug>/measure/content-1440.json --blocks migration/blocks.json --spec migration/pages/<slug>/measure/spec-1440.json --out migration/pages/<slug>/triage.json --md migration/pages/<slug>/triage.md`,
   then `npx stardust-lite block-inventory diff migration/pages/<slug>/triage.json`. Read the novelty line and the diff before anything else
   (the escalation rule below). Review `triage.md`: flip a wrong match, name the block of a weak one, set a section style — in the markdown —
   then `npx stardust-lite triage --from-md migration/pages/<slug>/triage.md --out migration/pages/<slug>/triage.json`.
4. `npx stardust-lite media-fetch migration/pages/<slug>/measure/content-1440.json --out migration/pages/<slug>/media`, then
   `npx stardust-lite da-put <org>/<site>/<branch> migration/pages/<slug>/media/* --to <media folder>` (both from the profile's `da` and `media`), then
   `npx stardust-lite author migration/pages/<slug>/triage.json --content migration/pages/<slug>/measure/content-1440.json[,clicks.json,hidden.json] --blocks migration/blocks.json --media migration/pages/<slug>/media/manifest.json --out migration/pages/<slug>/doc/<slug>.html`.
   Read the stderr table (what did not fit) and the lint; exit 3 = a NEW section (escalate). Review the document; never type a text.
5. `npx stardust-lite lint migration/pages/<slug>/doc/` — a 🔴 is a modelling defect in the triage, not a reason to edit the HTML.
6. `npx stardust-lite serve proto --port <port> --site .` (the profile's port, one per site) then
   `npx stardust-lite harness migration/pages/<slug>/doc/<slug>.html --serve proto --name <slug> --port <port> --fragments <branch host> --content migration/pages/<slug>/measure/content-1440.json[,clicks.json]`
   — every text the dumps hold must be found; a missing text is a triage or recipe defect.
7. Table rounds: `npx stardust-lite sections migration/pages/<slug>/measure/spec-<W>.json http://localhost:<port>/<slug>.harness.html` and
   `npx stardust-lite pair …` at the three widths before every CSS change. A reused block's rows are expected within 2 px already; what is off
   there is a section style or a recipe, not block CSS.
8. Delta gate rounds at the base width: `npx stardust-lite gate --live <url> --build http://localhost:<port>/<slug>.harness.html --out migration/pages/<slug>/gate --widths <base> --chrome --budget --triage migration/pages/<slug>/triage.json`
   — the chrome is masked, the per-section table names the red section and its block's budget. A round changes only what the tables name.
   Once clean: the three widths (`--widths 360,<base>,<probe>`), with `--probes` only for a section whose block is new or changed.
9. `npx stardust-lite da-put <org>/<site>/<branch> migration/pages/<slug>/doc/<slug>.html --to <folder of docPath>` (preview only). If a block changed:
   push the code, `npx stardust-lite sync-poll <branch host> . blocks/<x>/<x>.css …` until the bus serves it.
10. One served gate, full page: `npx stardust-lite gate --live <url> --build <branch host><docPath> --out migration/pages/<slug>/gate-served --origin migration/pages/<slug>/gate --widths <base> --no-chrome --budget --triage migration/pages/<slug>/triage.json`
    (a list: `gate --served-pages … --no-chrome`). The chrome is in this one number on purpose — a leak lives there too; expect the prototype's section rows.
11. Only when a block was added or changed: `npx stardust-lite block-inventory scan --cases --site-repo . --out migration/blocks.json` (recipes) and
    `npx stardust-lite block-inventory budgets --gate-dir migration/pages/<slug>/gate-served` (its budget from this page's served table).
12. `npx stardust-lite page-report <slug> --minutes <n> --first-url-minutes <n> --rounds-table <n> --rounds-gate <n> [--new-blocks a,b] [--deviation "…"]… [--blocked "…"]… [--note "…"]` — the page's row, `migration/pages/<slug>.md`, `migration/site-report.md`.

## Stop rule, per page

Every **reused** section (its block has a budget) within its block's budget at the width and within 2 px Δh, at the three widths; every **new** section
gated as in a template run (three widths, probes, within 2 px with the residual named); the served gate shows the prototype's numbers. Then ship: a
further round on a reused block's pixels is site work, filed as a deviation, not spent here.

## Escalation rule

A page whose triage novelty is ≥ 0.5, or that holds a NEW section the inventory cannot name after the review (`author` exits 3), is not a page
run: it is a **template run** — METHOD.md in full, a case folder `migration/cases/<template>/`, `site-profile init` and `block-inventory scan`
at its end, and an improvement item for stardust-lite. One new block on an otherwise known page stays a page run: model it (METHOD step 2),
write it with its recipe (`block-inventory recipe <name> --from migration/pages/<slug>/doc/<slug>.html --write`), gate its sections at the
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
