#!/usr/bin/env python3
"""Authored documents for www.usta.com/en/home.html (DA source format). Writes home.html, nav.html, footer.html next to this file.
Every text, href and media reference comes from the step-1 capture (measure/content-1440.json, measure/nav-tree.json,
measure/dom-1440.html); nothing is copied from the source DOM structure. Desktop composition authored (the mobile duplicates —
"BECOME A MEMBER" widget copy, the mobile Localize banner copy — are hidden DOM, see REGISTER.md)."""
import html, os, json
HERE = os.path.dirname(os.path.abspath(__file__))
M = 'https://blocks-first--sdt-usta2--aemcoder-adobe.aem.page/drafts/media/'
S = 'https://www.usta.com'
manifest = json.load(open(os.path.join(HERE, '..', 'media', 'manifest.json')))
def media(url):
    full = url if url.startswith('http') else S + url
    full = full.replace(' ', '%20')
    return M + manifest[full]

def esc(t): return html.escape(t, quote=False)
def picture(url, alt=''): return f'<picture><img src="{media(url)}" alt="{html.escape(alt)}"></picture>'
def pic(url, alt=''): return f'<p>{picture(url, alt)}</p>'  # a picture on its own line: an author's paragraph (the pipeline wraps it the same way)
def a(text, href, **kw):
    return f'<a href="{abs_(href)}">{esc(text)}</a>'
def btn(text, href, kind='primary'):
    tag = {'primary': 'strong', 'secondary': 'em'}[kind]
    return f'<p><{tag}>{a(text, href)}</{tag}></p>'
def link_p(text, href): return f'<p>{a(text, href)}</p>'
def cell(*inner): return '<div>' + ''.join(inner) + '</div>'
def row(*cells): return '<div>' + ''.join(cells) + '</div>'
def block(cls, *rows): return f'<div class="{cls}">' + ''.join(rows) + '</div>'
def kv(*pairs): return ''.join(row(cell(k), cell(v)) for k, v in pairs)
def section(*inner, style=None, meta=()):
    s = '<div>' + ''.join(inner)
    pairs = list(meta)
    if style: pairs.insert(0, ('style', style))
    if pairs: s += block('section-metadata', kv(*pairs))
    return s + '</div>'
def doc(*sections):
    return '<body>\n  <header></header>\n  <main>\n' + '\n'.join(sections) + '\n  </main>\n  <footer></footer>\n</body>\n'
def h(n, t): return f'<h{n}>{t}</h{n}>'
def p(t): return f'<p>{t}</p>'
def abs_(href): return href if href.startswith(('http', '#', 'mailto')) else S + href
def ul(items): return '<ul>' + ''.join(f'<li>{a(t, hr)}</li>' for t, hr in items) + '</ul>'
def icon(name): return f':{name}:'

# ------------------------------------------------------------------ home
# 1 hero band: campaign hero (BC hero, split variant) + membership promo, side by side (section style lays the two blocks out)
hero = block('hero campaign', row(cell(
    pic('/content/dam/coaching/public-pages/course-catalog/parent-hero.jpg', 'A coach on court'),
    pic('/content/experience-fragments/usta/Home/logged_out_homepage/hero/master/_jcr_content/root/container/container/container/image.coreimg.svg/1754919200267/coaching-logo.svg', 'USTA Coaching Logo'),
    h(1, '<em>REGISTER</em> TO BE FEATURED IN THE USTA COACHING SEARCH'),
    btn('REGISTER NOW', 'https://www.ustacoaching.com/en/home.html'))))
promo = block('promo membership',
    row(cell(pic('/en/home/_jcr_content/root/content/container_non_logged/container_hero_copy/container_copy/container_2050886238/image.coreimg.svg/1720624086624/usta-logo-white-footer.svg', 'USTA White Logo'))),
    row(cell(h(2, 'JOIN THE USTA'), p('Create a free USTA account to view personalized content, search events, connect with coaches and players and more.'))),
    row(cell(pic('/en/home/_jcr_content/root/content/container_non_logged/container_hero_copy/container_copy/container_2050886238/image_copy.coreimg.svg/1721832861085/join-membership-icon.svg', 'Join USTA and become a member'))),
    row(cell(btn('SIGN UP', '/en/home/myaccount/choose-account-type.html', 'secondary'))))
