#!/usr/bin/env python3
"""Authored documents for fidelity.com home (DA source format). Writes home.html, nav.html, footer.html next to this file."""
import json, re, html, os
HERE = os.path.dirname(os.path.abspath(__file__))
M = 'https://main--sdt-fidelity--aemcoder-adobe.aem.page/drafts/media/'
F = 'https://www.fidelity.com'
D = 'https://digital.fidelity.com'

def pic(name, alt=''):
    return f'<picture><img src="{M}{name}" alt="{html.escape(alt)}"></picture>'
def btn(text, href, kind='primary'):
    tag = {'primary': 'strong', 'secondary': 'em'}[kind]
    return f'<p><{tag}><a href="{href}">{text}</a></{tag}></p>'
def link_p(text, href):
    return f'<p><a href="{href}">{text}</a></p>'
def cell(*inner):
    return '<div>' + ''.join(inner) + '</div>'
def row(*cells):
    return '<div>' + ''.join(cells) + '</div>'
def block(cls, *rows):
    return f'<div class="{cls}">' + ''.join(rows) + '</div>'
def section(*inner, style=None):
    s = '<div>' + ''.join(inner)
    if style:
        s += block('section-metadata', row(cell('style'), cell(style)))
    return s + '</div>'
def doc(*sections):
    return '<body>\n  <header></header>\n  <main>\n' + '\n'.join(sections) + '\n  </main>\n  <footer></footer>\n</body>\n'

# ---------------------------------------------------------------- home
hero = section(block('hero card', row(cell(
    pic('hp-littlenowlongway.jpg'),
    '<h1>A little now could go a long way tomorrow</h1>',
    '<p>Let the power of recurring investing and smart saving features help you stay on track.</p>',
    btn('Open an account', f'{F}/open-account/overview'),
    btn('I need guidance', f'{D}/prgw/digital/accountselector/index', 'secondary')))))

def feat(title, desc):
    return f'<p><strong>{title}</strong><br>{desc}</p>'
slides = [
  ('Start investing', 'Invest smart from the start with a brokerage account', [
     ('$0 account fees<sup>2</sup>', 'Keep your money working toward your goals.'),
     ('$0 commissions', 'Trade US stocks and ETFs commission free online.<sup>1</sup>'),
     ('Trade any amount', 'Buy US stocks and ETFs for as little as $1 with fractional shares.<sup>3</sup>')],
   ('Open a brokerage account', f'{D}/prgw/digital/aox/aohome/getstarted?accountType=brokerage'),
   ('Explore ways to invest', f'{F}/trading/overview'), 'str-iphone.jpg'),
  ('Save for retirement', 'Plan for the possibilities ahead with a Roth IRA', [
     ('Tax savings', 'Any investment growth in a Roth is tax-free, with tax-free withdrawals in retirement.<sup>4</sup>'),
     ('Access to your contributions', 'Any amount you add to your Roth can be withdrawn without taxes or penalties, anytime, for any reason.'),
     ('Numerous ways to invest', 'Whether you invest on your own or have us do it, you can choose from stocks to ETFs to crypto and more.')],
   ('Open a Roth IRA', f'{D}/prgw/digital/aox/aohome/getstarted?accountType=rothIRA'),
   ('Explore retirement planning', f'{F}/retirement-ira/overview'), 'save-retirement-new-image-6-23.jpg'),
  ('Save for health care', 'Save, earn, and invest for health care with an HSA', [
     ('Triple-tax advantage', 'Get tax-deductible contributions, no immediate tax on earnings, and tax-free withdrawals for qualified medical expenses.<sup>5</sup>'),
     ('No account fees', 'Fidelity’s HSA has no account fees or minimums, and $0 commissions for US stock &amp; ETF trades.<sup>6</sup>'),
     ('Not “use-it-or-lose-it”', 'The money’s always yours. You can earn interest on cash, grow your account by investing, or do both.')],
   ('Open an HSA', f'{D}/prgw/digital/aox/aohome/getstarted?accountType=hsa'),
   ('Explore health savings at Fidelity', f'{F}/go/hsa/why-hsa'), 'hsa-new-image-6-23.jpg'),
  ('Invest for a child', 'Save for the next generation’s education with a 529 account', [
     ('Tax-smart savings', 'Any earnings grow federal income tax-deferred, and you can get tax-free withdrawals for qualified education expenses.'),
     ('Flexible use of funds', 'Pay for college, trade school, and K–12 nationwide, including tuition, fees, and books.<sup>7</sup>'),
     ('Your money can work harder', 'No minimums to open and no account fees.<sup>2</sup> Plus, start early and your money could potentially grow more.')],
   ('Open a 529 account', f'{D}/prgw/digital/aox/aohome/getstarted?accountType=collegeSavingsPlan'),
   ('Explore saving for a child', f'{F}/building-savings/child-saving-and-investing'), '529-new-image-6-23.jpg'),
]
tabs = section(block('tabs scroll-reveal', *[
    row(cell(f'<p>{label}</p>'),
        cell(f'<h3>{title}</h3>', *[feat(t, d) for t, d in feats], btn(*cta), link_p(*more)),
        cell(pic(img)))
    for label, title, feats, cta, more, img in slides]), style='white')

