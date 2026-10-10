#!/usr/bin/env python3
"""Case script: the authored document, written from author's --draft-new output (pictures + alts reused by file name) — the draft lost
every card-wide link and button href, put :icon: placeholders for the arrows, and the hero/people rows needed a different shape."""
import re, html
D = 'migration/cases/about/doc/'
src = open('migration/cases/about/acs-about.author.html').read()
pics = {m.group(1): m.group(0) for m in re.finditer(r'<picture><img src="[^"]*/drafts/media/([^"?]+)"[^>]*></picture>', src)}
def P(n): return pics[n]
def blk(name, rows):
    return f'<div class="{name}">\n' + '\n'.join('<div>' + ''.join(f'<div>{c}</div>' for c in r) + '</div>' for r in rows) + '\n</div>'
def meta(style): return f'<div class="section-metadata"><div><div>style</div><div>{style}</div></div></div>'
def a(href, t): return f'<a href="{href}">{html.escape(t, quote=False)}</a>'
S = []
# 1 hero
S.append(blk('hero', [[f'<p>{P("blue-macro-pattern-about-png.webp")}</p>'],
                      ['<p>About the American Chemical Society</p><h1>The world\'s scientific community</h1><p>Science moves forward when people come together. For over 150 years, ACS, a nonprofit organization, has united the global scientific community to foster research excellence, advance scientific education, and champion innovation. Discover how, together, we advance scientific knowledge, champion integrity, and build a community where science is for everyone.</p>'],
                      [f'<p>{P("card-bg-blue-1.svg")}</p>', f'<p>{P("acs-withname-logo-white.svg")}</p><p><a href="#acs-member-film">:play: A world built on science</a></p>']]))
# 2 strategy
S.append(blk('columns strategy', [[
    '<p>Our Roadmap</p><h2>Our strategic direction</h2><p>The ACS Strategic Plan 2025–2029 provides a five-year roadmap for the organization, outlining our vision, mission, core values, and strategic goals as we advance our commitment to improve all lives through the transforming power of chemistry.</p>'
    f'<p><em>{a("/about/strategicplan.html", "Explore our strategic plan")}</em></p><p>{P("strategic-bento-about-png.webp")}</p>',
    '<p>Our Vision</p><p>A world built on science</p><p>Our Mission</p><p>• Advance scientific knowledge</p><p>• Empower a global community</p><p>• Champion scientific integrity</p><p>Core Values</p><p>• Passion for Science</p><p>• Lifelong Learning</p><p>• Inclusion and Belonging</p><p>• Sustainability</p>']]))
# 3 governance
gov = [('/about/governance/board.html', 'Board of Directors'), ('/about/governance/charter.html', 'Bylaws and Petitions'), ('/about/governance/committees.html', 'Committees'),
       ('/local-sections.html', 'Local Sections'), ('/about/governance/councilors.html', 'Council'), ('/technical-divisions.html', 'ACS Divisions'),
       ('/about/governance/elections.html', 'Elections'), ('/global/chapters.html', 'International Chapters')]  # the source's order (column pairs)
S.append('<p>Leadership at ACS</p>\n<h2>A society governed by its members</h2>\n<p>ACS isn\'t directed from the top down. Our future is shaped by scientists, volunteers, councilors, committees, and elected leaders working together.</p>\n'
         f'<p><em>{a("/about/governance.html", "Learn about governance")}</em></p>\n' + blk('cards links', [[f'<p>{a(h, t)}</p>'] for h, t in gov]) + '\n' + meta('grey'))
# 4 brands
br = [('acs-publications-hz-tagline-fullcolor-thumb.svg', 'https://pubs.acs.org', 'ACS Publications', 'Peer-reviewed journals delivering trusted chemistry research worldwide'),
      ('cas-fullcolor-thumb.svg', 'https://www.cas.org/', 'CAS', 'Curated chemical data, substances, and insights powering research, discovery, and innovation'),
      ('cen-black-thumb.svg', 'https://cen.acs.org/index.html', 'C&EN', 'Trusted news and insights covering the global chemistry community'),
      ('aact-fullcolor-thumb.svg', 'https://teachchemistry.org/', 'AACT', 'Resources, training, and community for K–12 chemistry educators')]
S.append(f'<p>{P("branded-macro-black-background.png")}</p>\n<h2>Powering scientific discovery</h2>\n<p>The ACS family advances science by connecting scientists around the world to trusted research, essential knowledge, and award-winning journalism.</p>\n'
         + blk('cards brands', [[f'<p>{P(i)}</p>', f'<h3>{a(h, t)}</h3><p>{html.escape(d)}</p>'] for i, h, t, d in br]) + '\n' + meta('dark'))
