#!/usr/bin/env python3
"""Document generator for www.marriottvacationsworldwide.com/ (home): reads the captured DOM (measure/dom-1440.html) and the
modal dump (measure/modals.json), writes doc/home.html, doc/nav.html, doc/footer.html — the authored documents a person could
have typed in a doc. Texts come from the capture, never from memory. Media are the source's bytes on the branch host."""
import re, html, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
CASE = os.path.dirname(HERE)
d = open(f'{CASE}/measure/dom-1440.html').read()
modals = json.load(open(f'{CASE}/measure/modals.json'))
M = 'https://blocks-first--sdt-marriottvacationsworldwide--aemcoder-adobe.aem.page/drafts/media/'
SITE = 'https://www.marriottvacationsworldwide.com'

def inner(cls, tag='[a-z0-9]+'):
    m = re.search(r'<(%s) class="%s[^"]*"[^>]*>(.*?)</\1>' % (tag, re.escape(cls)), d, re.S)
    assert m, cls
    return m.group(2)

def clean(s):
    s = re.sub(r'<a ([^>]*?)href="([^"]*)"[^>]*>(.*?)</a>', lambda m: '<a href="%s">%s</a>' % (m.group(2), re.sub(r'<[^>]+>', '', m.group(3))), s, flags=re.S)
    s = re.sub(r'<br\s*/?>', '<br>', s)
    s = re.sub(r'<(?!/?(a|sup|br|strong|em)\b)[^>]+>', '', s)
    s = re.sub(r'\s+', ' ', s)
    s = s.replace('&nbsp;', ' ').replace('\xa0', ' ')
    return s.strip()

def pic(name, alt=''):
    return '<picture><img src="%s%s" alt="%s"></picture>' % (M, name, html.escape(alt, quote=True))

def block(name, rows):
    out = ['<div class="%s">' % name]
    for row in rows:
        out.append('<div>' + ''.join('<div>%s</div>' % c for c in row) + '</div>')
    out.append('</div>')
    return '\n'.join(out)

def section(parts, style=None):
    s = '\n'.join(parts)
    if style:
        s += '\n<div class="section-metadata"><div><div>style</div><div>%s</div></div></div>' % style
    return '<div>\n' + s + '\n</div>'

def doc(sections):
    return '<body>\n  <header></header>\n  <main>\n' + '\n'.join(sections) + '\n  </main>\n  <footer></footer>\n</body>\n'

# ---------------------------------------------------------------- home
intro_p = clean(inner('kt-adv-heading290_cbe971-4b', 'p'))
intro_ps = ['<p>%s</p>' % p.strip() for p in intro_p.split('<br><br>')]
encompasses = clean(inner('kt-adv-heading290_dc5cd2-50', 'p'))
tiles = {
    'Vacation Ownership': [('mvc-grey.png', 0), ('grey-sheraton.png', 1), ('wvc-logo-gray-4x.png', 2), ('grc-gray.png', 3), ('ritz-logo-gray-4x-300x287.png', 4), ('st-regis-gray.png', 5)],
    'hyatt': [('hvc-grey.png', 6)],
    'Exchange & Third-Party Management': [('interval-grey.png', 7), ('aqua-aston-grey.png', 8)],
}
def tile_rows(items):
    rows = []
    for name, i in items:
        m = modals[i]
        rows.append(['<p>%s</p>' % pic(name, m['alt']), '<h3>%s</h3>' % m['h2'] + ''.join('<p>%s</p>' % p for p in m['ps'])])
    return rows

hero_rows = [
    ['<p>%s</p><p><a href="%smvw-hero-inner-circle.mp4">Inner Circle hero video</a></p>' % (pic('mvw-hero-inner-circle-poster.jpg', 'The Marriott Vacation Clubs | Inner Circle, presented by Aflac'), M), ''],
    ['<p><a href="https://tpd1.www.marriottvacationsworldwide.com/wp-content/uploads/2025/06/25-07-3740250_Abound-Automated-Hotel-Booking-Sizzle-Video_vFN5-Resize.mp4">Abound automated hotel booking video</a></p>', ''],
]
for n, ext in [(1, 'jpg'), (2, 'jpg'), (3, 'jpeg'), (4, 'jpeg'), (5, 'jpg')]:
    hero_rows.append(['<p>%s</p>' % pic('mvw-hero-photo-%d.%s' % (n, ext), 'Vacations that move you'), '<h2>Vacations</h2><h3>that move you.</h3>'])