s_hero = section(hero, promo, style='hero-band')

# 2 discover: section head (default content) + 3 photo tiles (BC cards)
tiles = [
    ('/content/dam/usta/play/get-kids-to-play-tennis/kids--1421317654-1170x585.jpg.thumb.585.1170.png', 'YOUTH', '/en/home/play/youth-tennis.html', 'Two children lying on a tennis court laughing'),
    ('/content/dam/usta/play/assets/images/toc-national-championships.png.thumb.585.1170.png', 'COLLEGE', '/en/home/play/college-tennis.html', 'A college player hitting a forehand'),
    ('/content/dam/usta/play/adult/adult-tennis-social-tennis.jpg', 'ADULT', '/en/home/play/adult-tennis.html', 'Adults playing social tennis'),
]
s_discover = section(h(2, 'Discover'), p('<strong>YOUR TENNIS COMMUNITY</strong>'),
    block('cards discover', *[row(cell(pic(img, alt)), cell(h(3, a(t, hr)))) for img, t, hr, alt in tiles]), style='discover')

# 3 localize banner: default content over a section background (desktop + mobile renditions are configuration)
s_localize = section(h(3, 'Localize Your USTA.com Experience'),
    p('See news and happenings near you with the touch of a button'), p('Share your location now'),
    btn('SHARE LOCATION', '#share-location'),
    style='localize', meta=(('background', a('find-tournaments-bgnd.png', media('/content/dam/usta/play/assets/images/find_tournaments_bgnd.png.thumb.416.1440.png'))),
                            ('background-mobile', a('localize-mb-2-plain.png', media('https://www.usta.com/content/dam/usta/promos/Localize-MB-2-Plain.png.thumb.940.750.png')))))

TITLE_ICON = '/content/dam/usta/icons/player-title.png'
def topic(title): return pic(TITLE_ICON, 'Icon of tennis player serving.') + h(2, title)

# 4 recommended events: the personalised widget's logged-out state, default content
s_events = section(topic('Recommended Events'),
    p('Check out these upcoming events or explore more playing opportunities in our national search.'),
    h(3, 'UPCOMING EVENTS'),
    p('Localize your USTA.com experience with the touch of a button. Share your location to see play opportunities near you.'),
    btn('SHARE LOCATION', '#share-location'), style='topic, events')

# 5 event search: key-value configuration of the form
s_search = section(h(2, 'How do you play?'),
    block('event-search', kv(('Choose Type of Event', 'tournaments, programs, courts, coaches'),
                             ('Enter Zip Code or City, State', 'Enter Zip Code or City, State'),
                             ('SEARCH', a('SEARCH', '/en/home/play/play-tennis-near-me.html')))), style='search-band')

# 6 wheelchair promo (BC columns)
s_wheel = section(block('columns promo', row(
    cell(h(2, '50 Years of Wheelchair Tennis'), btn('Explore', '/en/home/play/50th-anniversary-of-wheelchair-tennis.html')),
    cell(pic('/en/home/_jcr_content/root/content/container_non_logged/container_1199805499/image_copy.coreimg.90.512.png/1774964913226/usta-wheelchair-50th-anniversary-logo-white.png',
             'Wheelchair 50 Anniversary logo with the number 5 next to the shape of a wheelchair tennis players representing the 0 in 50 in white')))), style='wheelchair')

