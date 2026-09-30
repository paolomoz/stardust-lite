#!/usr/bin/env python3
"""Authored documents for www.walgreens.com/ home (DA source format): home.html, nav.html, footer.html next to this file.
Every value comes from the step-1 capture (measure/content-1440.json = composition A: Target alert + offers carousel + GAM slot,
measure/nav-1440.json, measure/nav-360.json, measure/dom-1440.html for the hidden featured categories and the promo bar);
nothing is copied from the source DOM. Media = the source's bytes previewed on the branch (drafts/media, measure/media-map.json)."""
import html, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); MEAS = os.path.join(HERE, '..', 'measure')
M = 'https://blocks-first--sdt-walgreens--aemcoder-adobe.aem.page/drafts/media/'
W = 'https://www.walgreens.com'
C = json.load(open(os.path.join(MEAS, 'content-1440.json'))); NAV = json.load(open(os.path.join(MEAS, 'nav-1440.json'))); MM = json.load(open(os.path.join(MEAS, 'media-map.json')))
DOM = open(os.path.join(MEAS, 'dom-1440.html')).read()
E = lambda s: html.escape(s, quote=True)
def med(src):
    """source URL (or its tail) → previewed media URL, the source's bytes"""
    for u, v in MM.items():
        if u == src or u.split('?')[0].endswith(src) or src.split('?')[0] in u: return M + v['file']
    raise KeyError(src)
def absu(h): return h if h.startswith(('http', '/widgets/', '#')) else W + h
def pic(src, alt=''): return f'<picture><img src="{med(src)}" alt="{E(alt)}"></picture>'
def a(text, href, **attrs): return f'<a href="{E(absu(href))}"' + ''.join(f' {k}="{E(v)}"' for k, v in attrs.items()) + f'>{text}</a>'
def p(inner): return f'<p>{inner}</p>'
def btn(text, href, kind): tag = {'primary': 'strong', 'secondary': 'em'}[kind]; return f'<p><{tag}>{a(E(text), href)}</{tag}></p>'
def cell(*inner): return '<div>' + ''.join(inner) + '</div>'
def row(*cells): return '<div>' + ''.join(cells) + '</div>'
def block(cls, *rows): return f'<div class="{cls}">' + ''.join(rows) + '</div>'
def kv(cls, **pairs): return block(cls, *[row(cell(k.replace('_', '-')), cell(v)) for k, v in pairs.items()])
def section(*inner, style=None):
    s = '<div>' + ''.join(inner)
    if style: s += block('section-metadata', row(cell('style'), cell(style)))
    return s + '</div>'
def doc(*sections): return '<body>\n  <header></header>\n  <main>\n' + '\n'.join(sections) + '\n  </main>\n  <footer></footer>\n</body>\n'

# ---- content tree helpers (content-dump.mjs output)
def walk(n):
    if isinstance(n, list):
        for k in n: yield from walk(k)
    elif isinstance(n, dict):
        yield n
        for k in n.get('children', []): yield from walk(k)
PARENT = {}
def index_parents(n, parent=None):
    if isinstance(n, list):
        for k in n: index_parents(k, parent)
    elif isinstance(n, dict):
        PARENT[id(n)] = parent
        for k in n.get('children', []): index_parents(k, n)
for _k, _v in C.items():
    if not _k.startswith('__'): index_parents(_v)
def para_of(n):
    p = PARENT.get(id(n))
    while p is not None and p.get('tag') not in ('p', 'div', 'a', 'li'): p = PARENT.get(id(p))
    return id(p) if p is not None else id(n)
def paragraphs(nodes):
    """copy spans → one <p> per source paragraph, in document order; bold spans keep their weight"""
    groups = []
    for n in nodes:
        key = para_of(n)
        if groups and groups[-1][0] == key: groups[-1][1].append(n)
        else: groups.append((key, [n]))
    out = []
    for _, g in groups:
        if len(g) == 2 and g[0]['text'] == 'Text to 21525' and g[1]['text'] == 'JOINRX':
            out.append(p('Text <strong>JOINRX</strong> to 21525')); continue  # the dump joins a span's own text around its bold child
        segs = ''.join((f'<strong>{E(n["text"])}</strong>' if '700' in n['font'].split()[2] else E(n['text'])) + ' ' for n in g)
        out.append(p(segs.strip().replace(' .', '.').replace(' *', '*')))
    return out