partner = section(block('columns feature', row(
    cell(pic('wealth-plan-possibilities-new.jpg')),
    cell('<h2>A partner to help bring your plans to life</h2>',
         '<p>Collaborate with a dedicated Fidelity advisor to build a comprehensive wealth management strategy designed to help you meet your goals and evolving needs.</p>',
         btn('Find an advisor', f'{D}/prgw/digital/faa/0/landing-page?ccsource=phpdefault')))), style='white')

legal = section(
    f'<p>Review Fidelity Brokerage Services with <a href="https://brokercheck.finra.org/firm/summary/7784">FINRA\'s BrokerCheck</a></p>',
    link_p('Regulatory summary of Fidelity services (PDF)', f'{F}/bin-public/060_www_fidelity_com/documents/FBS-SAI-CRS.pdf'),
    style='legal')

cards_data = [
  ('learn-carousel-01-image-01.jpg', '3 ways to use your health savings account', 'Know the type of HSA user you are, then see how to make your money work harder.', 'article', 'Article', '6 min', f'{F}/learning-center/personal-finance/hsa-investing'),
  ('marketsense-lcupdate.jpg', 'Market Sense: Weekly insights', 'Our experts discuss the latest headlines, current market conditions, and what it all means for you.', 'webinar', 'Webinar', '24 min', f'{F}/learning-center/live-PI'),
  ('learn-carousel-03-image-01.jpg', 'How to start investing', 'It doesn\'t have to be overly complicated. Here\'s how to start.', 'article', 'Article', '6 min', f'{F}/viewpoints/personal-finance/how-to-start-investing'),
]
cards = section('<h2>Expertise you can act on</h2>', block('cards learn', *[
    row(cell(pic(img)), cell(f'<h3><a href="{href}">{t}</a></h3>', f'<p>{teaser}</p>', f'<p>:{icon}: {typ} :clock: {dur}</p>'))
    for img, t, teaser, icon, typ, dur, href in cards_data]), style='creme')

why = section(block('columns feature', row(
    cell('<h2>Why choose Fidelity?</h2>',
         '<p>Our objective insights and disciplined approach have helped generations of customers through all kinds of markets.</p>',
         '<ul><li>A clear, straightforward experience</li><li>Guidance as life changes</li><li>A wider range of integrated tools and products</li><li>Value and transparency at every step</li></ul>'),
    cell(pic('hp-why-fidelity-small-6-24.jpg')))), style='white')

looking = section(block('columns feature minor', row(
    cell(pic('image-feature-02-looking-for-something-else-01-screen.png')),
    cell('<h2>Looking for something else?</h2>',
         '<p>Answer a few questions about your goals and we\'ll show account options that could work for you.</p>',
         btn('Get started', f'{D}/prgw/digital/accountselector/index', 'secondary')))), style='creme')

# disclosures: archive state fragments → clean paragraphs (strip ids/names/titles on links, keep em/strong/sup/br/a)
raw = json.load(open(os.path.join(HERE, '..', 'measure', 'disclosures.json')))
paras = []
for t in raw:
    t = re.sub(r'\s(id|name|title|target|rel|class)="[^"]*"', '', t)
    t = t.replace('<br />', '<br>').replace('<br/>', '<br>')
    t = re.sub(r'\s+', ' ', t).strip()
    if t.startswith('<p>'):
        for m in re.findall(r'<p>(.*?)</p>', t, flags=re.S):
            m = m.strip()
            if m: paras.append(f'<p>{m}</p>')
    else:
        paras.append(f'<p>{t}</p>')
disclosures = section(*paras, style='disclosures')

meta = section(block('metadata',
    row(cell('title'), cell('Fidelity Investments - Retirement Plans, Investing, Brokerage, Wealth Management, Financial Planning and Advice, Online Trading.')),
    row(cell('description'), cell('Fidelity Investments offers Financial Planning and Advice, Retirement Plans, Wealth Management Services, Trading and Brokerage services, and a wide range of investment products.')),
    row(cell('template'), cell('home')),
    row(cell('nav'), cell('/drafts/nav')),
    row(cell('footer'), cell('/drafts/footer'))))

