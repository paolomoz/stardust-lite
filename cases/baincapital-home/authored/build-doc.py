# build-doc.py — author the DA documents for /drafts/home, /drafts/nav, /drafts/footer from the measured content.
import json, html
E = html.escape
CDN = 'https://cdn-east2.baincapital.com'
BC = 'https://www.baincapital.com'
def img(src, alt=''): return f'<p><img src="{E(src)}" alt="{E(alt)}"></p>'
def block(name, rows):
    out=[f'<div class="{name}">']
    for r in rows:
        out.append('<div>'+''.join(f'<div>{c}</div>' for c in r)+'</div>')
    out.append('</div>'); return '\n'.join(out)
def section(inner, style=None):
    sm = block('section-metadata', [['style', style]]) if style else ''
    return '<div>\n'+inner+'\n'+sm+'\n</div>'

# ---------- home ----------
secs=[]
# 1 hero
hero_rows=[
 ['<h1>Embrace possibility,<br><em>realize potential</em></h1>'],
 ['<p>Who we are</p>', '<p>Bain Capital is a global private investment firm that partners differently to unlock opportunity and help people and companies <em>create exceptional outcomes</em>.</p>',
  img(f'{CDN}/2024-11/slide-1-triangle1.jpg?VersionId=UwG0Q8O0GUt0Ow2qbfA9biar0_8JdaMt','')+img(f'{CDN}/2024-11/slide-1-triangle-2_0.jpg?VersionId=0HQJ9Z55DkpewFx8B.uPFqnisCxz_O0N','')+img(f'{CDN}/2024-11/slide-1-triangle-3.jpg?VersionId=CIh23PhC87k6b_qz2zcOGumnYg.bf17_','')],
 ['<p>How we’re different</p>', '<p>We invest in what could be. Through <em>cross-platform collaboration</em>, we connect deep and diverse vertical and regional expertise to deliver unconventional insight.</p><p><a href="https://player.vimeo.com/video/1027828847">See our approach in action</a></p>',
  img(f'{CDN}/2024-11/bc24-home-advantages-v4.jpg?VersionId=idc_E_4iXrh3LMExT4nM4W1.ZWBxxjOv','')+img(f'{CDN}/2024-11/bc24-home-advantages-v11.jpg?VersionId=6He1TFvAkPZtHpJf.iyEaeivUJtHfmvw','')],
 ['<p>A rewarding career</p>', '<p>As a member of our team, you can accelerate your professional growth with supportive leaders who invest in you. <em>Discover your opportunity</em> at Bain Capital.</p><p><a href="/careers">Fulfill your potential</a></p>',
  img(f'{CDN}/2026-06/bc26-home-career-v2.jpg?VersionId=kBQ2sF6Pa5VWW3TXH.hIVnqmdY9r7Nkp','')+img(f'{CDN}/2026-06/bc26-home-career-v2_0.jpg?VersionId=HJ6zLY6uOKv5xdsngFQCMqGe.NTTm_lr','')],
]
secs.append(section(block('bain-hero', hero_rows), 'backdrop-cream'))
# 2 advantages
adv=[
 (f'{CDN}/Casestudy/bc_partnering-differently-v2_1.jpg?VersionId=9Hl3LE9EqU2JNgrqFEbffoqqfEwFzhBC','https://player.vimeo.com/video/1026850835','How we partner differently','Partnering differently','We partner differently, building enduring relationships, collaborating across our platform, and focusing on value creation to achieve better outcomes.'),
 (f'{CDN}/Casestudy/bc_unlocking_opportunity.jpg?VersionId=CdOfJe3e8tnJTu3m7p3LsIXNv3YKxztz','https://player.vimeo.com/video/1026850705','How we unlock opportunity','Unlocking opportunity','We bring together diverse perspectives in pursuit of transformative ideas. Through our collaborative culture, we connect insights to unlock potential.'),
 (f'{CDN}/Casestudy/bc_creating_exceptional_outcomes.jpg?VersionId=i6gHZ.SQqM2Ix9Z2tlfLFZ_Il9Ntg.Aq','https://player.vimeo.com/video/1026850567','How we strive to create exceptional outcomes','Creating exceptional outcomes','We strive for exceptional outcomes by supporting people and bolstering investment performance. We continuously challenge ourselves to find the best answer.'),
]
adv_rows=[[img(p)+f'<p><a href="{E(v)}">{E(l)}</a></p>', f'<h3>{E(t)}</h3><p>{E(d)}</p>'] for p,v,l,t,d in adv]
secs.append(section('<h2>Turning insights into advantages</h2>\n<p>We are committed to the value-creation journey, from initial idea to lasting impact.</p>\n'+block('bain-advantages', adv_rows), 'band-first, backdrop-lightblue, title-xl'))
# 3 platform
plat=[
 ('Private Equity','Transforming businesses through deep sector expertise and capabilities.',[('Global Private Equity','https://www.baincapitalprivateequity.com/'),('Double Impact','https://www.baincapitaldoubleimpact.com/'),('Insurance','https://www.baincapitalinsurance.com/')]),
 ('Growth & Venture','Accelerating seed-to-scale growth in partnership with visionary leaders.',[('Ventures','/ventures'),('Life Sciences','https://www.baincapitallifesciences.com/'),('Tech Opportunities','https://www.baincapitaltechopportunities.com/'),('Crypto','/crypto')]),
 ('Capital Solutions','Structuring bespoke solutions across asset types, industries, markets, and business life cycles.',[('Special Situations','https://baincapitalspecialsituations.com/')]),
 ('Credit','Enabling investment opportunities through rigorous analysis and solutions spanning the credit spectrum.',[('Credit','https://www.baincapitalcredit.com/')]),
 ('Real Assets','Building the next generation of real assets.',[('Real Estate','https://www.baincapitalrealestate.com/'),('Special Situations','https://baincapitalspecialsituations.com/')]),
]
plat_rows=[[f'<p>{E(n)}</p>', f'<p>{E(d)}</p>', '<ul>'+''.join(f'<li><a href="{E(h)}">{E(t)}</a></li>' for t,h in links)+'</ul>'] for n,d,links in plat]
secs.append(section('<h2>Our integrated platform</h2>\n<p>Over four decades, we have strategically grown our business and expanded our focus to address an increasingly complex investment landscape.</p>\n'+block('bain-platform', plat_rows), 'band, backdrop-navy, dark'))
# 4 spotlight
spot=[
 (f'{CDN}/styles/optimize_image/s3/2026-05/investment-spotlight-indus-v2.jpg?VersionId=W97LVmKXPa5vxwqdYWc73ULDFsX_M5DI&itok=G04BvGvt','Bain Capital Industrials','Industrials','Partnering for a new industrial era','https://baincapitalindustrials.com/'),
 (f'{CDN}/styles/optimize_image/s3/2024-11/investment-spotlight-health-v2.png.jpg?VersionId=YYzyulpCTMTsal.TUBXD4K5nHZlxFfRD&itok=Dj5x_MR9','Bain Capital Healthcare','Healthcare','Building great companies to serve patients','https://www.baincapital.com/healthcare/'),
 (f'{CDN}/styles/optimize_image/s3/2024-11/investment-spotlight-tech-v2.jpg?VersionId=ZneUgARdepaVedhzfoJKX40ThAnfvUvk&itok=hLv8UoXG','Bain Capital Technology','Technology','Leading companies into the future','https://www.baincapital.com/technology/'),
]
spot_rows=[[img(s,a), f'<p>{E(tag)}</p><h3><a href="{E(h)}">{E(t)}</a></h3>'] for s,a,tag,t,h in spot]
secs.append(section('<h2>Vertical spotlight</h2>\n'+block('bain-spotlight', spot_rows), 'band, backdrop-navy, dark'))
# 5 commitments (esg)
esg=[
 (f'{CDN}/styles/optimize_image/s3/2026-06/bcsi26-cover_0.jpg?VersionId=2gRUnupJW4mJ.R75B8knywwg7aA9XY5n&itok=fahndAo7','Sustainable growth and innovation','',f'{CDN}/2026-07/Bain-Capital-Sustainability-Report-June2026_1.pdf','2026 Sustainability Report',True),
 (f'{CDN}/styles/optimize_image/s3/2026-06/bcsi26-engaged-governance-and-stewardship-home-v2.jpg?VersionId=EfwWUZVGB9VNRrMvnWowAoyYIexcDxC_&itok=BCNSXPL6','Active governance & stewardship','To promote active and engaged governance, holding ourselves accountable for driving value with high integrity in partnership with our portfolio companies',f'{BC}/sustainability-and-impact/active-governance-and-stewardship','Explore Commitment',False),
 (f'{CDN}/styles/optimize_image/s3/2026-06/bcsi26-sustainable-growth-and-resilience_0.jpg?VersionId=AkidwCANSOY_8BhgLoIYCunIbWoUyG7H&itok=oIQirB8b','Sustainable growth & reducing climate impact','To reduce emissions and improve resource efficiency, embedding sustainability into our companies and rigorously measuring the resulting impact over time',f'{BC}/sustainability-and-impact/sustainable-growth-reducing-climate-impact','Explore Commitment',False),
 (f'{CDN}/styles/optimize_image/s3/2026-06/bcsi26-future-ready-teams_0.jpg?VersionId=l1LwLvjFYGQeEZihCxsuKaZB.fdPR2LB&itok=57sFAVqd','Fair employment, engagement & well-being','To treat employees with fairness and respect, building an environment and culture that at its core promotes employee safety, well-being, and engagement',f'{BC}/sustainability-and-impact/fair-employment-engagement-well-being','Explore Commitment',False),
 (f'{CDN}/styles/optimize_image/s3/2026-06/bcsi26-opportunity-inclusion_0.jpg?VersionId=JgEL17IOlfviDDH00XnWegFZfJWeI_Nx&itok=wepWRXxp','Opportunity & inclusion','To be champions of diversity and inclusion and to drive meaningful progress by cultivating a high-performance culture',f'{BC}/sustainability-and-impact/opportunity-and-inclusion','Explore Commitment',False),
 (f'{CDN}/styles/optimize_image/s3/2025-06/bcsi25-diversity-equity-inclusion-community_0.jpg?VersionId=WMV6lygzLpeLKjOACHkW46qKy_TZKY.N&itok=MI_lhCN7','Community engagement','To encourage and support our companies’ efforts to engage and contribute to their communities, locally and across the globe',f'{BC}/sustainability-and-impact/community-engagement','Explore Commitment',False),
]
esg_rows=[[img(s,t), f'<h4>{E(t)}</h4>'+(f'<p>{E(d)}</p>' if d else '')+f'<p>{"<strong>" if strong else ""}<a href="{E(h)}">{E(l)}</a>{"</strong>" if strong else ""}</p>'] for s,t,d,h,l,strong in esg]
secs.append(section('<h2>Sustainability &amp; Impact</h2>\n<p>Integrating sustainability across our portfolios furthers positive, long-term impacts on our environment and society.</p>\n<p><strong><a href="/sustainability-and-impact">Explore Sustainability &amp; Impact at Bain Capital</a></strong></p>\n<h3>Our core sustainability commitments</h3>\n'+block('bain-commitments', esg_rows), 'band-tail, backdrop-cream'))
# 6 people
people_rows=[
 [img(f'{CDN}/2024-11/outcome-bg.jpg?VersionId=mScHUJgF3_eObdpuFmmcoI0vLQk6tSGH','')],
 ['<h2>Great outcomes come from <em>great teams</em></h2><p>We challenge each other to think and work differently to create meaningful and lasting impact.</p><p><a href="https://www.baincapital.com/people">Meet our people</a></p>'],
 ['<p><a href="https://www.baincapital.com/people/chris-gordon">Chris Gordon</a></p>','<p>Partner</p>','<p>Private Equity</p>'],
 ['<p><a href="https://www.baincapital.com/people/paul-moskowitz">Paul Moskowitz</a></p>','<p>Partner</p>','<p>Private Equity</p>'],
]
secs.append(section(block('bain-people', people_rows), 'band, backdrop-photo, dark'))
# 7 news
news=[
 ('Press Releases','Special Situations','September 28, 2026','AAR accelerates its aftermarket platform strategy by agreeing to acquire a controlling interest in MRO Holdings','/news/aar-accelerates-its-aftermarket-platform-strategy-agreeing-acquire-controlling-interest-mro-holdings', f'{CDN}/News/Screenshot%202026-09-28%20181028.png'),
 ('Press Releases','Double Impact','September 22, 2026','Announcement of Sale of SOLitude Lake Management, LLC to Bain Capital','/news/announcement-sale-solitude-lake-management-llc-bain-capital',''),
 ('Press Releases','Real Estate','September 21, 2026','BlueWater Marinas and Bain Capital Acquire Mystic River Marina in Mystic, CT, and Ripley Light Drystack Marina in Charleston, SC','/news/bluewater-marinas-and-bain-capital-acquire-mystic-river-marina-mystic-ct-and-ripley-light-drystack-marina',''),
 ('Press Releases','Credit','August 27, 2026','Bain Capital’s Private Credit Group Announces $6 Billion of Financing Investments for First Half 2026','/news/bain-capitals-private-credit-group-announces-6-billion-financing-investments-first-half-2026',''),
 ('Press Releases','Tech Opportunities','August 27, 2026','RQD* Clearing Secures $74 Million Strategic Growth Investment Led by Bain Capital','/news/rqd-clearing-secures-74-million-strategic-growth-investment-led-bain-capital',''),
]
news_rows=[[ (img(im,'') if im else '')+f'<p>{E(tag)}</p><p>{E(topic)}</p><p>{E(date)}</p>', f'<p><a href="{E(h)}">{E(t)}</a></p>'] for tag,topic,date,t,h,im in news]
news_rows.append(['<p><a href="https://www.baincapital.com/news">See all news</a></p>'])
secs.append(section('<h2>Latest news</h2>\n'+block('bain-news', news_rows), 'band, backdrop-cream'))
# 8 presence
off=json.load(open('.work/live/offices.json'))
def office_cell(o):
    h=f'<h4>{E(o["city"])}</h4>' + (f'<p><em>{E(o["title"])}</em></p>' if o['title'] else '')
    h+='<p>'+'<br>'.join(E(l) for l in o['lines'])+'</p>'
    if o['map']: h+=f'<p><a href="{E(o["map"])}">Google Maps</a></p>'
    return h
