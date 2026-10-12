#!/usr/bin/env python3
"""fix-doc.py — one-off document edits after `author` (friction: author treats a card-wide <a> as ONE leaf and dropped the .gif card,
so the default cards recipe wrote 'Title Desc LEARN MORE' in one paragraph and FY2020 lost a row). Rebuilds every cards block from
the dump, section by section (picture | h3, p, LEARN MORE link), the Explore tiles (h3 link + p, one row each), the CTA columns
(text | button), the footer (one logo, named social icons), the nav search token. Reads the dump and the manifest, never the source."""
import json, re, html, sys
C = 'migration/cases/about-article'
HOST = 'https://blocks-first--sdt-takeda--aemcoder-adobe.aem.page/drafts/media'
dump = json.load(open(f'{C}/measure/content-1440.json'))
man = json.load(open(f'{C}/media/manifest.json'))
url2file = {u: f.split('/')[-1] for u, f in man.items()} if isinstance(man, dict) else {}
esc = lambda s: html.escape(s or '', quote=False).replace('"', '&quot;')
# card groups: the top-level sections of main holding card links
groups = []
def cards_of(n, acc):
    if isinstance(n, dict):
        if n.get('tag') == 'a' and 'programs/' in (n.get('href') or '') and any(c.get('tag') == 'img' for c in n.get('children', [])):
            img = next(c for c in n['children'] if c.get('tag') == 'img'); h3 = None; desc = None
            def inner(m):
                nonlocal h3, desc
                if isinstance(m, dict):
                    if m.get('tag') == 'h3': h3 = m.get('text')
                    elif m.get('tag') == 'div' and m.get('text') and m['text'] != 'LEARN MORE' and h3 and desc is None: desc = m['text']
                    for v in m.get('children', []): inner(v)
            for c in n['children']: inner(c)
            acc.append(dict(href=n['href'], src=img['src'], alt=img.get('alt', ''), h3=h3, desc=desc)); return
        for v in n.get('children', []): cards_of(v, acc)
def sections(n):
    # the dump's main root → div → section.global-pt children
    if isinstance(n, dict):
        if n.get('tag') == 'section' and 'global-pt' in (n.get('cls') or ''):
            acc = []; cards_of(n, acc)
            if acc: groups.append(acc)
            return
        for v in n.get('children', []): sections(v)
    elif isinstance(n, list):
        for v in n: sections(v)
sections(dump['main'])
print(f'{len(groups)} card sections, {sum(map(len, groups))} cards in the dump', file=sys.stderr)
def row(c):
    f = url2file.get(c['src'], '')
    if not f: print('no media for', c['src'], file=sys.stderr)
    return (f'<div><div><p><picture><img src="{HOST}/{f}" alt="{esc(c["alt"])}"></picture></p></div>'
            f'<div><h3>{esc(c["h3"])}</h3><p>{esc(c["desc"])}</p><p><a href="{esc(c["href"])}">LEARN MORE</a></p></div></div>')
def balanced_end(s, start):
    depth = 0
    for m in re.finditer(r'<div\b|</div>', s[start:]):
        depth += 1 if m.group(0) == '<div' else -1
        if depth == 0: return start + m.end()
    raise SystemExit('unbalanced')
doc = open(f'{C}/doc/corporate-giving.html').read()
out = []; pos = 0; gi = 0
for m in re.finditer(r'<div class="cards">', doc):
    if m.start() < pos: continue
    end = balanced_end(doc, m.start())
    out.append(doc[pos:m.start()]); out.append('<div class="cards">\n' + '\n'.join(row(c) for c in groups[gi]) + '\n</div>'); gi += 1; pos = end
