# bms-home — report

Source https://www.bms.com/ · site aemcoder-adobe/sdt-bms-lite, branch blocks-first · draft https://blocks-first--sdt-bms-lite--aemcoder-adobe.aem.page/drafts/bms-home (preview only).

| | 360 | 1440 | 2560 |
|---|---|---|---|
| `first` round | 33.75 % | 30.08 % | 17.27 % |
| prototype (r4, stop) | 6.99 % | 2.92 % | 1.62 % |
| served | 7.01 % | 2.92 % | 1.61 % |

- Clock: t0 22:52:35Z → stop 23:11:23Z = 18.8 min (4 rounds); served 20.8 min. Tool time t0 → stop 300 s.
- cap-probe (served): PASS at 2560.
- leak: `leak-proto.txt` and `leak-served.txt` identical (13 selectors, 1440).
- Residual rows (served): Areas of focus Δh +22 (1440) / −32 (360), Pipeline Δh −32 / +40, empty row Δh −70 / −54; pipeline band 3600 at 1440 11.7 % (stats numbers, see REGISTER).