inner_circle = re.search(r'<a class="kb-button[^"]*kb-btn290_781132-8c[^"]*" href="([^"]*)"', d).group(1)

def company_row(photo, alt, h2cls, pcls, href, extra=''):
    return ['<p>%s</p>' % pic(photo, alt), extra + '<h2>%s</h2><p>%s</p><p><strong><a href="%s">Learn More</a></strong></p>' % (clean(inner(h2cls, 'h2')), clean(inner(pcls, 'p')), href)]
company_rows = [
    company_row('vacation-ownership-desert-willow-drone.jpg', 'Aerial view of a Marriott Vacation Club resort in the desert', 'kt-adv-heading290_0468fc-90', 'kt-adv-heading290_940138-ab', SITE + '/our-company/vacation-ownership/'),
    company_row('espacio-deck.jpg', 'Deck of a resort with ocean view', 'kt-adv-heading290_e35d74-ff', 'kt-adv-heading290_ec1639-53', SITE + '/our-company/exchange-third-party-management/'),
    company_row('mvw-nyse-scaled-1.jpg', 'Marriott Vacations Worldwide at the New York Stock Exchange', 'kt-adv-heading290_5e38a4-67', 'kt-adv-heading290_855ec5-21', SITE + '/investor-relations/', extra='<p>%s</p>' % pic('08efc0071b2c0f230195cc38ee4472f0b1ddb7b1-1536x864.png', 'Marriott Vacations Worldwide stock chart')),
    company_row('caring-culture.jpg', 'Associates volunteering in the community', 'kt-adv-heading290_ca806b-d6', 'kt-adv-heading290_703a8d-ad', SITE + '/our-values/giving/'),
    company_row('housekeeping.jpg', 'A housekeeping associate at work', 'kt-adv-heading290_89ba64-d2', 'kt-adv-heading290_b4b063-59', SITE + '/careers/overview/'),
]

def stat(icon, alt, number, label, prefix=None):
    num = ('<em>%s</em> ' % prefix if prefix else '') + number
    return ['<p>%s</p>' % pic(icon, alt), '<p>%s</p>' % num, '<p>%s</p>' % label]
stats_vo = [
    stat('number-members-dark.png', 'Owner families icon', '700,000 +', 'Owner Families'),
    stat('customer-satisfaction-dark.png', 'Guest satisfaction icon', '90% +', 'Guest Satisfaction Score'),
    stat('numbers-vo-resorts-dark.png', 'Resorts icon', '120', 'Vacation Ownership<br>Properties', 'APPROXIMATELY'),
]
stats_ex = [
    stat('nations-dark.png', 'Countries icon', '90 +', 'EXCHANGE NETWORK<br>COUNTRIES'),
    stat('numbers-vo-resorts-dark.png', 'Resorts icon', '3,200', 'Exchange Network<br>Properties', 'MORE THAN'),
    stat('number-members-dark.png', 'Members icon', '1.6M', 'Exchange Network<br>Members', 'APPROXIMATELY'),
]
stats_mvw = [stat('associates-ww-dark.png', 'Associates icon', '22,000 +', 'Associates Worldwide')]

home = doc([
    section([block('carousel hero', hero_rows), '<p><strong><a href="%s">Learn About Inner Circle</a></strong></p>' % inner_circle], 'hero'),
    section(['<h1>%s</h1>' % clean(inner('kt-adv-heading290_4cddbe-a4', 'h1'))] + intro_ps + [
        '<h2>%s</h2>' % clean(inner('kt-adv-heading290_67e909-33', 'h2')),
        '<p>%s</p>' % encompasses,
        '<h2>%s</h2>' % clean(inner('kt-adv-heading290_24eab5-59', 'h2')),
        block('cards brands', tile_rows(tiles['Vacation Ownership'])),
        block('cards brands divider', tile_rows(tiles['hyatt'])),
        '<h2>%s</h2>' % clean(inner('kt-adv-heading290_5c737f-39', 'h2')),
        block('cards brands', tile_rows(tiles['Exchange & Third-Party Management'])),
    ], 'intro'),
    section([block('columns company-tiles', company_rows)], 'tiles'),
    section([
        '<h2>%s</h2>' % clean(inner('kt-adv-heading290_ed2868-38', 'h2')),
        '<p>%s</p>' % clean(inner('kt-adv-heading290_91ab51-4c', 'p')),
        '<h2>%s</h2>' % clean(inner('kt-adv-heading290_e2f95e-ba', 'h2')),
        block('cards stats', stats_vo),
        '<h2>%s</h2>' % clean(inner('kt-adv-heading290_b18999-5d', 'h2')),
        block('cards stats', stats_ex),
        '<h2>%s</h2>' % clean(inner('kt-adv-heading290_755283-80', 'h2')),
        block('cards stats', stats_mvw),
    ], 'presence'),
    section([block('metadata', [
        ['title', 'Home - Marriott Vacations Worldwide'],
        ['description', 'We strive to create the most expansive, immersive world of vacation and leisure experiences. We develop premium resorts and innovative travel options around the world.'],
        ['nav', '/drafts/nav'], ['footer', '/drafts/footer'],
    ])]),
])
open(f'{HERE}/home.html', 'w').write(home)

