#!/usr/bin/env python3
"""build-doc.py — the three authored documents (home, nav, footer) for www.audemarspiguet.com/ch/en/home from the step-1 captures:
measure/content-full-1440.json (texts, hrefs, media of every section incl. the 18 + 5 carousel cards), measure/nav-1440.json (drawer
panels), measure/content-1440.json (footer link groups). Written as an author would type them: default content first, blocks only
where default content cannot hold the composition; a standalone picture is a paragraph (`<p><picture>`); `<em>` carries the serif
accent of every heading; a bold link is the one button on the page. Media = the source's bytes previewed on the branch."""
import json, html, re, os
H = lambda s: html.escape(s, quote=False)
MEDIA = 'https://blocks-first--sdt-audemarspiguet--aemcoder-adobe.aem.page/drafts/media/'
full = json.load(open('measure/content-full-1440.json'))
nav = json.load(open('measure/nav-1440.json'))
content = json.load(open('measure/content-1440.json'))

def media_name(url):
    """the source URL → the name media-fetch gave the bytes (lower-case, `_` and `.` → `-`, hyphen runs collapsed; `.avif`/`.jpg`/`.svg`
    by the served Content-Type)"""
    m = re.search(r'/is/image/audemarspiguet/([^?]+)', url) or re.search(r'/is/content/audemarspiguet/([^?]+)', url) or re.search(r'/([^/?]+)\.(jpg|png|mp4)', url)
    base = m.group(1); base = base.replace('%20', '-')
    ext = 'avif' if 'fmt=avif' in url else ('svg' if '/is/content/' in url else 'jpg')
    name = re.sub(r'-+', '-', re.sub(r'[_.]', '-', base.lower()))
    return f'{name}.{ext}'

def pic(img):
    return f'<picture><img src="{MEDIA}{media_name(img["src"])}" alt="{H(img["alt"].strip())}"></picture>'

def heading(tag, h):
    """plain part + <em>serif part</em> — the source renders both uppercase by CSS; DOM text kept as typed"""
    plain, italic = h['plain'], h['italic']
    if not italic:  # 'AP CHRONICLES' / 'Find a boutique': the dump's i-part came back empty — split on the measured span text
        italic = h['text'][len(plain):].strip()
    return f'<{tag}>{H(plain)} <em>{H(italic)}</em></{tag}>'

def video_src(v):
    return v['src'].split('#')[0]

secs = full['sections']
out = []
# 1–2 hero ×2: block `hero`, simple: row 1 media (the source's own mp4), row 2 copy
for s in secs[:2]:
    rows = [f'<div><div><p><a href="{H(video_src(s["video"]))}">{H(s["heading"]["text"])} (video)</a></p></div></div>']
    copy = heading('h1', s['heading'])
    if s['text']: copy += f'<p>{H(s["text"])}</p>'
    copy += f'<p><a href="{H(s["link"]["href"])}">{H(s["link"]["text"])}</a></p>'
    rows.append(f'<div><div>{copy}</div></div>')
    out.append(f'<div><div class="hero">{"".join(rows)}</div></div>')

def carousel(s, variant):
    head = heading('h2', s['heading'])
    if s.get('link'): head += f'<p><a href="{H(s["link"]["href"])}">{H(s["link"]["text"])}</a></p>'
    rows = []
    for c in s['cards']:
        text = f'<h3>{H(c["title"])}</h3><p>{H(c["desc"])}</p><p><a href="{H(c["href"])}">{H(c["cta"] or "Discover more")}</a></p>'
        rows.append(f'<div><div>{pic(c["img"])}</div><div>{text}</div></div>')
    cls = f'carousel {variant}'.strip()
    return f'<div>{head}<div class="{cls}">{"".join(rows)}</div></div>'

out.append(carousel(secs[2], 'compact'))
# 4 dualtext: default content, section style `indent`
d = secs[3]
out.append(f'<div>{heading("h2", d["heading"])}<p>{H(d["text"])}</p><div class="section-metadata"><div><div>style</div><div>indent</div></div></div></div>')
# 5 lookbook: columns (lookbook) 1 × 3 — left stack, centre video (own file + poster), right stack
g = secs[4]; cells = {c['cls'].split('ap-lookbook__element-wrapper--')[1].split()[0] if '--' in c['cls'] else 'x': c for c in g['cells']}
by = {}
for c in g['cells']:
    m = re.search(r'wrapper--(\w+)', c['cls']); by[m.group(1)] = c
