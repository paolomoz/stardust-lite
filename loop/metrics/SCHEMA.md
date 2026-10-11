# Run metrics — one CSV row per run (first-page prototype runs of stardust-lite)

Write CSV with EXACTLY this header (comma-separated, quote fields containing commas; empty = unknown; numbers plain, minutes to 1 decimal):

slug,period,run_label,t0_utc,site_url,code,setup_min,setup_src,first_proto_min,under10_min,never,stop_min,under10_360_min,under10_1440_min,under10_2560_min,served_min,rounds_n,r2_elapsed_min,r3_elapsed_min,r2_tool_s,r3_tool_s,tool_min,llm_min,split_src,first_360,first_1440,first_2560,deliver_360,deliver_1440,deliver_2560,served_360,served_1440,served_2560,turns,sections,doc_h_1440,notes

Definitions (all minutes are from t0 = the first instrument of the migration, NOT setup):
- period: A (Sep 30–Oct 1), B (Oct 3–4), C (Oct 9–11 inspection runs + five-minute loop).
- run_label: the loop label if any (I1–I3, L1–L22), else blank.
- setup_min: repo/site setup before t0. Prefer GitHub repo creation → t0: `gh api repos/<owner>/<repo> --jq .created_at` (owner usually aemcoder-adobe; find the repo name in the case files or the work dir's `git remote -v`). setup_src: `repo-created` | `timeline` (setup_start/end stamps) | `report` (stated in prose) | blank.
- first_proto_min: t0 → the first gate round on the first built prototype (a `first` re-run after a triage fix does not move it; say in notes when the run's own table names a later moment).
- under10_min: t0 → the first gate round under 10 % at ALL THREE widths 360 / 1440 / 2560 (use the run's own "stop" / "first < 10 % at all three" statement when present). never=1 if not reached; then stop_min = when the clock stopped.
- under10_<W>_min: t0 → the first round where that width is < 10.
- served_min: t0 → served gate done (after deploy to aem.page preview). served_<W>: its pixel %.
- rounds_n: number of gate invocations (any widths) from the first prototype's round (counted as 1) to the round under target (or the stop).
- r2_elapsed_min / r3_elapsed_min: time from the previous round's result to the 2nd / 3rd round's result (agent work + gate).
- r2_tool_s / r3_tool_s: the gate command's own duration for round 2 / 3 (TIMING.log, or the round's printed timing; else blank).
- tool_min: instrument time t0 → under10 (or stop): sum of TIMING.log durations when present (split_src=`exact`); otherwise an ESTIMATE from step stamps / stated durations / rounds × that era's gate time (split_src=`estimate`, say how in notes) — the user wants estimates for older runs, not blanks, unless nothing supports one. llm_min = (under10 or stop) − tool_min.
- first_<W>: pixel % of the first round per width. deliver_<W>: pixel % of the round under target (or the last round if never).
- turns: model turns of the run's agent if known — count UNIQUE assistant message ids (message.id) in the run agent's transcript, not raw lines; else blank.
- sections: live sections in the split (triage rows of main content). doc_h_1440: live document height at 1440 (measure summary / probe line).
- notes: ≤ 200 chars: estimation methods, anomalies (stalls excluded, by-hand stops, single-width rounds).
Never guess silently: an inferred value gets its method in notes; an unknown stays empty.