# 7 membership benefits (BC cards, logo tiles)
logos = [('calm-dashboard.svg', 'Calm'), ('wilson-dashboard.svg', 'Wilson'), ('head-dashboard.svg', 'Head'), ('us-open-dashboard.svg', 'US Open Shop'), ('usta-dashboard.svg', 'USTA Leagues')]
s_benefits = section(topic('Membership Benefits'),
    p('Get a USTA Membership today and unlock benefits like 50% off your first year of your subscription to Calm, exclusive discounts at Wilson, Head, and more.'),
    block('cards benefits', *[row(cell(pic('/content/dam/usta/logos/benefits/dashboard/' + f, alt))) for f, alt in logos]),
    btn('Get Started', '/content/usta/en/home/membership/shopping/order.html'), style='topic, topic-teal, benefits')

# 8 coaching band: default content
s_coaching = section(p('SERVE YOUR PASSION'), p('<em>USTA Coaching</em>'), btn('Start Now', 'https://www.ustacoaching.com/'), style='coaching')

# 9 tennis news (BC cards)
news = [
    ('/content/dam/usta/Articles/2026-photos/20260902-35award-a.jpg.transform/resize-400/img.jpg', "Visit the 35 X 35 President's Impact page", 'National', "35 X 35 President's Impact", 'September 02, 2026',
     'The award celebrates individuals and organizations working to grow the sport of tennis and advance the USTA’s mission of reaching 35 million tennis players by 2035.',
     '/en/home/stay-current/national/usta-announces-recipients-of-inaugural-35-x-35-president-s-impac.html'),
    ('/content/dam/usta/Articles/2026-photos/20260901-facilitysantefe-a.jpg.transform/resize-400/img.jpg', 'Visit the 2026 Featured Facility page', 'National', '2026 Featured Facility', 'September 01, 2026',
     'Forked Lightning Racquet Club is one of 41 recipients honored for excellence during 2026 US Open.',
     '/en/home/stay-current/national/santa-fe-s-forked-lightning-racquet-club-named-usta-s-featured-f.html'),
    ('/content/dam/usta/Articles/2026-photos/20260823-monique-a.jpg.transform/resize-400/img.jpg', 'Visit the Wheelchair 50: Monique page', 'National', 'Wheelchair 50: Monique', 'August 23, 2026',
     'In celebration of 50 years of wheelchair tennis, the USTA honors the incredible career of wheelchair tennis star Monique Kalkman-van den Bosch.',
     '/en/home/stay-current/national/50-years-of-wheelchair-tennis--monique-kalkman-van-den-bosch--th.html'),
    ('/content/dam/usta/Articles/2026-photos/20260821-chantal-a.jpg.transform/resize-400/img.jpg', 'Visit the Wheelchair 50: Chantal page', 'National', 'Wheelchair 50: Chantal', 'August 21, 2026',
     "In celebration of 50 years of wheelchair tennis, the USTA reflects on the legacy of Chantal Vandierendonck, the first women's star in the sport and a catalyst for the growth of the game in the Netherlands and around the world.",
     '/en/home/stay-current/national/chantal-vandierendonck-50-years-wheelchair-tennis.html'),
]
s_news = section(topic('Tennis News'),
    block('cards news', *[row(cell(pic(img, alt)), cell(p(f'<strong>{esc(eye)}</strong>'), h(3, a(t, hr)), p(esc(d)), p(esc(desc)), link_p('Read More', hr))) for img, alt, eye, t, d, desc, hr in news]),
    btn('SEE ALL NEWS', 'https://www.usta.com/en/home/news-search.html', 'secondary'), style='topic, news')

