#!/usr/bin/env python3
"""Authored documents for www.dentsu.com/ home (the CH edition the origin serves to this IP; DA source format): home.html, nav.html,
footer.html next to this file. Every text and href comes from the step-1 capture (measure/content-view-1440.txt, dom-1440.html);
nothing is copied from the source DOM. Media = the source's bytes previewed on the branch (/drafts/media/<name>)."""
import html, os
HERE = os.path.dirname(os.path.abspath(__file__))
M = 'https://blocks-first--sdt-dentsu--aemcoder-adobe.aem.page/drafts/media/'
S = 'https://www.dentsu.com'
E = lambda s: html.escape(s, quote=True)
def pic(name, alt=''): return f'<picture><img src="{M}{name}" alt="{E(alt)}"></picture>'
def a(text, href): return f'<a href="{E(href)}">{E(text)}</a>'
def p(inner): return f'<p>{inner}</p>'
def btn(text, href, kind='primary'): tag = {'primary': 'strong', 'secondary': 'em'}[kind]; return f'<p><{tag}>{a(text, href)}</{tag}></p>'
def cell(*inner): return '<div>' + ''.join(inner) + '</div>'
def row(*cells): return '<div>' + ''.join(cells) + '</div>'
def block(cls, *rows): return f'<div class="{cls}">' + ''.join(rows) + '</div>'
def section(*inner, style=None):
    s = '<div>' + ''.join(inner)
    if style: s += block('section-metadata', row(cell('style'), cell(style)))
    return s + '</div>'
def doc(*sections): return '<body>\n  <header></header>\n  <main>\n' + '\n'.join(sections) + '\n  </main>\n  <footer></footer>\n</body>\n'
def li(inner): return f'<li>{inner}</li>'
def ul(items): return '<ul>' + ''.join(li(i) for i in items) + '</ul>'

# ---------------------------------------------------------------- home
hero = block('hero', row(cell(p(pic('tokyo-banner-web.jpg', 'Tokyo crossing from above')), '<h1>Innovating to Impact</h1>', p(a('Go to Introduction', '#we-are-dentsu')))))
s_hero = section(hero)

s_intro = section('<h2>We are dentsu</h2>',
  p('The integrated growth and transformation partner to the world’s leading organizations, nurturing and developing innovations that drive outcomes. We push the boundaries of business transformation and sustainable growth for brands, people and society.'),
  style='intro')

promise = block('columns promise', row(
  cell(p(pic('logo-tagline-hero-image-05.jpg', ''))),
  cell('<h2>Our client promise: Innovating to Impact</h2>',
       p('Dentsu increases the potential for innovation to happen, creating experiences that can enrich every business. See what our global team of innovators and integrators can do for you.'),
       btn('Find out more', 'https://brands.dentsu.com/innovating-to-impact/start', 'secondary'))))
s_promise = section(promise)

s_quote1 = section(block('quote', row(cell(p('Our work drives impact at the convergence of marketing, technology and consulting.')))))

tiles = [
  ('heineken-calanda.jpg', 'Heineken Calanda', 'Heineken', S + '/ch/en/our-work/heineken-calanda'),
  ('mini-ooh-mural-painting.jpg', 'MINI Switzerland', 'MINI Switzerland', S + '/ch/en/our-work/mini-switzerland'),
  ('hero-1.jpg', 'Merkle Magpie - dentsu global', 'Merkle CXM: Magpie 100% AI-driven multi-channel marketing campaign', S + '/ch/en/our-work/case-studies-merkle-magpie'),
  ('eurostar-1-banner-image.jpg', 'iProspect: Eurostar', 'iProspect: Eurostar Partnering for programmatic', S + '/ch/en'),
  ('banner-sf-bc-zurich.jpg', 'Salesforce Basecamp Zurich', 'Salesforce Basecamp Zurich', S + '/ch/en'),
]
cards = block('cards tiles', *[row(cell(p(pic(img, alt))), cell(p(a(title, href)))) for img, alt, title, href in tiles],
              row(cell(), cell(p(a('Discover more of our work', S + '/ch/en/our-work')))))
