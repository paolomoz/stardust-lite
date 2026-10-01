#!/usr/bin/env python3
"""content-view.py <content.json> [root-key] [--depth N]
Reading-order view of a stardust-lite content-dump JSON: one line per node that carries text, a link, media, a background or a
border. Texts are printed in FULL (a truncated viewer cost stryker-home a round — BACKLOG #57). Container nodes with a background
or an id are printed too (they name the bands). Indentation = tree depth."""
import json, sys
args=[a for a in sys.argv[1:] if not a.startswith('--')]
d=json.load(open(args[0]))
roots=[args[1]] if len(args)>1 else [k for k in d if not k.startswith('__')]
def line(n,depth):
    b=n.get('box'); bx=f"[{b[0]},{b[1]},{b[2]}x{b[3]}]" if b else ''
    parts=[n['tag']]
    if n.get('id'): parts.append('#'+n['id'])
    if n.get('cls'): parts.append('.'+n['cls'].split()[0])
    s='  '*depth+' '.join(parts)+' '+bx
    if n.get('bg') and n['bg'] not in ('rgba(0, 0, 0, 0)',): s+=f" bg={n['bg']}"
    if n.get('bgi'): s+=f" bgi={n['bgi']}"
    if n.get('border'): s+=f" border={n['border']}"
    if n.get('font'): s+=f" | {n['font']}"
    if n.get('href'): s+=f" -> {n['href']}"
    if n.get('target'): s+=f" target={n['target']}"
    if n.get('src'): s+=f" src={n['src']} nat={n.get('nat')} alt={n.get('alt')!r}"
    if n.get('placeholder'): s+=f" placeholder={n['placeholder']!r}"
    if n.get('aria'): s+=f" aria={n['aria']!r}"
    if n.get('text') is not None: s+=f"\n{'  '*depth}  TEXT: {n['text']!r}"
    if n.get('markup') and n.get('markup')!=n.get('text'): s+=f"\n{'  '*depth}  MARKUP: {n['markup']}"
    return s
def show(n,depth):
    interesting=any(k in n for k in ('text','href','src','bgi','placeholder','border')) or (n.get('bg') and n['bg']!='rgba(0, 0, 0, 0)') or n.get('id')
    if interesting or depth<3: print(line(n,depth))
    for c in n.get('children',[]): show(c,depth+1)
for r in roots:
    print('=====',r)
    for n in d[r]: show(n,0)
print('doc',d.get('__doc'),'title',d.get('__title'),'desc',d.get('__desc'))
