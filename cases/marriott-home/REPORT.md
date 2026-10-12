# marriott-home — report (five-minute loop field run, stardust-lite e0e3428)

- Source: https://www.marriott.com/en-gb/default.mi · site repo aemcoder-adobe/sdt-marriott-lite, branch `blocks-first`
- Prototype: `proto/marriott-home.harness.html` (port 8991) · served: https://blocks-first--sdt-marriott-lite--aemcoder-adobe.aem.page/drafts/marriott-home (preview only)
- Clock: first prototype at 7.2 min (79 / 64.84 / 46.76), `stop:` at **34.0 min** after 10 CSS rounds; setup 1.1 min; tool time to stop 878 s.

| | 360 | 1440 | 2560 |
|---|---|---|---|
| prototype (r10) pixel % | 7.74 | 8.39 | 7.95 |
| served pixel % | 7.82 | 8.35 | 8.11 |
| Δh doc | 0 | 0 | 0 |

- leak.mjs (22 wrappers, 360 and 1440): prototype and served identical.
- Lint: PASS, 0 🔴, 1 🟡 (hero D1, see LINT.md).
- Blocks: hero, carousel (×3 + the brands grid), header / footer fragments; default content for the search bar, member card, app / careers / link lists.
- Hottest residual bands: 1440 450–900 (27 %, hero photo + the source's live date text), 2560 450–1350 (hero), 360 1800–2700 (14 %, carousel arrows / dots not built).
