# Backlog — every item traces to a case

Items come from `cases/*/REPORT.md` ("what the document got wrong or left out"). An item is closed by a change to METHOD.md or an
instrument **and** a case run that no longer hits it.

| # | item | source case | status |
|---|---|---|---|
| 1 | Local instruments (`live-spec`, `scroll-probe`, `sections`, `pair`, `leak`) have no live-page tier; on a bot-managed origin the measurement half is dark. Give `common.mjs` the tier `tools/diff/live-session.mjs` already has (real Chrome channel) — decide explicitly whether that is acceptable for the operator. | fidelity-home | open |
| 2 | Geo / consent interstitials: consent can be a full page; the accept control must reach every tool (`--consent`). Add to prerequisites. | fidelity-home | open |
| 3 | Session-variable regions decide the gate unless the origin is picked. Make `origin-pick.mjs` a step; keep the noise-floor pair. | fidelity-home | open |
| 4 | Media path so prototype and served page share one document (pipeline sideloads any reachable URL; `content.da.live` is not public; lowercase names; DA store is case-insensitive). One paragraph in METHOD.md. | fidelity-home | open |
| 5 | `:icon:` tokens: the harness fold does not convert them, the pipeline does. Fold them in `harness.mjs`. | fidelity-home | open |
| 6 | `gate.mjs` must default to the vendored tools. | fidelity-home | done (common.mjs → tools/replica) |
| 7 | Harness port collision gated another case's server. The harness should verify the served file is the one it wrote (hash) and refuse otherwise. | fidelity-home | open |
| 8 | `wrapTextNodes` wraps a picture-first cell into one `<p>`; the pipeline does not. Note in step 4; hero decorate must handle both. | fidelity-home | open |
| 9 | The stitch-shot chunk wait (450 ms) is a motion parameter: scroll-driven state that debounces longer never appears in the origin. Name it in step 6. | fidelity-home | open |
| 10 | Section-metadata folding is the pipeline's, not `aem.js`'s (boilerplate 2026). Say so in step 5. | fidelity-home | open |
| 11 | `measure-to-spec.mjs`: items from runs with different session states carry inconsistent y (36 px at 360). Record the session state per run or measure in one run. | fidelity-home | open |
| 12 | stitch-shot: per-chunk settle option (GSAP ScrollSmoother origins captured mid-lag, self-diff 1.65 %). | baincapital-home | open |
| 13 | `davids-model-lint`: accept a fully qualified video link inside a container row whose link text is not the URL. | baincapital-home | open |
| 14 | `eds-new-site` should trigger the branch code sync after the first push and poll. | baincapital-home, fidelity-home | open |
| 15 | Case folders: keep the tables, drop the captures (gitignored); a case README lists what regenerates them. | both | done (.gitignore) |
