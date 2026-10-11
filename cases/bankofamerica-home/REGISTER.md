# bankofamerica-home — register

## Triage (the model actually shipped; the `first` draft was replaced)
| # | section | model |
|---|---|---|
| 0 | FDIC strip "Bank of America deposit products:" | default content (p + FDIC svg); positioned over the header's 32 / 60 px top padding |
| 1 | masthead | `hero`: row 1 background (art-directed `| mobile <1025`), row 2 sign-in panel, row 3 open-an-account, row 4 h2, rows 5–8 card offers (image | number, label, fee, name, CTA, 360 link); quick links (360 only) as default list + 2 links |
| 2 | highlights + financial goals | `cards (super)` ×2, `cards (tiles)` ×4, h2 + p, `cards (goals)` ×4, p + button |
| 3 | news + connect | h2, `columns (news)` 2 rows, h2, `cards (connect)` ×4 |
| nav | | brand logo / three lists (top-left, top-right, menu) / search + Log in |

`first`'s draft (kept in git history): one `cards` block holding sign-in text + masthead offers with doubled responsive strings, a
`cards` of 9 rows with 3 empty rows, the goal tiles as loose default content, and the FDIC strip as `columns`. Re-modelled by hand.

## Deviations
- FDIC strip lives in main section #0, `position: absolute; top: 0` over the header's top padding (live: inside the chrome, above the header).
- Sign-in panel is static: labels + CSS-drawn inputs / checkbox, a bold link as the Log in button (no form — dynamic, out of scope).
- 360 quick links: text only, the live inline icons are not captured; the two outlined buttons have no icons.
- 360 financial-goals carousel: first card only, arrows / dots not built (space reserved).
- Footer social icons not authored (not in the capture); space reserved under "Connect with us". Footer link text renders heavier than live.
- Header: no dropdowns, static search field, no mobile drawer content.
- Hero card offers carry two links (desktop CTA, 360 link text) — one hidden per breakpoint.
- The live capture's sticky "Choose a checking account" bar (y≈820 at 1440, y≈870 at 360) is not built — overlay noise in the diff.
- 360-only texts ("Small Business", "Get the free app", mobile CTA strings, "Check your level", "Explore our app") were read from the
  360 capture; the harness content check (1440 JSON only) reports them as "not in the capture".

## Motion
None built; the live page's carousel (goals at 360) is static here.
