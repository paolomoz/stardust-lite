# marriott-home — timeline (UTC, 2026-10-10; t0 = 20:08:38, the start of `first`)

| t (UTC) | min from t0 | event | 360 / 1440 / 2560 % |
|---|---|---|---|
| 20:07:33 | −1.1 | setup start (repo, fstab, Code Sync, starter content, stardust-lite e0e3428, foundation, branch) | |
| 20:08:38 | 0.0 | t0 — `first` | |
| 20:10:32 | 1.9 | `first` exit 1: no nav / footer docs (header inside `main`, no `<footer>`), harness refused | |
| 20:12:11–20:13:07 | 4.0–4.5 | measure-page re-run by hand with `--header 'header.m-header' --footer 'footer, div.footer.aem-GridColumn'` | |
| 20:14:14 | 5.6 | `first --skip probe,measure` exit 1: :8990 held by another project's serve | |
| 20:15:51 | 7.2 | `first --skip probe,measure,media --port 8991` done, its first round | 79 / 64.84 / 46.76 |
| 20:22:39 | 14.0 | r1 | 23.68 / 34.79 / 31.28 |
| 20:27:03 | 18.4 | r2 | 22.56 / 22.7 / 23.18 |
| 20:29:42 | 21.1 | r3 | 23.08 / 23.92 / 23.74 |
| 20:31:37 | 23.0 | r4 | 20.83 / 19.79 / 20.94 |
| 20:34:00 | 25.4 | r5 | 18.76 / 15.53 / 13.54 |
| 20:35:50 | 27.2 | r6 | 17.87 / 11.91 / 10.83 |
| 20:37:38 | 29.0 | r7 | 13.98 / 9.1 / 8.29 |
| 20:39:16 | 30.6 | r8 | 12.27 / 8.92 / 8.19 |
| 20:40:37 | 32.0 | r9 | 11.62 / 8.92 / 8.19 |
| 20:42:36 | 34.0 | r10 — `stop:` under 10 % at the three widths | 7.74 / 8.39 / 7.95 |
| 20:45:11 | 36.5 | served gate (blocks-first branch, /drafts/marriott-home, preview) | 7.82 / 8.35 / 8.11 |

Tool seconds t0 → stop (TIMING.log): 878 s (14.6 min) of 34.0 min; the rest is model time.
