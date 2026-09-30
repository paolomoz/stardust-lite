#!/usr/bin/env python3
"""Authored documents for stryker.com/ch/en home (DA source format). Writes home.html, nav.html, footer.html next to this file.
Texts, hrefs and media come from the step-1 capture (migration/cases/home/measure/content-*.json, dom-1440.html);
nothing is copied from the source DOM structure. The nav's mega-menu lists are read from the captured DOM (hidden panels)."""
import html, os, re, json
from html.parser import HTMLParser
HERE = os.path.dirname(os.path.abspath(__file__))
M = 'https://blocks-first--sdt-stryker--aemcoder-adobe.aem.page/drafts/media/'
S = 'https://www.stryker.com'

def pic(name, alt=''):
    return f'<picture><img src="{M}{name}" alt="{html.escape(alt)}"></picture>'
def btn(text, href, kind='primary'):
    tag = {'primary': 'strong', 'secondary': 'em'}[kind]
    return f'<p><{tag}><a href="{href}">{html.escape(text)}</a></{tag}></p>'
def link_p(text, href):
    return f'<p><a href="{href}">{html.escape(text)}</a></p>'
def ul(items):
    return '<ul>' + ''.join(f'<li><a href="{h}">{html.escape(t)}</a></li>' for t, h in items) + '</ul>'
def cell(*inner): return '<div>' + ''.join(inner) + '</div>'
def row(*cells): return '<div>' + ''.join(cells) + '</div>'
def block(cls, *rows): return f'<div class="{cls}">' + ''.join(rows) + '</div>'
def section(*inner, style=None):
    s = '<div>' + ''.join(inner)
    if style: s += block('section-metadata', row(cell('style'), cell(style)))
    return s + '</div>'
def doc(*sections):
    return '<body>\n  <header></header>\n  <main>\n' + '\n'.join(sections) + '\n  </main>\n  <footer></footer>\n</body>\n'
def h2(t): return f'<h2>{html.escape(t)}</h2>'
def p(t): return f'<p>{html.escape(t)}</p>'
def abs_(h): return h if h.startswith('http') else S + h

# ---------------------------------------------------------------- home
hero = block('hero video',
  row(cell(pic('hero-frame.png', 'A caregiver in scrubs and a mask greets two visitors in a hospital corridor'))),
  row(cell(pic('homepage-mobile-v4.jpg', 'Four photos: a care team, a nurse with a young patient, a group holding a Together sign, a clinician at a screen'))),
  row(cell(link_p('Watch the video', 'https://media-assets.stryker.com/s7viewers/html5/VideoViewer.html?asset=stryker/COMM-MKOSYM-VID-870301_Website%20Landing%20Video%20English-AVS&amp;videoserverurl=https://media-assets.stryker.com/is/content/'))))
s_hero = section(hero)

s_what = section(block('columns boxed', row(
  cell(h2('What we do'),
       p("Stryker is one of the world's leading medical technology companies. Alongside our customers around the world, we impact more than 150 million patients annually."),
       btn('GET TO KNOW US', abs_('/ch/en/about.html'))),
  cell(pic('150m-white.jpg', '150M')))), style='gold-band, flush')

news = [
  ('strykerpangeaplatingsystem-pr-thumbnail.jpg', 'Stryker launches Pangea Plating System and completes first case in Europe', None,
   '/ch/en/about/news/2026/stryker-launches-pangea-plating-system-and-completes-first-case-in-europe.html', 'Pangea plating system implants'),
  ('stryker-logo-thumbnail-1.jpg', 'Stryker names Spencer Stiles President and Chief Operating Officer',
   'Stryker announced Spencer Stiles has been appointed President and Chief Operating Officer (COO), effective January 1, 2026. In this role, Stiles will lead the company’s global businesses, strategy, and mergers and acquisitions.',
   '/ch/en/about/news/2025/stryker-names-spencer-stiles-president-and-chief-operating-officer.html', 'Stryker logo'),
  ('strykertalks-andypierce-thumbnail-v2.jpg', 'Stryker’s Pierce shares how our latest digital innovations help caregivers and their patients',
   'Andy Pierce, our Group President of MedSurg and Neurotechnology, joins the StrykerTalks podcast to share updates on how our advanced devices and software – such as Vocera technology and the 1788 camera – help our customers address some of their most pressing challenges across the continuum of care.',
   '/ch/en/about/news/2024/stryker-s-pierce-shares-how-our-latest-digital-innovations-help-.html', 'StrykerTalks podcast with Andy Pierce'),
  ('stryker-logo-thumbnail-2.jpg', 'Stryker completes acquisition of Artelon, Inc.', None,
   '/ch/en/about/news/2024/stryker-completes-acquisition-of-artelon-inc.html', 'Stryker logo'),
]
s_news = section(h2('Latest news'), block('cards news', *[
  row(cell(pic(img, alt)), cell(f'<h3>{html.escape(t)}</h3>' + (p(d) if d else '') + link_p('Read More', abs_(h)))) for img, t, d, h, alt in news]))

