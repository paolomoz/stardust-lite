# The next phase — report (2026-10-11 19:20Z → 2026-10-12 02:20Z, hands off)

Asked: run the full plan of `NEXT.md` hands off, iterate on as many sites as needed, stop at 02:20Z with a report and updated charts.
Charts: `loop/metrics/charts.html` (data `loop/metrics/runs.csv`, 59 runs; tonight's 10 are period D). Running log: `loop/five-min/NEXT.md`.
Code: `exp/five-min` (pushed). Cases: `cases/*-p1`, `cases/lenovo-home-p2`, `cases/bankofamerica-home`, `cases/cisco-home`, `cases/okta-home`, `cases/accenture-home`.

## Result
The 5-minute target was not reached. Tonight's runs: median time to under 10 % **16.0 min** over the 9 that reached it (14.7 without P5,
the no-bands control); the loop's median was 20, before the loop 43–66. Tools are now a median 5.2 min of a run, the agent 10.7.
On a fixed panel of already-run pages, re-run with tonight's code by fresh agents, the hard pages got much faster and the easy ones held:

| page | loop run (old code) | panel re-run | Δ |
|---|---|---|---|
| santanderus | L16 8.0 | P1 8.8 | +0.8 |
| wpp | L7 9.7 | P2 9.5 | −0.2 |
| rbc | L18 14.7 | P3 11.0 | −3.7 |
| waters | L20 33.7 | P4 13.3 | **−20.4** |
| lenovo | L22 34.8 | P5 33.4 (without the bands) | −1.4 |
| lenovo | L22 34.8 | P6 16.5 (P5 + the bands: a field A/B) | **−18.3** |

New pages: cisco 16.1, accenture 17.3, bankofamerica 22.1, okta never (35.3, a chat widget in every live tile), nfm skipped (a location
block — `first` now stops on block pages).
Served pages matched their prototypes on P1–P4, cisco, bankofamerica and accenture (after one fix); lenovo P6 served 11.75 at 1440 (a slider scrolled sideways in
the served capture — fixed in settle after the run).

## How it was run
- Machine-side changes one at a time on the replay bench (no agent, deterministic, the 23 finished loop pages), each variant from a frozen
  checkout (the first baseline read a worktree being edited and was redone).
- Combined changes on a fixed PANEL of already-run pages: fresh repo, fresh agent, the same protocol, not shown the earlier work; each
  compared with its own earlier clock — the page's difficulty cancels. Then new pages from the seeded order.

## What changed (kept)
Each with the run that found it:
- **spec-to-css bands** (lenovo): rows that share one coarse spec section are drafted from their own band, not from the whole wrapper.
  Field A/B on lenovo: 33.4 → 16.5 min. (The bench had rejected it — see the method finding.)
- **Reading cards** (`gate/cards/`): one card per build section — owner file, Δh / % per width, the live values inside its range at
  1440 / 360, live | build crops — refreshed every round. Agents read them instead of writing flatten scripts.
- **section-view** takes a block name / anchor text and lists the digest's sections on a miss (lenovo passed brief's live numbering).
- **The gate**: keeps every round in `rounds/`, prints widths under target, prints each section's own % beside its page-aligned share.
- **Content and documents**: the tall-section split keeps content between heading-led parts (lenovo's rewards band and title, bms' two
  h4-led sections); the nav brand is its logo (`<a><picture>`); SVG backgrounds on text elements are markers, not pictures (rbc's 30
  chevrons; bench rbc −10.7 at 360); an icon-only link keeps its icon and label; a row with a chrome row's box is dropped (exactly the
  rows agents dropped by hand); visible text excludes inline-SVG `<style>`; a heading beside a picture keeps its `em` words.
- **Drafts**: a text in a bare `div` is a `p` rule (bench: marriott −4.9, unitedrentals −5.9 at 360); a section's background picture is
  drafted once; the picture-behind-text rule names its one picture (cisco, bankofamerica: icons became full-bleed backgrounds).