open(os.path.join(HERE, 'home.html'), 'w').write(doc(hero, tabs, partner, legal, cards, why, looking, disclosures, meta))

# ---------------------------------------------------------------- nav
def li(text, href=None, sub=None):
    inner = f'<a href="{href}">{text}</a>' if href else text
    if sub: inner += '<ul>' + ''.join(li(t, h) for t, h in sub) + '</ul>'
    return f'<li>{inner}</li>'
L = D + '/prgw/digital/login/full-page'
sections_nav = [
  ('Accounts &amp; Trade', [('Portfolio', f'{L}?AuthRedUrl=https://digital.fidelity.com/ft'), ('Account Positions', f'{D}/ftgw/digital/portfolio/positions'), ('Trade', f'{D}/ftgw/digital/trade-equity/index/orderEntry'), ('Fidelity Trader+ Web', f'{D}/ftgw/digital/traderplus'), ('Fidelity Trader+', f'{F}/investing/trading-platforms'), ('Transfers', f'{F}/customer-service/money-movement'), ('Cash Management', f'{D}/ftgw/digital/cashmanagement'), ('Bill Pay', f'{D}/ftgw/digital/billpay/home'), ('Full View<sup>®</sup>', f'{D}/ftgw/pna/customer/pgc/networth/'), ('Security Settings', f'{D}/ftgw/digital/security/dashboard/view'), ('Account Features', f'{D}/ftgw/digital/portfolio/features'), ('Documents', 'https://digitalservices.fidelity.com/navigate/ent-documentcenter/statements?poe=fidcom'), ('Tax Forms &amp; Information', f'{F}/tax-information/overview'), ('Retirement Distributions', f'{D}/ftgw/digital/mrdhub'), ('Refer a Friend', f'{F}/customer-service/friendsandfamily3a')]),
  ('Investing', [('Self-Directed Investing', f'{F}/investing/trading'), ('Advanced Trading', f'{F}/investing/advanced-trading'), ('Investing for a Child', f'{F}/investing/investing-for-kids'), ('Managing Cash &amp; Credit', f'{F}/investing/manage-cash-credit-lending'), ('Investment Accounts &amp; Products', f'{F}/investing/investment-accounts'), ('Investing &amp; Trading Education', f'{F}/learning-center/personal-finance/investing-trading-education')]),
  ('Retirement', [('Retirement Planning', f'{F}/retirement/retirement-planning'), ('401(k) Rollovers &amp; IRA Transfers', f'{F}/retirement/401k-rollover'), ('Retirement Accounts', f'{F}/retirement/retirement-accounts'), ('Retirement Education', f'{F}/learning-center/personal-finance/retirement-education')]),
  ('Wealth Management', [('Wealth Management Offerings', f'{F}/wealth/wealth-management-offerings'), ('Financial Advisors', f'{F}/wealth/financial-advisors'), ('Financial Planning', f'{F}/wealth/financial-planning'), ('Investment Management', f'{F}/wealth/investment-management'), ('Wealth Management Insights', f'{F}/learning-center/wealth-management-insights')]),
  ('News &amp; Research', [('News', f'{F}/news/overview'), ('Wealth Management Insights', f'{F}/learning-center/wealth-management-insights'), ('Watchlist', f'{D}/ftgw/digital/watchlist'), ('Alerts', 'https://alertable.fidelity.com/ftgw/digital/alerts'), ('Stocks, ETFs, Crypto', f'{D}/prgw/digital/research/src'), ('Mutual Funds', 'https://fundresearch.fidelity.com/fund-screener'), ('Fixed Income, Bonds &amp; CDs', f'{D}/prgw/digital/finewexp/filanding'), ('Options', f'{D}/ftgw/digital/exp-options-home/'), ('IPOs', f'{D}/prgw/digital/offerings/ipocalendar'), ('Annuities', 'https://fundresearch.fidelity.com/fund-screener/annuities/'), ('Learn', f'{F}/learning-center/overview')]),
]
nav = doc(
  section(f'<p><a href="{F}">:fidelity-logo:</a></p>'),
  section('<ul>' + ''.join(li(t, None, sub) for t, sub in sections_nav) + '</ul>'),
  section(link_p('Fidelity Assistant', f'{F}/customer-service/overview?ccsource=FA_NAV'),
          link_p(':help: Customer Support', f'{D}/prgw/digital/customer-service/'),
          btn('Open an account', f'{F}/open-account/overview', 'secondary'),
          btn('Log in', L),
          link_p(':search: How can we help?', f'{F}/search')))
open(os.path.join(HERE, 'nav.html'), 'w').write(nav)

