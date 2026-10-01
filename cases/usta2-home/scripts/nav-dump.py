#!/usr/bin/env python3
"""nav-dump.py <dom.html> <out.json> — the usta.com header's hidden lists: 6 level-1 items with their mega-menu (level-2 items with
icon + link, level-3 links), the two top-bar dropdowns (USTA Sites / USTA Sections), read from the live-spec DOM dump.
Site-specific selectors (a case template, like the travelers/ibm nav dumps)."""
import json, sys
from bs4 import BeautifulSoup
soup = BeautifulSoup(open(sys.argv[1]).read(), 'lxml')
out = {'level1': [], 'dropdowns': []}
for li in soup.select('ul.navigation-menu__list > li.navigation-menu__list-item--level-1'):
    a = li.select_one('a.navigation-menu__list-item-link--level-1')
    item = {'text': a.get_text(strip=True), 'href': a.get('href'), 'children': []}
    for l2 in li.select('li.navigation-menu__list-item--level-2'):
        a2 = l2.select_one('a.navigation-menu__list-item-link--level-2')
        img = l2.select_one('img.list-item__image')
        c = {'text': a2.get_text(strip=True) if a2 else None, 'href': a2.get('href') if a2 else None,
             'img': img.get('src') if img else None, 'alt': img.get('alt') if img else None, 'children': []}
        for a3 in l2.select('ul.navigation-menu__list-items--level-3 a'):
            c['children'].append({'text': a3.get_text(strip=True), 'href': a3.get('href')})
        item['children'].append(c)
    out['level1'].append(item)
for dd in soup.select('#top-navigation-bar .dropdown'):
    label = dd.select_one('.drop-down__label')
    d = {'label': label.get_text(strip=True) if label else None, 'slogan': None, 'img': None, 'links': []}
    sl = dd.select_one('.drop-down__slogan'); d['slogan'] = sl.get_text(strip=True) if sl else None
    im = dd.select_one('.drop-down__image img'); d['img'] = im.get('src') if im else None
    for a in dd.select('.drop-down__select-list a'):
        d['links'].append({'text': a.get_text(strip=True), 'href': a.get('href')})
    out['dropdowns'].append(d)
json.dump(out, open(sys.argv[2], 'w'), indent=1)
for l1 in out['level1']:
    print(l1['text'], l1['href'], len(l1['children']), 'l2 items,', sum(len(c['children']) for c in l1['children']), 'l3 links')
    for c in l1['children']: print('   ', c['text'], c['href'], '| img', (c['img'] or '')[-40:], '|', [x['text'] for x in c['children']])
for d in out['dropdowns']: print('DROPDOWN', d['label'], d['slogan'], d['img'], [(l['text'], l['href']) for l in d['links']])
