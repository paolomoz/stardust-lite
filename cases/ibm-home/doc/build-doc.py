#!/usr/bin/env python3
"""Authored documents for www.ibm.com/us-en home (DA source format): home.html, nav.html, footer.html next to this file.
Every value comes from the step-1 capture (migration/cases/home/measure/content.json, nav-content.json, megamenu-all.json);
nothing is copied from the source DOM. Media = the source's bytes previewed on the branch (drafts/media)."""
import html, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); MEAS = os.path.join(HERE, '..', 'measure')
M = 'https://blocks-first--sdt-ibm--aemcoder-adobe.aem.page/drafts/media/'
C = json.load(open(os.path.join(MEAS, 'content.json'))); N = json.load(open(os.path.join(MEAS, 'nav-content.json'))); MM = json.load(open(os.path.join(MEAS, 'megamenu-all.json')))
E = lambda s: html.escape(s, quote=True)
def pic(name, alt=''): return f'<picture><img src="{M}{name}" alt="{E(alt)}"></picture>'
def a(text, href): return f'<a href="{E(href)}">{E(text)}</a>'
def p(inner): return f'<p>{inner}</p>'
def btn(text, href, kind): tag = {'primary': 'strong', 'secondary': 'em'}[kind]; return f'<p><{tag}>{a(text, href)}</{tag}></p>'
def cell(*inner): return '<div>' + ''.join(inner) + '</div>'
def row(*cells): return '<div>' + ''.join(cells) + '</div>'
def block(cls, *rows): return f'<div class="{cls}">' + ''.join(rows) + '</div>'
def section(*inner, style=None):
    s = '<div>' + ''.join(inner)
    if style: s += block('section-metadata', row(cell('style'), cell(style)))
    return s + '</div>'
def doc(*sections): return '<body>\n  <header></header>\n  <main>\n' + '\n'.join(sections) + '\n  </main>\n  <footer></footer>\n</body>\n'
media_name = {  # source URL → uploaded file (source bytes, see measure/media-map.json)
  'IBM%20Bob%20hero': 'tile-bob-laptop.png', 'IBV%20Report': 'tile-ibv-report-ai-paying-off.png', 'LLM%20watermarks': 'tile-llm-watermarks.png', 'R4U-Bob-laptop': 'tile-r4u-bob-laptop-gradient.png',
  'big-blue-30-shopping': 'promo-big-blue-shopping.png', 'crushbank-logo': 'logo-crushbank.png', 'riverty-logo': 'logo-riverty.png', 'citadelle-logo': 'logo-citadelle.png', 'ibm-logo-2x1': 'logo-ibm.png',
  'training-professional': 'training-professional.png', 'training-foundational': 'training-foundational-skills.png', 'training-student': 'training-student-pathways.png', 'stay-connected': 'stay-connected-people.png' }
def med(src):
    for k, v in media_name.items():
        if k in src: return v
    raise KeyError(src)

# ---------------------------------------------------------------- home
H = C['hero']
banner = block('banner dark', row(cell(p(f'<strong>Get hands-on at IBM TechXchange 2026</strong> Build skills, earn certifications and save on hotels by Oct 1.')),
                                  cell(p(a('Explore the event', 'https://www.ibm.com/events/techxchange?lnk=hppr1us')))))
hero = block('hero leadspace',
  row(cell(f'<h1>{E(H["h1"])}</h1>', p(E(H['p'])), btn(H['buttons'][0]['text'], H['buttons'][0]['href'], 'primary'), btn(H['buttons'][1]['text'], H['buttons'][1]['href'], 'secondary'))),
  row(cell(p(a('IBM Bob – homepage leadspace video (0:26)', H['videoHref'])), pic('leadspace-ibm-bob-4x3-frame0.png', 'IBM Bob, the AI software development partner, in a dark code editor'))),
  row(cell('<h3>Latest News</h3>', '<ul>' + ''.join(f'<li>{a(n["text"], n["href"])}</li>' for n in C['news']) + '</ul>')))
s_top = section(banner, hero)

tiles = block('cards tiles', *[row(cell(pic(med(t['img']), t['alt'])), cell(p(E(t['label'])), p(f'<a href="{E(t["href"])}" title="{E(t["aria"] or t["text"])}">{E(t["text"])}</a>'))) for t in C['tiles']])
s_tiles = section('<h5>Recommended for you</h5>', tiles, style='bleed')

