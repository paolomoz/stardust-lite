# home — https://www.bmc.com/

Template `home`, one page, stardust-lite `main` @ bca633b, one agent, **prototype only** (no repo on GitHub, no DA, no deploy).

- Site repo: local only, `/Users/paolo/stardust/bmc-proto` (aem-boilerplate + `init --foundation --force`), branch `proto`; `fstab.yaml` holds a
  placeholder mount (`local/sdt-bmc`) for `first` to read.
- Prototype: `http://localhost:8994/bmc-home.harness.html` (gated), live-reload view `http://localhost:8932/bmc-home.harness.html`.
- Chrome without DA: `scripts/local-fragments.mjs` writes `doc/nav.html` / `doc/footer.html` as `proto/drafts/{nav,footer}.plain.html`; the
  harness runs without `--fragments`.
- Blocks: `columns` (hero, highlights), `carousel` (stats timeline), `cards` (links, logos, resources), `header`, `footer`; section styles
  `hero`, `feature`, `highlights`, `stats`, `help`, `logos`, `disclaimer`, `dark`, `light`.
- Result: stop at round 3: 8.86 / 4.42 / 4.70 % (360 / 1440 / 2560); r4 (polish) 6.02 / 3.12 / 3.75 %.
- Files: `REPORT.md`, `REGISTER.md`, `LINT.md`, `gate-r1..r4.log`, `first*.log`, `brief.txt`, `TIMING.log`; `doc/*.draft.html` are `first`'s drafts.