# 10 safe play: 3 course columns + a resources column (BC columns)
courses = [
    ('/en/home/_jcr_content/root/content/container_non_logged/container_1346537486/container_copy_copy/container_copy/container_copy/image.coreimg.90.512.png/1773671465211/safesport-parent-course.png',
     'Father and daughter walking to play tennis holding hands', 'Parent’s Guide to Misconduct in Sport',
     'Designed for parents of youth athletes at any age, this free course educates parents on recognizing, responding to, and preventing abuse.',
     '/en/home/safe-play/safesport-courses/parents-guide-to-misconduct-in-sport.html'),
    ('/en/home/_jcr_content/root/content/container_non_logged/container_1346537486/container_copy_copy/container_copy/container_copy_15492/image.coreimg.90.512.png/1773671476128/safesport-player-course.png',
     'Four tennis players shaking hands over the net', 'Abuse Prevention for Adult Athletes',
     'This course summarizes valuable athlete safety concepts—cultural, technical, and legal—with real-world examples relevant to adult athletes.',
     '/en/home/safe-play/safesport-courses/abuse-prevention-for-adult-athletes.html'),
    ('/en/home/_jcr_content/root/content/container_non_logged/container_1346537486/container_copy_copy/container_copy/container_copy_71981/image.coreimg.90.512.jpeg/1773671503884/safesport-volunteer-course.jpeg',
     'Teen athletes sitting on a stand talking', 'SafeSport for Volunteers',
     'Volunteers provide invaluable support, spirit, and leadership. But however infrequent or informal their engagement, they have critical positions to play to support and reinforce athlete safety.',
     '/en/home/safe-play/safesport-courses/safesport-for-volunteers.html'),
]
ICON_PLAYER = '/en/home/_jcr_content/root/content/container_non_logged/container_1346537486/container_copy_copy/container_copy/container_copy_copy_/container_copy/image.coreimg.svg/1741048758378/icon-player.svg'
resources = [
    ('CHECK SAFE PLAY™ APPROVAL STATUS', 'https://www.usta.com/en/home/safe-play/search-for-a-tennis-provider.html'),
    ('PARENT TOOLKIT', 'https://uscenterforsafesport.org/wp-content/uploads/2020/05/Parent-Toolkit_Complete-1.pdf'),
    ('SAFE PLAY™ RESOURCES', 'https://www.usta.com/en/home/safe-play/usta-safe-play-conduct-policies-guidelines.html'),
    ('LIST OF INELIGIBLE & SUSPENDED INDIVIDUALS', 'https://www.usta.com/en/home/safe-play/individuals-permanently-ineligible--suspended--or-other-measures.html'),
    ('UNDERSTANDING GROOMING', 'https://www.buzzsprout.com/1164980/9638546'),
]
s_safe = section(topic('Safe Play™'),
    p('The USTA is committed to promoting safe and respectful environments for athletes to thrive in. Safe PlayTM is the comprehensive athlete safety program consisting of education, screening, reporting tools and policies for appropriate conduct in tennis. The USTA works with the U.S. Center for SafeSport and the United States Olympic &amp; Paralympic Committee to develop Safe PlayTM policies, procedures and educational resources to support the program.'),
    block('columns safe-play', row(
        *[cell(pic(img, alt), h(4, esc(t)), p(esc(d)), link_p('Learn More', hr)) for img, alt, t, d, hr in courses],
        cell(h(4, 'LINKED ORGANIZATION RESOURCES'), '<ul>' + ''.join(f'<li>{icon("icon-player")} {a(t, hr)}</li>' for t, hr in resources) + '</ul>'))),
    style='topic, safe-play')

# 11 we are here to help (BC cards, text cards with a button pinned to the bottom)
helps = [
    ('Customer Care', 'Click the purple button in the bottom left corner of the page for on-line help.', 'CONTACT', '/en/home/about-usta/who-we-are/national/usta-contact-us.html'),
    ('Help Center', 'Access step-by-step guides, best practices and how-to videos.', 'EXPLORE', 'https://customercare.usta.com/hc/en-us'),
    ('USTA Tennis Mobile App', 'Access the catalog of articles on our new player mobile app.', 'LEARN MORE', 'https://customercare.usta.com/hc/en-us/categories/11386675502996-USTA-Tennis-App'),
    ('Your USTA Account', 'Check out all the articles on how to manage your USTA account.', 'LEARN MORE', 'https://customercare.usta.com/hc/en-us/sections/360008566371-Managing-Your-Account'),
]
s_help = section(topic('We Are Here To Help'),
    p('As your partner in play, we’re here to support you with any questions or inquiries you may have. We have a variety of resources available to help you:'),
    block('cards help', *[row(cell(h(4, esc(t)), p(esc(d)), btn(b, hr))) for t, d, b, hr in helps]), style='topic, help')