s_tiles = section(cards)

s_quote2 = section(block('quote', row(cell(p('Instinctive generosity is what guides us. That’s why we develop research and analysis that leads debate in the industry.')))))

feature = block('columns feature', row(
  cell('<h2>Consumer Vision Mother of Reinvention</h2>',
       p('How is artificial intelligence reshaping the relationship between people and brands? What role do originality, trust and personal growth play in an increasingly automated world? The answers can be found in dentsu’s new Consumer Vision report, <em>Mothers of Reinvention</em>.'),
       btn('Download', 'https://insight.dentsu.com/consumer-vision-mothers-of-reinvention/')),
  cell(p(pic('01-consumer-vision-promo-assets-instagram-linkedin-facebook-1080x1350.jpg', 'Consumer Vision Mother of Reinvention')))))
s_feature = section(feature)

logos = [('dentsu-carat-rgb.png', 'Carat Logo'), ('microsoftteams-image-1.png', 'iProspect Logo'), ('2022-05-merkle-logo-color-500.png', 'Merkle Logo'),
         ('dentsu-x.png', 'Dentsu x Logo'), ('dc-logo-icon-with-wordmark-rgb-png-17052022.png', 'Dentsu Creative')]
s_network = section('<h2>Our network</h2>', block('cards logos', *[row(cell(p(pic(img, alt)))) for img, alt in logos]),
                    btn('Find out about our Network', S + '/ch/en/who-we-are/our-agencies'), style='center')

meta = section(block('metadata', row(cell('title'), cell('dentsu')),
  row(cell('description'), cell('At dentsu, innovation is our strength, and your growth is our mission. We help you keep up with technological changes in the digital economy.')),
  row(cell('nav'), cell('/drafts/nav')), row(cell('footer'), cell('/drafts/footer'))))
open(os.path.join(HERE, 'home.html'), 'w').write(doc(s_hero, s_intro, s_promise, s_quote1, s_tiles, s_quote2, s_feature, s_network, meta))

# ---------------------------------------------------------------- nav (reading order: brand, market selector, primary menu)
brand = section(p(f'<a href="{S}/ch/en">{pic("main-logo-alt.png", "dentsu Logo")}</a>'))
markets = [('Africa', 'English', S + '/za/en'), ('Asia Pacific', 'English', S + '/sg/en'), ('Australia', 'English', S + '/au/en'), ('Austria', 'Deutsch', S + '/at/de'),
  ('Benelux', [('Nederland', S + '/nl/nl'), ('English', S + '/nl/en')]), ('Brazil', [('English', S + '/br/en'), ('Portuguese', S + '/br/pt')]),
  ('Canada', [('Français', S + '/ca/fr'), ('English', S + '/ca/en')]), ('China', [('中文', S + '/cn/zh'), ('English', S + '/cn/en')]),
  ('Denmark', 'Dansk', S + '/dk/dk'), ('Finland', 'Suomi', S + '/fi/fi'), ('France', 'Français', S + '/fr/fr'), ('Germany', 'Deutsch', S + '/de/de'),
  ('Greece', 'English', S + '/gr/en'), ('Hungary', [('Hungarian', S + '/hu/hu'), ('English', S + '/hu/en')]), ('India', 'English', S + '/in/en'),
  ('Indonesia', 'English', S + '/id/en'), ('Ireland', 'English', S + '/ie/en'), ('Israel', 'English', S + '/il/en'), ('Italy', 'Italiano', S + '/it/it'),
  ('Japan', [('English', S + '/jp/en'), ('日本語', S + '/jp/jp')]), ('MENA', 'English', S + '/ae/en'), ('New Zealand', 'English', S + '/nz/en'),
  ('Norway', 'Norsk', S + '/no/no'), ('Poland', 'Polski', S + '/pl/pl'), ('Southeast Europe', 'English', S + '/see/en'), ('Spain', 'Spanish', S + '/es/es'),
  ('Switzerland', 'English', S + '/ch/en'), ('Sweden', 'English', S + '/se/en'), ('Taiwan', [('中文', S + '/tw/zh'), ('English', S + '/tw/en')]),
  ('Turkey', 'Türkçe', S + '/tr/tr'), ('UK', 'English', S + '/uk/en'), ('USA', 'English', S + '/us/en')]
