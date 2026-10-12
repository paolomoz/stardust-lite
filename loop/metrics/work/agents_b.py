# List subagent transcripts: first/last timestamp, unique assistant message ids, site hints
import json, sys, glob, re, os
SITES = 'bny canonusa cibc covermore harbourvest manulife mfs natixis scotiabank take2games citizensbank takeda wellsfargo'.split()
for f in sorted(sys.argv[1:]):
    ids, ts, first = set(), [], None
    for line in open(f, errors='replace'):
        try: d = json.loads(line)
        except Exception: continue
        t = d.get('timestamp')
        if t: ts.append(t)
        if first is None and d.get('type') == 'user':
            m = d.get('message', {}).get('content')
            first = m if isinstance(m, str) else json.dumps(m)[:3000]
        if d.get('type') == 'assistant':
            mid = d.get('message', {}).get('id')
            if mid: ids.add(mid)
    hits = [s for s in SITES if first and re.search(r'sdt-' + s + r'\b|' + s, first, re.I)]
    print(os.path.basename(f), min(ts) if ts else '', max(ts) if ts else '', len(ids), hits, (first or '')[:160].replace('\n', ' '))