out.append(doc[pos:]); doc = ''.join(out)
print(f'{gi} cards blocks rebuilt', file=sys.stderr)
# tiles: two cells of one row → one row per tile, h3 link + p (title / text from the dump's a.group)
tiles = {}
def find_tiles(n):
    if isinstance(n, dict):
        if n.get('tag') == 'a' and 'group' in (n.get('cls') or '') and n.get('href') in ('/about/corporate-responsibility/corporate-giving/programs-in-action/', '/about/corporate-responsibility/faq/'):
            t = {}
            def inner(m):
                if isinstance(m, dict):
                    if m.get('tag') == 'h3': t['h3'] = m.get('text')
                    if m.get('tag') == 'p': t['p'] = m.get('text')
                    for v in m.get('children', []): inner(v)
            inner(n); tiles[n['href']] = t; return
        for v in n.get('children', []): find_tiles(v)
    elif isinstance(n, list):
        for v in n: find_tiles(v)
find_tiles(dump['main'])
def tile_cell(m):
    href = m.group(1); t = tiles[href]
    return f'<div><div><h3><a href="{esc(href)}">{esc(t["h3"])}</a></h3><p>{esc(t["p"])}</p></div></div>'
i = doc.find('<div class="cards tiles">'); end = balanced_end(doc, i)
blk = doc[i:end]
cells = re.findall(r'<div><p><strong><a href="([^"]+)">[^<]+</a></strong></p></div>', blk)
doc = doc[:i] + '<div class="cards tiles">\n' + '\n'.join(tile_cell(re.match(r'(.*)', h)) for h in cells) + '\n</div>' + doc[end:]
print(f'{len(cells)} tiles', file=sys.stderr)
# CTA: default p + columns cta (1 cell) → columns cta (text | button)
doc, n = re.subn(r'<p>(To learn more about[^\n]*?)</p>\s*<div class="columns cta">\s*<div><div><p><a href="([^"]+)">([^<]+)</a></p></div></div>',
             r'<div class="columns cta">\n<div><div><p>\1</p></div><div><p><strong><a href="\2">\3</a></strong></p></div></div>', doc)
print(f'cta rewritten: {n}', file=sys.stderr)
# section styles the spec asks for: the intro section has no gap below (!pb-0 !mb-0); FY2025 / FY2024 headings keep a 50 gap before their cards
meta = lambda style: f'<div class="section-metadata"><div><div>style</div><div>{style}</div></div></div>'
doc = doc.replace('</div>\n</div>\n<div>\n<div class="columns cta">', '</div>\n' + meta('tight') + '\n</div>\n<div>\n<div class="columns cta">', 1)
for fy in ('FY2025', 'FY2024'):
    doc = doc.replace(f'<h2>{fy} Programs</h2>\n</div>', f'<h2>{fy} Programs</h2>\n{meta("spaced")}\n</div>', 1)
print('section styles:', doc.count('section-metadata'), file=sys.stderr)
open(f'{C}/doc/corporate-giving.html', 'w').write(doc)
f = open(f'{C}/doc/footer.html').read()
f = re.sub(r'<p><picture><img src="[^"]*" alt="Takeda"></picture></p>\n', '', f, count=1)
f = f.replace('<li><em><a href="https://www.linkedin.com/company/takeda-pharmaceuticals/">:icon:</a></em></li>', '<li><a href="https://www.linkedin.com/company/takeda-pharmaceuticals/" title="LinkedIn">:linkedin:</a></li>')
f = f.replace('<li><em><a href="https://www.youtube.com/takeda-pharmaceuticals">:icon:</a></em></li>', '<li><a href="https://www.youtube.com/takeda-pharmaceuticals" title="YouTube">:youtube:</a></li>')
open(f'{C}/doc/footer.html', 'w').write(f)
# nav tools: the bar's controls (search, region, language) — the two bar links already sit in the sections list
nv = re.sub(r'<p><a href="/our-impact/our-stories/">OUR STORIES</a></p>\n<p><a href="/careers/">CAREERS</a></p>\n<p>:icon:</p>\n', '<p>:search: Search...</p>\n<p>:globe: Global</p>\n<p>EN</p>\n', open(f'{C}/doc/nav.html').read())
open(f'{C}/doc/nav.html', 'w').write(nv)
