# equitable-home — register

## triage
| # | live | decision |
|---|---|---|
| 0 | header (nav bar + audience band) | header (nav.html hand-authored: brand "Our Site", 4 links, tools "Sign in") |
| 1, 2 | footer experience fragment (dumped twice as a content root) | footer (footer.html hand-authored, 4 sections) / drop |
| 3 | announcement banner | default content (h3 + link styled as pill) |
| 4 | hero | columns (image cell covers the section; title cell over it) |
| 5 | h1 + vimeo + transcript | default content (vimeo link → blank 16:9 box; transcript clamped to 2 lines; "Video transcript:" toggle as a p) |
| 6, 7 | disclosure, compliance stamp | default content |
| 8 | feedback form | `feedback` block (question / Yes · No / Send feedback + stamp) — static, no form behaviour |
| — | floating promo dialog, sticky-top | not authored (0 height in the flow) |

## deviations
- Vimeo iframe not embedded: a blank 16:9 box (the capture shows the frame blank); the link stays in the document.
- Transcript expand / collapse not implemented: the paragraph is clamped to two lines; the toggle is static text.
- Announcement close (×), header search icon, "Our Site" / "Customer support" carets, audience switcher content (hidden band) and the mobile drawer contents not built.
- Footer social links: authored as links with names, painted as empty 14×18 boxes (no icon font wired; themify.woff fetched but unused).
- Feedback radios and button are painted, not a form (no submit).
- cap-probe at 2560 (served gate) reports module 1400 → 1370: the source's text modules are 1400 with 15 px padding; content x and width (1370) match.

## motion
- Announcement `bounceInDown` entrance and the hero/header entrance states not reproduced (measured at rest).