- **Media and delivery**: SVGs the delivery refuses (embedded raster / script / > 40 KB) are drawn as `-svg.png` (lenovo's served drift:
  preview 409 → `about:error`); documents upload after their media (waters' logo stored as `about:error`); failed uploads named; faces
  with identical bytes declared as one variable face (lenovo's Montserrat 600 rendered 700).
- **Foundation**: `decorateVideos` renders a video authored as poster + link (wpp, waters, mheducation: videos never rendered).
- **Guards**: `first` stops on a block page (nfm ran the whole pipeline on "Access Denied" and the gate printed REACHED); the capture hides
  chat launchers (okta) and restores horizontal scroll after the lazy-picture pass (lenovo P6 served).

## Rejected, flagged or not testable
- **Reverted at the end for served parity**: two draft rules named their picture by its local file name (the section's background
  picture; the picture behind the text). The served page renames media to `media_<hash>`, so they held on the prototype and missed on the
  delivery (accenture's careers backdrop: served 1440 at 7.53 % until fixed by hand). Back to the block-wide rule; naming ONE picture by a
  delivery-stable key is open (first next item).
- Rejected on the bench, then **re-adopted on field evidence**: the bands (above).
- Kept **against** the bench, on content fidelity: the gap-part split (lenovo −0.5…+6 points: two visible rows were missing from the
  document) and `decorateVideos` (mheducation +22 / +34 at 1440 / 2560: its hero is a background video, now rendered in flow; wpp −3).
- No effect, reverted: the cards per-row count from the fullest row (the chosen unit was the 2-span card itself).
- Not testable here: a faster model (item 7) — the deployment has no Sonnet model; nothing was run.
- Not started: hybrid fan-out (item 5), machine geometry rounds (item 6). Items 11–12 are the user's decision.

## The bench at the end
Every kept generator change together (`loop/bench/n9-final.json`) against the baseline (`n0-base.json`), 19 pages replaying on both:
medians unchanged (54.0 / 58.8 / 46.2 %, Δ 0.0 at each width) — better on 6 pages (rbc −10.7, unitedrentals −5.9, continental −3.5,
marriott −2.4 at 360; wpp −3.2 at 1440; omnicom −15.7 at 360), worse on 4 (nfl, sherwin-williams: the bands; mheducation: the videos;
merck +2.4 at 360). The machine-only first prototype is still ≈ 50 % — the gain is in how much of it the agent keeps, not in its %.

## The finding about the method
The bench's metric — the machine-only first-round pixel % — misjudges draft quality. The bands drafted every Lenovo section from its own
range and the bench read the page 2–6 points worse (the old wrapper-wide padding happened to make the incomplete machine build taller and
closer); in the field the same change halved the clock (33.4 → 16.5) because the agent kept the drafts instead of rewriting them for
14 min. The bench is still the right gate for a regression (a page breaking, a rule hitting every element), but a draft change should be
scored by whether the agent keeps the draft: a field A/B on one hard page, or a bench metric of "drafted values that match the final CSS".

## Where the clock goes now
Tools are 2–8 min of a run (median ≈ 5). The agent's own pass is the rest, and tonight's notes put its largest chunks in three places:
1. **`author` mis-modelling a section** (bankofamerica ≈ 10 min: a sign-in form, heading and four offers fused into one cards block;
   rbc ≈ 4 min: accordions dropped; okta ≈ 6 min: empty slide cells, missing cards; wpp: heading semantics lost). The largest remaining cost.
2. **Drafts the agent rewrites anyway** (cisco, okta: `sections-draft.css`'s `nth-of-type` rules beat `styles.css`, so the agents dropped
   the import; a 608 px cap read from a narrow column on waters).
3. **Capture residuals that no CSS fixes** (okta's chat tiles, lenovo's served slider) — guarded tonight, unverified on okta.

Next, in order: a delivery-stable way for a draft to name one picture (see the parity revert), the author's block modelling for forms / offers / accordions (scored by the agents' re-author minutes on the panel), the
draft specificity (`sections-draft.css` at `:where()` specificity or after `styles.css` with a clear owner), the bench metric for drafts.