# 12 ad slot: key-value, reserves the measured geometry, loads nothing (METHOD third-party slots)
s_ad = section(block('ad', kv(('label', 'Advertisement'), ('size', '728x90'), ('size-mobile', '320x50'))))

s_meta = section(block('metadata', kv(('title', 'USTA: Find a Tennis Tournament &amp; Play Tennis Near You'),
    ('description', 'The official site of the U.S. Tennis Association. Find a tennis court near you, learn to play tennis, and get tennis news from the USTA.'),
    ('nav', '/drafts/nav'), ('footer', '/drafts/footer'))))

home = doc(s_hero, s_discover, s_localize, s_events, s_search, s_wheel, s_benefits, s_coaching, s_news, s_safe, s_help, s_ad, s_meta)

# ------------------------------------------------------------------ nav (header fragment): utility, banner, brand, sections, tools
tree = json.load(open(os.path.join(HERE, '..', 'measure', 'nav-tree.json')))
def icon_name(url):
    return manifest[(url if url.startswith('http') else S + url).replace(' ', '%20')].rsplit('.', 1)[0]
def l3(items): return ('<ul>' + ''.join(f'<li>{a(x["text"], x["href"])}</li>' for x in items) + '</ul>') if items else ''
def l2(items): return '<ul>' + ''.join(f'<li>{icon(icon_name(c["img"])) + " " if c["img"] else ""}{a(c["text"], c["href"])}{l3(c["children"])}</li>' for c in items) + '</ul>'
level1 = [x for x in tree['level1'] if x['href']]  # the two href-less items are the mobile copies of the utility dropdowns
menu = '<ul>' + ''.join(f'<li>{a(x["text"], x["href"])}{l2(x["children"]) if x["children"] else ""}</li>' for x in level1) + '</ul>'
dropdowns = '<ul>' + ''.join(f'<li>{esc(d["label"])}<ul><li>{esc(d["slogan"])}</li>' + ''.join(f'<li>{a(l["text"], l["href"])}</li>' for l in d['links']) + '</ul></li>' for d in tree['dropdowns']) + '</ul>'
n_utility = section(dropdowns, p('Enter a location to personalize the experience…'),
    p(f'{icon("search-icon")} {a("Search", "#search")}'), p(f'{icon("language-icon")} {a("ENGLISH", "/en/home.html")} {a("ESPAÑOL", "/es/home.html")}'))
n_banner = section(p(f'{icon("tennis-ball")} <strong>New!</strong> Lost your account information? {a("Find your account!", "/content/usta/en/home/search-profile/find-your-account.html")}'))
n_brand = section(p(f'<a href="{S}/content/usta/en/home.html">{picture("/content/dam/usta/logos/section-logos/USTA_1c-black_RGB.png", "USTA Logo Home")}</a>'))
n_sections = section(menu)
n_tools = section(btn('JOIN', '/content/usta/en/home/myaccount/profile/join-self-rate.html', 'secondary'), btn('SIGN IN', '#sign-in'))
nav = doc(n_utility, n_banner, n_brand, n_sections, n_tools)

# ------------------------------------------------------------------ footer fragment: newsletter, download, main, legal
f_news = section(p(a('Sign up for our Newsletter', '#newsletter')))
f_download = section(p('<strong>Download the USTA App</strong>'),
    p(f'<a href="https://apps.apple.com/us/app/usta-tennis/id6443585452">{picture("/content/experience-fragments/usta/usta-en-footer-ef/master/_jcr_content/root/container/image.coreimg.png/1683879200192/app-store.png", "Download USTA App from Apple store")}</a> '
      f'<a href="https://play.google.com/store/apps/details?id=com.usta.player">{picture("/content/experience-fragments/usta/usta-en-footer-ef/master/_jcr_content/root/container/image_746557089.coreimg.png/1684907142031/google-play-badge.png", "Download USTA App from Google Play")}</a>'))
