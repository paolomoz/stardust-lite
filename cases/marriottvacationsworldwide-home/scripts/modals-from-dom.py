#!/usr/bin/env python3
"""modals-from-dom.py — case instrument: the brand modals' content (logo, heading with <sup>, paragraphs with links) read from the
captured DOM (measure/dom-1440.html). The modals sit in <body> with aria-hidden at rest: `content-dump` skips them, `click-state`
on the tile overlay printed no visible panel, so the authoring set of the nine cards came from here. Also writes
measure/modals-content.json in the dump's text/children shape for `harness --content`.
Usage: python3 scripts/modals-from-dom.py [measure/dom-1440.html]"""
import re, html, json, sys, os
CASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dom = sys.argv[1] if len(sys.argv) > 1 else f'{CASE}/measure/dom-1440.html'
d = open(dom).read()
def clean(s):
    s = re.sub(r'<a ([^>]*)href="([^"]*)"[^>]*>(.*?)</a>', lambda m: '<a href="%s">%s</a>' % (m.group(2), re.sub(r'<[^>]+>', '', m.group(3))), s, flags=re.S)
    s = re.sub(r'<(?!/?(a|sup|br|strong|em)\b)[^>]+>', '', s)
    return html.unescape(re.sub(r'\s+', ' ', s)).strip()
out = []
for i in range(1, 10):
    m = re.search(r'<div id="brand-grid-item-%d".*?<div id="kt-modal[^"]*-content" class="kt-modal-content">(.*?)</div>\s*</div>\s*</div>\s*</div>' % i, d, re.S)
    body = m.group(1)
    img = re.search(r'<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"', body)
    h2 = re.search(r'<h2[^>]*>(.*?)</h2>', body, re.S)
    ps = [clean(p) for p in re.findall(r'<p[^>]*>(.*?)</p>', body, re.S)]
    out.append({'i': i, 'img': img.group(1), 'alt': img.group(2), 'h2': clean(h2.group(1)), 'ps': [p for p in ps if p]})
json.dump(out, open(f'{CASE}/measure/modals.json', 'w'), indent=1)
strip = lambda s: html.unescape(re.sub(r'<[^>]+>', '', s))
kids = [{'tag': 'div', 'children': [{'tag': 'h2', 'text': strip(o['h2'])}] + [{'tag': 'p', 'text': strip(p)} for p in o['ps']]} for o in out]
json.dump({'main': {'tag': 'div', 'children': kids}, '__doc': 'brand modals (hidden DOM at rest) read from the captured DOM'}, open(f'{CASE}/measure/modals-content.json', 'w'), indent=1)
for o in out: print(o['i'], o['alt'], '|', o['h2'], '|', o['ps'][0][:70])
