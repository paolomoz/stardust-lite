#!/usr/bin/env python3
"""Structure decisions for Jev (exp/jev, step 1b): from where each triage row's TEXT ended up in the agent's final documents —
  dropped: most of the row's text is absent from the final page (≤ 20 % found; ≥ 60 % found = kept; between = unlabelled)
  split:   the row's found text spread over two or more final sections (top section < 75 % and a second holds ≥ 2 texts; ≥ 90 % in one = not)
then two nouls per row in one Jev request over the section's outline (content in reading order, positions in words), scored by precision /
recall at thresholds, beside the machine's own rules (author's drops: empty rows, a chrome row's box or anchor). Logs every answer.
Usage: python3 structure.py   (needs /tmp/jev/triage/*.json from harvest_blocks.py and TYPESAFE_API_KEY)"""
import concurrent.futures as cf, html, json, os, re, subprocess, time, urllib.request
from pathlib import Path

HERE = Path(__file__).parent; ROOT = Path.home() / 'stardust/2026-10'
norm = lambda t: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', str(t or '')))).strip().lower()
from harvest_blocks import final_sections  # noqa: E402

def doc_text(p):
    return norm(p.read_text()) if p.exists() else ''

items = []
for line in Path('/tmp/jev-corpus.txt').read_text().split():
    repo, case = line.split('/'); H = ROOT / repo / 'migration/cases' / case
    if 'nfm' in repo: continue
    tri = Path(f'/tmp/jev/triage/{repo}-{case}.json')
    docs = [d for d in (H / 'doc').glob('*.html') if d.stem not in ('nav', 'footer')]
    if not tri.exists() or not docs: continue
    outl = json.loads(subprocess.run(['node', str(HERE / 'outline.mjs'), str(H / 'measure/content-1440.json')], capture_output=True, text=True).stdout or '[]')
    t = json.load(open(tri)); rows = [r for r in t['sections'] if not r.get('chrome')]
    chrome = [r for r in t['sections'] if r.get('chrome')]
    if len(outl) != len(rows): print(f'# {line}: outline {len(outl)} vs triage {len(rows)} — skipped'); continue
    secs = [' '.join([b for _, b in s[0]] + [s[1]]) for s in final_sections(docs[0].read_text())]
    nav = doc_text(H / 'doc/nav.html') + ' ' + doc_text(H / 'doc/footer.html')
    for i, (r, o) in enumerate(zip(rows, outl)):
        leaves = [norm(x)[:30] for x in o['texts'] if len(norm(x)) >= 12]
        where = []
        for lf in leaves:
            hit = next((k for k, s in enumerate(secs) if lf in s), None)
            where.append(hit if hit is not None else ('chrome' if lf in nav else None))
        main = [w for w in where if isinstance(w, int)]
        share = len(main) / len(leaves) if leaves else None
        dropped = None if share is None else (1 if share <= 0.2 else 0 if share >= 0.6 else None)
        split = None
        if len(main) >= 3:
            cnt = sorted([main.count(k) for k in set(main)], reverse=True)
            split = 1 if (cnt[0] / len(main) < 0.75 and len(cnt) > 1 and cnt[1] >= 2) else 0 if cnt[0] / len(main) >= 0.9 else None
        cb = [c.get('box') for c in chrome if c.get('box')]
        machine_drop = int((not o['texts'] and 'no repeated' in o['layout']) or any(r.get('box') and all(abs(a - b) <= 4 for a, b in zip(c, r['box'])) for c in cb)
                           or any(norm(c.get('anchorText')) and norm(c.get('anchorText')) == norm(r.get('anchorText')) for c in chrome))
        h = o.get('height') or 0
        items.append({'case': line, 'page': repo, 'index': i, 'anchor': o['anchor'], 'dropped': dropped, 'split': split, 'machine_drop': machine_drop,
                      'state': {'position': 'the first section on the page' if i == 0 else 'the last section on the page' if i == len(rows) - 1 else f'section {i + 1} of {len(rows)}',
                                'height': 'empty (no height)' if not h else 'a thin strip (under 80 px)' if h < 80 else 'a short band (80–300 px)' if h < 300 else 'a medium band (300–900 px)' if h < 900 else 'a tall band (900–1800 px)' if h < 1800 else 'a very tall band (over 1800 px)',
                                'layout_of_pictures': o['layout'], 'content_in_reading_order': o['outline'] or ['(no text, no picture)']}})
