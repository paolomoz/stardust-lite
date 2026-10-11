# Gate invocations in a run transcript: start, end, wall s, widths, out dir, pixel lines from the output
import json, sys, re
from datetime import datetime
def ts(s): return datetime.fromisoformat(s.replace('Z', '+00:00'))
f = sys.argv[1]
uses, n = {}, 0
for line in open(f, errors='replace'):
    try: d = json.loads(line)
    except Exception: continue
    m = d.get('message', {}); c = m.get('content')
    if d.get('type') == 'assistant' and isinstance(c, list):
        for b in c:
            if b.get('type') == 'tool_use' and b['name'] == 'Bash':
                uses[b['id']] = (d['timestamp'], b['input'].get('command', ''), b['input'].get('run_in_background'))
    if d.get('type') == 'user' and isinstance(c, list):
        for b in c:
            if b.get('type') == 'tool_result' and b.get('tool_use_id') in uses:
                st, cmd, bg = uses.pop(b['tool_use_id'])
                if not re.search(r'stardust-lite gate\b|/gate\.mjs|\bgate --', cmd): continue
                out = b.get('content'); out = out if isinstance(out, str) else ' '.join(x.get('text', '') for x in out if isinstance(x, dict))
                w = re.search(r'--widths?\s+(\S+)', cmd); o = re.findall(r'--out\s+(\S+)', cmd)
                build = re.search(r'--build\s+(\S+)', cmd)
                pix = re.findall(r'(?:pixel|^)\s*(\d{3,4})\s*:\s*([\d.]+)\s*%', out, re.M)
                pix2 = re.findall(r'\b(360|1440|2560|2700)\b[^\n]{0,20}?([\d.]+)\s*%', out)
                n += 1
                print(f"#{n} {st[11:19]}->{d['timestamp'][11:19]} {(ts(d['timestamp'])-ts(st)).total_seconds():6.1f}s {'BG ' if bg else ''}w={w.group(1) if w else '-'} out={o} build={'served' if build and 'aem.page' in build.group(1) else 'proto'}")
                tl = [l for l in out.splitlines() if re.search(r'^\s*\|\s*(360|1440|2560|2700)\s*\||stop:|^\s*(360|1440|2560)\s*:', l)]
                for l in tl[:14]: print('    ', l[:200])
