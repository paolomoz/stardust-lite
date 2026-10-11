# Per tool call: start (assistant msg ts), end (tool_result ts), seconds, command head. Args: transcript [grep-regex]
import json, sys, re
from datetime import datetime
def ts(s): return datetime.fromisoformat(s.replace('Z', '+00:00'))
f = sys.argv[1]; pat = re.compile(sys.argv[2]) if len(sys.argv) > 2 else None
uses = {}
rows = []
for line in open(f, errors='replace'):
    try: d = json.loads(line)
    except Exception: continue
    m = d.get('message', {}); c = m.get('content')
    if d.get('type') == 'assistant' and isinstance(c, list):
        for b in c:
            if b.get('type') == 'tool_use':
                inp = b.get('input', {})
                cmd = inp.get('command') or inp.get('file_path') or json.dumps(inp)[:200]
                uses[b['id']] = (d['timestamp'], b['name'], cmd, inp.get('run_in_background'))
    if d.get('type') == 'user' and isinstance(c, list):
        for b in c:
            if b.get('type') == 'tool_result' and b.get('tool_use_id') in uses:
                st, name, cmd, bg = uses.pop(b['tool_use_id'])
                dur = (ts(d['timestamp']) - ts(st)).total_seconds()
                out = b.get('content'); out = out if isinstance(out, str) else json.dumps(out)
                rows.append((st, d['timestamp'], dur, name, bg, cmd, out))
mode = sys.argv[3] if len(sys.argv) > 3 else 'list'
for st, en, dur, name, bg, cmd, out in rows:
    if pat and not pat.search(cmd if isinstance(cmd, str) else ''): continue
    print(f"{st[11:19]} {en[11:19]} {dur:7.1f}s {name[:5]} {'BG ' if bg else ''}{str(cmd)[:220].replace(chr(10),' | ')}")
    if mode == 'out': print('    OUT:', re.sub(r'\s+', ' ', out)[-400:])