# 5 bento
S.append('<p>What We Do</p>\n<h2>Impact in action</h2>\n<p>Inspired by what we can achieve together, ACS helps people find the knowledge, resources, and community that move science forward.</p>\n'
         + blk('cards bento', [
             [f'<p>{P("advocacy-bento-png.webp")}</p>', f'<h3>{a("/policy.html", "Advocating for science")}</h3><p>ACS empowers scientists to advocate for research, education, and informed policy.</p><p>Explore ACS policy and advocacy</p>', f'<p>{P("card-bg-blue-3.svg")}</p>'],
             [f'<p>{P("supportscience-img-large-jpg.webp")}</p>', f'<h3>{a("/policy/support-science.html", "Support science")}</h3><p>ACS offers career resources, scholarships, and grants for chemists facing funding changes.</p><p>Explore resources</p>', f'<p>{P("card-bg-yellow-2.svg")}</p>'],
             ['', f'<h3>{a("/pressroom/newsreleases/2026.html", "News releases")}</h3><p>Get the latest ACS announcements, scientific breakthroughs, and chemistry news.</p>'],
             [f'<p>{P("card-bg-teal-1.svg")}</p>', f'<h3>{a("/about/inclusion.html", "Advancing ACS' core value of inclusion and belonging")}</h3><p>Learn how we support making science more accessible and inclusive for everyone.</p>']]))
# 6 people heading + strip + buttons (one section: the strip is part of the people band)
S.append('<p>The People Behind ACS</p>\n<h2>Thousands of perspectives, one shared purpose</h2>\n<p>ACS brings together people across disciplines, industries, career stages, and geographic boundaries — all connected by a common goal: advancing chemistry and its positive impact on the world.</p>')
S.append(blk('cards people', [[f'<p>{P(f"{i}-loop-about.png")}</p>'] for i in range(1, 13)]))
S.append(f'<p><strong>{a("/membership.html", "Explore membership")}</strong></p>\n<p><em>{a("/get-involved.html", "Get involved")}</em></p>')
# 9 callout
S.append('<p>Jobs at ACS</p>\n<h2>Find your place at ACS</h2>\n<p>Discover opportunities with a team dedicated to supporting science and the people who make it happen.</p>\n'
         f'<p><strong>{a("https://jobs.acs.org/", "View jobs at ACS")}</strong></p>\n' + meta('callout'))
# 10 history
S.append(blk('columns history', [[f'<p>{P("acs-history-png.webp")}</p>',
    '<h2>Our history</h2><p>Founded in 1876, the American Chemical Society began as a gathering of 35 chemists in New York City dedicated to advancing scientific knowledge and collaboration. Today, ACS is one of the world’s largest scientific societies, supporting research, education, policy, and industry across the globe.</p>'
    f'<p><strong>{a("/150.html", "Celebrate our 150th anniversary")}</strong></p><p><em>{a("/about/history.html", "Discover our history")}</em></p>']]) + '\n' + meta('lavender'))
# 11 ethical
S.append('<h3>Ethical commitments</h3>\n'
         f'<p><em>{a("/content/dam/acsorg/about/compliance/acs-supplier-contractor-code-conduct.pdf", "ACS' global supplier and contractor code of conduct (PDF)")}</em></p>\n'
         f'<p><em>{a("/content/dam/acsorg/about/compliance/acs-modern-slavery-statement.pdf", "ACS' modern slavery statement (PDF)")}</em></p>')
S.append('<div class="metadata">\n<div><div>title</div><div>About ACS</div></div>\n<div><div>nav</div><div>/drafts/nav</div></div>\n<div><div>footer</div><div>/drafts/footer</div></div>\n<div><div>description</div><div>ACS is one of the world’s largest scientific societies, dedicated to advancing scientific knowledge, empowering a global community, and championing scientific integrity.</div></div>\n</div>')
out = '<body>\n  <header></header>\n  <main>\n' + '\n'.join(f'<div>\n{x}\n</div>' for x in S) + '\n  </main>\n  <footer></footer>\n</body>\n'
open(D + 'acs-about.html', 'w').write(out)
# nav
L = '<li>' ; nav = ['<p><a href="/" aria-label="American Chemical Society">:acs-emblem::acs-wordmark:</a></p>',
  '<ul>' + ''.join(f'<li>{a(h, t)}</li>' for h, t in [('/events.html', 'Events'), ('/education.html', 'Education'), ('/careers.html', 'Careers'), ('/funding.html', 'Funding & Awards'), ('/get-involved.html', 'Get Involved'), ('/membership.html', 'Membership'), ('/about.html', 'About Us')]) + '</ul><p>:search:</p>',
  '<ul>' + ''.join(f'<li>{a(h, t)}</li>' for h, t in [('https://www.acs.org/', 'ACS'), ('https://pubs.acs.org', 'ACS Publications'), ('https://cen.acs.org', 'C&EN'), ('https://www.cas.org', 'CAS')]) + '</ul>'
  f'<p>{a("/donate.html", "Donate")}</p><p>{a("/login.html", "Log In")} :caret-down:</p><p><strong>{a("/membership.html", "Join ACS")}</strong></p>',
  f'<p>{a("/about.html", "About ACS")}</p><ul>' + ''.join(f'<li>{x}</li>' for x in [a('/about/governance.html', 'Governance') + ' :chevron-down:', a('/about/leadership.html', 'Leadership'), a('/about/financial.html', 'Financial') + ' :chevron-down:', a('/about/history.html', 'History'), a('/about/inclusion.html', 'Inclusion')]) + f'</ul><p><em>{a("https://jobs.acs.org/", "Jobs at ACS")}</em></p>']
open(D + 'nav.html', 'w').write('<body>\n  <header></header>\n  <main>\n' + '\n'.join(f'<div>\n{x}\n</div>' for x in nav) + '\n  </main>\n  <footer></footer>\n</body>\n')
# footer: the author draft, social icon names
f = open(D + 'footer.html').read()
for n in ['Facebook', 'Instagram', 'YouTube', 'LinkedIn']:
    f = re.sub(r'(title="Follow us on ' + n + r'">):icon:', r'\1:' + n.lower() + ':', f)
f = f.replace('</ul>\n<p>GET TO KNOW US', '</ul>\n</div>\n<div>\n<p>GET TO KNOW US')
f = f.replace('<li>Manage Cookies</li>', '<li><a href="#manage-cookies">Manage Cookies</a></li>')
open(D + 'footer.html', 'w').write(f)
print('ok', len(out))
