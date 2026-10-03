# bny-leadership — https://www.bny.com/corporate/global/en/about-us/leadership.html (template `leadership`, AEM Sites origin)

Final URL = requested URL (200, no redirect; `--locale en` pinned). Site repo `aemcoder-adobe/sdt-bny`, branch `blocks-first`, stardust-lite c8ecf9b.
Served draft: https://blocks-first--sdt-bny--aemcoder-adobe.aem.page/drafts/leadership (nav `/drafts/nav`, footer `/drafts/footer`, media `/drafts/media/`; preview only).

| | 360 | 1440 | 2560 (probe) |
|---|---|---|---|
| live doc height | 7031 | 3507 | 3507 |
| prototype pixel % (gate-r9) | 2.62 | 0.19 | 0.10 |
| served pixel % (gate-served) | 2.62 | 0.23 | 0.13 |
| Δh | −1 | 0 | 0 |
| cap-probe | — | — | PASS (5/5) |

Noise floor 0 % at 1440 (measure-page `--noise`, Δh 0). Residue named: Userway fixed widget in every live chunk (360), 1 px text anti-aliasing in the chrome bands.
Rounds: 1 table round (triage draft → sections-as-panels), 9 gate rounds (r1 three widths, r2–r4 base, r5–r7 three widths, r8 probe, r9 three widths + probes), 1 served gate.
Overlays: `--consent '#onetrust-accept-btn-handler' --dismiss .uwy --locale en`. Sections: measure-page's guess `div.aem-GridColumn` (2 sections: hero 384, general container 2645 at 1440).

Blocks written (shapes): `cards` variant `leadership` (container, 2 cols: picture | h3 + p + p>a; 20 + 12 rows), `tabs` (auto-built from section-metadata `tab`, one row per label; bar ≥ 992, "Category" dropdown below), `header` (nav fragment: brand / sections / tools; hides at scrollY > 0), `footer` (fragment: links grid 4 × auto + region button, social icons, legal). Section style `tertiary-hero`. Foundation: fonts.css (Akkurat Pro 400/700, Druk 700, Material Icons; no face for `BNYM_CORPORATE_Publico_Pro` — the source loads none), styles.css tokens from the brief.

Files: REPORT.md (what the run taught), REGISTER.md (triage, deviations, motion), LINT.md, TIMELINE.md, NOTES.md (friction, ranked), doc/ (authored documents + the author draft), scripts/doc-from-draft.py (the document edit), measure/ (specs, dumps, brief, deep probes, scroll probes; captures ignored), gate-r*/ + gate-served/ (gate.json, pixel/cap JSON, pair and sections tables; PNG ignored), probes/ (hover-diff JSON), leak-*.txt.