def find(pred, root=None):
    for n in walk(root if root is not None else C['#root-container > .aem-Grid > div']):
        if pred(n): return n
    raise KeyError(pred)
def byid(i, root=None): return find(lambda n: n.get('id') == i, root)
def bycls(c, root): return [n for n in walk(root) if c in (n.get('cls') or '').split()]
def texts(node): return [n for n in walk(node) if n.get('text')]
def first_text(node, cls=None):
    for n in texts(node):
        if cls is None or cls in (n.get('cls') or ''): return n['text']
    return ''
def img_of(node):
    for n in walk(node):
        if n.get('tag') == 'img': return n
    return None

# ---------------------------------------------------------------- home
# S0 Target alert (session-variable: 2 of 3 loads; in the cached origin)
alert = block('alert', row(cell(p(f'<strong>2026-2027 COVID-19 vaccines</strong> are now recommended for all adults ages 18+. Children under 18 may be eligible: speak to a pharmacist to learn more. Walk in or {a("<strong>schedule online ›</strong>", "/findcare/schedule-vaccine?ban=Covid19_FDAapproved_Alert", title="schedule your vaccine online")}'))))
s_alert = section(alert)

# S1 quick links (health pills) on the taupe band
hp = byid('health-pills-container')
pills = [n for n in walk(hp) if (n.get('cls') or '').startswith('quicklinkcardv1')]
quick = block('cards quicklinks', *[row(cell(pic(img_of(t)['src'])), cell(p(a(E(first_text(t)), t['href'])))) for t in pills])
s_quick = section(quick, style='taupe')

# S2 vaccination slim banner (60/40)
vb = byid('vaccinations-tile-1')
vt = texts(vb)
vac = block('banner dark', row(cell(f'<h2>{E(vt[0]["text"])}</h2>', p(E(vt[1]['text'])), btn(vt[2]['text'], find(lambda n: n.get('tag') == 'a' and 'btn' in (n.get('cls') or ''), vb)['href'], 'secondary')), cell(pic(img_of(vb)['src'], img_of(vb).get('alt', '')))))
s_vac = section(vac)

# S3 enterprise-a: 3 promo cards, first double width (plum, white text)
def promo_card(t, dark=False):
    """card = eyebrow (12 px bold) · heading (Tiempos) · copy · optional button; whole card is the link"""
    parts = []
    href = t.get('href')
    tx = [n for n in texts(t)]
    # classify by measured class names: body-x-small = eyebrow, display-* = heading, body-medium / plain = copy, btn = button
    eyebrow = next((n for n in tx if 'body-x-small' in (n.get('cls') or '')), None)
    head = next((n for n in tx if 'display' in (n.get('cls') or '')), None)
    if eyebrow: parts.append(p(E(eyebrow['text'])))
    if head: parts.append(f'<h3>{a(E(head["text"]), href) if href else E(head["text"])}</h3>')
    button = find(lambda n: n.get('tag') in ('button', 'a') and 'btn' in (n.get('cls') or ''), t) if 'btn' in json.dumps(t) else None
    inbtn = set(id(n) for n in walk(button)) if button else set()
    copy = [n for n in tx if n is not eyebrow and n is not head and id(n) not in inbtn]
    # paragraphs: consecutive spans of one <p> in the source share a parent → group by parent box y
    parts.extend(paragraphs([n for n in copy if n['text'] != 'Clip']))
    if button:
        parts.append(btn(first_text(button), button.get('href') or '/store/c/productlist/N=20007799', 'secondary'))
    return row(cell(''.join(parts)), cell(pic(img_of(t)['src'], img_of(t).get('alt', ''))))
ea = byid('enterprise-a-container')
ea_tiles = [byid(f'enterprise-a-tile-{i}', ea) for i in (1, 2, 3)]
promo_a = block('cards promo dark feature-first', *[promo_card(t) for t in ea_tiles])
s_ea = section(promo_a)