centre = by['square1']
left = f'<p>{pic(by["portrait1"]["img"])}</p><p>{pic(by["landscape1"]["img"])}</p>'
mid = f'<p><a href="{H(video_src(centre["video"]))}">Code 11.59 by Audemars Piguet brand campaign (video)</a></p><p>{pic(centre["img"])}</p>'
right = f'<p>{pic(by["landscape2"]["img"])}</p><p>{pic(by["portrait2"]["img"])}</p>'
out.append(f'<div><div class="columns lookbook"><div><div>{left}</div><div>{mid}</div><div>{right}</div></div></div></div>')
# 7 dualtextimage: columns (teasers) 1 × 2, each column picture + h2 + p + link
t = secs[6]
cols = []
for it in t['items']:
    cols.append(f'<div><p>{pic(it["img"])}</p>{heading("h2", it["heading"])}<p>{H(it["text"])}</p><p><a href="{H(it["link"]["href"])}">{H(it["link"]["text"])}</a></p></div>')
out.append(f'<div><div class="columns teasers"><div>{"".join(cols)}</div></div></div>')
# 8 textimage AP Chronicles: columns (feature): text | picture
def feature(it, picture_first):
    text = f'<div>{heading("h2", it["heading"])}<p>{H(it["text"])}</p><p><a href="{H(it["link"]["href"])}">{H(it["link"]["text"])}</a></p></div>'
    p = f'<div><p>{pic(it["img"])}</p></div>'
    return f'<div><div class="columns feature"><div>{p + text if picture_first else text + p}</div></div></div>'
out.append(feature(secs[7]['items'][0], False))
# 9 services carousel
out.append(carousel(secs[8], ''))
# 10 find a boutique: picture | text
out.append(feature(secs[9]['items'][0], True))
# 11 newsletter: default content, section style `newsletter` (white band, three columns)
n = secs[10]
out.append(f'<div><h2>Get the <em>Latest News</em></h2><p>{H(n["text"])}</p><p><strong><a href="{H(n["cta"]["href"])}">{H(n["cta"]["text"])}</a></strong></p><div class="section-metadata"><div><div>style</div><div>newsletter</div></div></div></div>')
meta = ('<div><div class="metadata"><div><div>title</div><div>Audemars Piguet | Swiss Luxury Watches</div></div>'
        '<div><div>description</div><div>In the heart of the Vallée de Joux, a Swiss region that beats to the tune of complicated watch mechanisms, everything started for Audemars Piguet in 1875.</div></div>'
        '<div><div>nav</div><div>/drafts/nav</div></div><div><div>footer</div><div>/drafts/footer</div></div></div></div>')
out.append(meta)
open('doc/home.html', 'w').write('<body>\n  <header></header>\n  <main>\n' + '\n'.join(out) + '\n  </main>\n  <footer></footer>\n</body>\n')

# ---- nav: brand · categories (3-level list) · tools
cats = []
for st in nav['states']:
    items = [it for it in st['items'] if it['box'][0] >= 500]  # the panel column; the left column holds the categories and tools
    groups = []; cur = None
    for it in items:
        if it['tag'] == 'h4':
            cur = {'title': it['text'], 'links': []}; groups.append(cur)
        elif it['tag'] == 'a':
            if cur is None: groups.append({'title': None, 'link': it})
            else: cur['links'].append(it)
    lis = []
    for g in groups:
        if g['title'] is None: lis.append(f'<li><a href="{H(g["link"]["href"])}">{H(g["link"]["text"])}</a></li>')
        else: lis.append(f'<li>{H(g["title"].title() if g["title"].isupper() else g["title"])}<ul>' + ''.join(f'<li><a href="{H(l["href"])}">{H(l["text"])}</a></li>' for l in g['links']) + '</ul></li>')
    cats.append(f'<li>{H(st["label"])}<ul>{"".join(lis)}</ul></li>')
