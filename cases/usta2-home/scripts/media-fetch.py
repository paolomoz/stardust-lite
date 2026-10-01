#!/usr/bin/env python3
"""media-fetch.py <content.json>… --extra <url>… --out media/ — collect every img src / background url the content dump holds
(visible composition), plus extra URLs, and download the source's BYTES unchanged (webp stays webp, svg stays svg) under a
lowercase name; writes media/manifest.json (url → file). METHOD prerequisites: upload the source's bytes."""
import json, sys, os, re, subprocess, urllib.parse
args = sys.argv[1:]; out = 'media'; extra = []; files = []
i = 0
while i < len(args):
    if args[i] == '--out': out = args[i+1]; i += 2
    elif args[i] == '--extra': extra.append(args[i+1]); i += 2
    elif args[i] == '--extra-file': extra += [l.strip() for l in open(args[i+1]) if l.strip()]; i += 2
    else: files.append(args[i]); i += 1
urls = []
def walk(n):
    if n.get('src') and not n['src'].startswith('data:'): urls.append(n['src'])
    if n.get('bgi'):
        m = re.search(r'url\("?([^")]+)"?\)', n['bgi'])
        if m: urls.append(m.group(1))
    for c in n.get('children', []): walk(c)
for f in files:
    d = json.load(open(f))
    for k, v in d.items():
        if k.startswith('__'): continue
        for n in v: walk(n)
urls += extra
seen = []; [seen.append(u) for u in urls if u not in seen]
os.makedirs(out, exist_ok=True)
manifest = {}
for u in seen:
    full = u if u.startswith('http') else 'https://www.usta.com' + u
    full = full.replace(' ', '%20')
    path = urllib.parse.urlparse(full).path
    name = urllib.parse.unquote(path.split('/')[-1]).lower()
    if name in ('img.jpg', 'img.png'):  # AEM transform renditions: name from the asset
        parts = [p for p in path.split('/') if p]
        asset = [p for p in parts if re.search(r'\.(jpe?g|png|webp)', p, re.I)][0]
        name = urllib.parse.unquote(asset).lower().split('.transform')[0]
    name = re.sub(r'[^a-z0-9._-]+', '-', name)
    if not re.search(r'\.(jpe?g|png|webp|svg|gif|avif)$', name):
        name += '.png'
    base = name
    n = 1
    while name in manifest.values() and manifest.get(full) != name:
        stem, ext = os.path.splitext(base); name = f'{stem}-{n}{ext}'; n += 1
    dest = os.path.join(out, name)
    if not os.path.exists(dest):
        r = subprocess.run(['curl', '-sSL', '-o', dest, '-w', '%{http_code} %{content_type}', full], capture_output=True, text=True)
        print(r.stdout.strip(), '<-', full[-90:], '->', name)
    manifest[full] = name
json.dump(manifest, open(os.path.join(out, 'manifest.json'), 'w'), indent=1)
print(len(manifest), 'files')