pres_rows=[[img('/drafts/media/world-map.png','World map with Bain Capital office locations')+img('/drafts/media/world-map-wide.png','')+img('/drafts/media/world-map-mobile.png','')]]
pres_rows.append(['<h2>Our global presence</h2>'])
for label,rid in (('Americas','4'),('Asia','3'),('Europe','2')):
    pres_rows.append([f'<p>{E(label)}</p>']+[office_cell(o) for o in off[rid]])
secs.append(section(block('bain-presence', pres_rows), 'band-open, backdrop-blue, dark'))
# metadata
meta=block('metadata',[['title','Bain Capital | Global Private Investment Firm'],['description','Bain Capital is a global private investment firm that partners differently to unlock opportunity and help people and companies create exceptional outcomes.'],['template','home'],['nav','/drafts/nav'],['footer','/drafts/footer']])
secs.append('<div>\n'+meta+'\n</div>')
home='<body>\n<header></header>\n<main>\n'+'\n'.join(secs)+'\n</main>\n<footer></footer>\n</body>\n'
open('.work/author/home.html','w').write(home)
# ---------- nav ----------
nav='''<body>
<header></header>
<main>
<div>
<p><a href="/">Bain Capital</a></p>
</div>
<div>
<ul>
<li><a href="/about-us">About Us</a></li>
<li><a href="https://www.baincapital.com/#ourintegratedplatform">Businesses</a></li>
<li><a href="/sustainability-and-impact">Sustainability &amp; Impact</a></li>
<li><a href="/people">People</a></li>
<li><a href="/careers">Careers</a></li>
<li><a href="/news">News</a></li>
</ul>
</div>
<div>
<ul>
<li><a href="https://services.dataexchange.fiscloudservices.com/Document/2449254">Investor Login</a></li>
<li><a href="/locations">Locations</a></li>
<li><a href="/search">Search</a></li>
</ul>
</div>
</main>
<footer></footer>
</body>
'''
open('.work/author/nav.html','w').write(nav)
footer='''<body>
<header></header>
<main>
<div>
<p>© 2012-2026 Bain Capital, LP. The Bain Capital square symbol is a trademark of Bain Capital, LP All Rights Reserved.</p>
<ul>
<li><a href="https://www.baincapital.com/privacy-policy">Privacy Policy</a></li>
<li><a href="https://www.baincapital.com/terms-use">Terms of Use</a></li>
<li><a href="https://www.baincapital.com/regulatory-disclosures">Regulatory Disclosures</a></li>
<li><a href="https://www.baincapital.com/fraud-and-cybersecurity-warning">Fraud and Cybersecurity Warning</a></li>
<li><a href="https://www.baincapital.com/fraud-and-cybersecurity-warning-chinese">警告：网络欺诈及网络钓鱼</a></li>
<li><a href="https://www.baincapital.com/fraud-and-cybersecurity-warning-spanish">Fraude y advertencia de ciberseguridad</a></li>
</ul>
</div>
<div>
<ul>
<li><a href="https://www.linkedin.com/company/bain-capital">LinkedIn</a></li>
<li><a href="https://twitter.com/baincapital?lang=en">Twitter</a></li>
</ul>
</div>
</main>
<footer></footer>
</body>
'''
open('.work/author/footer.html','w').write(footer)
print('home', len(home), 'bytes; sections', home.count('<div class="section-metadata">')+1)
