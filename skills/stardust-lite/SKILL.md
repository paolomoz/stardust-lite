---
name: stardust-lite
description: Migrate one web page to AEM Edge Delivery Services with high fidelity, blocks-first — set up the site repo, open a live-reloading view of the prototype in the browser, measure the source at three widths, triage the content model (David's Model), author the document, write the blocks, gate the runtime prototype pixel-by-pixel until every width is under 10 %, optionally deploy to DA and gate the served page. Use when asked to "migrate <url> with stardust-lite", to migrate, replicate or prototype a page in EDS with a fidelity number.
---

# stardust-lite — one page, from a URL to a gated prototype

The method lives in this plugin: `${CLAUDE_PLUGIN_ROOT}/CHECKLIST.md` (twelve steps on one screen — read it before step 3 below),
`${CLAUDE_PLUGIN_ROOT}/METHOD.md` (the reference, read for a row), `${CLAUDE_PLUGIN_ROOT}/ROLLOUT.md` (a page after the template),
the open rows of `${CLAUDE_PLUGIN_ROOT}/BACKLOG.md` (`grep -n '| open'`; cite, do not re-solve). The instruments run inside the site repo
as `npx stardust-lite <name>` once step 1 has installed them (`npx stardust-lite list --usage` prints every usage line).

## 0. Read the request

- **URL** — the page. **Mode** — `prototype` (default: a local repo, nothing published) or `eds` when the user says deploy / EDS / DA /
  publish / preview. Publishing is outward-facing: never pick `eds` on your own.
- **Site name** `sdt-<domain label>` (bmc.com → `sdt-bmc`), **page slug** `<label>-<last path segment | home>`. Do not ask unless the
  user's words conflict with these; say what you picked.
- **Directory**: next to the git repo the session starts in (`$(git rev-parse --show-toplevel)/../<site>`), else `./<site>`.
  If it already exists with an `fstab.yaml`, this is a **second page of that site**: work on a new branch, and read ROLLOUT.md first
  (a second `first` rewrites the first page's block CSS with `spec-to-css --force` — restore the shared files from git after it).

## 1. The site repo (≈ 1 min)

- `prototype`: `node ${CLAUDE_PLUGIN_ROOT}/bin/stardust-lite.mjs new <url> --dir <dir> --slug <slug>` — clones the aem-boilerplate on a
  `proto` branch (no remote), writes a placeholder fstab, installs stardust-lite and Playwright's Chromium, copies the foundation, commits,
  and prints the two commands below.
- `eds`: create the repo first — the `eds-new-site` skill when it is available (it confirms the name and wires Code Sync), otherwise
  `gh repo create <org>/<site> --template adobe/aem-boilerplate --private --clone`, an `fstab.yaml` mounting `content.da.live/<org>/<site>/`,
  the AEM Code Sync app on the repo. Then the same `new <url> --dir <clone>` (it only installs into an existing repo), a branch, push, and
  `npx stardust-lite sync-poll <host> . styles/styles.css --trigger <org>/<site>/<branch>`. Needs `DA_TOKEN` (Adobe IMS bearer) in the env.

## 2. The live view — before anything is measured

From the site repo, in the background: `npx stardust-lite live proto --site-repo . --open <slug>`. It opens
`http://localhost:<port>/<slug>.harness.html` in the user's browser (a waiting page until the first prototype exists), swaps a changed
stylesheet in place and reloads on any other change at the same scroll offset; a busy port moves to the next free one. Tell the user the
URL it printed. It is for eyes only — never gate its port; the gated page is the harness port `first` prints.

## 3. The run

Record `date -u +%FT%TZ` in `TIMING.log` (t0). Then `npx stardust-lite first <url> --slug <slug> --template <template>` (`--no-da` in
`prototype` mode; with no branch host the chrome is folded locally by `local-fragments`). It measures, triages, authors, drafts the CSS,
builds the prototype and runs round 1, and prints the exact harness / round commands to re-use. From there follow CHECKLIST steps 4–9:
fix the model in the document (the draft is a draft — remodel it, lint it), write the block CSS from the brief and the spec rows, one round
at a time, until `target 10 %: REACHED` at 360 / 1440 / 2560 → `stop:`. Stamp the stop in `TIMING.log`.

What the field runs paid for (read before the first round):
- **Read probe-load's `fixed` list at t0.** A sticky announcement bar is stamped into every capture chunk (bmc-home: r1 at 72 %): add its
  close control to `migration/site.json` `overlays.dismiss` and re-run `first --skip probe`.
- The foundation's `decorateButtons` swaps the `strong` / `em` for the link: style `a.button.primary` / `a.button.secondary`, not `strong > a`.
- The content dump records letter-spacing only when non-zero: set it per text family, never body-wide.
- The pipeline writes `<a><strong>x</strong></a>` as `<strong><a>`: a bold link inside a sentence must not get the button rule.
- One document per page, nav / footer as their own documents; hand-author the chrome from the spec rows, never copy the source DOM.

## 4. Close

- `prototype`: write `migration/cases/<template>/` README, REPORT (clock, rounds table, lessons), REGISTER (triage, deviations with their
  pixel cost, motion), LINT; commit locally. Offer `eds` as the next step.
- `eds`: CHECKLIST steps 10–12 — media to DA **before** the document (DA stores `about:error` for an image not uploaded yet; check the served
  `.plain.html` for it), the document to `drafts/`, push, `sync-poll`, gate the served page, `leak` on both, then the case documents.
  Quote file lists for `da-put` as separate arguments (zsh does not word-split a `$VAR`).

Report to the user: the live-view URL, the rounds table (pixel % at 360 / 1440 / 2560 per round), what was not built (motion, menus,
forms) with its cost, and where the case documents are.