# S4 offers just for you (personalised coupon carousel; session-variable content)
of = byid('offers-for-you-container')
oh = first_text(of, 'title-large'); ov = find(lambda n: 'carousel-viewall' in (n.get('cls') or ''), of)
coupons = bycls('b2b-coupon-card', of)
def coupon(cn):
    tx = texts(cn); im = img_of(cn)
    badge = next((n['text'] for n in tx if 'expires-badge' in (n.get('cls') or '')), None)
    title = next(n['text'] for n in tx if 'title-medium' in (n.get('cls') or ''))
    brand = next((n['text'] for n in tx if 'text__red' in (n.get('cls') or '')), None)
    kind = next((n['text'] for n in tx if 'body-x-small' in (n.get('cls') or '')), None)
    parts = []
    if badge: parts.append(p(E(badge)))
    parts.append(f'<h3>{E(title)}</h3>')
    if brand: parts.append(p(E(brand)))
    if kind: parts.append(p(E(kind)))
    parts.append(btn('Clip', '/offers/offers.jsp?ban=HP_Coupon_8302026_Control', 'secondary'))
    return row(cell(pic(im['src'])), cell(''.join(parts)))
offers = block('carousel offers', *[coupon(cn) for cn in coupons])
s_offers = section(f'<h2>{E(oh)}</h2>', p(a(E(first_text(ov)), ov['href'])), offers)

# S5 GAM ad slot (third-party creative — the slot geometry is content, the creative is not)
s_gam = section(kv('ad', slot='/22301037185/walgreens/homepage', size='970x90', network='google'))

# S6 Halloween: 4 light promo cards + slim banner on the plum band
eb = byid('enterprise-b-container')
eb_tiles = [byid(f'enterprise-b-tile-{i}', eb) for i in (1, 2, 3, 4)]
promo_b = block('cards promo', *[promo_card(t) for t in eb_tiles])
sb = byid('enterprise-b-tile-5', eb); sbt = texts(sb); sbb = find(lambda n: n.get('tag') == 'a' and 'btn' in (n.get('cls') or ''), sb)
hallo = block('banner light', row(cell(f'<h2>{E(sbt[0]["text"])}</h2>', btn(first_text(sbb), sbb['href'], 'primary')), cell(pic(img_of(sb)['src'], img_of(sb).get('alt', '')))))
s_eb = section(promo_b, hallo, style='plum')

# S7 health module: heading + 4 media-top cards
def media_card(t):
    tx = texts(t); href = t.get('href')
    eyebrow = next((n for n in tx if 'body-x-small' in (n.get('cls') or '')), None)
    head = next(n for n in tx if 'title-large' in (n.get('cls') or ''))
    parts = []
    if eyebrow: parts.append(p(E(eyebrow['text'])))
    parts.append(f'<h3>{a(E(head["text"]), href)}</h3>')
    copy = [n for n in tx if n is not eyebrow and n is not head]
    parts.extend(paragraphs(copy))
    return row(cell(pic(img_of(t)['src'], img_of(t).get('alt', ''))), cell(''.join(parts)))
hm = byid('health-module-container'); hm_h = first_text(hm, 'display-x-small')
hm_tiles = [byid(f'health-module-tile-{i}', hm) for i in (1, 2, 3, 4)]
s_health = section(f'<h2>{E(hm_h)}</h2>', block('cards media-top health', *[media_card(t) for t in hm_tiles]))

# S8 photo: heading + 3 promo cards (first double), pastel per card
ph = byid('photo-container'); ph_h = first_text(ph, 'display-x-small')
ph_tiles = [byid(f'photo-tile-{i}', ph) for i in (1, 2, 3)]
s_photo = section(f'<h2>{E(ph_h)}</h2>', block('cards promo feature-first photo', *[promo_card(t) for t in ph_tiles]), style='compact-head')

# S9 deals of the week (store-specific dynamic carousel; session-variable store line)
dw = byid('dotw-dynamic-carousel-container')
dw_view = find(lambda n: 'carousel-viewall' in (n.get('cls') or ''), dw)
store_line = [n['text'] for n in texts(dw) if (n.get('cls') or '') in ('store-address', 'expiration-text')]
dw_cards = bycls('dow-carousel', dw)
def deal(cn):
    tx = texts(cn); im = img_of(cn); link = find(lambda n: n.get('tag') == 'a', cn)
    price = next(n['text'] for n in tx if n.get('tag') == 'strong')
    desc = next((n['text'] for n in tx if 'body-small' in (n.get('cls') or '')), '')
    left = cell(pic(im['src'], im.get('alt', ''))) if im else cell('')
    return row(left, cell(f'<h3>{a(E(price), "/offers/offers.jsp/weeklyad", title=link.get("aria") or price)}</h3>', p(E(desc))))
