#!/usr/bin/env python3
"""Authored documents for travelers.com home (DA source format). Writes home.html, nav.html, footer.html next to this file.
Every value comes from the step-1 measurement (migration/cases/home/measure); nothing is copied from the source DOM."""
import html, os
HERE = os.path.dirname(os.path.abspath(__file__))
M = 'https://blocks-first--sdt-travelers--aemcoder-adobe.aem.page/drafts/media/'
T = 'https://www.travelers.com'
Q = 'https://pijas.travelers.com/get-a-quote-now/entry.html'

def pic(name, alt=''):
    return f'<picture><img src="{M}{name}.webp" alt="{html.escape(alt)}"></picture>'
def btn(text, href, kind='primary'):
    tag = {'primary': 'strong', 'secondary': 'em'}[kind]
    return f'<p><{tag}><a href="{href}">{text}</a></{tag}></p>'
def link_p(text, href):
    return f'<p><a href="{href}">{text}</a></p>'
def ul(items):
    return '<ul>' + ''.join(f'<li><a href="{h}">{t}</a></li>' for t, h in items) + '</ul>'
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
def eyebrow(text):
    return f'<p><strong>{text}</strong></p>'

# ---------------------------------------------------------------- home
products = [
  ('Auto', f'{Q}?sponsor=directload&amp;path=request&amp;zipCode={{?}}&amp;lob=AUTO'),
  ('Home', f'{Q}?lob=HOME&amp;sponsor=directload&amp;path=request&amp;zipCode={{?}}'),
  ('Renters', f'{Q}?lob=RENTER&amp;sponsor=directload&amp;path=request&amp;zipCode={{?}}'),
  ('Auto + Home', f'{Q}?lob=AUTO,HOME&amp;sponsor=directload&amp;path=request&amp;zipCode={{?}}'),
  ('Auto + Condo', f'{Q}?lob=AUTO,CONDO&amp;sponsor=directload&amp;path=request&amp;zipCode={{?}}'),
  ('Auto + Renters', f'{Q}?lob=AUTO,RENTER&amp;sponsor=directload&amp;path=request&amp;zipCode={{?}}'),
  ('Condo', f'{Q}?lob=CONDO&amp;sponsor=directload&amp;path=request&amp;zipCode={{?}}'),
  ('Boat &amp; Yacht', f'{T}/boat-yacht-insurance'), ('Umbrella', f'{T}/umbrella-insurance'), ('Valuable Items', f'{T}/jewelry-insurance'),
  ('Landlord', f'{T}/landlord-insurance'), ('Wedding &amp; Event', 'https://www.protectmywedding.com/'), ('Travel', f'{T}/travel-insurance'),
  ('Pet', f'{T}/pet-insurance'), ('Motorcycle', f'{T}/motorcycle-insurance'), ('Flood', f'{T}/flood-insurance'),
]
hero = block('hero quote',
  row(cell(pic('1440home', 'A father carrying his daughter on his back, a solar technician, a woman greeting a dog through a car window and a shop owner at a counter'))),
  row(cell(eyebrow('Personal insurance'), '<h2>Find the insurance to fit your needs.</h2>',
           '<p>Select a product</p>', ul(products), '<p>ZIP code</p>',
           btn('Start a quote*', Q),
           link_p('Continue a quote', f'{Q}?path=RETRIEVE&amp;sponsor=directload'),
           '<p>or call to get a quote* <a href="tel:+18555372298">1-855-537-2298</a></p>')),
  row(cell(eyebrow('Business insurance'), '<h2>Transforming risk to your business advantage.</h2>',
           btn('Find solutions', f'{T}/business-insurance', 'secondary'))))
