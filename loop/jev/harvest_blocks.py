#!/usr/bin/env python3
"""Harvest block decisions for the Jev replay (exp/jev, step 1).
For every finished case (content dump + triage + the agent's final document): re-run today's `triage` on the dump (the machine's
decision, as `first` would make it), then find each row's section in the FINAL document by its anchor text and read the block the agent
ended with (the label). One JSON line per row: the row's fingerprint fields (Jev's state), the machine's block, the final block.
Usage: python3 harvest_blocks.py [corpus.txt] > data/blocks.jsonl   (corpus: lines '<repo>/<case>' under ~/stardust/2026-10)"""
import html, json, re, subprocess, sys
from pathlib import Path

ROOT = Path.home() / 'stardust/2026-10'
LITE = Path(__file__).resolve().parents[2]
TMP = Path('/tmp/jev/triage'); TMP.mkdir(parents=True, exist_ok=True)
norm = lambda t: re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', str(t or '')))).strip().lower()

def final_sections(doc):
    """main > div sections of a DA document: [(blocks [(name, text)], default_text)]"""
    s = doc[doc.find('<main'):doc.rfind('</main>')] if '<main' in doc else doc
    s = re.sub(r'^<main[^>]*>', '', s)
    out, depth, start, i = [], 0, None, 0
    for m in re.finditer(r'<(/?)div\b[^>]*>', s):
        if not m.group(1):
            if depth == 0: start = m.end()
            depth += 1
        else:
            depth -= 1
            if depth == 0 and start is not None: out.append(s[start:m.start()]); start = None
    secs = []
    for sec in out:
        blocks = []; rest = sec
        for bm in re.finditer(r'<div class="([a-z0-9-]+)(?:\s[^"]*)?">', sec):
            name = bm.group(1)
            if name in ('section-metadata', 'metadata'): continue
            # the block's own subtree: from its tag to the matching close
            d, j = 1, bm.end()
            for t in re.finditer(r'<(/?)div\b[^>]*>', sec[bm.end():]):
                d += -1 if t.group(1) else 1
                if d == 0: j = bm.end() + t.start(); break
            blocks.append((name, norm(sec[bm.end():j]))); rest = rest.replace(sec[bm.start():j], ' ')
        secs.append((blocks, norm(rest)))
    return secs

def label_for(anchor, secs):
    a = norm(anchor)[:30]
    if len(a) < 4: return None
    # the SECTION the anchor is in decides: its block when it has one (the heading is usually authored as default content above the
    # block — labelling by where the anchor text sits read a cards section as `default`), `default` only for a section without a block
    for blocks, default in secs:
        if any(a in text for _, text in blocks) or a in default:
            hit = [name for name, text in blocks if a in text]
            return hit[0] if hit else (blocks[0][0] if blocks else 'default')
    return None

corpus = Path(sys.argv[1]).read_text().split() if len(sys.argv) > 1 else Path('/tmp/jev-corpus.txt').read_text().split()
for entry in corpus:
    repo, case = entry.split('/')
    H = ROOT / repo / 'migration/cases' / case
    docs = [d for d in (H / 'doc').glob('*.html') if d.stem not in ('nav', 'footer')]
    if not docs: continue
    out = TMP / f'{repo}-{case}.json'
    blocks = ROOT / repo / 'migration/blocks.json'
    r = subprocess.run(['node', str(LITE / 'scripts/triage.mjs'), str(H / 'measure/content-1440.json'), '--blocks', str(blocks), '--spec', str(H / 'measure/spec-1440.json'), '--out', str(out)],
                       cwd=ROOT / repo, capture_output=True, text=True)
    if r.returncode or not out.exists():
        print(f'# {entry}: triage failed ({r.stderr.strip()[-120:]})', file=sys.stderr); continue
    secs = final_sections(docs[0].read_text())
    for row in json.load(open(out))['sections']:
        if row.get('chrome'): continue
        m = row.get('match') or {}
        machine = m.get('block') if m.get('kind') != 'default' and m.get('block') else 'default'
        final = label_for(row.get('anchorText'), secs)
        print(json.dumps({'case': entry, 'page': repo.replace('sdt-', '').split('-p')[0].split('-b0')[0].split('-b1')[0].replace('-lite', ''), 'index': row['index'],
                          'anchorText': row.get('anchorText'), 'fingerprint': row.get('fingerprint'), 'repeat': row.get('repeat'), 'groups': row.get('groups'),
                          'mediaRatio': row.get('mediaRatio'), 'media': row.get('media'), 'texts': row.get('texts'), 'links': row.get('links'),
                          'rowsCols': row.get('rowsCols'), 'shape': row.get('shape'), 'collection': row.get('collection'), 'classes': row.get('classes'),
                          'notes': row.get('notes'), 'box': row.get('box'), 'machine': machine, 'final': final}))
