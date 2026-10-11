#!/usr/bin/env python3
"""Build loop/metrics/part-D.csv (period D: the next-phase panel and new pages, 2026-10-11 evening) per loop/metrics/SCHEMA.md.
Everything is read, nothing transcribed: TIMING.log (labels + seconds), the gate's rounds/ history (every round's % per width), the
served gate.json, triage.json, measure/summary.json, the GitHub repo's creation time and the run agent's transcript (unique message ids).
Usage: python3 build_d.py   (runs listed in RUNS below)"""
import csv, glob, json, subprocess, datetime as dt
from pathlib import Path

W = Path(__file__).parent
OUT = W.parent / 'part-D.csv'
SUB = Path('/Users/paolo/.claude/projects/-Users-paolo-stardust-stardust-lite/614dd9f2-bfec-468f-9209-027bfa3cb115/subagents')
# (label, repo, slug, code, note)
RUNS = [
    ('P1', 'sdt-santanderus-p1', 'santanderus-home', 'e8dfd0a', 'panel re-run of L16 (8.0)'),
    ('P2', 'sdt-wpp-p1', 'wpp-home', 'e8dfd0a', 'panel re-run of L7 (9.7)'),
    ('P3', 'sdt-rbc-p1', 'rbc-home', 'b60175f', 'panel re-run of L18 (14.7)'),
    ('P4', 'sdt-waters-p1', 'waters-home', 'c0c9e90', 'panel re-run of L20 (33.7)'),
    ('P5', 'sdt-lenovo-p1', 'lenovo-home', '7a9be3d', 'panel re-run of L22 (34.8)'),
    ('P6', 'sdt-lenovo-p2', 'lenovo-home', 'a8b975a', 'field A/B of P5: the same code + the spec-to-css bands'),
    ('N1', 'sdt-nfm-lite', 'nfm-home', '5104a9f', 'new page'),
    ('N2', 'sdt-bankofamerica-lite', 'bankofamerica-home', None, 'new page'),
    ('N3', 'sdt-cisco-lite', 'cisco-home', None, 'new page'),
]
HEADER = open(W.parent / 'part-C.csv').readline().strip().split(',')
T = lambda s: dt.datetime.fromisoformat(s.replace('Z', '+00:00'))
mins = lambda a, b: round((b - a).total_seconds() / 60, 1)


def timing(path):
    ev, open_ = [], {}
    for line in Path(path).read_text().splitlines():
        p = line.split()
        if len(p) < 3: continue
        lab = line[line.index('[') + 1:line.index(']')]
        if p[1] == 'START': open_[lab] = T(p[0])
        elif p[1] == 'END': ev.append({'label': lab, 'start': open_.pop(lab, None), 'end': T(p[0]), 's': int(p[-1].rstrip('s'))})
    return ev


def turns_of(repo):
    for meta in SUB.glob('agent-*.jsonl'):
        try:
            with open(meta) as f:
                head = f.read(20000)
            if f'REPO = {repo}' not in head: continue
            ids = set()
            with open(meta) as f:
                for line in f:
                    if '"type":"assistant"' not in line.replace(' ', ''): continue
                    try: m = json.loads(line).get('message', {})
                    except Exception: continue
                    if m.get('id'): ids.add(m['id'])
            return len(ids)
        except OSError: continue
    return ''


