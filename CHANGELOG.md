# Changelog

Versioning: patch (x.x.1) for a fix, minor (x.1.x) for a new feature or a breaking change — see CLAUDE.md.

## 0.2.0 — 2026-10-12
- **The fast path** (#17): `first` runs measure → triage → media → author → drafts → harness → the first gated round in one call, prints the
  re-run commands, stops on a block page; documents upload after their media.
- **Rounds** (#17, #19): the digest prints every width and each section's own % beside its page-aligned share; reading cards per section
  (`cards`), refreshed every round; `section-view` (one section's mini-gate, by index / block / anchor); every round kept in `rounds/` with
  its section tables and digest.
- **Generator** (#17): section drafts from their own band, content between tall-section parts kept, chrome-split rows dropped, the nav
  logo, SVG markers and icon links, visible text only, `div` text drafted as `p`, no file-name selectors (served parity).
- **Media and capture** (#17): SVGs the delivery refuses drawn as PNG, identical font files declared as one variable face, chat widgets
  hidden before the page's scripts, horizontal scroll restored after the lazy-picture pass; `decorateVideos` in the foundation.
- **Docs** (#18): `CHECKLIST.md` and `METHOD.md` follow the field protocol.
- Evidence: `loop/metrics/charts.html` (60 runs), `loop/five-min/REPORT-next-phase.md`, `loop/model-bench/RESULTS.md`.

## 0.1.0
- The blocks-first method, instruments and foundation templates before the five-minute loops.
