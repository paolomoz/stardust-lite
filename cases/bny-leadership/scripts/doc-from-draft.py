# One-off document edit: the author draft (tabs recipe = label | panel) → the sections-as-panels model:
# cards.leadership rows per person, section-metadata `tab` per panel, Quick Links as default content.
# Texts, hrefs and media names come from the author draft and the --hidden dump, nothing is typed here.
import json, re, sys, html
draft = open('doc/leadership.author-draft.html').read()
hidden = json.load(open('measure/hidden-1440.json'))
manifest = json.load(open('media/manifest.json'))
HOST = 'https://blocks-first--sdt-bny--aemcoder-adobe.aem.page/drafts/media'
def media_name(src):
    import urllib.parse
    return manifest.get(src) or manifest.get(urllib.parse.unquote(src)) or manifest.get(urllib.parse.quote(src, safe=':/'))
def walk(n, out):
    if isinstance(n, dict):
        out.append(n)
        for c in n.get('children', []) or []: walk(c, out)
    return out
def units(root):
    nodes = walk(root, [])
    us, cur = [], None
    for n in nodes:
        if n.get('tag') == 'img':
            cur = {'img': n.get('src'), 'alt': n.get('alt', '')}; us.append(cur)
        elif cur is not None and n.get('tag') == 'h3' and 'leader-name' in n.get('cls', ''): cur['name'] = n['text']
        elif cur is not None and n.get('tag') == 'p' and 'leader-designation' in n.get('cls', ''): cur['title'] = n['text']
        elif cur is not None and n.get('tag') == 'a' and 'leader_link' in n.get('cls', ''): cur['href'] = n.get('href'); cur['link'] = re.sub(r'\s*arrow_forward\s*$', '', n.get('text', ''))
    return [u for u in us if 'name' in u]
roots = hidden['hidden div.tabs-container-detail']
board = units(roots[1])
# the Board panel's own Quick Links (h3 + a.dynamic-link) from the hidden dump
def quick_links(root):
    nodes = walk(root, [])
    out, on = [], False
    for n in nodes:
        if n.get('tag') == 'h3' and n.get('text', '').strip() == 'Quick Links': on = True; out.append('<h3>Quick Links</h3>')
        elif on and n.get('tag') == 'a' and 'dynamic-link' in n.get('cls', ''):
            out.append(f'<p><a href="{n.get("href")}">{re.sub(r"\s*arrow_forward\s*$", "", n.get("text", ""))}</a></p>')
    return '\n'.join(out)
board_quick = quick_links(roots[1])
# EC units: from the draft's default content run (picture, h3, p, p>a)
ec = re.findall(r'<p><picture><img src="([^"]+)" alt="([^"]*)"></picture></p>\s*<h3>([^<]+)</h3>\s*<p>([^<]+)</p>\s*<p><a href="([^"]+)">([^<]+?)\s*<em>arrow_forward</em></a></p>', draft)
ec = [{'img': a, 'alt': b, 'name': c, 'title': d, 'href': e, 'link': f.strip()} for a, b, c, d, e, f in ec]
def row(u):
    src = u['img'] if u['img'].startswith(HOST) else f"{HOST}/{media_name(u['img'])}"
    return (f'<div><div><picture><img src="{src}" alt="{html.escape(u["alt"])}"></picture></div>'
            f'<div><h3>{u["name"]}</h3>{("<p>" + u["title"] + "</p>") if u.get("title") else ""}<p><a href="{u["href"]}">{u["link"]}</a></p></div></div>')
def cards(us): return '<div class="cards leadership">\n' + '\n'.join(row(u) for u in us) + '\n</div>'
def meta(pairs): return '<div class="section-metadata">' + ''.join(f'<div><div>{k}</div><div>{v}</div></div>' for k, v in pairs) + '</div>'
# Quick Links from the draft
ql = re.search(r'<h3>Quick Links</h3>.*?(?=<div class="section-metadata">|<div class="metadata">)', draft, re.S)
quick = ql.group(0).strip() if ql else ''
quick = re.sub(r'\s*<em>arrow_forward</em>', '', quick)
quick = re.sub(r'(</div>\s*<div>\s*)+$', '', quick).strip()
metablock = re.search(r'<div class="metadata">.*?</div>\s*</div>\s*</div>', draft, re.S)
doc = f'''<body>
  <header></header>
  <main>
<div>
<h1>OUR LEADERSHIP</h1>
{meta([('style', 'tertiary-hero')])}
</div>
<div>
{cards(ec)}
{quick}
{meta([('tab', 'Executive Committee')])}
</div>
<div>
{cards(board)}
{board_quick}
{meta([('tab', 'Board of Directors')])}
</div>
<div>
{metablock.group(0) if metablock else ''}
</div>
  </main>
  <footer></footer>
</body>
'''
open('doc/leadership.html', 'w').write(doc)
print('ec', len(ec), 'board', len(board), 'quick', bool(ql), 'meta', bool(metablock))