focus = [
  ('test-images-portfolio-2.jpg', 'Medical and Surgical', 'Empowering people for powerful outcomes',
   'By putting people at the heart of every innovation, we optimize pathways across the continuum of care — for the excellence of care delivery, the safety and wellbeing of care teams and the outcomes of patients.',
   '/ch/en/portfolios/medical-surgical-equipment.html', 'LIFEPAK 15 monitor/defibrillator'),
  ('mako-column-photo-v2.jpg', 'Orthopaedics and Spine', "Leading what's next",
   'Our Orthopaedics portfolio is a culmination of powerful solutions that maximize clinical, financial and operational outcomes. From iconic innovations to reliable platforms, from decision-driving data to medical education, we help move procedures and patients forward.',
   '/ch/en/portfolios/orthopaedics.html', 'Mako robotic arm'),
  ('test-images-portfolio-4.jpg', 'Neurotechnology', 'Better connected',
   'By delivering access to meaningful innovation, operational efficiency and the simplification of a single partner, we provide the power of a deeper understanding to help you better serve the needs of your patients and help improve clinical and economic outcomes.',
   '/ch/en/portfolios/neurotechnology-spine.html', 'Neurotechnology products'),
]
s_focus = section(h2('Our focus'), block('cards focus', *[
  row(cell(pic(img, alt)), cell(f'<h3><a href="{abs_(h)}">{html.escape(t)}</a></h3><p><em>{html.escape(sub)}</em></p>' + p(d))) for img, t, sub, d, h, alt in focus]), style='padded')

s_people = section(block('columns', row(
  cell(h2('People are at the heart of what we do,'), p('and by valuing our differences, we are stronger together.'),
       btn('Join our team', 'https://careers.stryker.com/')),
  cell(pic('peoplegraphic-v5.jpg', 'Group Photo')))))

s_cr = section(block('hero banner',
  row(cell(pic('makinganimpact-greengrad-desktopv4.jpg', 'CR'))),
  row(cell(pic('makinganimpact-greengrad-mobile.jpg', 'Making an impact mobile'))),
  row(cell(h2('Corporate responsibility'),
           p('We are committed to positively impacting people and our planet through responsible, sustainable practices that create a better, healthier world.'),
           btn('Read our Comprehensive Report', abs_('/content/dam/stryker/about/annual-review/2024/Stryker-2024-Comprehensive-Report.pdf'))))))

awards = [('2025-worlds-best-workplaces2025-asia-best-workplaces-600x600.png', "World's Best Workplaces 2025"), ('100-best-companies-small.png', 'Fortune 100 Best Companies to Work For 2025'),
  ('2025-asia-best-workplaces-600x600.png', 'Best Workplaces in Asia 2025'), ('100-best-companies-eu-small.png', 'Best Workplaces in Europe 2025'),
  ('gptw-latam-small.png', 'Best Workplaces in Latin America 2025'), ('100-best-companies-maufacturing-production-small.png', 'Best Workplaces in Manufacturing and Production 2025')]
s_awards = section(h2('Awards'), p('We owe our achievements to our dedicated employees'),
  block('cards awards', *[row(cell(pic(img, alt))) for img, alt in awards]),
  btn('View all awards', abs_('/ch/en/about/awards/awards.html')), style='gray')

s_fine = section(p('COMM-GSNPS-SYK-1057827_Rev-3'), style='fine-print, flush, page-end')

meta = block('metadata', row(cell('title'), cell('Stryker - Medical Devices and Equipment Manufacturing Company | Stryker')),
             row(cell('nav'), cell('/drafts/nav')), row(cell('footer'), cell('/drafts/footer')),
             row(cell('description'), cell('Stryker is one of the world’s leading medical technology companies, impacting more than 150 million patients annually.')))
home = doc(s_hero, s_what, s_news, s_focus, s_people, s_cr, s_awards, s_fine, section(meta))

