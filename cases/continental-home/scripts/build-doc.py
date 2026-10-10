# the document, nav and footer: author --draft-new's draft with the card-wide hrefs, the video section and the chrome put back
# (texts and hrefs from measure/content-1440.json; pictures the draft's own drafts/media URLs)
import sys
M = 'https://blocks-first--sdt-continental-lite--aemcoder-adobe.aem.page/drafts/media'
def pic(f): return f'<picture><img src="{M}/{f}" alt=""></picture>'
def doc(sections, meta=''):
    body = '\n'.join(f'<div>\n{s}\n</div>' for s in sections)
    return f'<body>\n  <header></header>\n  <main>\n{body}\n{meta}\n  </main>\n  <footer></footer>\n</body>\n'
def sm(style): return f'<div class="section-metadata"><div><div>style</div><div>{style}</div></div></div>'
def card(img, title, text, href, label):
    return f'<div><div><p>{pic(img)}</p></div><div><p><strong>{title}</strong></p><p>{text}</p><p><a href="{href}">{label}</a></p></div></div>'
AR = 'https://cdn.continental.com/fileadmin/__imported/sites/corporate/_international/english/hubpages/30_20investors/30_20reports/annual_20reports/downloads/annual-report-2025.pdf'
FB = 'https://cdn.continental.com/fileadmin/__imported/sites/corporate/_international/english/hubpages/30_20investors/30_20reports/fact_20book/downloads/2026_investor_presentation_factbook.pdf'
main = [
f'''<div class="carousel hero">
<div><div><p>{pic('csm-11411-contitech-keyvisual-lay-01-4-zu-3-576f608e21.jpg')}</p></div><div><h2>Continental Sells ContiTech to Lone Star Funds...</h2><p>...and will become a pure-play tire manufacturer</p><p><strong><a href="/en/press/press-releases/continental-ct-2026/">Read the press release</a></strong> <strong><a href="/en/press/studies-publications/contitech/">All materials on the topic</a></strong></p></div></div>
<div><div><p>{pic('csm-2025-geschaeftsbericht-cover-be01b5aafc.png')}</p></div><div><h2>Results Q2 2026</h2><p>Continental Enters Final Phase of Realignment with Strong Second Quarter.</p><p><strong><a href="/en/press/press-releases/results-first-half-2026/">Find out more</a></strong></p></div></div>
</div>''',
f'''<h1><strong>Welcome</strong> to Continental</h1>
<p>Continental is a leading tire manufacturer and industry specialist that develops and produces sustainable, safe and convenient solutions for automotive manufacturers as well as industrial and end customers worldwide. <a href="/en/press/studies-publications/figures-data-facts/">Learn more</a></p>
<div class="columns teaser">
<div><div><p>{pic('csm-geschaeftsbericht-2025-titel-dina4-srgb-rz02-en-608643d2b0.jpg')}</p><p>The 2025 annual report covers topics such as corporate strategy and structure, research and development, as well as general economic conditions.</p><p><a href="{AR}">Find out more</a></p></div><div><p><a href="https://charts3.equitystory.com/teaser-t1/continental-ag-v31/English/">https://charts3.equitystory.com/teaser-t1/continental-ag-v31/English/</a></p><p><strong><a href="/en/investors/shares/share-price-chart/">Share Price Chart</a></strong></p></div></div>
</div>''',
f'''<p>{pic('the-garage-5-hintergrund-1.jpg')}</p>
<p>The Continental Tires Garage</p>
<h2>Two Wheels, One Passion: What Makes a Good Bicycle Tire?</h2>
<div class="columns video">
<div><div><p>{pic('640.jpg')}</p><p>© Continental AG</p></div><div><p>In Episode 5, “Two Wheels, One Passion,” we take a closer look at the technologies behind a bicycle tire and how they contribute to safety, grip, efficiency, and performance. Together with our expert and product manager for bicycle tires, Oliver Vauth, host Daniel Holzberg explores why bicycle tires are significantly more complex than they appear at first glance. Through small experiments and real-world comparisons, Oliver and Daniel explain how modern rubber compounds influence grip, rolling resistance, and durability; why puncture protection requires more than just thicker rubber; and how we leverage our decades of tire expertise across various mobility segments.</p><p>Please find here all episodes of the new season <strong><a href="/en/press/media-library/the-continental-tires-garage/">“The Continental Tires Garage”</a></strong></p></div></div>
</div>
''' + sm('bg-image, garage'),
f'''<h2>Career at Continental</h2>
<p>Shaping the future of mobility is not easy. But it gets easier when the right talents are on board. Only together can we develop solutions that make tomorrow even safer, more comfortable, and more sustainable.</p>
<div class="cards">
{card('csm-csm-materialentwicklung-leistungen-zur-gesundheitsfoerderung-9ae2e4636d-b32bccaacc.jpg', 'What We are Working on', 'The areas of work in which Continental’s innovations have a global impact are diverse. Find out what we’re working on.', '/en/career/what-we-are-working-on/', 'Find out more')}
{card('csm-working-at-continental-lunch-networking-300a262bd1.jpg', 'Working at Continental', 'Discover Continental as an employer and find out about the corporate culture, career opportunities and other benefits.', '/en/career/working-at-continental/', 'Find out more')}
{card('csm-overall-hr-visual-kopie1-b5be3fe100.png', 'Our Range of Jobs', 'The day-to-day work of our experts ensures that innovations can be created. Discover of our diverse professional fields of work.', '/en/career/our-range-of-jobs/', 'Find out more')}
</div>''',
f'''<p>{pic('coast-road-v2.jpg')}</p>
<h2>Sustainability at Continental</h2>
<p>Turn change into opportunity. Embrace sustainability. This is how we have anchored sustainability in our Group strategy. Learn more about our sustainability roadmap and how we continuously implement it.</p>
<p><strong><a href="/en/sustainability/reporting-and-downloads/">Find out more</a></strong></p>
<div class="cards facts">
<div><div><p><strong>Greenhouse gas intensity:</strong></p><p>0.20</p><p><strong>t CO₂e per ton</strong><br>GHG intensity related to production in the tire business in fiscal year 2025 (in gross GHG relative Scope 1 and market‑based Scope 2)</p></div></div>
<div><div><p><strong>Resource use:</strong></p><p>28.1</p><p><strong>Percent</strong><br>Share of purchased renewable and recycled production materials in tires in fiscal year 2025</p></div></div>
<div><div><p><strong>Representation of diversity:</strong></p><p>8.1</p><p><strong>%-points</strong><br>Delta between the share of women in management positions and the share of women among non‑manual workers (excl. USA), in percentage points as of December 31, 2025</p></div></div>
</div>
''' + sm('bg-image'),
f'''<h2>Continental in Facts and Figures</h2>
<div class="cards">
{card('csm-2026-factbook-cover-3d201d59fe.png', 'Investor Presentation June 2026 (Fact Book 2025)', "Detailed figures and information on Continental's transformation as well as on the Group Sectors Tires and ContiTech.", FB, 'Investor presentation - PDF (8.9 MB)')}
{card('csm-roland-welzbacher-finanzzahlen-2026-q2-statement-9a6d6bad88.jpg', 'Continental Enters Final Phase of Realignment with Strong Second Quarter', '<strong>August 04, 2026</strong> Continental continued its positive momentum in the second quarter of 2026. The Tires group sector achieved good results with an adjusted EBIT margin exceeding the guidance for the current fiscal year. As expected, ContiTech ended the quarter with a solid performance. Adjusted free cash flow was also significantly higher than in the previous year. These improvements were driven primarily by a higher share of tires measuring 18 inches and above, continued positive effects from raw-material prices, lower impacts from exchange rates and tariffs as well as strict cost discipline.', '/en/press/press-releases/results-first-half-2026/', 'Find out more')}
{card('csm-geschaeftsbericht-2025-titel-screen-1920x1080px-srgb-rz01-ohne-head-2bde4bd4e8.jpg', '2025 Annual Report: Charting New Paths.', 'The 2025 annual report covers topics such as corporate strategy and structure, research and development, as well as general economic conditions.', AR, 'Find out more')}
</div>''',
'''<p><strong>Follow us on</strong></p>
<ul><li><a href="https://www.facebook.com/Continental">:facebook: Facebook</a></li><li><a href="https://www.tiktok.com/@continental">:tiktok: TikTok</a></li><li><a href="https://www.youtube.com/c/ContinentalCorporation">:youtube: Youtube</a></li><li><a href="https://www.instagram.com/continental_career/">:instagram: Instagram</a></li><li><a href="https://www.linkedin.com/company/continental">:linkedin: LinkedIn</a></li><li><a href="https://www.glassdoor.com/Overview/Working-at-Continental-EI_IE3768.11,22.htm">:glassdoor: Glassdoor</a></li><li><a href="/en/general/rss/">:rss: RSS</a></li></ul>
''' + sm('social'),
]
meta = '''<div>
<div class="metadata">
<div><div>title</div><div>Home | Continental - Continental AG</div></div>
<div><div>description</div><div>Our Goal: Healthy Mobility - clean, safe and connected. Our heart beats for this. Learn more about it on our homepage.</div></div>
<div><div>nav</div><div>/drafts/nav</div></div>
<div><div>footer</div><div>/drafts/footer</div></div>
</div>
</div>'''
nav = [
'<p><a href="/en/" title="Continental AG">:continental-logo: :continental-tagline:</a></p>',
'<ul><li><a href="/en/press/">Press</a></li><li><a href="/en/career/">Careers</a></li><li><a href="/en/investors/">Investors</a></li><li><a href="/en/sustainability/">Sustainability</a></li><li><a href="/en/products-and-solutions/">Products &amp; Solutions</a></li><li><a href="/en/company/">Company</a></li><li><a href="/en/stories/">Stories</a></li></ul>',
'<p><a href="/en/country-selector/">:globe: Global</a></p>\n<p>EN :chevron-down:</p>\n<p>Search :search:</p>\n<p>:download-single:</p>',
]
footer = [
'<p><strong>Contact Us</strong></p>\n<ul><li><a href="/en/press/press-contacts/">Press</a></li><li><a href="/en/career/contact-faqs/contact/">Jobs &amp; Careers</a></li><li><a href="/en/investors/ir-contact/">Investor Relations</a></li><li><a href="/en/general/sustainability-contact-form/">Sustainability</a></li><li><a href="/en/general/products/">Products</a></li><li><a href="/en/general/contact-suppliers/">Suppliers</a></li><li><a href="/en/company/corporate-governance/integrity-hotline/">Integrity Hotline</a></li></ul>',
'<p><strong>Quick Access</strong></p>\n<ul><li><a href="/en/investors/reports-presentations/">Financial Reports</a></li></ul>',
'<p><strong>Websites</strong></p>\n<ul><li><a href="https://www.continental-industry.com/">ContiTech :link-external:</a></li><li><a href="https://www.continental-tires.com/">Tires :link-external:</a></li></ul>',
'<p><strong>Terms &amp; Conditions</strong></p>\n<ul><li><a href="/en/general/site-notice/">Site Notice</a></li><li><a href="/en/general/legal-notice/">Legal Notice</a></li><li><a href="/en/general/data-protection/">Data Protection</a></li><li><a href="/en/general/cookie-policy/">Cookie Policy</a></li></ul>',
'<p>© 2026 Continental AG</p>',
]
d = sys.argv[1]
open(f'{d}/continental-home.html', 'w').write(doc(main, meta))
open(f'{d}/nav.html', 'w').write(doc(nav))
open(f'{d}/footer.html', 'w').write(doc(footer))