deals = block('carousel deals', *[deal(cn) for cn in dw_cards])
s_deals = section(p(pic('Hub_Illustration.png')), '<h2><strong>Deals</strong> <em>of the</em> Week</h2>', p(f'{E(store_line[0])} <strong>{E(store_line[1])}</strong>'), p(a('View all', dw_view['href'])), deals)

# S10/S11 personalisation slots that render nothing for an anonymous visitor (this repo's widget convention)
s_buyagain = section(p(a('Buy again', '/widgets/buy-again.html')))
s_recent = section(p(a('Recently viewed items', '/widgets/recently-viewed.html')))

# S12 explore more: heading + 4 white media-top cards
tc = byid('tertiary-container'); tc_h = first_text(tc, 'display-x-small')
tc_tiles = [byid(f'tertiary-tile-{i}', tc) for i in (1, 2, 3, 4)]
s_explore = section(f'<h2>{E(tc_h)}</h2>', block('cards media-top', *[media_card(t) for t in tc_tiles]))

# S13 Criteo sponsored slot (renders empty on the live page: 48 px reserve)
s_criteo = section(kv('ad', slot='hp-criteo-banner', network='criteo'))

# S14 featured categories: 17 round icons, 10 shown + "See more"
cats = re.findall(r'<a[^>]*class="[^"]*labelledIcon[^"]*"[^>]*href="([^"]+)"[^>]*>.*?<img src="([^"]+)"[^>]*>(.*?)</a>', DOM[DOM.find('id="featured-categories-container"'):DOM.find('id="featured-categories-container"') + 40000], flags=re.S)
def cat_row(href, src, label):
    label = html.unescape(re.sub(r'<[^>]+>', ' ', label)).strip()
    return row(cell(pic(src.rsplit('/', 1)[1])), cell(p(a(E(label), html.unescape(href)))))
fc_h = first_text(byid('featured-categories-container'), 'title-large')
s_cats = section(f'<h2>{E(fc_h)}</h2>', block('cards categories', *[cat_row(*c) for c in cats]))

# S15 the source's sponsored-products slot title, painted white on white above an empty module (48 px)
s_sponsored = section(kv('ad', slot='criteo-sponsored-products', network='criteo', title='Beauty deals you’ll love'))

meta = section(block('metadata', row(cell('title'), cell(E(C['__title']))), row(cell('description'), cell(E(C['__desc']))), row(cell('template'), cell('home')), row(cell('nav'), cell('/drafts/nav')), row(cell('footer'), cell('/drafts/footer'))))
open(os.path.join(HERE, 'home.html'), 'w').write(doc(s_alert, s_quick, s_vac, s_ea, s_offers, s_gam, s_eb, s_health, s_photo, s_deals, s_buyagain, s_recent, s_explore, s_criteo, s_cats, s_sponsored, meta))

# ---------------------------------------------------------------- nav (reading order: promo bar · brand · tools · menu · language)
def li(inner): return f'<li>{inner}</li>'
promo = C['#wag-header-promo-container'][0]
promo_links = [n for n in walk(promo) if n.get('tag') == 'a']
promo_ul = '<ul>' + ''.join(li(a(E(first_text(n)), n['href'])) for n in promo_links) + '</ul>'
hdr = C['header'][0]
store = first_text(byid('store-selector-trigger-desktop', hdr), 'store-selector-trigger-text')
account_items = [(n['text'], n['href']) for n in walk(NAV['account'][1]) if n.get('tag') == 'a' and n.get('text')]
tools = '<ul>' + li(a(':search: Search', '/search/results.jsp')) + li(a(f':pin: {E(store)}', '/storelocator/find.jsp?tab=store+locator&requestType=locator') ) + li(':account: Account<ul>' + ''.join(li(a(E(t), h if not h.startswith('javascript') else ('/login.jsp' if 'Sign' in t else '/register/regpersonalinfo'))) for t, h in account_items) + '</ul>') + li(a(':cart: Cart', '/cart/view-ui')) + '</ul>'
def menu_items(panel):
    out = []
    for n in walk(panel):
        if n.get('tag') == 'a':
            t = first_text(n) or n.get('text', '')
            if not t: continue
            href = n.get('href') or ''
            out.append(li(a(E(t), href) if not href.startswith('javascript') else E(t)))
        elif n.get('tag') == 'hr': out.append('<li>---</li>')
    return out