quick = block('quick-links',
  row(cell(f'<p>:dollar-circle: <a href="{T}/pay-your-bill">Pay your bill</a></p>')),
  row(cell(f'<p>:pencil: <a href="{T}/claims/file-claim">File a claim</a></p>')),
  row(cell('<p>:group: <a href="https://agent.travelers.com/search">Find an agent</a></p>')),
  row(cell(f'<p>:conversation: <a href="{T}/contact-us">Contact us</a></p>')))
s_hero = section('<h1>Travelers has got you covered every day and when it matters most.</h1>', hero, quick)

personal_links = [('Auto', '/car-insurance'), ('Boat &amp; yacht', '/boat-yacht-insurance'), ('Condo', '/condo-insurance'), ('Flood', '/flood-insurance'), ('Home', '/home-insurance'), ('Landlord', '/landlord-insurance'), ('Motorcycle', '/motorcycle-insurance'), ('Pet', '/pet-insurance'), ('Renters', '/renters-insurance'), ('Travel', '/travel-insurance'), ('Umbrella', '/umbrella-insurance'), ('Valuable items', '/jewelry-insurance'), ('Wedding &amp; event', '/event-insurance')]
business_links = [('Commercial auto &amp; trucking', '/business-insurance/commercial-auto'), ('Commercial umbrella &amp; excess liability', '/business-insurance/commercial-umbrella'), ('Cyber', '/business-insurance/cyber-insurance'), ('General liability', '/business-insurance/general-liability'), ('Global insurance', '/business-insurance/global'), ('Management &amp; professional liability', '/business-insurance/professional-liability-insurance'), ('Property', '/business-insurance/property'), ("Small business owner's policy", '/business-insurance/business-owners-policy'), ('Surety bonds', '/surety-bond'), ('Workers compensation', '/business-insurance/workers-compensation')]
def abs_(items):
    return [(t, T + h) for t, h in items]
s_personal = section(block('columns feature', row(
  cell(eyebrow('Travelers personal insurance'), '<h2>For individuals and families</h2>',
       "<p>You care about life's important moments. Travelers cares about protecting them.</p>",
       eyebrow('Explore products'), ul(abs_(personal_links)), btn('More products', f'{T}/personal-insurance')),
  cell(pic('chinese-family-dinner', 'A family sharing dinner at home')))))
s_business = section(block('columns feature', row(
  cell(pic('engineers-meeting-cargo-business', 'Engineers reviewing a tablet at a cargo terminal')),
  cell(eyebrow('Travelers business insurance'), '<h2>For businesses and organizations</h2>',
       '<p>You face risks to grow your business and protect your organization. Travelers helps manage those risks.</p>',
       eyebrow('Explore products'), ul(abs_(business_links)), btn('More products', f'{T}/business-insurance/products-services')))))

industries = [('manufacturing-large', 'Insurance for manufacturing', '/business-insurance/manufacturers', 'Two people talking on a factory floor'),
  ('energy-insurance-large', 'Insurance for energy', '/business-insurance/energy', 'Wind turbines at sunset'),
  ('financial-institutions-medium', 'Insurance for financial institutions', '/business-insurance/financial-institutions', 'Glass office towers seen from below'),
  ('technology-insurance-medium', 'Insurance for technology', '/business-insurance/technology', 'A microchip being placed on a circuit board')]
s_industries = section(eyebrow('Industries we protect'), '<h2>Rely on our advanced industry and risk expertise to help you tailor your business coverage.</h2>',
  block('cards', *[row(cell(pic(img, alt)), cell(f'<h3><a href="{T}{href}">{t}</a></h3>')) for img, t, href, alt in industries]),
  btn('Explore all industries', f'{T}/business-insurance/industries', 'secondary'), style='center')

s_cta = section(block('columns cta', row(
  cell(pic('141208-christiankozowyk-travelers-08-0149', 'An agent talking with a customer')),
  cell('<h3>Any questions so far? We can help.</h3>', '<p>Reach out to a Travelers representative or local independent agent.</p>'),
  cell(btn('Find an agent', 'https://agent.travelers.com/search')))), style='bordered')