flinks = [('CAREERS', 'https://careers.usta.com'), ('INTERNSHIPS', 'https://careers.usta.com'),
    ('CONTACT US', 'https://www.usta.com/en/home/about-usta/who-we-are/national/usta-contact-us.html'),
    ('TERMS OF USE', 'https://www.usta.com/en/home/about-usta/who-we-are/national/usta-terms-of-use.html'),
    ('USTA CONNECT PORTAL', 'https://ustaconnect.usta.com/'),
    ('SAFE PLAY DISCIPLINARY LIST', 'https://www.usta.com/en/home/safe-play/individuals-permanently-ineligible--suspended--or-other-measures.html'),
    ('SITEMAP', 'https://www.usta.com/en/home/about-usta/who-we-are/national/usta-com-sitemap.html'),
    ('UMPIRE POLICY', 'https://www.usta.com/en/home/about-usta/who-we-are/national/usta-umpire-anti-discrimination-policy.html'),
    ('PRIVACY POLICY', 'https://www.usta.com/en/home/about-usta/who-we-are/national/usta-privacy-policy.html'),
    ('FIND YOUR ACCOUNT', 'https://www.usta.com/en/home/search-profile/find-your-account.html'),
    ('ACCESSIBILITY STATEMENT', 'https://www.usta.com/en/home/about-usta/who-we-are/national/usta-accessibility-statement.html'),
    ('COOKIE POLICY', 'https://www.usta.com/en/home/about-usta/who-we-are/national/usta-privacy-policy/usta-cookie-policy.html')]
socials = [('https://www.facebook.com/usta', '/content/dam/usta/footer/Facebook_White_footer.svg', 'Facebook'),
    ('https://www.twitter.com/usta', '/content/dam/usta/footer/TwitterX_White-footer.svg', 'Twitter'),
    ('https://www.instagram.com/usta/', '/content/dam/usta/footer/Instagram_White_footer.svg', 'Instagram'),
    ('https://www.youtube.com/@usta/videos', '/content/dam/usta/footer/YouTube_White_footer.svg', 'YouTube')]
apps = [('https://apps.apple.com/us/app/usta-tennis/id6443585452', '/content/dam/usta/app-icons/USTA-app.png', 'USTA Tennis Application'),
    ('https://apps.apple.com/us/app/usta-mobile/id411621803', '/content/dam/usta/logos/Tennislink-app.png', 'TennisLink Application'),
    ('https://apps.apple.com/us/app/usta-programming/id1501843836', '/content/dam/usta/app-icons/Serve-app.png', 'USTA Serve'),
    ('https://apps.apple.com/us/app/usta-flex/id6446393326', '/content/dam/usta/logos/usta-flex-icon.png', 'USTA Flex App'),
    ('https://apps.apple.com/us/app/us-open-tennis-championships/id327455869', '/content/dam/usta/logos/AppIcons-USO.png', 'USO Application')]
f_main = section(pic('/content/dam/usta/footer/USTA_Logo_White_footer.svg', 'USTA Logo'), ul(flinks),
    p(' '.join(f'<a href="{hr}">{picture(img, alt)}</a>' for hr, img, alt in socials)),
    p('<strong>USTA APPS</strong>'), p(' '.join(f'<a href="{hr}">{picture(img, alt)}</a>' for hr, img, alt in apps)))
f_legal = section(p(f'<a href="https://www.onetrust.com">{picture("/content/dam/usta/footer/Privacy_Icon_footer.svg", "Reviewed by Onetrust for privacy")}</a>'), p('© 2026 USTA ALL RIGHTS RESERVED'))
footer = doc(f_news, f_download, f_main, f_legal)

for name, content in (('home.html', home), ('nav.html', nav), ('footer.html', footer)):
    open(os.path.join(HERE, name), 'w').write(content)
    print(name, len(content), 'bytes')
