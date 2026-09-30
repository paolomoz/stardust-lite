# fidelity.com home — triage, deviations, motion (v2 procedure, 2026-09-30)

Source: https://www.fidelity.com/ (Akamai bot manager; from a non-US IP an "International Usage Agreement" interstitial is served —
`.accept-btn-box a` is the consent click, passed to every headed tool). Doc height 8448 (1440 and 2560), 10012 (360, settled).
Cap-probe: contentMaxWidth 1440 (module, 2 sections), shell fluid, probe 2560. Body bg rgb(249,247,245). Fonts Fidelity Sans 400/600/700,
Fidelity Slab variable 300. Noise floor (two 1440 captures): 5.95 % — bands 0:55.9, 450:55.7, rest 0 — the hero rotates per load.

## Triage table (step 2, before any block existed)

| # | section (live) | default content | block · shape · collection match · rows × cols | section style |
|---|---|---|---|---|
| 0 | header (utility bar + primary bar + search) | nav doc: brand link, 5-item list with nested lists, tool links | `header` · BC header (fragment /drafts/nav) — Fidelity look in header.css | — |
| 1 | full-hero (card over photo; photo below card at 360) | h1, teaser p, two button links | `hero (card)` · simple · BC **hero** · 1 × 1 (picture + h1 + p + 2 button paragraphs) | — |
| 2 | scroll-reveal (sticky tab list · 4 slides · sticky crossfading image) | — | `tabs (scroll-reveal)` · container · BC **tabs** · 4 × 3 (tab title · body: h3 + 3 bold-lead paragraphs + primary button + link · picture) | `white` |
| 3 | image-feature-block "A partner…" (image left 952 px, text right) | — | `columns (feature)` · container · BC **columns** · 1 × 2 (picture · h2 + p + button) | `white` |
| 4 | legal (FINRA line) | p with link, p link | none | `legal` |
| 5 | card-carousel "Expertise you can act on" (3 cards; arrows + dots at 360) | h2 | `cards (learn)` · container · BC **cards** · 3 × 2 (picture · h3-link + p + meta p with `:article:`/`:clock:` icons) | `creme` |
| 6 | image-feature-block "Why choose Fidelity?" (text left, image right) | — | `columns (feature)` · 1 × 2 (h2 + p + ul · picture) | `white` |
| 7 | image-feature-block minor "Looking for something else?" | — | `columns (feature, minor)` · 1 × 2 (picture · h2 + p + secondary button) | `creme` |
| 8 | disclosures (outside `main` on the source, before the footer) | 16 paragraphs (em, strong, sup, br, links) | none | `disclosures` |
| 9 | footer (3 link columns · Stay Connected zip form + 9 social links · logo + internal links · copyright + reserved links) | footer doc: 3 ul · h3 + p + link + ul · picture + ul · p + ul + p | `footer` · BC footer (fragment /drafts/footer); decorate builds the zip form from the label paragraph + "Search" link | — |

Hidden DOM not modelled: mobile nav duplicate, nav version t5b, skip link, Qualtrics "Feedback" tab, cookie/consent scripts.
Configuration: `template: home` (body class), `nav`, `footer` metadata. No per-section backgrounds beyond `white`/`creme`.

## David's Model lint at step 2
home 0 🔴 / 1 🟡 (hero = BC hero shape, justified); nav, footer clean — see LINT.md. Unchanged through the run.

## Deviations register