# ---------------------------------------------------------------- nav (reading order: brand, sections, tools)
def li(text, href=None, children=None):
    label = '<a href="%s">%s</a>' % (href, text) if href else text
    kids = '<ul>%s</ul>' % ''.join(children) if children else ''
    return '<li>%s%s</li>' % (label, kids)
menu = re.search(r'<ul id="primary-menu".*?</nav>', d, re.S).group(0)
def links_of(li_id):
    seg = re.search(r'<li id="%s".*?</li>\s*</ul>' % li_id, menu, re.S).group(0)
    out = []
    for m in re.finditer(r'<li[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', seg, re.S):
        t = html.unescape(re.sub(r'<[^>]+>', '', m.group(2))).replace('Expand', '').strip()
        out.append((t, m.group(1)))
    return out[1:]
company_links = [li(t, h) for t, h in links_of('menu-item-27')[:3]]
vo_brands = [('Marriott Vacation Club', '/our-company/vacation-ownership#marriott-vacation-club'), ('Sheraton Vacation Club', '/our-company/vacation-ownership#sheraton-vacation-club'),
             ('Westin Vacation Club', '/our-company/vacation-ownership#westin-vacation-club'), ('Grand Residences by Marriott', '/our-company/vacation-ownership#grand-residence-by-marriott'),
             ('The Ritz-Carlton Club', '/our-company/vacation-ownership#the-ritz-carlton-club'), ('St. Regis Residence Club', '/our-company/vacation-ownership#st-regis-residence-club'),
             ('Hyatt Vacation Club', '/our-company/vacation-ownership#hyatt-vacation-club')]
ex_brands = [('Interval International', '/our-company/exchange-third-party-management#interval-international'), ('Aqua-Aston Hospitality', '/our-company/exchange-third-party-management#aqua-aston-hospitality')]
company_links.append('<li><a href="/our-company/vacation-ownership/">Vacation Ownership</a> %s<ul>%s</ul></li>' % (clean(inner('kt-adv-heading104_64c478-d1', 'p')), ''.join(li(t, h) for t, h in vo_brands)))
company_links.append('<li><a href="/our-company/exchange-third-party-management/">Exchange & Third-Party Management</a> %s<ul>%s</ul></li>' % (clean(inner('kt-adv-heading102_1d78df-5d', 'p')), ''.join(li(t, h) for t, h in ex_brands)))
values = links_of('menu-item-24')
values_items = [li(*values[0]), li('Corporate Responsibility', None, [li(t, h) for t, h in values[1:]])]
investor = [li(t, h) for t, h in links_of('menu-item-71')]
careers = [li(t, h) for t, h in links_of('menu-item-89')]
nav = doc([
    section(['<p><a href="%s/">%s</a></p>' % (SITE, pic('mvwpms-202376-mvw-full-logo-parisian-blue-pms-654-2048x654-1-1536x491.png', 'Marriott Vacations Worldwide Logo'))]),
    section(['<ul>%s%s%s%s%s</ul>' % (
        li('Our Company', SITE + '/our-company/', company_links),
        li('Our Values', SITE + '/our-values/', values_items),
        li('Investor Relations', SITE + '/investor-relations/', investor),
        li('Careers', SITE + '/careers/', careers),
        li('Newsroom', SITE + '/category/newsroom/'))]),
    section(['<p><a href="%s/?s=" title="Search">:search:</a></p>' % SITE, '<p><strong><a href="/contact-us/">CONTACT US</a></strong></p>']),
])
open(f'{HERE}/nav.html', 'w').write(nav)