I = C['intro']
picto = {'ibm--bob': 'pictogram-ibm-bob', 'ai': 'pictogram-ai', 'streaming-data': 'pictogram-streaming-data', 'flash--storage': 'pictogram-flash-storage', 'govern--users--and--identities': 'pictogram-govern-users-and-identities', 'automate--modular--management': 'pictogram-automate-modular-management', 'predictive-analytics': 'pictogram-predictive-analytics', 'group': 'pictogram-group'}
cards = block('cards pictogram', *[row(cell(p(f':{picto[c["pictogram"]]}:')), cell(f'<h3>{a(c["heading"], c["href"])}' + (' :launch:' if c['cta'] == 'external' and 'ibm.com' in c['href'] else '') + '</h3>', p(E(c['copy'])))) for c in C['cards']])
s_tech = section(f'<h2>{E(I["h2"])}</h2>', p(I['p_html']), p(a(I['link']['text'], I['link']['href'])), cards, p(a(C['exploreAll']['text'], C['exploreAll']['href'])), style='split-intro')

P = C['promo']
promo = block('banner light', row(cell(pic(med(P['img']), P['alt'])), cell(p(f'<strong>{E(P["heading"])}</strong>'), p(E(P['text']))), cell(btn(P['cta']['text'], P['cta']['href'], 'secondary'))))
s_promo = section(promo)

cases = block('cards case-study', *[row(cell(pic(med(c['img']), c['alt'])), cell(f'<h3>{a(c["heading"], c["href"])}</h3>', p(f'<strong>{E(c["stat"])}</strong>'), p(E(c['desc'])))) for c in C['cases']])
s_impact = section(f'<h2>{E(C["title"])}</h2>', cases)

Tr = C['training']
training = block('cards training', *[row(cell(pic(med(i['img']), i['alt'])), cell(f'<h3>{E(i["heading"])}</h3>', p(E(i['copy'])), *[p(a(l['text'], l['href'])) for l in i['links']])) for i in Tr['items']])
s_training = section(f'<h2>{E(Tr["h2"])}</h2>', training, style='title-aside')

Nw = C['newsletter']
newsletter = block('columns newsletter', row(cell(f'<h2>{E(Nw["h2"])}</h2>', pic(med(Nw['img']), Nw['alt'])), cell(f'<h2>{E(Nw["formH2"])}</h2>')))
s_news = section(newsletter)

meta = section(block('metadata', row(cell('title'), cell('IBM')), row(cell('description'), cell(E(C['head']['desc']))), row(cell('template'), cell('home')), row(cell('nav'), cell('/drafts/nav')), row(cell('footer'), cell('/drafts/footer'))))
open(os.path.join(HERE, 'home.html'), 'w').write(doc(s_top, s_tiles, s_tech, s_promo, s_impact, s_training, s_news, meta))

# ---------------------------------------------------------------- nav (reading order: brand, primary menus, tools)
def li(inner): return f'<li>{inner}</li>'
def megamenu(m):
    tabs = []
    for t in m['tabs']:
        links = ''.join(li(a(l['title'].strip(), l['href']) + ' ' + E(l['desc'])) for g in t['groups'] for l in g['links'])
        tabs.append(li(a(t['heading']['title'], t['heading']['href']) + f'<ul>{links}</ul>'))
    tabs.append(li(a(m['viewAll']['text'], m['viewAll']['href'])))
    return '<ul>' + ''.join(tabs) + '</ul>'
S = N['support']
support = '<ul>' + ''.join(li(a(t, h)) for t, h in S['optional']) + ''.join(li(a(i['title'], i['href']) + ' ' + E(i['desc'])) for i in S['items']) + '</ul>'
l0 = []
for item in N['l0']:
    if item['tag'] == 'c4d-megamenu-top-nav-menu': l0.append(li(E(item['label']) + megamenu(MM[item['label']])))
    elif item['tag'] == 'c4d-top-nav-menu': l0.append(li(E(item['label']) + support))
    else: l0.append(li(a(item['label'], item['href'])))
login = N['profile'][0][1].replace('&amp;', '&')
nav_doc = doc(
  section(p(f'<a href="https://www.ibm.com/us-en">:ibm-logo: IBM</a>')),
  section('<ul>' + ''.join(l0) + '</ul>'),
  section(p(a(':search: Search all of IBM', 'https://www.ibm.com/search?lnk=L0G')), p(a(':chat: Contact IBM', 'https://www.ibm.com/contact/global')), p(a(':earth: Page translations', 'https://www.ibm.com/planetwide')), p(a(':user: Log in', login))))
open(os.path.join(HERE, 'nav.html'), 'w').write(nav_doc)

# ---------------------------------------------------------------- footer
F = N['footer']
groups = ''.join(f'<h2>{E(g["title"])}</h2><ul>' + ''.join(li(a(l['title'], l['url'])) for l in g['links']) + '</ul>' for g in F['footerMenu'])
legal = '<ul>' + ''.join(li(a(l['title'], l['url'])) for l in F['footerThin']) + li(a('Cookie Preferences', 'https://www.ibm.com/us-en/privacy')) + '</ul>'
open(os.path.join(HERE, 'footer.html'), 'w').write(doc(section(p(f'<a href="https://www.ibm.com/us-en">:ibm-logo-footer: IBM</a>')), section(groups), section(legal)))
print('wrote home.html nav.html footer.html')
