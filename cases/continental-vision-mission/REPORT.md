# REPORT — vision-mission (continental.com/en/company/corporate-governance/vision-mission/, `main` @ bca633b)

## Clock (t0 = 10:32:48Z, `first` start; TIMING.log)

| milestone | min |
|---|---|
| setup (reuse `sdt-continental-lite`, branch, stardust-lite bump, push, code sync 1 s) — before t0 | — |
| `first` (probe → measure → triage → media → author → spec-to-css → harness → gate r1) | 1.0 |
| restore the home's header / footer / cards / columns CSS and `styles.css` that `first` overwrote | |
| document re-modelled by hand + lint clean, CSS written, r2 | 6.4 |
| `stop:` (r2 under 10 % at the three widths) | 6.4 |
| deployed (media, doc, push, sync 12 s), served gate r1: 17.96 % at 360 | (not stamped) |
| leak → fix (a bold link in running text), redeploy, served gate | 13.2 |

## Rounds (pixel %, 360 / 1440 / 2560)

| round | 360 | 1440 | 2560 | what changed |
|---|---|---|---|---|
| r1 (`first`) | 29.59 | 22.26 | 18.96 | the draft: `embed` hero, breadcrumb with `:icon:` items, one stray `columns`, Code of Conduct as flat text, `accordion` for the social row; header CSS overwritten by `spec-to-css --force` |
| r2 | 4.71 | 2.93 | 2.50 | the document re-modelled (banner / breadcrumb / continued / compact / lucent / grey sections, `columns` 2 / 3 / media, `cards` 4-up, the home's `social` row); the home's block CSS restored and extended — `target 10 %: REACHED`, `stop:` |
| r3 | 4.71 | 2.93 | 2.50 | the document in the pipeline's markup (`<strong><a>`), the inline bold link rule — no change on the prototype |
| served r1 | 17.96 | 6.94 | 4.65 | `strategy` served as a pill (+20 px in #4, everything below shifted) |
| served | 5.56 | 3.22 | 2.61 | same document and code on `vision-mission`, `/drafts/continental-vision-mission`; cap-probe PASS at 2560; leak 0 differing lines at 1440, a 1 px whitespace offset at 360 |

## Lessons

- **On a second page of a site, `first` is destructive to the first page's code**: `spec-to-css --force` rewrote `header.css`, `footer.css`,
  `cards.css`, `columns.css`, `sections-draft.css` and added two `@import`s to `styles.css`; the author step drafted (and, without `--no-da`,
  would have uploaded) new `drafts/nav` / `drafts/footer` over the home's. Run with `--no-da`, then `git checkout` the shared files and
  extend them. A `first --rollout` (skip chrome, never `--force` an existing block CSS) would save the restore step.
- **The pipeline writes `<a><strong>x</strong></a>` as `<strong><a>x</a></strong>`**: a site whose `strong > a` is the inline pill (the
  home's Code-of-Conduct-style buttons inside a sentence) turns a bold text link into a pill on the served page only. Author the pipeline's
  order in the document so the prototype shows it, and give the bold text link its own rule.
- The draft's `:icon:` breadcrumb separators and the `embed` hero are modelling noise the triage could not know; a list in a `breadcrumb`
  section and a lone picture in a `banner` section lint clean and need no block.
- A batch `da-put` through an unquoted `$FILES` in zsh passed one argument (zsh does not word-split): six images missing, the document
  stored `about:error` for them. Upload media before the document, and check the served `plain.html` for `about:error`.
