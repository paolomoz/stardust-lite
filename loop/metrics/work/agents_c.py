#!/usr/bin/env python3
"""List subagents of the five-min session: meta description, first prompt head, first/last timestamp, unique assistant message ids.
Streams each jsonl line by line."""
import json, sys
from pathlib import Path

D = Path.home() / '.claude/projects/-Users-paolo-stardust-stardust-lite/614dd9f2-bfec-468f-9209-027bfa3cb115/subagents'

for f in sorted(D.glob('agent-*.jsonl')):
    meta = {}
    mf = f.with_suffix('.meta.json')
    if mf.exists():
        try:
            meta = json.loads(mf.read_text())
        except Exception:
            pass
    ids, first_prompt, t_first, t_last = set(), None, None, None
    with f.open() as fh:
        for line in fh:
            try:
                o = json.loads(line)
            except Exception:
                continue
            ts = o.get('timestamp')
            if ts:
                t_first = t_first or ts
                t_last = ts
            msg = o.get('message') or {}
            if first_prompt is None and o.get('type') == 'user':
                c = msg.get('content')
                if isinstance(c, list):
                    c = ' '.join(x.get('text', '') for x in c if isinstance(x, dict))
                first_prompt = (c or '')
            if o.get('type') == 'assistant' and msg.get('id'):
                ids.add(msg['id'])
    print(json.dumps(dict(agent=f.stem, desc=meta.get('description'), first=t_first, last=t_last, turns=len(ids),
                          prompt=(first_prompt or '')[:400].replace('\n', ' '))))
