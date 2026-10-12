"""print tool results (filtered lines) for tool calls whose command matches REGEX. usage: tx_results.py FILE REGEX [LINEREGEX] [START] [END]"""
import json, sys, re
f, rx = sys.argv[1], re.compile(sys.argv[2])
lrx = re.compile(sys.argv[3]) if len(sys.argv) > 3 else re.compile(r'\|\s*(360|1440|2560)\s*\|')
lo = sys.argv[4] if len(sys.argv) > 4 else '0'; hi = sys.argv[5] if len(sys.argv) > 5 else '9'
uses = {}
for line in open(f):
    try: o = json.loads(line)
    except: continue
    m = o.get('message') or {}; ts = o.get('timestamp', '')
    if o.get('type') == 'assistant':
        for c in m.get('content') or []:
            if isinstance(c, dict) and c.get('type') == 'tool_use':
                cmd = (c.get('input') or {}).get('command', '')
                if rx.search(cmd) and lo <= ts <= hi: uses[c['id']] = ts
    elif o.get('type') == 'user' and isinstance(m.get('content'), list):
        for c in m['content']:
            if isinstance(c, dict) and c.get('type') == 'tool_result' and c.get('tool_use_id') in uses:
                cont = c.get('content')
                txt = cont if isinstance(cont, str) else '\n'.join(x.get('text', '') for x in cont if isinstance(x, dict))
                hits = [l for l in txt.splitlines() if lrx.search(l)]
                print(uses[c['tool_use_id']][:19], '->', ts[11:19], ' || '.join(h[:140] for h in hits[:6]))