tiles = [(':report-a-claim:', 'File a claim', f'{T}/claims/file-claim'), (':upload-a-file:', 'Upload a file', 'https://claim.travelers.com/claimuploadcenter/'),
  (':check-status:', 'Check status', f'{T}/claims/check-your-claim-status'), (':find-a-provider:', 'Find a provider', 'https://claim-services.travelers.com/claims/claim-services')]
s_claims = section(block('columns feature tiles', row(
  cell(eyebrow('Claim Center'), '<h2>Everything you need at your fingertips</h2>',
       '<p>Our easy to use tools let you manage your claim experience.</p>', btn('Visit Claim Center', f'{T}/claims')),
  cell('<ul>' + ''.join(f'<li>{i} <a href="{h}">{t}</a></li>' for i, t, h in tiles) + '</ul>'))))

why = [('man-tablet-greenhouse', 'Sustainability', 'https://sustainability.travelers.com/', 'Here, sustainability means performing today, transforming for tomorrow and fulfilling our promise to our customers, communities and employees.', 'A man with a tablet in a greenhouse'),
  ('female-professionals-greeting-each-other-convention-center', 'Diversity &amp; Inclusion', f'{T}/about-travelers/diversity', 'We attract and retain the best employees from the broadest talent pool and foster an inclusive environment where each individual can develop and thrive.', 'Professionals greeting each other at a convention'),
  ('corporate-citizenship-small-480x300', 'Community', f'{T}/about-travelers/community', 'Travelers builds strong communities through giving and volunteerism to support educational and economic opportunities for all.', 'Volunteers framing a house'),
  ('homepage-nyse-panel-medium', 'Travelers Institute', 'https://institute.travelers.com/', 'We bring industry thought leadership and analysis to help address the most pressing challenges facing our industries, our customers and the communities we serve.', 'A panel discussion on stage')]
s_why = section(eyebrow('Why Travelers'), '<h2>170+ years of experience. 30,000 people who care.</h2>',
  block('cards', *[row(cell(pic(img, alt)), cell(f'<h3><a href="{href}">{t}</a></h3>', f'<p>{p}</p>')) for img, t, href, p, alt in why]),
  btn('More about Travelers', f'{T}/about-travelers', 'secondary'))

s_featured = section('<h2>Featured content</h2>', block('columns story', row(
  cell(pic('family-at-graduation-brand-commercial', 'A family at a graduation ceremony')),
  cell('<h3>Care when it matters most. And to us, it always matters.</h3>',
       '<p>A single act of care holds the power to alter a week, shape an outcome, or even transform a lifetime. Here are stories of life-changing care from real Travelers employees, inspired by true events.</p>',
       link_p('Watch films', f'{T}/about-travelers/commercials')))), style='grey')

articles = [('person-calling-for-help-after-a-car-accident', 'Resources for Traveling on the Road', "What to Do if You're in a Car Accident", '/resources/auto/travel/what-to-do-if-you-are-in-a-car-accident', 'No one likes to think about the prospect of being in a car accident, but if you think ahead and understand what steps to take, you may feel better prepared for the unexpected.', '3 minutes', 'A driver on the phone after a car accident'),
  ('5-innovations-job-site-safety-large', 'Construction Resources', '5 Innovations Impacting Construction Job Site Safety', '/resources/business-industries/construction/innovations-construction-job-site-safety', 'Construction job sites can present workers with a variety of hazards. Explore five areas of innovation impacting construction job site safety.', '6 minutes', 'A construction worker wearing a VR headset'),
  ('new-nonprofit-board-member-recruit-meeting-with-board', 'Resources for Nonprofit Organizations', '5 Tips for Recruiting Nonprofit Board Members', '/resources/business-industries/nonprofit/5-tips-for-recruiting-nonprofit-board-members', 'Recruiting nonprofit board members is challenging. Get recruitment ideas for filling those seats.', '5 minutes', 'A nonprofit board meeting'),
  ('a-woman-is-getting-interviewed-by-two-men', 'Small Business Resources', '5 Interviewing Tips for Hiring Employees for Your Small Business', '/resources/business-industries/small-business/5-interviewing-tips-for-hiring-for-your-small-business', 'These interview tips can help you find qualified candidates for your small business.', '4 minutes', 'A video interview on a laptop')]
