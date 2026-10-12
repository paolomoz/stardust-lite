# Register — take2games ir-news (Break Free: Borderlands®4 Now Available Worldwide)

Source: https://www.take2games.com/ir/news/break-free-borderlandsr4-now-available-worldwide (200, no redirect; final URL identical). Measured 2026-10-03 at 360 / 1440 / 2560, probe width 2700 (cap-probe: shell 2160 × 1.25). Consent: OneTrust `#onetrust-accept-btn-handler` (no reload). Noise floor 1440: 0 % (Δh 0).

## Triage (step 2 — content model before any block)

| # | source section (1440) | default content | block · shape · collection · rows × cols | section style |
|---|---|---|---|---|
| 0 | `header` 1440×80 — logo link, 5 items (2 are menu buttons) | nav document `/drafts/nav`: brand picture link; one list of 5 items (an item without a link is a menu label) | `header` (fragment decorate) | — |
| 1 | `main > nav.investorRelations_navBar` 1440×56 — sticky dark IR sub-navigation: 3 menu buttons + 1 link | — | **`ir-nav`** · simple · no collection shape · 1 × 1 — one cell holding a list of 4 items, three with a nested list (the click-revealed menus: Financial Information 4, Stock Information 2, Email Alerts 2 — `measure/clicks-irnav-1440.json`) | — (the block bleeds the bar) |
| 2 | `main > div.investorRelations_pageContent` 1440×3616 — the press release | h2; `:pdf: Download PDF` link; 31 paragraphs with `<strong>/<em>/<a>/<br>`; 2 lists (3 nested items); contacts paragraph with `<br>` | **`figure (left)`** · simple · no collection shape · 2 × 1 — row 1 picture, row 2 caption (the Business Wire key art floated left of the text) | `article` |
| 3 | `footer` 1440×179 | footer document `/drafts/footer`: brand picture; one list of 9 links (+ "Cookie Settings" → `#cookie-settings`) and the copyright paragraph; rating picture | `footer` (fragment decorate) | — |

Lint: PASS, 0 🔴, 2 🟡 D1 (`ir-nav` and `figure` are single-column prose-only blocks — justified: `ir-nav` is a sticky bar with click-opened menus and chevrons; `figure` floats a picture with its caption inside the text, which default content cannot express). Novelty 100 % of blocks (empty inventory).

## Deviations

| # | source feature | decision | pixel cost |
|---|---|---|---|
| D1 | The Business Wire image `mms.businesswire.com/…/Borderlands_4_Key_Art_-_Horizontal.jpg` renders as a **broken image** on the live page (the server answers 403 when the `Referer` is take2games.com — curl without a Referer gets the bytes): the live box is the alt text in 460×168 (460×158 at 360). | The picture is content: authored and shown inside the measured box (`object-fit: cover`, 460×168; 460×158 below 640). Geometry identical, paint differs. | the 450–900 band: 10.9 % at 1440, 7.1 % at 2560; 900–1800 at 360 3.4 % — the whole residual above the noise floor |
| D2 | The release ends with an empty paragraph (`<p>&nbsp;</p>`, 24 + 16 = 40 px) before "Source:" and holds a 1 px tracking-pixel paragraph (+16) before "View source version" — Business Wire boilerplate in every release. | Not authored (the pipeline drops empty paragraphs). The rhythm is modelled in the `article` section style: last paragraph `margin-top: 3.5rem`, third-last `margin-top: 2rem`. | 0 (Δh 0 at the three widths); before the rule: Δh −56 and a 19.9 % band from the chunk offset |
| D3 | Header mega-menus "Games" and "Policies & Conduct" (buttons opening panels; hidden content not click-dumped) and the mobile drawer's items. | Authored as menu labels (items without a link); the block renders them as buttons with the chevron; panels not authored. | 0 at rest |
| D4 | "Cookie Settings" is a `button` that opens the OneTrust preference centre. | Authored as a link to `#cookie-settings`; the footer block calls `OneTrust.ToggleInfoDisplay()`. | 0 |
| D5 | Live `header` is `position: sticky` with a `::before` veil (z −2) and `rgba(235,235,235,.8)`; mine is sticky with the same colour and shadow, no veil. | Equivalent paint; sticky kept so both stitched captures repeat the bar at chunk tops alike. | 0 |
| D6 | cap-probe at 2700: "module 2/2: live 480px → build 1872px" — the live module is the floated figure (`div#bwbodyimg`), the build's is `.default-content-wrapper`. | A one-module page: cap-probe reads the article's own float as a module (BACKLOG #162). Shell (2160) and module 1 (full-bleed bar) pass. Advisory. | 0 |
| D7 | `harness --content`: 14 article texts "not in the capture" — the paragraphs whose words sit inside Business Wire's inline `<org>/<location>/<chron>/<person>/<money>` elements, which the content dump dropped from the parent text. | Typed from the capture (dom-1440 text). | 0 |
| D9 | The pipeline drops a `<br>` that ends a `<strong>` (three bold title lines: "About Take-Two Interactive Software", "About 2K", "Cautionary Note…") and trims a space inside `<em>…</em>` ("Deluxe Editionfeatures"). | Document edit: the break and the spaces sit outside the inline formatting (`<strong>About 2K</strong><br>`, `<strong><em>Deluxe Edition</em></strong> features`). Served-only difference found by the leak table + pair (served gate 1: Δh −72 at 1440, −54 at 2560, 0 at 360). | 0 after the edit |
| D8 | Type scale 15 / 16 / 18 px (360 / base / ≥ 1920) via `html { font-size }`; cap `--shell: 120rem` (1920 / 2160), gutter 2 / 6 / 8 rem. | Measured at three widths (p 15/22.5 → 16/24 → 18/27; cap-probe shell 2160 at 2700). | 0 |

## Motion

| probe (live ⇒ build) | live | build | parity |
|---|---|---|---|
| hover header item (`a.css-1um7p1v`, `button.css-1xa2u0n`) | color + chevron fill #000 → #075f49 | `header nav .nav-sections a:hover, button:hover { color: #075f49 }` (inline SVG follows currentColor) | see gate-4/motion-compare.txt |
| click `#menu-button--ir-nav-0` ⇒ `.ir-nav button` | reach-portal panel [96,120,190,152], 4 rows of 32, white | `.ir-nav-menu` [96,136,214,152], 4 rows of 32, white, shadow | panel 16 px lower and 24 wider — not gated (click-revealed) |
| hover IR nav items, Download PDF, article links, footer links | no change (hover-diff) | none | dead on live |
| sticky header (top 0) and IR bar (top 80) | sticky | sticky | same |
| `transition: bottom` ×3 at 500 ms on live (`button.fixed.bottom-4.left-4`, the scroll-to-top button sliding in after one viewport) | present | not authored — a fixed utility layer, not content | MISSING in motion-compare, register row |
