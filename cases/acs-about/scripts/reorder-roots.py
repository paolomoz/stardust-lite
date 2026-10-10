#!/usr/bin/env python3
"""Case workaround: measure-page dumped the footer band (div.footer.acsFooter.parbase) BEFORE main in the dump's key order, so
splitSections read it as a content row before the hero. Rewrite the dump with that root after main (by box y), so the
'link band at the page bottom is the footer' rule applies. Usage: reorder-roots.py <content-W.json> [...] (in place, .orig kept)"""
import json, sys, shutil
for p in sys.argv[1:]:
    d = json.load(open(p)); shutil.copy(p, p + '.orig')
    keys = [k for k in d if not k.startswith('__')]
    def y(k):
        v = d[k]; v = v if isinstance(v, list) else [v]
        b = [n['box'][1] for n in v if isinstance(n, dict) and n.get('box')]
        return min(b) if b else 0
    head = [k for k in keys if k == 'header']; rest = sorted([k for k in keys if k != 'header'], key=y)
    out = {k: d[k] for k in head + rest}; out.update({k: v for k, v in d.items() if k.startswith('__')})
    json.dump(out, open(p, 'w')); print(p, list(out))
