// build-doc.mjs — generates the three authored documents (home, nav, footer) from the step-2 triage table.
// Texts come from the content dump (measure/content-1440.json) and the hidden-state dumps (measure/*.txt); nothing is copied from
// the source DOM structure. Run: node doc/build-doc.mjs  → doc/home.html, doc/nav.html, doc/footer.html
import { readFileSync, writeFileSync } from 'node:fs';

const M = 'https://blocks-first--sdt-hiltongrandvacations--aemcoder-adobe.aem.page/drafts/media/';
const S = 'https://www.hiltongrandvacations.com';
const dump = JSON.parse(readFileSync(new URL('../measure/content-1440.json', import.meta.url), 'utf8'));
const texts = []; const walk = (n) => { if (!n || typeof n !== 'object') return; if (Array.isArray(n)) return n.forEach(walk); if (typeof n.text === 'string') texts.push(n); walk(n.children); }; walk(dump.main);
// a text from the capture, by prefix: markup when the dump kept inline formatting, else the text (never typed from memory)
const T = (prefix) => { const n = texts.find((t) => t.text.startsWith(prefix)); if (!n) throw new Error(`not in capture: ${prefix}`); return (n.markup || n.text).replace(/<!---->/g, '').replace(/ class="[^"]*"/g, '').replace(/ target="_self"/g, '').replace(/\s+/g, ' ').trim(); };
const abs = (html) => html.replace(/href="\//g, `href="${S}/`);

const pic = (file, alt = '') => `<picture><img src="${M}${file}" alt="${alt.replace(/"/g, '&quot;')}"></picture>`;
const sec = (inner, style, extra = '') => `<div>${inner}${style || extra ? `<div class="section-metadata">${style ? `<div><div>style</div><div>${style}</div></div>` : ''}${extra}</div>` : ''}</div>`;
const block = (name, rows) => `<div class="${name}">${rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('')}</div>`;
const link = (href, text) => `<a href="${href.startsWith('http') ? href : S + href}">${text}</a>`;
const primary = (href, text) => `<p><strong>${link(href, text)}</strong></p>`;
const secondary = (href, text) => `<p><em>${link(href, text)}</em></p>`;

/* ---------------- home ---------------- */
// the hero is default content (D1): two posters, the player link and the headline; scripts.js buildAutoBlocks folds the first section
// (h1 + pictures + a player link) into the `hero video` block — the Block Collection hero auto-block pattern
const hero = `<p>${pic('hero-poster-1440.png', 'A resort suite living room with a ceiling fan and a view of the ocean')}</p><p>${pic('hero-poster-360.png', 'A resort marina at dusk')}</p>`
  + `<p><a href="https://player.vimeo.com/video/923348410?h=1f2258775d">Hilton Grand Vacations hero video</a></p>`
  + `<h1>Experience the Difference With<br>Hilton’s <strong>Exclusive Timeshare Brand</strong></h1>${primary('/en/discover-hilton-grand-vacations', 'Discover the Difference')}<p>Scroll to Explore</p>`;

const intro = `<h2>${T('Timeshare membership with Hilton Grand Vacations')}</h2>`
  + block('columns intro', [[
    `<p>${T('See how vacation membership works.')}</p>${secondary('/en/discover-hilton-grand-vacations/how-membership-works', 'How it Works')}`,
    `<p>${T('Begin your vacation membership journey.')}</p>${secondary('/en/discover-hilton-grand-vacations/vacation-offers', 'Vacation Offers')}`,
  ]])
  + `<p>${abs(T('Already purchased a vacation package?'))}</p>`;

const ticker1 = block('ticker', [
  ['<p>200</p>'], [`<p>${T('Global Resorts')}</p>`], [`<p>${T('Members can enjoy stays at more than 200')}</p>`],
  [secondary('/en/resorts-and-destinations', 'Explore Destinations')],
  [`<p>${pic('global-map-with-apac.avif', 'Graphic map with locations of Hilton Grand Vacations resorts around the world')}</p>`],
]);