# ---------------------------------------------------------------- footer
cols = [
  [('Mutual Funds', f'{F}/mutual-funds/overview'), ('ETFs', f'{F}/etfs/overview'), ('Fixed Income', f'{F}/fixed-income-bonds/overview'), ('Bonds', f'{F}/fixed-income-bonds/individual-bonds/overview'), ('CDs', f'{F}/fixed-income-bonds/cds'), ('Options', f'{F}/options-trading/overview'), ('Crypto', f'{F}/crypto/overview'), ('Fidelity Trader+', f'{F}/trading/trading-platforms'), ('Investor Centers', f'{F}/branches/branch-locations')],
  [('Stocks', f'{F}/stock-trading/overview'), ('Online Trading', f'{F}/trading/overview'), ('Direct Indexing', f'{F}/direct-indexing/overview'), ('Sustainable Investing', f'{F}/sustainable/overview'), ('Annuities', f'{F}/annuities/overview'), ('Life Insurance', f'{F}/life-insurance/term-life-insurance/overview'), ('Long-Term Care Planning', f'{F}/life-insurance/long-term-care/overview'), ('529 Plans', f'{F}/529-plans/overview'), ('Health Savings Account', f'{F}/go/hsa/why-hsa')],
  [('IRAs', f'{F}/retirement/retirement-accounts'), ('Retirement Planning', f'{F}/retirement/retirement-planning'), ('Small Business Retirement Plans', f'{F}/retirement-ira/small-business/compare-retirement-plans'), ('Charitable Giving', f'{F}/building-savings/charity-and-philanthropy'), ('Marketplace Solutions', f'{F}/go/marketplace/overview'), ("FINRA's BrokerCheck", 'https://brokercheck.finra.org/Firm/Summary/7784'), ('Why Fidelity', f'{F}/why-fidelity/overview')],
]
social = [('instagram.png', 'Instagram', 'https://www.instagram.com/fidelityinvestments'), ('linkedin.png', 'LinkedIn', 'https://www.linkedin.com/company/fidelity-investments'), ('youtube.png', 'YouTube', 'https://www.youtube.com/user/fidelityinvestments'), ('reddit.png', 'Reddit', 'https://www.reddit.com/r/fidelityinvestments/'), ('x.png', 'X (Twitter)', 'https://www.twitter.com/fidelity'), ('facebook.png', 'Facebook', 'https://www.facebook.com/fidelityinvestments'), ('tiktok-icon.png', 'TikTok', 'https://www.tiktok.com/@fidelityinvestments'), ('fidelitymobile26x26.png', 'Fidelity Apps', f'{F}/mobile/overview'), ('refer26x26.png', 'Refer a Friend', f'{F}/customer-service/friendsandfamily3a?ccsource=RAFFooterNav')]
reserved = [('Terms of Use', f'{F}/terms-of-use'), ('Privacy', f'{F}/privacy/overview'), ('Security', f'{F}/security/overview'), ('Site Map', f'{F}/sitemap/overview'), ('Accessibility', f'{F}/accessibility/overview'), ('Contact Us', f'{F}/customer-service/contact-us'), ('Share Your Screen', f'{F}/customer-service/contact-us#share'), ('Disclosures', 'https://communications.fidelity.com/information/crs/'), ('Manage My Targeting/Advertising Cookies', f'{F}/privacy/overview#cookies')]
footer = doc(
  section(*['<ul>' + ''.join(li(t, h) for t, h in c) + '</ul>' for c in cols]),
  section('<h3>Stay Connected</h3>', '<p>Locate an Investor Center by ZIP Code</p>', link_p('Search', f'{F}/branches/branch-locations'),
          '<ul>' + ''.join(f'<li>{pic(img)}<a href="{h}">{t}</a></li>' for img, t, h in social) + '</ul>'),
  section(pic('fidelity-footer-logo.png', 'Fidelity.com Home'), '<ul>' + ''.join(li(t, h) for t, h in [('Careers', 'https://jobs.fidelity.com'), ('News Releases', 'https://newsroom.fidelity.com/'), ('About Fidelity', 'https://about.fidelity.com'), ('International', 'https://www.fidelityinternational.com')]) + '</ul>'),
  section('<p>Copyright 1998-2026 FMR LLC. All Rights Reserved.</p>', '<ul>' + ''.join(li(t, h) for t, h in reserved) + '</ul>',
          link_p('This is for persons in the US only.', f'{F}/terms-of-use#For')))
open(os.path.join(HERE, 'footer.html'), 'w').write(footer)
print('wrote home.html nav.html footer.html', len(paras), 'disclosure paragraphs')
