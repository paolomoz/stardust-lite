#!/usr/bin/env python3
"""Compact reading-order view of a stardust-lite content-dump JSON: one line per node with text/link/media, box and font."""
import json, sys
d = json.load(open(sys.argv[1]))
roots = [k for k in d if not k.startswith('__')]
def walk(n, depth):
    b = n.get('box'); tag = n.get('tag'); cls = n.get('cls', '') or ''
    bits = []
    for k in ('text', 'html'):
        if n.get(k): bits.append(f'"{n[k][:160]}"')
    if n.get('href') is not None: bits.append(f"href={n['href']}")
    if n.get('src'): bits.append(f"src={n['src']} nat={n.get('nat')} alt={n.get('alt')!r}")
    if n.get('bgimg') or n.get('bg-image') or n.get('bgImage'): bits.append(f"bgimg={n.get('bgimg') or n.get('bg-image') or n.get('bgImage')}")
    if n.get('font'): bits.append(f"font={n['font']}")
    if n.get('bg') and n['bg'] not in ('rgba(0, 0, 0, 0)',): bits.append(f"bg={n['bg']}")
    for k in ('placeholder','type','aria','role','hidden','display'):
        if n.get(k): bits.append(f"{k}={n[k]}")
    show = bits or depth < 4
    if show:
        print('  ' * depth + f"{tag}{('.'+cls.replace(' ','.')) if cls else ''}{('#'+n['id']) if n.get('id') else ''} {b} " + ' '.join(bits))
    for c in n.get('children', []): walk(c, depth + 1)
for r in roots:
    print('=====', r)
    for n in d[r]: walk(n, 0)
print('__doc', d.get('__doc'), '__title', d.get('__title'), '__desc', d.get('__desc'))