const tab = (label, file, alt, title, tags, body, href, cta) => [label, `<p>${pic(file, alt)}</p><h3>${title}</h3><p>${tags}</p><p>${body}</p><p>${link(href, cta)}</p>`];
const tabs = '<p>Trending Destinations</p>' + block('tabs', [
  tab('Hawaii', 'gettyimages-155600390.avif', 'Hawaii', T('Put your cell phone on island mode in Hawaii'), 'Beaches | Tropical | Coastal', T('Make yourself at home on the Big Island'), '/en/resorts-and-destinations/hawaii', 'Explore Hawaii'),
  tab('Florida', 'fl-orlando-ext-lifestyle-thmpk-2020-006-edited.avif', 'Florida', 'Endless Possibilities for Family-Friendly Fun', 'Coastal | Tropical | Beaches', 'There’s no shortage of places to stay with our wide collection of Florida timeshare resorts, where you’ll feel at home with plenty of space to fit your family-sized vacation.', '/en/resorts-and-destinations/florida', 'Explore Florida'),
  tab('Las Vegas', 'gettyimages-577308536.avif', 'Las Vegas', 'Adventure on and beyond the Las Vegas Strip', 'Desert | City | Mountain', 'Find your new favorite resort in The City That Never Sleeps. Indulge in the glitz and glamor of world-renowned dining, gaming and live entertainment experiences.', '/en/resorts-and-destinations/las-vegas', 'Explore Las Vegas'),
]);

const points = T('15,000 Hilton Honors Points');
const offer = (file, alt, banner, eyebrow, title, price, retail, href) => [
  `<p>${pic(file, alt)}</p>`,
  `${banner ? `<p><em>${banner}</em></p>` : ''}${eyebrow ? `<p>${eyebrow}</p>` : ''}<h3>${title}</h3><p><strong>${price}</strong>${retail ? ` Retail Value Up To ${retail}` : ''}</p><p>${points}</p>${primary(href, 'Explore Offers')}<p>Terms and Conditions apply.</p>`,
];
const offers = block('carousel offers', [
  offer('destination-orlando-778x584.avif', 'Orlando', 'Best Seller', 'Save Now. Travel Later.', '3 NIGHTS IN Orlando', '$249 /STAY', '$708', '/en/discover-hilton-grand-vacations/vacation-offers#destination-offer--orlando'),
  offer('destination-lasvegas-778x584.avif', 'Las Vegas', 'Best Seller', 'Save Now. Travel Later.', '3 NIGHTS IN Las Vegas', '$249 /STAY', '$915', '/en/discover-hilton-grand-vacations/vacation-offers#destination-offer--lasvegas'),
  offer('destination-myrtle-beach-632x478.avif', 'Myrtle Beach', 'Best Seller', 'Save Now. Travel Later.', '3 NIGHTS IN Myrtle Beach', '$299 /STAY', '$957', '/en/discover-hilton-grand-vacations/vacation-offers#destination-offer--myrtlebeach'),
  offer('gatlinburg-featured-offer-card-vacation-offers-page.avif', 'Red rock mountains near Sedona', '', 'Save Now. Travel Later.', '3 NIGHTS IN Gatlinburg', '$299 /STAY', '$1,008', '/en/discover-hilton-grand-vacations/vacation-offers#destination-offer--gatlinburg'),
  offer('visit-a-top-destination-featured-offer-card-vacation-offers-page.avif', 'Two lounge chairs beneath an umbrella on a beach', 'Save Now. Travel Later.', '', T('Visit A Top Destination For Less'), '$249 /STAY', '', '/en/discover-hilton-grand-vacations/vacation-offers'),
]);

const resort = (file, alt, name, sub, loc, href) => [`<p>${pic(file, alt)}</p>`, `<h3>${name}</h3><p>${sub}</p><p>${loc}</p><p>${link(href, 'Explore Resort')}</p>`];
const resorts = `<h2>${T('World-Class Resorts That')}</h2><p>${T('Enjoy Studios and multi-bedroom Suites')}</p>`
  + block('carousel coverflow', [
    resort('nv-ela-ext-aerial-2025-005-compressed.avif', 'Elara, Las Vegas, Nevada', 'Elara', 'A Hilton Grand Vacations Club', 'Las Vegas, Nevada', '/en/resorts-and-destinations/las-vegas/elara-a-hilton-grand-vacations-club'),
    resort('ny-thc-ext-2004-003-compressed.avif', 'The Hilton Club, New York, New York', 'The Hilton Club', 'New York', 'New York, New York', '/en/resorts-and-destinations/new-york/the-hilton-club-new-york'),
    resort('hi-gwa-ext-2008-001.avif', 'Grand Waikikian, Waikiki Beach, Oahu', 'Grand Waikikian', 'A Hilton Grand Vacations Club', 'Waikiki Beach, Oahu', '/en/resorts-and-destinations/hawaii/grand-waikikian-a-hilton-grand-vacations-club'),
    resort('orlsw-ext-pool-2024-003.avif', 'SeaWorld Orlando, Orlando, Florida', 'SeaWorld Orlando', 'A Hilton Grand Vacations Club', 'Orlando, Florida', '/en/resorts-and-destinations/florida/seaworld-orlando-a-hilton-grand-vacations-club'),
    resort('nv-fla-ext-pc-2018-001-compressed.avif', 'Flamingo, Las Vegas, Nevada', 'Flamingo', 'A Hilton Grand Vacations Club', 'Las Vegas, Nevada', '/en/resorts-and-destinations/las-vegas/flamingo-a-hilton-grand-vacations-club'),
  ]);