l0 = []
for m in NAV['menus']:
    l0.append(li(E(m['label']) + '<ul>' + ''.join(menu_items(m['panel'])) + '</ul>'))
for t, h in [('Weekly Ad', '/offers/offers.jsp/weeklyad?ban=dl_dlsp_MegaMenu_WeeklyAd'), ('Halloween', '/store/c/productlist/N=20001182/1/ShopAll=20001182'), ('Vaccinations', '/topic/pharmacy/immunization-services-appointments.jsp')]:
    l0.append(li(a(t, h)))
nav_doc = doc(
  section(promo_ul),
  section(p(a(pic('Branding.svg', 'Walgreens: Trusted since 1901'), '/', title='Walgreens Home'))),
  section(tools),
  section('<ul>' + ''.join(l0) + '</ul>'),
  section(p(a('Español', '/es/', lang='es'))))
open(os.path.join(HERE, 'nav.html'), 'w').write(nav_doc)

# ---------------------------------------------------------------- footer (sign-up · logo · 4 link columns · legal · products · disclaimer)
F = C['footer'][0]
signup = find(lambda n: 'btn__tint-blue' in (n.get('cls') or ''), F)
logo = img_of(find(lambda n: (n.get('cls') or '') == 'footer__logo', F))
cols = bycls('wag-col-3', F)
def col_section(col):
    out = []
    for n in col.get('children', []):
        if n.get('tag') == 'a': out.append(p(f'<strong>{a(E(n["text"]), n["href"] if n["href"] != "#!" else "#")}</strong>'))
        elif n.get('tag') == 'ul': out.append('<ul>' + ''.join(li(a(E(x.get('text') or first_text(x)), x['href']) + (' :privacy-choices:' if 'Privacy Choices' in (x.get('text') or '') else '')) for x in n['children'] if x.get('tag') == 'a') + '</ul>')
    return section(*out)
legal_ul = find(lambda n: n.get('tag') == 'ul' and any(c.get('id') == 'noticePrivacy-link' for c in n.get('children', [])), F)
legal = '<ul>' + ''.join(li(a(E(x['text']), x['href'])) for x in legal_ul['children']) + '</ul>'
copyright_ = first_text(byid('copyright-link', F))
bottom = find(lambda n: (n.get('cls') or '') == 'left', F)
prod_lists = [n for n in bottom['children'] if n.get('tag') == 'ul']; prod_heads = [n['text'] for n in bottom['children'] if n.get('tag') == 'strong']
products = ''.join(p(f'<strong>{E(h)}</strong>') + '<ul>' + ''.join(li(a(E(x['text']), x['href'])) for x in ul['children']) + '</ul>' for h, ul in zip(prod_heads, prod_lists))
disc = byid('wag-footer-disclaimer-new', F)
disc_p = ''.join([p(f'*Restrictions apply. See {a("Walgreens.com/Offerdetails", "/promotion/offer-details", title="Walgreens.com Offer Details")} for more information.'),
                  p(f'<strong>PRICING PROMISE:</strong> ' + E(find(lambda n: 'font__sixteen' in (n.get('cls') or ''), disc)['text']))])
footer_doc = doc(
  section(btn(first_text(signup), signup['href'], 'secondary')),
  section(p(a(pic('WAG_Signature_logo_RGB.png', logo.get('alt', 'Walgreens Logo')), '/'))),
  *[col_section(c) for c in cols],
  section(legal, p(E(copyright_))),
  section(products),
  section(disc_p))
open(os.path.join(HERE, 'footer.html'), 'w').write(footer_doc)
print('wrote home.html nav.html footer.html', len(coupons), 'coupons', len(dw_cards), 'deals', len(cats), 'categories', len(cols), 'footer columns')