print(f"items {len(items)} · dropped labelled {sum(x['dropped'] is not None for x in items)} (positives {sum(x['dropped'] == 1 for x in items)}) · split labelled {sum(x['split'] is not None for x in items)} (positives {sum(x['split'] == 1 for x in items)})")

KEY = os.environ['TYPESAFE_API_KEY']
Q = {'not_content': {'type': 'noul', 'instructions': {'question': 'Is `section` NOT part of the page\'s own content — something a migrated page would leave out or move to the header / footer: a cookie or consent strip, a promo pop-up or banner overlay, a skip link, a copy of the site header or footer, a back-to-top button, an empty spacer?',
                                                     'focus': 'Read `content_in_reading_order` and `position`: navigation-like link lists at the top or bottom, copyright lines, sign-in prompts in a strip, and empty bands are the signals.'}},
     'several': {'type': 'noul', 'instructions': {'question': 'Does `section` hold two or more DISTINCT pieces of content that an author would put in separate sections of the page — for example a sign-in form beside unrelated product offers, or an intro band followed by an unrelated grid with its own heading?',
                                                 'focus': 'Several headings that each start a different topic, a form next to marketing content, or a strong change of layout part-way through mean yes; one heading with its own cards or columns means no.'}}}

def ask(x):
    body = json.dumps({'model': 'jev-latest', 'state': {'section': x['state']}, 'questions': Q}).encode()
    req = urllib.request.Request('https://api.typesafe.ai/v1/systemone', data=body, headers={'Authorization': f'Bearer {KEY}', 'content-type': 'application/json', 'user-agent': 'curl/8'})
    for a in range(4):
        try:
            d = json.load(urllib.request.urlopen(req, timeout=60))['answers']
            return {**x, 'p_not_content': d['not_content']['noul'], 'p_several': d['several']['noul']}
        except Exception as e:
            err = e; time.sleep(1 + 2 * a)
    return {**x, 'error': str(err)[:100]}

with cf.ThreadPoolExecutor(6) as ex: res = list(ex.map(ask, items))
with open(HERE / 'data/replay-structure.jsonl', 'w') as f:
    for x in res: f.write(json.dumps(x) + '\n')
ok = [x for x in res if 'p_several' in x]

def pr(name, lab, score, thrs):
    L = [x for x in ok if x[lab] is not None]; pos = sum(x[lab] for x in L)
    print(f'\n{name}: {len(L)} labelled, {pos} positive (base rate {100*pos/max(1,len(L)):.0f} %)')
    for t in thrs:
        fl = [x for x in L if x[score] >= t]; tp = sum(x[lab] for x in fl)
        print(f'  P >= {t}: flags {len(fl):3}, precision {100*tp/max(1,len(fl)):3.0f} %, recall {100*tp/max(1,pos):3.0f} %')
pr('dropped ← not_content', 'dropped', 'p_not_content', (0.5, 0.7, 0.85, 0.95))
L = [x for x in ok if x['dropped'] is not None]; fl = [x for x in L if x['machine_drop']]; tp = sum(x['dropped'] for x in fl)
print(f"  machine rules (empty / chrome box / chrome anchor): flags {len(fl)}, precision {100*tp/max(1,len(fl)):.0f} %, recall {100*tp/max(1,sum(x['dropped'] for x in L)):.0f} %")
pr('split ← several', 'split', 'p_several', (0.5, 0.7, 0.85, 0.95))