| source feature | decision | pixel cost (est.) |
|---|---|---|
| Hero rotates per load (4 variants seen: littleNow / goals-timeline / transferring / milestones) | session-variable region; document fixes "A little now could go a long way tomorrow"; origins at 360 and 2560 re-picked with origin-pick until the variant matched (the other-variant captures kept as `live-*-variant-*.png`) | with a non-matching origin: 360 +18 % (whole page shifts 63 px), 2560 +3.2 % (hero bands 31 %); with the matching origin: 360 hero band 19 % (mobile photo crop), 1440 0.9 %, 2560 ≈ 0 |
| Scroll-reveal photos have per-image focal points (`--focal-x/--focal-y` 59/50 · 70/60 · 40/40 · 65/30) | no authoring for a per-image focal point; build crops 50/50 | 360: bands 900–3600 at 12–31 % ≈ 5.5 % of the page; 1440/2560: ≤ 0.5 % per band |
| Scroll-reveal activation timing | live state does not move within a 450 ms chunk wait; build debounces 600 ms after scroll end (matched, not measured — scroll-probe could not run) | before: 1440 bands 1800–4050 at 5–14 %; after: ≤ 1 % |
| Nav item text width | build items 2–5 px wider each ("Investing" 66 vs 64) — same woff2, same size/weight/ls; cause not found | < 0.1 % |
| Header search "chat" round button | drawn as a 40 px empty ring (`.nav-search::after`); icon not modelled | ≈ 0 |
| Qualtrics "Feedback" tab (24 × 93 fixed, right edge) | decided out (third-party widget) | ≈ 0.02 % per width |
| Header search is a form with smart-suggest | link `:search: How can we help?` styled as the input; deviation accepted | 0 |
| Footer ZIP form | footer decorate builds `<form>` (input + Search) from the label paragraph and the "Search" link, action = branch locator | 0 |
| Nav level-2 dropdown panels (300 px white cards, shadow) | modelled as nested lists; hover/click opens; decided in | hidden at rest |
| Card whole-surface link | h3 link; cards.js makes the article clickable (role=link) | 0 |
| Scroll-reveal fades (sticky 60 px gradients top/bottom of the content column) | implemented in tabs.css (sticky pseudo-elements) | 0 |
| Stitch artifacts: sticky tab list / image repeat per 900 px chunk | instrument artifact on both sides (same capture shape) | 0 |
| Fonts | woff2 fetched from the Wayback Machine (assets.fidelity.com blocks curl); Slab variable weight 300 | 0 |
| Images | Wayback copies uploaded to DA `/drafts/media/*` (lowercase names), previewed on main; document references the preview-host URL so prototype and served page share one document | 0 |
| Live CSS custom props (`--fds-*`) | not read; values from measure.mjs only | — |

## Motion register (from motion-observe --headed, 1440)

| interaction | live | build | status (motion-compare, prototype = served) |
|---|---|---|---|
| primary button hover | bg rgb(54,135,39) → rgb(30,111,29) | styles.css | verified: parity |
| secondary button hover | bg transparent → rgb(230,228,225) | styles.css | verified: parity |
| tertiary link-button hover (Explore…) | bg → rgb(230,228,225) | tabs.css | verified: parity |
| nav level-1 hover | bg → rgb(245,243,240), class `level2-popup` (dropdown opens) | header.css/js (`aria-expanded` on hover) | verified: parity on the hover probe; "MISSING" on the class line — the source's class name only |
| nav utility links hover | none | — | decided out (dead on live) |
| card hover | box-shadow rgba(0,0,0,.1) 0 4px 8px (0.1 s), h3 → rgb(54,135,39) | cards.css | verified: parity (build also reports the inner `a` colour — inherited) |
| footer / legal links hover | no colour change | — | decided out (dead on live) |
| scroll-reveal image | opacity crossfade 0.75 s + class `visible` at slide thresholds | tabs.js (nearest slide, 600 ms after scroll end) | verified: parity (opacity transition + `visible` class) |
| scroll-reveal tab marker | transform 0.3 s | tabs.css/js | verified: parity (transform transition) |
| tab click | no sampled change on live (frame sampler blind to it) | tabs.js scrollIntoView + marker | implemented; not verifiable with this probe |
| header on scroll | static | — | decided out (dead on live, both sides) |
| cards at 360 | horizontal snap track, prev/next, 3 dots | cards.js | implemented; not probed (motion gate at 1440 only) |
| build-only transitions (bg 0.15 s, colour 0.1 s) | none on live | removed in r2 | verified: 0 extra |

Deep hover diff (pseudo-elements / subtree colour): NOT run — no instrument with `--headed` exists for it (see report).
