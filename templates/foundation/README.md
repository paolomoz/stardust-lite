# Foundation (copied by `npx stardust-lite init --foundation`)

Site code the migration owns after copying — not a dependency, never updated from stardust-lite. `init --foundation` writes each file
only when it does not exist yet and prints what it wrote and what it skipped.

- `scripts/stardust.js` — the helpers the first seven migrations each rewrote in `scripts.js`: `decorateIconTokens(root)` (`:name:` →
  `<span class="icon icon-name">`), `inlineIcons(root)` (the `.icon` `<img>` swapped for the fetched inline SVG, cached, so `currentColor`
  applies), `buildWidgetAutoBlocks(main)` (a `/widgets/` link → `widget` block), `readFragmentSections(fragment)` + `itemOwn(li)` (a loaded
  fragment's sections read through the pipeline's `.default-content-wrapper` and `li > p` rules), `hideEmptySections(main)`. The site's
  `scripts.js` imports what it uses: `import { decorateIconTokens, inlineIcons, buildWidgetAutoBlocks } from './stardust.js';` and calls
  `decorateIconTokens(main)` before `decorateIcons(main)` in `decorateMain`, `inlineIcons(main)` after it, `buildWidgetAutoBlocks(main)` in
  `buildAutoBlocks`. Nothing in it is a measurement.
- `styles/reset.css` — the resets in `:where()` (specificity 0, so no block rule loses to them), `[hidden] { display: none !important }`,
  the empty metadata section rule `main > .section:not(:has(> *))`, the icon box, the runtime's `body.appear` / block-loaded visibility.
  `styles.css` imports it first.
- `styles/styles.css` — the skeleton with the token names the spec produces (`--shell`, `--content-max`, `--gutter`, `--nav-height`,
  `--section-gap`, `--body-font-family`, `--heading-font-family`, body size / line-height / weight / colour), each with a `/* spec: … */`
  comment naming where in `migration/site.json` or the spec its value comes from; the cap placement is a choice of one line from
  cap-probe's kind. None of the boilerplate's unmeasured rules (button look, wrapper cap, heading scale).
- `styles/fonts.css` — one `@font-face` template; the faces from `site.json fonts.faces`, the bytes under `/fonts`.

Page 1 of a site pours measured values into this skeleton instead of stripping the boilerplate by hand (three of walgreens' four rounds);
page N never touches these files unless a deviation names them.

`blocks/header/` and `blocks/footer/` (JS + CSS skeletons, `--force` replaces the boilerplate's): each fragment section's CONTENT lands in one `div` (`nav > .nav-brand / .nav-sections / .nav-tools`, `.footer > .footer-N`) — the pipeline's `.default-content-wrapper` is flattened away, so the CSS styles one level; the hamburger, `.nav-drop` and icon inlining are structure, every size is the spec's.