def market(m):
    if isinstance(m[1], list):  # two editions: "Benelux (Nederland | English)" — the first link carries the market name
        (l1, h1), (l2, h2) = m[1]
        return f'<a href="{E(h1)}">{E(m[0])} ({E(l1)}</a> | <a href="{E(h2)}">{E(l2)}</a>)'
    return a(f'{m[0]} ({m[1]})', m[2])
sel = section(p('Switzerland'),
  f'<h2>{a("Global (English)", S + "/?global=true")}</h2>',
  f'<h2>Dentsu Group ({a("English", "https://www.group.dentsu.com/en/")} | {a("日本語", "https://www.group.dentsu.com/jp/")})</h2>',
  ul([market(m) for m in markets]))
menu = section(ul([
  a('Home', S + '/ch/en/'),
  'Who we are' + ul([a('Dentsu Switzerland', S + '/ch/en/who-we-are/dentsu-switzerland'), a('Our agencies', S + '/ch/en/who-we-are/our-agencies'),
                      a('Sustainability', S + '/ch/en/who-we-are/sustainability'), a('Our leadership', S + '/ch/en/who-we-are/our-leadership')]),
  a('Our work', S + '/ch/en/our-work'),
  'Our thinking' + ul([a('Our latest thinking', S + '/ch/en/our-latest-thinking')]),
  a('Our latest news', S + '/ch/en/media-and-investors'), a('Careers', S + '/ch/en/careers'), a('Contact us', S + '/ch/en/contact-us')]))
open(os.path.join(HERE, 'nav.html'), 'w').write(doc(brand, sel, menu))

# ---------------------------------------------------------------- footer (4 blocks in reading order, then the legal lines)
f1 = section('<h3>Policies</h3>', ul([a('Privacy notices', S + '/ch/en/privacy-notices'), a('Cookies', S + '/ch/en/cookies-notice'),
                                       a('Responsible Disclosure', S + '/ch/en/responsible-disclosure'), a('Our policies', S + '/ch/en/our-policies')]))
f2 = section(f'<h3>{a("Contact", S + "/ch/en/contact-us")}</h3>')
f3 = section(f'<h3>{a("Sitemap", S + "/ch/en/sitemap")}</h3>')
socials = [('instagram', 'Visit us on Instagram', 'https://www.instagram.com/dentsuintl'), ('facebook', 'Visit us on Facebook', 'https://www.facebook.com/dentsuintl/'),
           ('linkedin', 'Visit us on LinkedIn', 'https://www.linkedin.com/company/dentsuintl/'), ('twitter', 'Visit us on Twitter', 'https://twitter.com/dentsuintl'),
           ('youtube', 'Visit us on YouTube', 'https://www.youtube.com/channel/UCn503X8N2DVg2kizWHLkuoQ')]
f4 = section('<h3>Connect</h3>', ul([f'<a href="{E(h)}">:{icon}: {E(t)}</a>' for icon, t, h in socials]))
f5 = section(p('Notwithstanding any actions or statements by the Dentsu Group globally or outside the U.S., it will continue to abide by all applicable laws and regulations in the U.S.'),
             p('Any statements or actions that purport to relate to the Dentsu Group and are inconsistent with U.S. law or guidance should be interpreted as, and deemed, not applicable to the U.S.'))
open(os.path.join(HERE, 'footer.html'), 'w').write(doc(f1, f2, f3, f4, f5))
print('written home.html nav.html footer.html')