s_prepare = section(eyebrow('Prepare &amp; Prevent'), '<h2>Insights to help you manage risks at home, work and on the road</h2>',
  block('cards', *[row(cell(pic(img, alt)), cell(eyebrow(eb), f'<h3><a href="{T}{href}">{t}</a></h3>', f'<p>{p}</p>', f'<p>:clock: {rt}</p>')) for img, eb, t, href, p, rt, alt in articles]))

meta = section(block('metadata',
  row(cell('title'), cell('Travelers: Insurance Coverage and Protection for What Matters Most')),
  row(cell('description'), cell('Protect your personal and business investments with Travelers Insurance. From auto to homeowners or business insurance, we have the solution to suit your needs.')),
  row(cell('template'), cell('home')),
  row(cell('nav'), cell('/drafts/nav')),
  row(cell('footer'), cell('/drafts/footer'))))

open(os.path.join(HERE, 'home.html'), 'w').write(doc(s_hero, s_personal, s_business, s_industries, s_cta, s_claims, s_why, s_featured, s_prepare, meta))

# ---------------------------------------------------------------- nav (reading order: top hat, brand, primary menus, tools)
def li(text, href=None, sub=None):
    inner = f'<a href="{href}">{text}</a>' if href else text
    if sub: inner += '<ul>' + ''.join(li(t, h, s) for t, h, s in sub) + '</ul>'
    return f'<li>{inner}</li>'
def L(items):  # (text, path, children)
    return [(t, (T + h if h.startswith('/') else h), [(a, (T + b if b.startswith('/') else b), None) for a, b in (c or [])] or None) for t, h, c in items]