# ---------------------------------------------------------------- nav (mega-menu lists from the captured hidden DOM)
class Panels(HTMLParser):
    """Collects, per .secondary-nav panel, the columns; each column = list of (kind, text, href) with kind bold|plain|head."""
    def __init__(s):
        super().__init__(); s.panels = []; s.col = None; s.li = None; s.depth = 0; s.in_panel = 0; s.stack = []
    def handle_starttag(s, tag, attrs):
        a = dict(attrs); cls = a.get('class', '')
        s.stack.append((tag, cls))
        if tag == 'div' and 'secondary-nav' in cls.split(): s.panels.append([]); s.in_panel = len(s.stack)
        if s.in_panel and tag == 'div' and 'col-md-2' in cls.split() and 'hidden-md' not in cls: s.col = []; s.panels[-1].append(s.col)
        if s.col is not None and tag == 'li': s.li = {'kind': 'bold' if 'bold' in cls.split() else 'plain', 'text': '', 'href': None}
        if s.li is not None and tag == 'a': s.li['href'] = a.get('href')
        if s.li is not None and tag == 'span': s.li['kind'] = 'head'
    def handle_endtag(s, tag):
        if s.li is not None and tag == 'li': s.col.append(s.li); s.li = None
        if tag == 'div' and s.col is not None and s.stack and 'col-md-2' in s.stack[-1][1].split(): s.col = None
        if s.stack: s.stack.pop()
        if s.in_panel and len(s.stack) < s.in_panel: s.in_panel = 0
    def handle_data(s, d):
        if s.li is not None: s.li['text'] += d
dom = open(os.path.join(HERE, '..', 'measure', 'dom-1440.html'), encoding='utf-8').read()
i = dom.find('class="main-nav"'); seg = re.sub(r'<script.*?</script>', '', dom[i:dom.find('</header>', i)], flags=re.S)
pp = Panels(); pp.feed(seg)
panels = [[[dict(it, text=re.sub(r'\s+', ' ', it['text']).strip()) for it in col] for col in panel] for panel in pp.panels]

L1 = [('About', '/ch/en/about.html'), ('Products', '/ch/en/portfolios.html'), ('Services', '/ch/en/services.html'), ('Training and Education', '/ch/en/training-and-education.html')]
def l2_list(panel):
    """Columns are editorial breaks on the source; the document keeps one list per menu: bold items are top-level entries, a heading
    (span) opens a group whose plain items are nested under it."""
    out = '<ul>'; group_open = False
    for col in panel:
        for it in col:
            if it['kind'] == 'bold':
                if group_open: out += '</ul></li>'; group_open = False
                out += f'<li><a href="{abs_(it["href"])}">{html.escape(it["text"])}</a></li>'
            elif it['kind'] == 'head':
                if group_open: out += '</ul></li>'
                out += f'<li>{html.escape(it["text"])}<ul>'; group_open = True
            else:
                if not group_open: out += '<li><ul>'; group_open = True
                out += f'<li><a href="{abs_(it["href"])}">{html.escape(it["text"])}</a></li>'
    if group_open: out += '</ul></li>'
    return out + '</ul>'
main_items = ''
for k, (t, h) in enumerate(L1):
    sub = l2_list(panels[k]) if k < len(panels) and any(panels[k]) else ''
    main_items += f'<li><a href="{abs_(h)}">{html.escape(t)}</a>{sub}</li>'
utility = [('Careers', 'http://careers.stryker.com/'), ('IFUs', 'https://ifu.stryker.com'), ('Imprint', abs_('/ch/en/about/our-locations/imprint.html')), ('Contact', abs_('/ch/en/about/contact.html'))]
nav = doc(
  section(f'<p><a href="{abs_("/ch/en/index.html")}">{pic("logo-png.png", "Stryker")}</a></p>'),
  section(ul(utility), f'<p>{pic("globe-icon-png.png", "Select Country/Language")} <a href="{abs_("/ch/en/index.html")}#language-country">Switzerland/English</a></p>'),
  section(f'<ul>{main_items}</ul>'),
  section(link_p('Search this site', abs_('/ch/en/search.html'))))

# ---------------------------------------------------------------- footer
legal = [('PRIVACY', abs_('/ch/en/legal/privacy.html')), ('ACCESSIBILITY STATEMENT', abs_('/ch/en/legal/website-accessibility.html')),
         ('HEALTHCARE PROFESSIONAL DISCLAIMER', abs_('/ch/en/legal/surgeon-disclaimer.html')), ('TERMS OF USE', abs_('/ch/en/legal/terms-of-use.html'))]
footer = doc(
  section(p('© Stryker 1998-2026'), ul(legal)),
  section(f'<p><a href="https://www.facebook.com/strykercareers/">{pic("icon-social-f.png", "Facebook")}</a></p>',
          f'<p><a href="https://www.linkedin.com/company/stryker">{pic("icon-social-t.png", "LinkedIn")}</a></p>'),
  section(ul([('Product experience', 'http://www.stryker.com/productexperience'), ('Ethics hotline', 'http://www.ethicshotline.stryker.com/')])))

for name, content in (('home.html', home), ('nav.html', nav), ('footer.html', footer)):
    open(os.path.join(HERE, name), 'w', encoding='utf-8').write(content)
    print(name, len(content), 'bytes')
print('panels', [[len(c) for c in pnl] for pnl in panels])