rows = []
for label, repo, slug, code, note in RUNS:
    H = Path.home() / 'stardust/2026-10' / repo / 'migration/cases/home'
    if not (H / 'TIMING.log').exists(): continue
    ev = timing(H / 'TIMING.log'); t0 = min(e['start'] or e['end'] for e in ev)
    rounds = []
    for f in sorted(glob.glob(str(H / 'gate/rounds/*.json'))):
        d = json.load(open(f)); rounds.append((T(d['_writtenAt']), {r['W']: r['pct'] for r in d['rows']}))
    if not rounds: continue
    under = lambda p, ws=(360, 1440, 2560): all(isinstance(p.get(w), (int, float)) and p[w] < 10 for w in ws)
    stop_i = next((i for i, (_, p) in enumerate(rounds) if under(p)), None)
    end_t = rounds[stop_i][0] if stop_i is not None else rounds[-1][0]
    first_t, first_p = rounds[0]
    u = {w: next((mins(t0, t) for t, p in rounds if isinstance(p.get(w), (int, float)) and p[w] < 10), '') for w in (360, 1440, 2560)}
    tool = sum(e['s'] for e in ev if e['end'] <= end_t + dt.timedelta(seconds=1)) / 60
    gate_ev = [e for e in ev if e['label'].startswith('r') or e['label'] == 'first']
    rtool = lambda k: next((e['s'] for e in ev if e['label'] == f'r{k - 1}'), '')
    served = {}; served_min = ''
    sg = H / 'gate-served/gate.json'
    if sg.exists():
        d = json.load(open(sg)); served = {r['W']: r['pct'] for r in d['rows']}; served_min = mins(t0, T(d['_writtenAt']))
    try: created = T(subprocess.run(['gh', 'api', f'repos/aemcoder-adobe/{repo}', '--jq', '.created_at'], capture_output=True, text=True).stdout.strip()); setup = mins(created, t0)
    except Exception: setup = ''
    tri = json.load(open(H / 'triage.json')); secs = len([r for r in tri['sections'] if not r.get('chrome') and not r.get('drop')])
    try: doc_h = json.load(open(H / 'measure/summary.json')).get('docHeight', {}).get('1440', '') if isinstance(json.load(open(H / 'measure/summary.json')).get('docHeight'), dict) else ''
    except Exception: doc_h = ''
    if not doc_h:
        try: doc_h = json.load(open(H / 'measure/spec-1440.json')).get('doc', '')
        except Exception: doc_h = ''
    stop_p = rounds[stop_i][1] if stop_i is not None else rounds[-1][1]
    row = dict(slug=f'{slug}-{label.lower()}', period='D', run_label=label, t0_utc=t0.strftime('%Y-%m-%dT%H:%M:%SZ'),
               site_url=json.load(open(H / 'measure/summary.json')).get('url', ''), code=code or '', setup_min=setup, setup_src='repo-created',
               first_proto_min=mins(t0, first_t), under10_min=mins(t0, end_t) if stop_i is not None else '', never='' if stop_i is not None else '1',
               stop_min='' if stop_i is not None else mins(t0, end_t), under10_360_min=u[360], under10_1440_min=u[1440], under10_2560_min=u[2560],
               served_min=served_min, rounds_n=(stop_i + 1) if stop_i is not None else len(rounds),
               r2_elapsed_min=mins(rounds[0][0], rounds[1][0]) if len(rounds) > 1 else '', r3_elapsed_min=mins(rounds[1][0], rounds[2][0]) if len(rounds) > 2 else '',
               r2_tool_s=rtool(2), r3_tool_s=rtool(3), tool_min=round(tool, 1), llm_min=round(mins(t0, end_t) - tool, 1), split_src='exact',
               first_360=first_p.get(360, ''), first_1440=first_p.get(1440, ''), first_2560=first_p.get(2560, ''),
               deliver_360=stop_p.get(360, ''), deliver_1440=stop_p.get(1440, ''), deliver_2560=stop_p.get(2560, ''),
               served_360=served.get(360, ''), served_1440=served.get(1440, ''), served_2560=served.get(2560, ''),
               turns=turns_of(repo), sections=secs, doc_h_1440=doc_h,
               notes=f'{note}; rounds from gate/rounds/; section-view calls not in TIMING.log')
    rows.append(row)
with open(OUT, 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=HEADER); w.writeheader(); w.writerows(rows)
print(f'{OUT}: {len(rows)} rows')
for r in rows: print(r['run_label'], r['slug'], 'first', r['first_proto_min'], 'under10', r['under10_min'] or f"never ({r['stop_min']})", 'tools', r['tool_min'], 'llm', r['llm_min'], 'turns', r['turns'])
