# index transcripts: file, first/last timestamp, cwd set, n lines
import json, sys, os, glob
root = os.path.expanduser('~/.claude/projects')
for f in sorted(glob.glob(root + '/**/*.jsonl', recursive=True)):
    if os.path.getmtime(f) < 1759100000: continue  # before ~Sep 29 2025? (filter loosely)
    first = last = None; cwds = set(); n = 0
    try:
        with open(f) as fh:
            for line in fh:
                n += 1
                try: o = json.loads(line)
                except: continue
                ts = o.get('timestamp')
                if ts:
                    if not first: first = ts
                    last = ts
                c = o.get('cwd')
                if c: cwds.add(c)
    except Exception as e:
        continue
    if not first: continue
    if first[:10] > '2026-10-02' or last[:10] < '2026-09-29': continue
    print(first[:16], last[:16], n, os.path.relpath(f, root)[:110], '|', ';'.join(sorted(cwds))[:200])
