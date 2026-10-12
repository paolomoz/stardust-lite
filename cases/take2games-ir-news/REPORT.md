# REPORT — take2games ir-news (v2 blocks-first, template run)

**Page**: https://www.take2games.com/ir/news/break-free-borderlandsr4-now-available-worldwide — Take-Two Interactive investor-relations press release ("Break Free: Borderlands®4 Now Available Worldwide"). Status 200, no redirect (final URL identical). Next.js page, 0 shadow hosts, OneTrust consent (`#onetrust-accept-btn-handler`, no reload). Headless Chromium accepted everywhere (no `--chrome`, no cookies).

**Served**: https://blocks-first--sdt-take2games--aemcoder-adobe.aem.page/drafts/ir-news-borderlands-4 (preview only; nav `/drafts/nav`, footer `/drafts/footer`, media `/drafts/media/`). Repo `aemcoder-adobe/sdt-take2games`, branch `blocks-first`, stardust-lite e4d7099.

## Numbers (pixel % vs the cached origin from `measure-page --noise`; noise floor 1440 = 0 %, Δh 0)

| build | 360 | 1440 | 2560 (probe 2700 for cap-probe) | Δh | section tables | cap-probe |
|---|---|---|---|---|---|---|
| prototype r1 (18:05) | 10.88 | 8.03 | 7.32 | 62 / −8 / −45 | article −63 / −8 / −6 | FAIL 3/3 (no shell) |
| prototype r2 (1440 only) | — | 4.74 | — | 56 | article −56 | FAIL 1/3 |
| prototype r3 — first < 10 % at three widths (18:14) | 7.02 | 1.76 | 4.69 | 19 / 0 / −3 | article −20 / 0 / +3 | FAIL 1/3 |
| prototype r4 + probes (18:19) | 1.94 | 1.76 | 1.14 | 37 / 0 / 0 | article −38 / 0 / 0 | FAIL 1/3 |
| prototype r5 (360 only, 18:21) — **final** | **1.11** | **1.76** | **1.14** | 0 / 0 / 0 | CLEAN | module 2 = floated figure (#162) |
| served 1 (18:25) | 2.6 | 6.56 | 5.12 | 0 / −72 / −54 | article −72 / −54 | same |
| served 2 (18:30) — **final** | **1.6** | **1.85** | **1.2** | 0 / 0 / 0 | CLEAN | same |

Leak table (18 wrappers, 1440): prototype = served, identical after the document fix. Residual band at every width: the 450–900 band (10.9 / 7.1 %) is the Business Wire key art that the live page cannot load (hotlink 403 → alt text in the 460×168 box) and the build paints inside the same box — register D1. Everything else ≤ 2.4 % (text anti-aliasing at chunk tops where the sticky chrome repeats).

## Clock (t0 = 17:45:50Z, first instrument on the page; setup 17:43:14 → 17:45:04 = 1 m 50 s)

| milestone | time | from t0 |
|---|---|---|
| measure done (2 runs; the default `--sections` matched nothing) | 17:49:41 | 3.9 min |
| triage table + author draft lint PASS | 17:55:54 | 10.1 min |
| document authored (hand-typed holes, ir-nav list, figure block), fragments + media previewed | 18:02:15 | 16.4 min |
| first harness prototype served | 18:03:16 | 17.4 min |
| gate r1 three widths | 18:05:15 | 19.4 min |
| first < 10 % at three widths (r3) | 18:14:51 | 29.0 min |
| probes run (r4) | 18:19:16 | 33.4 min |
| prototype final (r5) | 18:21:23 | 35.6 min |
| code pushed + synced, document put to DA | 18:23:19 | 37.5 min |
| served gate 1 | 18:25:49 | 40.0 min |
| served gate 2 (done) | 18:30:27 | 44.6 min |

Rounds: 2 table rounds (measure re-run; triage root), 5 prototype gate rounds (3 at three widths), 2 served gate rounds. CSS changed only what the tables named (REGISTER, NOTES).

## Content model (see REGISTER.md)

Two source sections in `main`: the sticky IR sub-navigation → block **`ir-nav`** (simple, 1 × 1: a list of 4 items, 3 with nested lists = the click-revealed menus); the press release → default content (h2, `:pdf:` link, 31 paragraphs, 2 lists with 3 nested items, contacts with `<br>`) with one block **`figure (left)`** (simple, 2 × 1: picture, caption) and section style `article`. Header and footer are fragments in the simplest shape (brand picture; one list; "Cookie Settings" as a `#cookie-settings` link the footer block wires to OneTrust). Lint PASS 0 🔴 2 🟡 (both justified).

## What this run taught

1. **A broken live image is a measurement no table names.** The spec reported `IMG fit=fill 460×168` for an `<img>` whose server 403s a take2games Referer; the live box is the alt text's (460×158 at 360). The build keeps the measured box and paints the picture inside it (D1). `live-spec`/`media-list` should carry `broken` (naturalWidth 0) and `brief` should print it.
2. **The content dump must flatten unknown inline elements.** Business Wire's `<org>/<location>/<chron>/<person>/<money>` were split into child nodes and their words removed from the parent text — 14 of 37 article nodes had holes in the draft and three nested list items were flattened. Typed from the capture; `harness --content` then flags those 14 as "not in the capture" (LINT.md).
3. **Chunk-aligned chrome amplifies Δh.** Both captures repeat the sticky header + bar at chunk tops; the last chunk is bottom-aligned, so a −56 Δh put the two copies 56 px apart (a 19.9 % band). The live header is `position: sticky`, not fixed — the first look's `fixed` list should say which.
4. **The Business Wire tail is a rhythm, not spacers**: an empty paragraph (40) and a tracking-pixel paragraph (16) every release carries; modelled in the `article` section style (`p:last-child`, `p:nth-last-child(3)` margins) — Δh 0 at the three widths.
5. **Two served-only normalisations METHOD step 5 does not list**: a `<br>` ending a `<strong>` is dropped, a space at the edge of `<em>…</em>` is trimmed (−72 at 1440, found by leak + pair in one served round). Author the break and the spaces outside the inline formatting; the harness fold should apply both.
6. **Type scale as a root font-size**: p 15/22.5 → 16/24 → 18/27 and every scaled length (insets, chevrons, paddings) follow one factor per width; `html { font-size: 15 / 16 / 18 px }` with rem everywhere and px for the constants (shell 120 rem is the exception that scales: 1920 → 2160, the content 1872 at both 2560 and 2700).
7. **cap-probe on a one-module article** reads the floated figure as module 2 (#162) — FAIL printed, advisory by BACKLOG; shell and the full-bleed bar pass.

Blocked: nothing. Not done: the header mega-menus' and the mobile drawer's panel contents (hidden content, D3), the scroll-to-top utility button (motion row).
