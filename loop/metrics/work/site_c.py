#!/usr/bin/env python3
"""Per run of period C: measured URL, live doc height at 1440, triage rows (content sections), repo created_at.
usage: site_c.py  (prints one JSON line per run)"""
import json, re, subprocess
from pathlib import Path

ROOT = Path.home() / 'stardust' / '2026-10'
RUNS = [
    ('si-home', 'sdt-si'), ('acs-about', 'sdt-acs'), ('continental-home', 'sdt-continental-lite'),
    ('marriott-home', 'sdt-marriott-lite'), ('publicis-home', 'sdt-publicis-lite'), ('toryburch-home', 'sdt-toryburch-lite'),
    ('deloitte-home', 'sdt-deloitte-lite'), ('bms-home', 'sdt-bms-lite'), ('equitable-home', 'sdt-equitable-lite'),
    ('wpp-home', 'sdt-wpp-lite'), ('pgatour-home', 'sdt-pgatour-lite'), ('revlon-home', 'sdt-revlon-lite'),
    ('sherwinwilliams-home', 'sdt-sherwinwilliams-lite'), ('intel-home', 'sdt-intel-lite'), ('nfl-home', 'sdt-nfl-lite'),
    ('nike-home', 'sdt-nike-lite'), ('merck-home', 'sdt-merck-lite'), ('mheducation-home', 'sdt-mheducation-lite'),
    ('santanderus-home', 'sdt-santanderus-lite'), ('unitedrentals-home', 'sdt-unitedrentals-lite'), ('rbc-home', 'sdt-rbc-lite'),
    ('wyndham-home', 'sdt-wyndham-lite'), ('waters-home', 'sdt-waters-lite'), ('omnicom-home', 'sdt-omnicom-lite'),
    ('lenovo-home', 'sdt-lenovo-lite'),
]


def case_dir(work):
    c = [p.parent.parent for p in (work / 'migration' / 'cases').glob('*/measure/summary.json')]
    return c[0] if c else None


def triage_rows(cd):
    t = json.loads((cd / 'triage.json').read_text())
    rows = []
    for s in t['sections']:
        blk = (s.get('match') or {})
        lab = blk.get('block') if isinstance(blk, dict) else None
        rows.append(dict(chrome=s.get('chrome'), block=lab, drop=s.get('drop') or (isinstance(blk, dict) and blk.get('drop'))))
    return rows


for slug, wd in RUNS:
    work = ROOT / wd
    cd = case_dir(work)
    out = dict(slug=slug, work=wd)
    if cd:
        out['case'] = str(cd.relative_to(work))
        summ = json.loads((cd / 'measure' / 'summary.json').read_text())
        out['url'] = summ.get('url')
        st = cd / 'measure' / 'structure-1440.txt'
        if st.exists():
            m = re.match(r'doc (\d+)', st.read_text().split('\n', 1)[0])
            out['doc_h_1440'] = int(m.group(1)) if m else None
        if (cd / 'triage.json').exists():
            rows = triage_rows(cd)
            out['rows'] = len(rows)
            out['content'] = sum(1 for r in rows if not r['chrome'] and not r['drop'])
            out['chrome'] = [r['chrome'] for r in rows if r['chrome']]
            out['drops'] = sum(1 for r in rows if r['drop'])
    rem = subprocess.run(['git', '-C', str(work), 'remote', 'get-url', 'origin'], capture_output=True, text=True).stdout.strip()
    repo = rem.rstrip('/').removesuffix('.git').split('github.com/')[-1] if rem else None
    out['repo'] = repo
    if repo:
        r = subprocess.run(['gh', 'api', f'repos/{repo}', '--jq', '.created_at'], capture_output=True, text=True)
        out['created_at'] = r.stdout.strip() or r.stderr.strip()[:80]
    print(json.dumps(out))