# ---------------------------------------------------------------- footer
def col(parts): return '\n'.join(parts)
def ul(items): return '<ul>%s</ul>' % ''.join('<li><a href="%s">%s</a>%s</li>' % (h, t, extra) for t, h, extra in items)
c1 = col(['<h2>Our Company</h2>',
          ul([('About Us', SITE + '/our-company/about/', ''), ('Executive Leadership', '/our-company/#executiveleadership', ''), ('Awards & Recognition', SITE + '/our-company/awards/', '')]),
          ul([('Privacy & Cookie Policy', 'https://privacy.marriottvacationsworldwide.com/', ''), ('Cookie Settings', '#cookie-settings', ''),
              ('Do Not Sell/Share', 'https://privacy-portal-mvwc.my.onetrust.com/webform/711fd727-975b-4078-b1d2-af57070c5360/f9632859-a20d-435a-8ff2-643cdc761645', ''),
              ('Terms of Use', '/terms-of-use', ''), ('Contact Us', '/contact-us', ''),
              ('Accessibility Statement', '/accessibility-statement', ' <a href="https://www.essentialaccessibility.com/marriott-vacations-worldwide" title="Download the eSSENTIAL Accessibility assistive technology app">:ea-icon:</a>')])])
c2 = col(['<h2>Investor Relations</h2>', ul([(t, 'http://ir.marriottvacationsworldwide.com/' + p, '') for t, p in [
    ('Press Releases', 'press-releases'), ('Events & Presentations', 'events-presentations'), ('Corporate Governance', 'corporate-governance'), ('Financial Information', 'financial-information'),
    ('Stock Information', 'stock-information'), ('Investor FAQs', 'investor-faqs'), ('Investor Contact Us', 'contact-us')]])])
c3 = col(['<h2>BRANDS & BUSINESSES</h2>', ul([('Marriott Vacation Club', 'https://marriottvacationclub.com/', ''), ('Sheraton Vacation Club', 'https://www.vistana.com/sheraton-vacation-club', ''),
    ('Westin Vacation Club', 'https://www.vistana.com/westin-vacation-club', ''), ('Grand Residences by Marriott', 'http://www.grandresidenceclub.com/', ''),
    ('The Ritz-Carlton Club', 'http://www.ritzcarltonclub.com/', ''), ('St. Regis Residence Club', 'http://www.theresidenceclub.com/', '')]),
    '<p><a href="https://www.hyattvacationclub.com/">Hyatt Vacation Club</a></p>',
    ul([('Interval International', 'http://www.intervalworld.com/', ''), ('Aqua-Aston Hospitality', 'http://www.aquaaston.com/', '')])])
c4 = col(['<h2>Our Values</h2>', ul([('Our Culture', SITE + '/our-values/culture/', ''), ('Corporate Responsibility Report', '/our-values/corporate-responsibility-report/', ''),
    ('Commitment to Giving', SITE + '/our-values/giving/', ''), ('Conserving Our Environment', SITE + '/our-values/conserving-environment/', '')]),
    '<h3>CAREERS</h3>', ul([('College Programs', 'https://careers.marriottvacationsworldwide.com/en-US/page/college', ''), ('Current Openings', 'https://careers.marriottvacationsworldwide.com/', '')])])
footer = doc([
    section([block('brand-bar', [['<p>%s</p>' % pic('mvw-brandbar-horiz-cmyk-1536x192.png', 'Marriott Vacations Worldwide company brands horizontal logo bar')],
                                 ['<p>%s</p>' % pic('mvw-brandbar-stacked-wcag-768x521.png', 'Marriott Brands Bar Logo')]])]),
    section([block('columns footer-links', [[c1, c2, c3, c4]])]),
    section(['<p>© 2011 - 2026 Marriott Vacations Worldwide Corporation. All Rights Reserved.</p>',
             '<p><a href="https://www.linkedin.com/company/marriottvacationsworldwide" title="Linkedin">:linkedin:</a> <a href="https://www.facebook.com/mvwcorporation" title="Facebook">:facebook:</a> <a href="https://www.instagram.com/marriottvacationsworldwide/" title="Instagram">:instagram:</a></p>']),
])
open(f'{HERE}/footer.html', 'w').write(footer)
print('wrote home.html nav.html footer.html')