menus = [
 ('For Individuals', L([
   ('Products', '/personal-insurance', [('Car', '/car-insurance'), ('Home', '/home-insurance'), ('Renters', '/renters-insurance'), ('Condo', '/condo-insurance'), ('Landlord', '/landlord-insurance'), ('Boat &amp; Yacht', '/boat-yacht-insurance'), ('Flood', '/flood-insurance'), ('Motorcycle', '/motorcycle-insurance'), ('Travel', '/travel-insurance'), ('Pet', '/pet-insurance'), ('Weddings &amp; Events', '/event-insurance'), ('Umbrella', '/umbrella-insurance'), ('More', '/personal-insurance')]),
   ('Prepare &amp; Prevent', '/resources', [('Insurance 101', '/resources/insurance-101'), ('Home Central', '/resources/home'), ('Travelers Garage', '/resources/auto')]),
   ('Affinity Group Discounts', '/affinity-programs', None), ('Online Services', '/online-service', None), ('Pay Your Bill', '/pay-your-bill', None), ('Personal Insurance Overview', '/personal-insurance', None)])),
 ('For Business', L([
   ('Products &amp; Solutions', '/business-insurance/products-services', [('Commercial Auto &amp; Trucking', '/business-insurance/commercial-auto'), ('Cyber', '/business-insurance/cyber-insurance'), ('General Liability', '/business-insurance/general-liability'), ('Management &amp; Professional Liability', '/business-insurance/professional-liability-insurance'), ('Property', '/business-insurance/property'), ("Business Owner's Policy", '/business-insurance/business-owners-policy'), ('Surety Bonds', '/surety-bond'), ('Workers Compensation', '/business-insurance/workers-compensation'), ('More', '/business-insurance/products-services')]),
   ('Industries', '/business-insurance/industries', [('Construction', '/business-insurance/construction'), ('Energy &amp; Renewable', '/business-insurance/energy'), ('Financial Institutions', '/business-insurance/financial-institutions'), ('Healthcare', '/business-insurance/healthcare'), ('Manufacturing', '/business-insurance/manufacturers'), ('Real Estate', '/business-insurance/real-estate'), ('Technology', '/business-insurance/technology'), ('Transportation', '/business-insurance/transportation'), ('More', '/business-insurance/industries')]),
   ('Services', '/business-insurance/services', [('Risk Control', '/risk-control'), ('Claims', '/claims'), ('Premium Audit', '/business-insurance/services/premium-audit'), ('More', '/business-insurance/services')]),
   ('Prepare &amp; Prevent', '/resources', None), ('Pay Your Bill', '/pay-your-bill', None), ('Small Business', '/small-business-insurance', None), ('Large Business', '/business-insurance/large', None), ('Multinational Insurance', '/business-insurance/multinational', None), ('Business Insurance Overview', '/business-insurance', None)])),
 ('Claims', L([
   ('Claim Center', '/claims', None), ('Should I File a Claim?', '/claims/file-claim/should-i-file-a-claim', None), ('File a Claim', '/claims/file-claim', None), ('Upload a File', 'https://claim.travelers.com/claimuploadcenter', None), ('Roadside Assistance', '/claims/file-claim/roadside-assistance', None), ('Find a Service Provider', '/claims/claim-services', None),
   ('Manage Your Claim Experience', '/claims/manage-claim', [('Understanding the Claim Process', '/claims/manage-claim/what-to-expect-during-claim'), ('Claim Guide Library', '/claims/guides'), ('Workers Compensation Claim Process', '/claims/manage-claim/workers-compensation-claim-process')]),
   ('Claim Capabilities', '/claims/capabilities', None), ('Check Your Claim Status', '/claims/check-your-claim-status', None)])),
 ('Prepare &amp; Prevent', L([
   ('For Individuals', '/resources/individuals', None),
   ('Home Central', '/resources/home', [('Buying &amp; Selling', '/resources/home/buying-selling'), ('Home Maintenance', '/resources/home/maintenance'), ('Home Renovation', '/resources/home/renovation'), ('Home Safety', '/resources/home/safety'), ('Moving', '/resources/home/moving'), ('Smart Home', '/resources/home/smart-home')]),
   ('Travelers Garage', '/resources/auto', [('Buying &amp; Selling', '/resources/auto/buying-selling'), ('Car Maintenance', '/resources/auto/maintenance'), ('Distracted Driving', '/resources/auto/distracted-driving'), ('Safe Driving', '/resources/auto/safe-driving'), ('Teen Driving', '/resources/auto/teen-driving'), ('Boating', '/resources/boating')]),
   ('Insurance 101', '/resources/insurance-101', None), ('Weather', '/resources/weather', None), ('For Business', '/resources/business', None),
   ('Industries', '/resources/business-industries', [('Construction', '/resources/business-industries/construction'), ('Energy', '/resources/business-industries/energy'), ('Manufacturing', '/resources/business-industries/manufacturing'), ('Nonprofit', '/resources/business-industries/nonprofit'), ('Small Business', '/resources/business-industries/small-business'), ('Technology', '/resources/business-industries/technology')]),
   ('Business Topics', '/resources/business-topics', [('Business Continuity', '/resources/business-topics/business-continuity'), ('Cyber', '/resources/business-topics/cyber-security'), ('Driver &amp; Fleet Safety', '/resources/business-topics/driver-fleet-safety'), ('Facilities Management', '/resources/business-topics/facilities-management'), ('Internet of Things', '/resources/business-topics/internet-of-things'), ('Product and Services Liability', '/resources/business-topics/product-service-liability'), ('Supply Chain Management', '/resources/business-topics/supply-chain-management'), ('Workplace Safety', '/resources/business-topics/workplace-safety')]),
   ('Travelers Risk Index', '/resources/risk-index', None), ('Prepare &amp; Prevent Resources', '/resources', None)])),
]
tophat = [('About', f'{T}/about-travelers'), ('Careers', 'https://careers.travelers.com/'), ('Agents', f'{T}/foragents'), ('Investors', 'https://investor.travelers.com/home/default.aspx'), ('Sustainability', 'https://sustainability.travelers.com/'), ('Contact Us', f'{T}/contact-us')]
nav = doc(
  section(ul(tophat)),
  section(f'<p><a href="{T}/">:travelers-logo:</a></p>'),
  section('<ul>' + ''.join(li(t, None, sub) for t, sub in menus) + '</ul>'),
  section(link_p(':search: Search', f'{T}/search'), btn('Log in', 'https://signin.travelers.com/', 'secondary')))
