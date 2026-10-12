# REPORT — manulife-business (blocks-first v2, loop run; stardust-lite 98b3529)

Page: https://www.manulife.com/ca/en/business (final URL unchanged) · site repo `aemcoder-adobe/sdt-manulife`, branch `blocks-first` · served: https://blocks-first--sdt-manulife--aemcoder-adobe.aem.page/drafts/business (preview only).

## Numbers

| | 360 | 1440 | 2560 (probe) |
|---|---|---|---|
| prototype (r7) | 2.01 % Δh 0 | 0.67 % Δh 0 | 0.37 % Δh 0 |
| served | 2.02 % Δh 0 | 0.67 % Δh 0 | 0.38 % Δh 0 |
| noise floor (live vs live, 1440) | — | 0 % Δh 0 | — |

cap-probe PASS at 2560 · motion 3 parity / 0 missing / 1 advisory · leak table prototype vs served identical · lint PASS (1 🟡 justified) · doc height 5696 / 4350 / 4350 on both sides.

## Clock (TIMELINE.md)

setup 2 min 13 s (16:22:34 → 16:24:47) · t0 16:30:36 · measure 16:33 (polluted) → re-measure 16:40 · triage + lint clean 16:51 · document 16:55 · **first prototype 17:01 (t0 + 31 min)** · **first < 10 % at three widths 17:13 (t0 + 43)** · probes pass 17:28 (t0 + 58) · synced 17:29 · DA put 17:29 · **served gate 17:33 (t0 + 62.5)**. Table rounds: 2 triage drafts + 1 edit; gate rounds: 7 prototype + 1 served (3 of the 7 were CSS rounds: r1→r2, r3→r4, r5→r6).

## Blocks written (6, all new; shapes in REGISTER §1)

`hero` (1 × 1), `cards` (tiles 3 × 2 · icons 4 × 2 · icons linked 2 × 2), `carousel` (cards 3 × 2 · articles 6 × 3; prev/next/counter, 3 per page ≥ 768), `columns` (banner 1 × 2), `header` (nav fragment: 4 sections), `footer` (fragment: 3 sections). Foundation: `styles.css` (module cap 1200, three section styles `padded` / `surface` / `spaced-bottom`, tokens), `fonts.css` (5 faces), `/fonts` (5 woff2), `/icons` (20 SVGs).

## What this page taught

1. **A web-components origin is dark to the content dump.** 114 shadow hosts: `content-dump` / `triage` / `brief` / `author` saw no text in the product carousel, the hero tiles, the article cards (only `<time>`) or the footer, and `harness --content` flagged 28 texts as "not in the capture". The texts came from `probe-structure --pierce` (depth 26) and the components' JSON attributes in `dom-1440.html` (`cards=`, `links=`, `primary-tab-items=`), and the document was finished by hand. The method needs a pierced content dump (`content-dump --pierce`, or `measure-page` piercing when `probe-load` counts shadow hosts > 0) — the single biggest cost of the run (≈ 12 min across triage, author and texts).
2. **`--dismiss` is a click.** Passing the Kampyle feedback *opener* as `--dismiss` opened the Medallia survey into every chunk of the origin captures; the noise floor was 0 % because both live captures held it. No instrument said "a new overlay appeared after dismiss". Re-measure cost 70 s plus 3 min of reading crops.
3. **The section guess matched nested grid columns** (12, nested) and `triage` read 2 sections (hero + a 3168-px lump). The flat split had to be read from the pierced structure and passed as `--sections`. The guess should keep the shallowest non-overlapping set.
4. **`:where()` must wrap the whole reset selector.** `footer .footer :where(ul)` still outranks `.footer-group-list` (the prefix counts); two rounds (r2, r6) went to the same trap in header, footer and carousel. METHOD step 4 says "resets go in :where()" — it should say "the whole selector".
5. **Block-created `.icon` spans need `decorateIcons(block)` before `inlineIcons(block)`** — every icon was empty in r1 (the DOM showed it; the gate's hottest band did not). The foundation could export one `decorateBlockIcons(block)` that does both.
6. **Fonts behind a WAF**: 403 to curl, node fetch and even an in-page `fetch()`; only the page's own `@font-face` responses carry the bytes. `scripts/fetch-bytes.mjs` (case script) saves them from `page.on('response')` — a generic lift candidate for `media-fetch --browser`.
7. **The pipeline's `decorateButtons` runs before a block's decorate** and drops `<em>`/`<strong>` around a lone link: read the `secondary`/`primary` class it leaves, not the markup.
8. The pairing (`pair`) mis-anchored the header controls ("Search" → `.nav-tools` 262 wide, "Sign in" → the inner span) in every run while `deep-probe` on the build showed the right boxes; the Δy·loc column and the group offsets were right every time and named the three real rounds (−60 / −40 / +42 cascade; Δx +48 selectors; row gap 64).

## Blocked / not done

Nothing blocked. Not built by decision: mega-menus, mobile drawer, search layer, third-party layers (REGISTER D1–D4). `site-profile init` and `block-inventory scan` were run at the end (migration/site.json, migration/blocks.json) — see the case README for the profile print.