const heritage = `<p>${pic('hilton-logo-black.avif', 'Hilton')}</p><h2>${T('105+ Years of Excellence')}</h2><p>${T('As part of the Hilton portfolio')}</p>`;

const quote = (file, alt, text, name, since, href) => [`<p>${pic(file, alt)}</p>`, `<p>${text}</p><p><strong>${name}</strong><br>${since}</p><p>${link(href, 'Read Article')}</p>`];
const stats = block('ticker', [
  ['<p>720,000</p>'], [`<p>${T('Travel enthusiasts')}</p>`], [`<p>${T('Join a community of over')}</p>`],
  [primary('/en/discover-hilton-grand-vacations', 'Explore Membership')],
]) + block('cards quotes', [
  quote('mike-and-deanna-o.avif', 'Deanna & Mike O.', T('“This was our first experience with timeshare'), 'Deanna & Mike O.', 'Members Since 2019', '/en/getaway-guide/article/2023/07/why-two-owners-went-all-in-with-hilton-grand-vacations'),
  quote('kiana-profile-20picture-edit-367x450.avif', 'Kiana C.', T('“Hilton Grand Vacations was my ticket'), 'Kiana C.', 'Member since 2022', '/en/getaway-guide/article/2024/04/im-a-millennial-heres-why-i-became-a-hilton-grand-vacations-member'),
  quote('reneered-profile-20picture-edit-367x450.avif', 'Rene S.', T('“Hilton Grand Vacations offered a canvas'), 'Rene S.', 'Member since 2011', '/en/getaway-guide/article/2024/04/my-journey-with-hilton-grand-vacations-timeshare-has-been-a-joyous-one'),
]) + `<p>${link('/en/getaway-guide', 'View All')}</p>`;
const statsMeta = `<div><div>background</div><div>${M}d1a42f4c6999f6862e6f207c668c46d7.avif</div></div>`;

const socials = [
  ['https://www.facebook.com/HiltonGrandVacations', 'facebook.svg', 'Facebook'], ['https://x.com/HiltonGrandVac', 'x.svg', 'X'],
  ['https://www.youtube.com/channel/UCcCEgOzK4mtrT1HWAJEmW7g', 'youtube.svg', 'YouTube'], ['https://www.instagram.com/hiltongrandvacations/', 'instagram.svg', 'Instagram'],
  ['https://www.pinterest.com/hiltongrandvacations/', 'pinterest-logo.svg', 'Pinterest'],
];
const socialLinks = socials.map(([h, f, n]) => `<p><a href="${h}">${pic(f, n)}</a></p>`).join('');
const social = `<h2>${T('Our Members Prefer to Vacay')}</h2><p>${T('Follow us on Social Media')}</p>${socialLinks}`
  + block('carousel social', [
    [`<p>${pic('vimeo-1127532147.jpg', 'Waikiki beach and skyline from the water')}</p>`, '<p><a href="https://player.vimeo.com/video/1127532147?h=ec2f0a1209">Island Days &amp; Aloha Stays With Hilton Grand Vacations</a></p>'],
    [`<p>${pic('image.avif', 'Girl in a Swimming Pool')}</p>`, ''],
    [`<p>${pic('amenities-image-3.avif', 'A resort suite')}</p>`, `<p>${T('HGVC stays are amazing.')}</p><p><strong>Larissa Woodard Clark</strong></p>`],
    [`<p>${pic('vimeo-1102617020.jpg', 'A mountain cabin in Pigeon Forge')}</p>`, '<p><a href="https://player.vimeo.com/video/1102617020?h=b5b7f40316">Outdoor Adventure Awaits In Pigeon Forge With Hilton Grand Vacations</a></p>'],
    [`<p>${pic('5-ways-to-plan-a-fabulous-summer-family-reunion-in-florida-body-4-june-7-resize.avif', 'A family at a resort pool')}</p>`, `<p>${T('We LOVE you @hiltongrandvacations!')}</p><p><strong>Savvytravelmamas</strong></p>`],
  ]);

