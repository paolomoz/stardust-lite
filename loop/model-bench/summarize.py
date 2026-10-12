#!/usr/bin/env python3
"""Summarize the model × effort benchmark: one row per run from the headless result (<id>.json: model actually used, turns, cost,
API time) and the run's own repo (TIMING.log, gate/rounds/, gate-served/gate.json, REGISTER.md). Writes results.csv, prints a table.
Usage: python3 summarize.py"""
import csv, glob, json, re, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
T = lambda s: dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
mins = lambda a, b: round((b - a).total_seconds() / 60, 1)
runs = {}
for line in (HERE / 'runs.log').read_text().splitlines():
    p = line.split()
    if len(p) >= 5 and p[1] == 'START': runs[p[2]] = {'id': p[2], 'model': p[3], 'effort': p[4]}
rows = []
for rid, r in runs.items():
    res = {}
    try: res = json.loads((HERE / f'{rid}.json').read_text() or '{}')
    except Exception: pass
    mu = res.get('modelUsage') or {}
    used = ','.join(sorted(mu.keys()))
    H = Path.home() / 'stardust/2026-10' / f'sdt-rbc-{rid}' / 'migration/cases/home'
    ev, starts, stop_line = [], {}, None
    if (H / 'TIMING.log').exists():
        for line in (H / 'TIMING.log').read_text().splitlines():
            q = line.split()
            if 'CLOCK STOP' in line: stop_line = T(q[0]); continue
            if '[' not in line or len(q) < 3: continue
            lab = line[line.index('[') + 1:line.index(']')]
            if q[1] == 'START': starts[lab] = T(q[0])
            elif q[1] == 'END': ev.append({'label': lab, 'start': starts.pop(lab, None), 'end': T(q[0]), 's': int(q[-1].rstrip('s'))})
    rounds = []
    for f in sorted(glob.glob(str(H / 'gate/rounds/*.json'))):
        d = json.load(open(f)); rounds.append((T(d['_writtenAt']), {x['W']: x['pct'] for x in d['rows']}))
    t0 = min((e['start'] or e['end'] for e in ev), default=None)
    under = lambda p: all(isinstance(p.get(w), (int, float)) and p[w] < 10 for w in (360, 1440, 2560))
    si = next((i for i, (_, p) in enumerate(rounds) if under(p)), None)
    end_t = rounds[si][0] if si is not None else (stop_line or (rounds[-1][0] if rounds else None))
    tool = sum(e['s'] for e in ev if end_t and e['end'] <= end_t + dt.timedelta(seconds=1)) / 60 if end_t else None
    served = {}
    if (H / 'gate-served/gate.json').exists(): served = {x['W']: x['pct'] for x in json.load(open(H / 'gate-served/gate.json'))['rows']}
    reg = len(re.findall(r'^\s*[-|]', (H / 'REGISTER.md').read_text(), re.M)) if (H / 'REGISTER.md').exists() else ''
    clock = mins(t0, end_t) if t0 and end_t else None
    turns = res.get('num_turns')
    rows.append(dict(id=rid, model=r['model'], effort=r['effort'], model_used=used, under10_min=clock if si is not None else '', never='' if si is not None else '1',
                     stop_min=clock if si is None else '', tool_min=round(tool, 1) if tool is not None else '', llm_min=round(clock - tool, 1) if clock is not None and tool is not None else '',
                     rounds=(si + 1) if si is not None else len(rounds), turns=turns or '', s_per_turn=round(res.get('duration_api_ms', 0) / 1000 / turns, 1) if turns else '',
                     cost_usd=round(res.get('total_cost_usd', 0), 2) if res else '', wall_min=round(res.get('duration_ms', 0) / 60000, 1) if res else '',
                     final=' / '.join(str((rounds[si][1] if si is not None else rounds[-1][1]).get(w, '')) for w in (360, 1440, 2560)) if rounds else '',
                     served=' / '.join(str(served.get(w, '')) for w in (360, 1440, 2560)) if served else '', register_lines=reg, error=res.get('is_error', '')))
with open(HERE / 'results.csv', 'w', newline='') as f:
    if rows: w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
print('| id | model | effort | used | < 10 % (min) | tools | LLM | rounds | turns | s / turn | cost $ | final % | served % | register |')
print('|' + '---|' * 14)
for x in rows:
    t10 = x['under10_min'] if x['never'] != '1' else f"never ({x['stop_min']})"
    print(f"| {x['id']} | {x['model'].replace('claude-', '')} | {x['effort']} | {x['model_used'].replace('claude-', '')} | {t10} | {x['tool_min']} | {x['llm_min']} | {x['rounds']} | {x['turns']} | {x['s_per_turn']} | {x['cost_usd']} | {x['final']} | {x['served']} | {x['register_lines']} |")