tools = [('watch', 'Find your watch', 'https://www.audemarspiguet.com/ch/en/watch-collection'), ('pin', 'Boutiques', 'https://www.audemarspiguet.com/ch/en/stores'),
         ('user', 'Login or sign up', 'https://www.audemarspiguet.com/ch/en/secure/account'), ('mail', 'Contact us', 'https://www.audemarspiguet.com/ch/en/form/contact-us'),
         ('world', 'Switzerland / English', 'https://www.audemarspiguet.com/')]
navdoc = ('<body>\n  <header></header>\n  <main>\n'
          '<div><p><a href="https://www.audemarspiguet.com/ch/en/home">:logo: Audemars Piguet</a></p></div>\n'
          f'<div><ul>{"".join(cats)}</ul></div>\n'
          '<div><ul>' + ''.join(f'<li><a href="{u}">:{ic}: {t}</a></li>' for ic, t, u in tools) + '</ul></div>\n'
          '  </main>\n  <footer></footer>\n</body>\n')
open('doc/nav.html', 'w').write(navdoc)

# ---- footer: logos · language + link groups · social · legal
def walk(node, acc):
    acc.append(node)
    for c in node.get('children', []) or node.get('kids', []) or []: walk(c, acc)
    return acc
foot = next(r for r in content['roots'] if r['sel'].startswith('footer')) if 'roots' in content else None
# read the footer from the content-view text instead (the dump's schema differs per instrument): groups are h4 + following a's
view = open('measure/content-view-1440.txt').read().split('===== footer')[1]
logos = re.findall(r'a \[[^\]]+\] -> (\S+) target=\S+ aria="([^"]+)"\s+img\S* \[[^\]]+\] src=(\S+) nat=\[(\d+),(\d+)\] alt="([^"]+)"', view)
groups = re.findall(r'h4\S* \[[^\]]+\] \| [^\n]*\n\s+TEXT: "([^"]+)"((?:\n\s+a \[[^\n]+\n\s+TEXT: "[^"]+")+)', view)
grp_html = ''
for title, body in groups:
    links = re.findall(r'a \[[^\]]+\] \|[^\n]*-> (\S+) target=\S+\n\s+TEXT: "([^"]+)"', body)
    grp_html += f'<h4>{H(title.title() if title.isupper() else title)}</h4><ul>' + ''.join(f'<li><a href="{H(u if u.startswith("http") else "https://www.audemarspiguet.com" + u)}">{H(t)}</a></li>' for u, t in links) + '</ul>'  # flat: a classless <div> inside a section is not default content for the pipeline
social = re.findall(r'a \[[^\]]+\] -> (\S+) target=_blank\n(?!\s+img)', view)
names = {'instagram': 'Instagram', 'facebook': 'Facebook', 'youtube': 'YouTube', 'tiktok': 'TikTok', 'linkedin': 'LinkedIn', 'pinterest': 'Pinterest', 'weibo': 'Weibo', 'wechat': 'WeChat', 'line': 'LINE', 'x.com': 'X'}
def sname(u):
    for k, v in names.items():
        if k in u: return v
    return u
footdoc = ('<body>\n  <header></header>\n  <main>\n'
           '<div>' + ''.join(f'<p><a href="{H(u)}" title="{H(aria)}"><picture><img src="{MEDIA}{media_name(src)}" alt="{H(alt)}" width="{w}" height="{h}"></picture></a></p>' for u, aria, src, w, h, alt in logos) + '</div>\n'
           '<div><p><a href="https://www.audemarspiguet.com/">:world: Change language / currency</a></p>' + grp_html + '</div>\n'
           '<div><ul>' + ''.join(f'<li><a href="{H(u)}">{H(sname(u))}</a></li>' for u in social) + '</ul></div>\n'
           '<div><p>沪ICP备13031168号-1</p><p>© 2026 Audemars Piguet</p></div>\n'
           '  </main>\n  <footer></footer>\n</body>\n')
open('doc/footer.html', 'w').write(footdoc)
print('home', len(out), 'sections;', 'nav categories', len(cats), '; footer logos', len(logos), 'groups', len(groups), 'social', len(social))