const dom = readFileSync(new URL('../measure/spec-1440/dom-1440.html', import.meta.url), 'utf8');
const ci = dom.indexOf('subscribe-checkbox-label'); const consent = dom.slice(ci, ci + 3000).match(/<p[^>]*>([\s\S]*?)<\/p>/)[1].replace(/<!---->/g, '').replace(/_ngcontent-ng-c\d+=""/g, '').replace(/ class="[^"]*"| target="_blank"| rel="[^"]*"/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const form = `<h2>${T('Vacation Inspiration')}</h2><p>${T('Sign up to get our latest news')}</p><p><em>${T('All fields are required.')}</em></p>`
  + block('signup-form', [
    ['First Name', 'text'], ['Last Name', 'text'], ['Email', 'email'],
    ['Consent', `<p>${abs(consent)}</p>`], ['Submit', 'Sign Up'],
  ]);

const metadata = block('metadata', [
  ['title', dump.__title], ['description', dump.__desc], ['nav', '/drafts/nav'], ['footer', '/drafts/footer'],
]);

const home = `<body>
  <header></header>
  <main>
${sec(hero, '')}
${sec(intro, 'intro')}
${sec(ticker1 + tabs, 'destinations')}
${sec(offers, 'navy')}
${sec(resorts, 'grey')}
${sec(heritage, 'heritage')}
${sec(stats, 'stats', statsMeta)}
${sec(social, 'social')}
${sec(form, 'signup')}
${sec(metadata, '')}
  </main>
  <footer></footer>
</body>
`;

/* ---------------- nav ---------------- */
const li = (href, label, subs) => `<li>${link(href, label)}${subs ? `<ul>${subs.map(([h, l]) => `<li>${link(h, l)}</li>`).join('')}</ul>` : ''}</li>`;
const nav = `<body>
  <header></header>
  <main>
<div><p><a href="${S}/en">${pic('hgv-blue-logo.svg', 'Hilton Grand Vacations Logo')}</a></p></div>
<div><ul>${[
  li('/en/discover-hilton-grand-vacations', 'Why Hilton Grand Vacations', [['/en/discover-hilton-grand-vacations/benefits-of-membership', 'Benefits of Membership'], ['/en/discover-hilton-grand-vacations/how-membership-works', 'How Membership Works'], ['/en/discover-hilton-grand-vacations/cost-and-value-of-membership', 'Cost and Value of Membership'], ['/en/discover-hilton-grand-vacations/journey-to-membership', 'Journey to Membership'], ['/en/discover-hilton-grand-vacations/what-happens-after-you-join', 'What Happens After You Join?'], ['/en/lp/where-next', 'WHERENEXT BY HGV']]),
  li('/en/resorts-and-destinations', 'Our Resorts and Destinations', [['/en/resorts-and-destinations/canada', 'Canada'], ['/en/resorts-and-destinations/caribbean', 'Caribbean'], ['/en/resorts-and-destinations/japan', 'Japan'], ['/en/resorts-and-destinations/mexico', 'Mexico']]),
  li('/en/getaway-guide', 'Getaway Guide', [['/en/getaway-guide/vacation-ideas', 'Vacation Ideas & Advice'], ['/en/getaway-guide/destinations', 'Destinations'], ['/en/getaway-guide/membership-basics', 'Membership 101'], ['/en/getaway-guide/tips-and-advice', 'Travel Tips & Advice']]),
  li('/en/discover-hilton-grand-vacations/vacation-offers', 'Vacation Offers'),
  li('/en/ultimate-access', 'Exclusive Experiences', [['/en/ultimate-access/events', 'Events Calendar'], ['/en/ultimate-access/concert-events', 'Concerts'], ['/en/ultimate-access/local-experiences', 'Local Experiences'], ['/en/ultimate-access/dining-events', 'Dining'], ['/en/ultimate-access/sports-events', 'Sports'], ['/en/ultimate-access/brand-ambassadors', 'Brand Ambassadors']]),
].join('')}</ul></div>
<div><p>${link('/en/sign-in', 'Sign Into Your Account')}</p><ul><li>${link('/en', 'English')}</li><li><a href="https://www.hiltongrandvacations.co.kr/">Korean</a></li><li><a href="https://www.hgvc.co.jp/">Japanese</a></li></ul></div>
  </main>
  <footer></footer>
</body>
`;

/* ---------------- footer ---------------- */
const ul = (items) => `<ul>${items.map(([h, l, ext]) => `<li>${link(h, l)}${ext ? ' :arrow-up-right-from-square:' : ''}</li>`).join('')}</ul>`;
const brands = ['logo-waldorf-astoria.svg|Waldorf Astoria', 'logo-conrad.svg|Conrad Hotels', 'logo-lxr.svg|LXR', 'logo-nomad.svg|Nomad', 'logo-signia-by-hilton.svg|Signia by Hilton', 'logo-canopy.svg|Canopy', 'logo-hilton.svg|Hilton Hotels', 'logo-curio-collection.svg|Curio Collection', 'logo-graduate.svg|Graduate', 'logo-double-tree.svg|DoubleTree', 'logo-tapestry-collection.svg|Tapestry Collection', 'logo-embassy-suites.svg|Embassy Suites', 'logo-tempo.svg|Tempo', 'logo-outset-collection.svg|Outset Collection', 'logo-motto.svg|Motto', 'logo-hilton-garden-inn.svg|Hilton Garden Inn', 'logo-hampton-inn.svg|Hampton Inn', 'logo-tru.svg|Tru', 'logo-spark.svg|Spark', 'logo-homewood-suites.svg|Homewood Suites', 'logo-home2-suites.svg|Home2 Suites', 'logo-livsmart-studios.svg|LivSmart Studios', 'logo-apartment-collection.svg|Apartment Collection', 'logo-hilton-club.svg|Hilton Club', 'logo-hilton-grand-vacations-club.svg|Hilton Grand Vacations Club', 'logo-hilton-vacation-club.svg|Hilton Vacation Club'];
const disclaimers = ['THIS MATERIAL IS FOR THE PURPOSE', 'This is neither an offer', 'Hilton Grand Vacations Club LLC, HVC', 'To learn more about our Sales', 'Certain travel services', 'As a convenience to Owners', 'To manage your cookie preferences', 'Hilton Grand Vacations® is a registered', 'Hilton Honors TM is a trademark', '© 2026 Hilton Grand Vacations Inc.'];
const footer = `<body>
  <header></header>
  <main>
<div><h2>About</h2>${ul([['/en/discover-hilton-grand-vacations', 'Discover Hilton Grand Vacations'], ['/en/faqs', 'FAQs'], ['https://investors.hgv.com', 'Investors', 1], ['/en/group-travel', 'Group Travel'], ['/en/hilton-honors-member-benefits', 'Hilton Honors™'], ['https://corporate.hgv.com/home/default.aspx', 'Corporate', 1], ['https://careers.hgv.com', 'Careers', 1], ['/en/discover-hilton-grand-vacations/partnerships', 'Our Brand Partnerships']])}
<h2>${link('/en/contact-us', 'Contact')}</h2>${ul([['/en/contact-us/owner-with-questions', 'Owners With Questions'], ['/en/contact-us/direct-sales', 'Direct Sales'], ['/en/contact-us/virtual-presentation-form', 'Schedule A Virtual Presentation'], ['/en/contact-us/questions', 'Package Holder Support'], ['/en/contact-us/general-contact', 'Recent Resort Experience']])}
<h2>Legal</h2><ul><li>${link('/en/privacy-notice/your-privacy-choices#osanoPrivacyForms', 'Your Privacy Choices')} :privacy-options:</li><li>${link('/en/privacy-notice', 'Global Privacy Notice')}</li><li>${link('/en/cookie-statement', 'Cookie Statement')}</li><li>${link('/en#osanocookiedrawer', 'Manage Cookies')}</li><li>${link('/en/legal', 'Site Usage and Information Agreement')}</li></ul></div>
<div>${secondary('/en/contact-us/newsletter-subscription', 'Sign Up for the Latest News')}${secondary('/en/discover-hilton-grand-vacations/vacation-offers', 'Vacation Offers')}<p><a href="${S}/en/lp/where-next">${pic('where-next-logo.svg', 'WhereNext by HGV')}</a></p>${socialLinks}</div>
<div><p><a href="https://www.hilton.com/en/">${pic('logo-hilton-tagline.svg', 'Hilton Logo')}</a></p>${brands.map((b) => { const [f, a] = b.split('|'); return `<p>${pic(f, `${a} Logo`)}</p>`; }).join('')}<p><a href="https://www.hilton.com/en/hilton-honors">${pic('logo-hilton-honors.svg', 'Hilton Honors Logo')}</a></p></div>
<div>${disclaimers.map((d) => `<p>${abs(T(d))}</p>`).join('')}</div>
  </main>
  <footer></footer>
</body>
`;

const out = (f, s) => { writeFileSync(new URL(f, import.meta.url), s); console.log(f, s.length); };
out('home.html', home); out('nav.html', nav); out('footer.html', footer);