open(os.path.join(HERE, 'nav.html'), 'w').write(nav)

# ---------------------------------------------------------------- footer
social = [('social-fb', 'Facebook', 'https://www.facebook.com/travelers'), ('social-yt', 'YouTube', 'https://www.youtube.com/user/TravelersInsurance'), ('social-x', 'X', 'https://x.com/Travelers'), ('social-linkedin', 'LinkedIn', 'https://www.linkedin.com/company/travelers'), ('social-instagram', 'Instagram', 'https://www.instagram.com/travelersinsurance')]
groups = [
  ('Products &amp; Services', [('Individuals &amp; Families', f'{T}/personal-insurance'), ('Businesses', f'{T}/business-insurance'), ('Claims', f'{T}/claims'), ('Prepare &amp; Prevent', f'{T}/resources')]),
  ('Our Company', [('About Travelers', f'{T}/about-travelers'), ('Careers', 'https://careers.travelers.com/'), ('Investors', 'https://investor.travelers.com/home/default.aspx'), ('Sustainability', 'https://sustainability.travelers.com/'), ('Travelers Institute', 'https://institute.travelers.com/')]),
  ('Connect', [('Contact Us', f'{T}/contact-us'), ('MyTravelers<sup>®</sup>', f'{T}/online-service'), ('For Agents', f'{T}/foragents'), ('Find an Agent', 'https://agent.travelers.com/search')]),
  ('Legal &amp; Compliance', [('Terms of Service', f'{T}/about-travelers/legal'), ('Privacy and Security Statements', f'{T}/about-travelers/privacy-statements'), ('Do Not Sell or Share My Information', f'{T}/about-travelers/privacy-statements#cookies'), ('Accessibility', f'{T}/about-travelers/accessibility'), ('Producer Compensation Disclosure', f'{T}/about-travelers/producer-compensation-disclosure'), ('Legal Entity Information', f'{T}/about-travelers/subsidiaries')]),
]
footer = doc(
  section(f'<p><a href="{T}/">:travelers-logo:</a></p>',
          '<ul>' + ''.join(f'<li><a href="{h}">:{i}: {t}</a></li>' for i, t, h in social) + '</ul>',
          '<p>Travelers and The Travelers Umbrella are registered trademarks of The Travelers Indemnity Company in the U.S. and other countries.</p>',
          '<p>©2026 The Travelers Indemnity Company. All rights reserved.</p>'),
  section(*[f'<h2>{h}</h2>' + ul(items) for h, items in groups]),
  section('<p>*InsuraMatch, LLC, a Travelers-owned insurance agency, performs certain sales and fulfillment services for Travelers. InsuraMatch can offer products from Travelers and non-affiliated insurance companies. Availability of Travelers’ products may vary by state and channel. Certain products in certain states may not be available on a standalone basis, and in certain states, including but not limited to California, products must be obtained through a local independent agent.</p>'))
open(os.path.join(HERE, 'footer.html'), 'w').write(footer)
print('wrote home.html nav.html footer.html')
