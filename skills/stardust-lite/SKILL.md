---
name: stardust-lite
description: Migrate one web page to AEM Edge Delivery Services with high fidelity, blocks-first, inside the EDS site repo the session works in — open a live-reloading view of the prototype in the browser, measure the source at three widths, triage the content model (David's Model), author the document, write the blocks, gate the runtime prototype pixel-by-pixel until every width is under 10 %, optionally deploy to DA and gate the served page. Use when asked to "migrate <url> with stardust-lite", to migrate, replicate or prototype a page in EDS with a fidelity number.
---

# stardust-lite — one page, from a URL to a gated prototype

The method lives in this plugin: `${CLAUDE_PLUGIN_ROOT}/CHECKLIST.md` (twelve steps on one screen — read it before step 3 below),
`${CLAUDE_PLUGIN_ROOT}/METHOD.md` (the reference, read for a row), `${CLAUDE_PLUGIN_ROOT}/ROLLOUT.md` (a page after the template),
the open rows of `${CLAUDE_PLUGIN_ROOT}/BACKLOG.md` (`grep -n '| open'`; cite, do not re-solve). The instruments run inside the site repo
as `npx stardust-lite <name>` once step 1 has installed them (`npx stardust-lite list --usage` prints every usage line).

## 0. The context: an EDS site repo

stardust-lite works **inside an EDS site repo** — the session's working directory (or the repo the user names): the aem-boilerplate shape,
`fstab.yaml` mounting `content.da.live/<org>/<site>/`, `scripts/aem.js`, `head.html`. The blocks, styles and the case evidence are written
there; the branch host `https://<branch>--<site>--<org>.aem.page` is where a deploy is gated. This skill never creates that repo. If the
working directory is not one, stop and tell the user: open the session in the site's EDS repo (or create it first — the `eds-new-site`
skill, or a clone of `adobe/aem-boilerplate` with an `fstab.yaml`).

Read from the request and the repo:
- **URL** — the page. **Slug** `<domain label>-<last path segment | home>`, **template** the last path segment or `home`. Say what you picked.
- **Mode** — `prototype` (default: nothing leaves the machine; `first --no-da`) or `deploy` when the user says deploy / publish / preview /
  DA. Publishing is outward-facing: never pick `deploy` on your own. `deploy` needs the repo on GitHub with AEM Code Sync and `DA_TOKEN`.
- **A second page of a site that already has runs** (`migration/cases/` holds one): work on a new branch and read ROLLOUT.md first — a second
  `first` rewrites the first page's block CSS with `spec-to-css --force`; restore the shared files from git after it.

## 1. stardust-lite in the repo (≈ 30 s)

From the site repo: `node ${CLAUDE_PLUGIN_ROOT}/bin/stardust-lite.mjs setup <url> [--slug <slug>] [--template <name>]`. It refuses a
directory that is not an EDS site repo (exit 2 — stop as in step 0), installs stardust-lite and Playwright's Chromium, copies the foundation
(over the boilerplate's styles only on a fresh repo), writes `migration/run.json`, commits, and prints the two commands below. In `deploy`
mode work on a branch, push it, and `npx stardust-lite sync-poll <host> . styles/styles.css --trigger <org>/<site>/<branch>`.

## 2. The live view — before anything is measured

From the site repo, in the background: `npx stardust-lite live proto --site-repo . --open <slug>`. It opens
`http://localhost:<port>/<slug>.harness.html` in the user's browser (a waiting page until the first prototype exists), swaps a changed
stylesheet in place and reloads on any other change at the same scroll offset; a busy port moves to the next free one. Tell the user the
URL it printed. It is for eyes only — never gate its port; the gated page is the harness port `first` prints.

## 3. The run

Record `date -u +%FT%TZ` in `TIMING.log` (t0). Then `npx stardust-lite first <url> --slug <slug> --template <template>` (`--no-da` in
`prototype` mode; when the branch host serves no nav — a repo not synced yet — the chrome is folded locally by `local-fragments`). It measures, triages, authors, drafts the CSS,
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
  pixel cost, motion), LINT; commit. Offer `deploy` as the next step.
- `deploy`: CHECKLIST steps 10–12 — media to DA **before** the document (DA stores `about:error` for an image not uploaded yet; check the served
  `.plain.html` for it), the document to `drafts/`, push, `sync-poll`, gate the served page, `leak` on both, then the case documents.
  Quote file lists for `da-put` as separate arguments (zsh does not word-split a `$VAR`).

Report to the user: the live-view URL, the rounds table (pixel % at 360 / 1440 / 2560 per round), what was not built (motion, menus,
forms) with its cost, and where the case documents are.
