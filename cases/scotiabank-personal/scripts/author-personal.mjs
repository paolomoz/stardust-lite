#!/usr/bin/env node
/* author-personal.mjs — writes doc/personal.html, doc/nav.html, doc/footer.html from the step-1 dumps (no text is typed here:
   every string comes from measure/content-*.json, measure/hidden-tabs-1440.json, measure/megamenu-1440.json; media names from
   media/manifest.json). Case script: `author` has no recipes on an empty inventory (NOTES.md). Run from the case dir. */
import fs from 'node:fs';
const J = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const c1440 = J('measure/content-1440.json'), c360 = J('measure/content-360.json');
const hidden = J('measure/hidden-tabs-1440.json'), mm = J('measure/megamenu-1440.json');
const manifest = J('media/manifest.json');
const MEDIA = 'https://blocks-first--sdt-scotiabank--aemcoder-adobe.aem.page/drafts/media/';
const warn = [];
const media = (src) => { const n = manifest[src]; if (!n) { warn.push(`media not in manifest: ${src}`); return src; } return MEDIA + n; };
const esc = (s) => String(s).replace(/&(?!(amp|nbsp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => String(s || '').replace(/&(?!(amp|nbsp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/"/g, '&quot;');
const cls = (n) => (n && n.cls) || '';
const has = (n, c) => cls(n).split(/\s+/).includes(c);
function* walk(n) { if (!n) return; if (Array.isArray(n)) { for (const k of n) yield* walk(k); return; } yield n; for (const k of n.children || []) yield* walk(k); }
const all = (root, pred) => [...walk(root)].filter(pred);
const first = (root, pred) => all(root, pred)[0];
const byCls = (root, c) => all(root, (n) => has(n, c));
const text = (n) => (n && (n.text || '')).replace(/\s+/g, ' ').trim();
// inline markup → what an author types: strong/em/sup/br/a and &nbsp; stay; icon/sr-only spans go; every other span is unwrapped
function clean(m) {
  if (!m) return '';
  let s = m;
  s = s.replace(/<span class="sr-only">[\s\S]*?<\/span>/g, '').replace(/<span class="fa[^"]*"><\/span>/g, '');
  s = s.replace(/<b(\s[^>]*)?>/g, '<strong>').replace(/<\/b>/g, '</strong>');
  for (let i = 0; i < 6; i += 1) s = s.replace(/<span[^>]*>([\s\S]*?)<\/span>/g, '$1');
  s = s.replace(/<\/?p>/g, '').replace(/^(\s*<br>\s*)+$/g, '');
  s = s.replace(/(<br>\s*)+$/g, '');
  s = s.replace(/^(\s*<br>\s*)+/g, '&nbsp;<br>'); // the source copy starts with an empty line (a typed line break); a bare leading <br> is dropped by the pipeline, an inner nbsp + br survives (METHOD step 5, served plain.html) — REGISTER.md
  return s.replace(/\s+/g, ' ').trim();
}
const inline = (n) => (n.markup ? clean(n.markup) : esc(text(n)));
const pic = (src, alt = '') => `<picture><img src="${attr(media(src))}" alt="${attr(alt)}"></picture>`;
const bgUrl = (n) => { if (n && n.bgiUrl) return n.bgiUrl; const m = /url\("?([^")]+)/.exec((n && n.bgi) || ''); return m && m[1]; };
const section = (inner, style) => `<div>\n${inner}${style ? `\n<div class="section-metadata"><div><div>style</div><div>${style}</div></div></div>` : ''}\n</div>`;
const block = (name, rows) => `<div class="${name}">\n${rows.map((r) => `<div>${r.map((cell) => `<div>${cell}</div>`).join('')}</div>`).join('\n')}\n</div>`;
const body = (main) => `<body>\n<header></header>\n<main>\n${main}\n</main>\n<footer></footer>\n</body>\n`;

// ---------- main page ----------
const main = c1440.main;
const hero = byCls(main, 'hero')[0];
const heroBg = bgUrl(byCls(hero, 'brand3-hero-renditions')[0]);
const heroBgMobile = bgUrl(byCls(c360.main, 'brand3-hero-renditions')[0]);   // the 767 rendition is another crop (art-directed), authored as the second picture of row 1
const heroLogo = first(hero, (n) => n.tag === 'img');
const h1 = first(hero, (n) => n.tag === 'h1');
const heroPs = all(hero, (n) => n.tag === 'p');
const heroBtns = byCls(hero, 'bns_button');
const lede = heroPs[0]; const labels = heroPs.slice(1, 3);
const heroRows = [
  [pic(heroBg) + (heroBgMobile && heroBgMobile !== heroBg ? pic(heroBgMobile) : '')],
  [`<p>${pic(heroLogo.src, heroLogo.alt)}</p><h1>${inline(h1)}</h1><p>${inline(lede)}</p>`],
  [`<p>${inline(labels[0])}</p><p><strong><a href="${attr(heroBtns[0].href)}">${esc(text(heroBtns[0]))}</a></strong></p>`],
  [`<p>${inline(labels[1])}</p><p><em><a href="${attr(heroBtns[1].href)}">${esc(text(heroBtns[1]))}</a></em></p>`],
];
const compassH2 = byCls(main, 'customCompassHeaderTitle')[0];
const compassRows = byCls(main, 'customCompassCard').map((card) => {
  const link = byCls(card, 'customCompassLink').find((n) => n.tag === 'a');
  const img = first(card, (n) => n.tag === 'img');
  const title = byCls(card, 'customCompassContentTitle')[0];
  const action = byCls(card, 'customCompassActionContainer')[0];
  return [pic(bgUrl(card)), img ? pic(img.src, img.alt) : '', `<h3><a href="${attr(link.href)}">${inline(title)}</a></h3><p>${esc(text(action))}</p>`];
});
const tabLabels = byCls(main, 'rec--tab').filter((n) => n.tag === 'button').map(text);
const panels = hidden['hidden .rec-tab-panel'];
if (panels.length !== tabLabels.length) warn.push(`tabs: ${tabLabels.length} labels, ${panels.length} panels`);
const cardHtml = (card) => {
  const callout = byCls(card, 'callout')[0];
  const img = first(card, (n) => n.tag === 'img');
  const content = byCls(card, 'card-content')[0];
  const link = byCls(content, 'standalone-link')[0];
  const items = all(content, (n) => (n.tag === 'h3' || n.tag === 'p') && n !== link);
  const texts = items.map((n) => {
    const m = n.markup || '';
    if (n.tag === 'h3') return `<h3>${inline(n).replace(/<\/?strong>/g, '')}</h3>`; // the source resets <b> to 400 inside the subtitle
    if (/^(<b>)?<span class="subtitle-1"/.test(m.trim())) return `<p><strong>${inline(n).replace(/<\/?strong>/g, '')}</strong></p>`; // a styled bold paragraph on the source (p.subtitle-1, no bottom margin), not a heading
    const t = inline(n);
    return t ? `<p>${t}</p>` : ''; // an empty paragraph is a spacer the pipeline drops (METHOD step 5)
  }).join('');
  const label = clean((link.markup || text(link)).split('<span')[0]);
  return [img ? pic(img.src, img.alt) : '', callout ? esc(text(callout)) : '', texts, `<p><a href="${attr(link.href)}">${label}</a></p>`];
};
const tabRows = []; const cardBlocks = [];
panels.forEach((panel, i) => {
  const h2 = first(panel, (n) => n.tag === 'h2');
  const nodes = [...walk(panel)];
  const firstCard = nodes.findIndex((n) => has(n, 'card--marketing'));
  const ledeP = nodes.slice(nodes.indexOf(h2) + 1, firstCard).find((n) => n.tag === 'p'); // the lede sits between the h2 and the first card
  const closing = byCls(panel, 'bns_button')[0];
  const cards = byCls(panel, 'card--marketing');
  if (!tabLabels[i]) warn.push(`panel ${i} has no label`);
  tabRows.push([esc(tabLabels[i] || ''), `<h2>${inline(h2)}</h2>${ledeP ? `<p>${inline(ledeP)}</p>` : ''}`, closing ? `<p><strong><a href="${attr(closing.href)}">${inline(closing)}</a></strong></p>` : '']);
  cardBlocks.push(block('cards marketing', cards.map(cardHtml)));
  if (cards.length !== 6) warn.push(`panel ${i} (${tabLabels[i]}): ${cards.length} cards`);
});
const closingSec = byCls(main, 'section--content')[0];
const cdic = first(closingSec, (n) => n.tag === 'a');
const cdicImg = first(cdic, (n) => n.tag === 'img');
const cdicP = first(closingSec, (n) => n.tag === 'p');
const meta = `<div class="metadata"><div><div>title</div><div>${esc(c1440.__title)}</div></div><div><div>description</div><div>${esc(c1440.__desc)}</div></div><div><div>nav</div><div>/drafts/nav</div></div><div><div>footer</div><div>/drafts/footer</div></div></div>`;
const page = body([
  section(block('hero', heroRows)),
  section(`<h2>${inline(compassH2)}</h2>\n${block('cards compass', compassRows)}`, 'pale-blue'),
  section(`${block('tabs', tabRows)}\n${cardBlocks.join('\n')}`, 'pale-blue'),
  section(`<p><a href="${attr(cdic.href)}">${pic(cdicImg.src, cdicImg.alt)}</a></p>\n<p>${inline(cdicP)}</p>`, 'cdic'),
  section(meta),
].join('\n'));

// ---------- nav ----------
const header = c1440['header#header'];
const topnav = byCls(header, 'bns--topnav')[0];
const utilLinks = byCls(topnav, 'nav-link');
const moreSites = first(topnav, (n) => n.tag === 'a' && !has(n, 'nav-link'));
const lang = first(topnav, (n) => n.tag === 'button');
const logo = byCls(header, 'h--logo')[0]; const logoImg = first(logo, (n) => n.tag === 'img');
const logoMobile = first(c360['header#header'], (n) => n.tag === 'img' && has(n, 'mobile'));
const searchLabel = first(header, (n) => n.tag === 'input');
const tools = all(header, (n) => n.tag === 'a' && n.aria && /Location|Contact Us|Offers/.test(n.aria));
const iconFor = { Location: 'location', 'Contact Us': 'phone', Offers: 'rewards' };
const signIn = byCls(header, 'btn').find((n) => n.tag === 'a');
const msg = first(header, (n) => n.tag === 'p' && /OnLine/.test(n.text || ''));
const menuItems = byCls(mm['hidden .mm--container'], 'mm--nav-item');
const menuHtml = menuItems.map((li) => {
  const top = byCls(li, 'mm--nav-link')[0];
  const dd = byCls(li, 'mm--dropdown')[0];
  let sub = '';
  if (dd) {
    const sections = (byCls(dd, 'mm--dropdown-sections')[0] || { children: [] }).children.filter((n) => n.tag === 'li');
    const groups = sections.map((sec) => {
      const title = byCls(sec, 'mm--section-title')[0];
      const links = all(sec, (n) => n.tag === 'a');
      return `<li><strong>${esc(text(title))}</strong><ul>${links.map((a) => `<li><a href="${attr(a.href)}">${esc(text(a) || text(first(a, (k) => k.text)))}</a></li>`).join('')}</ul></li>`;
    });
    const viewall = byCls(dd, 'mm--dropdown-viewall')[0];
    sub = `<ul>${groups.join('')}${viewall ? `<li><em><a href="${attr(viewall.href)}">${esc(text(viewall))}</a></em></li>` : ''}</ul>`;
  }
  return `<li><a href="${attr(top.href)}">${esc(text(top))}</a>${sub}</li>`;
}).join('\n');
const nav = body([
  section(`<ul>${utilLinks.map((a) => `<li><a href="${attr(a.href)}">${esc(text(a))}</a></li>`).join('')}</ul>\n<p><a href="${attr(moreSites.href)}">${esc(text(moreSites))}</a></p>\n<p>${esc(text(lang))}</p>`),
  section(`<p><a href="${attr(logo.href)}">${pic(logoImg.src, logoImg.alt)}${pic(logoMobile.src, logoMobile.alt)}</a></p>`),
  section(`<p>${esc(searchLabel.placeholder || text(searchLabel))}</p>`),
  section(`<ul>${tools.map((a) => `<li><a href="${attr(a.href)}">:${iconFor[a.aria]}: ${esc(a.aria)}</a></li>`).join('')}</ul>\n<p><strong><a href="${attr(signIn.href)}">${esc(text(signIn))} :lock:</a></strong></p>\n<p>${clean(msg.markup)}</p>`),
  section(`<ul>\n${menuHtml}\n</ul>`),
].join('\n'));

// ---------- footer ----------
const footer = c1440['footer#footer'];
const titles = byCls(footer, 'c--title'); const texts = byCls(footer, 'c--text'); const links = byCls(footer, 'c--link');
const helpIcons = ['question', 'phone', 'calendar']; // DOM order of span.c--icon classes: Icon_Question1, Icon_OldPhone, icon_calendar_48px (dom-1440.html)
const cards = titles.map((t, i) => `<p>:${helpIcons[i]}:</p>\n<h3>${esc(text(t))}</h3>\n<p>${esc(text(texts[i]))}</p>\n<p><a href="${attr(links[i].href)}">${clean(links[i].markup || text(links[i]))}</a></p>`);
const social = all(footer, (n) => n.tag === 'a' && /^footer-(facebook|instagram|linkedin|twitter|youtube)$/.test(n.id || ''));
const socialIcon = { 'footer-facebook': 'facebook', 'footer-instagram': 'instagram', 'footer-linkedin': 'linkedin', 'footer-twitter': 'x-twitter', 'footer-youtube': 'youtube' };
const legal = byCls(footer, 'f--links')[0];
const legalLinks = all(legal, (n) => n.tag === 'a'); const cookie = first(legal, (n) => n.tag === 'button');
const copy = byCls(footer, 'f--copyright')[0];
const foot = body([
  section(`${cards.join('\n')}\n<ul>${social.map((a) => `<li><a href="${attr(a.href)}" title="${attr(a.aria)}">:${socialIcon[a.id]}:</a></li>`).join('')}</ul>`),
  section(`<ul>${legalLinks.map((a) => `<li><a href="${attr(a.href)}">${esc(text(a))}</a></li>`).join('')}<li><a href="#cookie-settings">${esc(text(cookie))}</a></li></ul>`),
  section(`<p>${esc(text(copy))}</p>`),
].join('\n'));

fs.mkdirSync('doc', { recursive: true });
fs.writeFileSync('doc/personal.html', page); fs.writeFileSync('doc/nav.html', nav); fs.writeFileSync('doc/footer.html', foot);
console.error(`personal.html: hero 4 rows, compass ${compassRows.length} rows, tabs ${tabRows.length} rows, cards blocks ${cardBlocks.length}; nav: ${utilLinks.length} utility, ${menuItems.length} menu items; footer: ${titles.length} cards, ${social.length} social, ${legalLinks.length} legal`);
warn.forEach((w) => console.error('warn:', w));
