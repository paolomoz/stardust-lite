"""Dump tool calls of a Claude Code transcript within a UTC window.
usage: tx_tools.py FILE [START_ISO] [END_ISO] [--grep REGEX] [--all]
prints: start(UTC) dur_s tool cmd-head ; then summary: unique assistant msg ids, union tool time."""
import json, sys, re
from datetime import datetime
av = sys.argv[1:]
if '--grep' in av:
    i = av.index('--grep'); av = av[:i] + av[i+2:]
args = [a for a in av if not a.startswith('--')]
f = args[0]; lo = args[1] if len(args) > 1 else '0'; hi = args[2] if len(args) > 2 else '9'
g = None
if '--grep' in sys.argv: g = re.compile(sys.argv[sys.argv.index('--grep') + 1])
show_all = '--all' in sys.argv
def P(t): return datetime.fromisoformat(t.replace('Z', '+00:00'))
uses = {}; ids = set(); res = {}
for line in open(f):
    try: o = json.loads(line)
    except: continue
    ts = o.get('timestamp')
    if not ts: continue
    m = o.get('message') or {}
    if o.get('type') == 'assistant':
        if lo <= ts <= hi and m.get('id'): ids.add(m['id'])
        for c in m.get('content') or []:
            if isinstance(c, dict) and c.get('type') == 'tool_use':
                uses[c['id']] = (ts, c.get('name'), c.get('input') or {}, m.get('id'))
    elif o.get('type') == 'user':
        cont = m.get('content')
        if isinstance(cont, list):
            for c in cont:
                if isinstance(c, dict) and c.get('type') == 'tool_result':
                    res[c.get('tool_use_id')] = ts
iv = []
lastres = {}  # per assistant message id: latest result ts (serial execution of a batch)
rows = []
for k, (ts, name, inp, mid) in uses.items():
    if not (lo <= ts <= hi): continue
    end = res.get(k)
    if end: rows.append((end, ts, name, inp, mid))
rows.sort()
for end, ts, name, inp, mid in rows:
    st = max(ts, lastres.get(mid, ts))
    lastres[mid] = end
    d = (P(end) - P(st)).total_seconds()
    ts = st
    iv.append((P(ts), P(end)))
    cmd = inp.get('command') or inp.get('file_path') or inp.get('description') or inp.get('prompt') or ''
    cmd = ' '.join(str(cmd).split())
    if show_all or (g and g.search(cmd)):
        print(ts[:19], end[11:19], f'{d:6.1f}', name, cmd[:260])
iv.sort(); tot = 0; cur = None
for a, b in iv:
    if cur and a <= cur[1]:
        if b > cur[1]: cur[1] = b
    else:
        if cur: tot += (cur[1] - cur[0]).total_seconds()
        cur = [a, b]
if cur: tot += (cur[1] - cur[0]).total_seconds()
print(f'SUMMARY turns(unique msg ids)={len(ids)} tool_calls={len(iv)} union_tool_min={tot/60:.1f}')
