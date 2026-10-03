// Case script (natixis about-article): finish the `author --draft-new` drafts where the default recipes cannot (BACKLOG #148 / #189):
// accordion rows from the hidden-panel dump (summary | panel), cards rows from the repeating containers with the section's heading and lede
// left as default content, the partnerships columns as 4 cells × 3 linked logos, the in-page-nav anchors as the pipeline's heading ids,
// and the nav / footer documents beyond the simplest shape (top bar, search, social, two footer paragraphs).
// Every text comes from the dumps; nothing is typed here except the search placeholder (register row).
import { readFileSync, writeFileSync } from 'node:fs';

const CASE = new URL('..', import.meta.url).pathname;
const HOST = 'https://blocks-first--sdt-natixis--aemcoder-adobe.aem.page/drafts/media';
const content = JSON.parse(readFileSync(`${CASE}measure/content-1440.json`, 'utf8'));
const hidden = JSON.parse(readFileSync(`${CASE}measure/hidden-1440.json`, 'utf8'));
const manifest = JSON.parse(readFileSync(`${CASE}media/manifest.json`, 'utf8'));
const triage = JSON.parse(readFileSync(`${CASE}triage.json`, 'utf8'));
const styleOf = (i) => triage.sections.find((s) => s.index === i)?.sectionStyle || null;

const roots = content['div.root.container'];
const walk = (n, f) => { if (!n) return; if (Array.isArray(n)) { n.forEach((c) => walk(c, f)); return; } f(n); (n.children || []).forEach((c) => walk(c, f)); };
const byId = (id) => { let r = null; walk(roots, (n) => { if (!r && n.id === id) r = n; }); if (!r) throw new Error(`no node #${id}`); return r; };
const findAll = (root, pred) => { const out = []; walk(root, (n) => { if (pred(n)) out.push(n); }); return out; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '\u00a0').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
// the dump truncates `markup` at ~500 characters while `text` is whole (ERG quotes): rebuild from the text, keeping an open <b> that the cut left
// the spec's inline bold runs (spec items k = 'b', with their text) restore a <b> the truncated markup lost entirely (IMADE's lead)
const spec = JSON.parse(readFileSync(`${CASE}measure/spec-360.json`, 'utf8'));
const boldRuns = []; spec.secs.forEach((sec) => (sec.items || []).forEach((it) => { if (it.k === 'b' && it.t) boldRuns.push(it.t.trim()); }));
const markupOf = (n) => {
  if (n.markup == null) return esc(n.text || '');
  const text = n.text || '';
  if (plain(n.markup).replace(/\s+/g, ' ').trim().length >= text.replace(/\s+/g, ' ').trim().length - 2) return n.markup;
  const openIdx = n.markup.lastIndexOf('<b>');
  if (openIdx > -1 && n.markup.indexOf('</b>', openIdx) === -1) { const before = plain(n.markup.slice(0, openIdx)); return `${esc(before)}<b>${esc(text.slice(before.length))}</b>`; }
  let out = esc(text);
  boldRuns.forEach((run) => { const e = esc(run); if (out.includes(e)) out = out.replace(e, `<b>${e}</b>`); });
  return out;
};
const inline = (n) => {
  let m = markupOf(n);
  m = m.replace(/<\/?b>/g, (t) => t.replace('b', 'strong')).replace(/<\/?i>/g, (t) => t.replace('i', 'em'));
  m = m.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '').replace(/\s+target="[^"]*"/g, '').replace(/\s+rel="[^"]*"/g, '');
  m = m.replace(/<br>\s*$/g, '').trim();
  return m;
};
const media = (src) => { const f = manifest[src]; if (!f) throw new Error(`media not in manifest: ${src}`); return `${HOST}/${f}`; };
const picture = (img) => `<p><picture><img src="${media(img.src)}" alt="${esc(img.alt || '')}"></picture></p>`;
const serialize = (n) => {
  if (!n) return '';
  if (/^h[1-6]$|^p$/.test(n.tag)) return `<${n.tag}>${inline(n)}</${n.tag}>\n`;
  if (n.tag === 'img') return `${picture(n)}\n`;
  if (n.tag === 'ul' || n.tag === 'ol') return `<${n.tag}>${(n.children || []).map((li) => `<li>${li.children ? li.children.map(serialize).join('').trim() : inline(li)}</li>`).join('')}</${n.tag}>\n`;
  if (n.tag === 'li') return `<li>${inline(n)}</li>`;
  if (n.tag === 'a') return `<p><a href="${n.href}">${inline(n)}</a></p>\n`;
  return (n.children || []).map(serialize).join('');
};
const cell = (html) => `<div>${html.trim()}</div>`;
const table = (cls, rows) => `<div class="${cls}">\n${rows.map((r) => `<div>${r.map(cell).join('')}</div>`).join('\n')}\n</div>\n`;
const meta = (style) => (style ? `<div class="section-metadata"><div><div>style</div><div>${style}</div></div></div>\n` : '');
const section = (i, html) => `<div>\n${html}${meta(styleOf(i))}</div>\n`;

// accordion: summary | panel, the panel from the hidden dump by the item's id
const panels = hidden['hidden .cmp-accordion__panel'];
const accordion = (id, variant) => {
  const items = findAll(byId(id), (n) => /cmp-accordion__item\b/.test(n.cls || '') && n.id);
  return table(variant ? `accordion ${variant}` : 'accordion', items.map((it) => {
    const btn = findAll(it, (n) => n.tag === 'button')[0];
    const panel = panels.find((p) => p.id === `${it.id}-panel`);
    if (!panel) throw new Error(`no hidden panel for ${it.id}`);
    return [`<p>${esc(btn.text.trim())}</p>`, serialize(panel)];
  }));
};
// cards: one row per container that holds a picture and a text component
const cards = (root, variant) => {
  const units = findAll(root, (n) => /cmp-container\b/.test(n.cls || '') && (n.children || []).some((c) => (c.children || []).some((g) => /cmp-image\b/.test(g.cls || ''))) && (n.children || []).some((c) => (c.children || []).some((g) => /cmp-text\b/.test(g.cls || ''))));
  return table(variant ? `cards ${variant}` : 'cards', units.map((u) => {
    const img = findAll(u, (n) => n.tag === 'img')[0]; const text = findAll(u, (n) => /cmp-text\b/.test(n.cls || ''))[0];
    return [picture(img), serialize(text)];
  }));
};

const out = [];
// sections 1–4 come from the author's draft (patched below); 5–13 are rebuilt here
const draft = readFileSync(`${CASE}doc/diversity-equity-and-inclusion.html`, 'utf8');
const mainHtml = draft.slice(draft.indexOf('<main>') + 6, draft.indexOf('</main>'));
const tops = []; let depth = 0, start = -1;
for (const m of mainHtml.matchAll(/<div\b[^>]*>|<\/div>/g)) {
  if (m[0] === '</div>') { depth -= 1; if (depth === 0) tops.push(mainHtml.slice(start, m.index + 6)); } else { if (depth === 0) start = m.index; depth += 1; }
}
const ANCHORS = { Commitment: '#commitment-to-diversity-equity-and-inclusion-overview', Culture: '#culture', Programs: '#programs', 'Employee groups': '#employee-resource-groups-erg', Partnerships: '#partnerships', 'Policies and statements': '#policies-and-statements', Awards: '#awards-and-recognition' };
tops.slice(0, 4).forEach((s) => out.push(`${s.replace(/<a href="#[^"]*">([^<]+)<\/a>/g, (t, label) => (ANCHORS[label] ? `<a href="${ANCHORS[label]}">${label}</a>` : t))}\n`));
// 5 culture: h2 + 3 p, facts
const facts = findAll(byId('container-fffb054266'), (n) => /ntx-fact-card\b/.test(n.cls || '') && n.children);
out.push(section(5, serialize(byId('culture')) + table('cards facts', facts.map((f) => [`<p>${esc(f.children[0].text)}</p>`, `<p>${esc(f.children[1].text)}</p>`]))));
// 6 programs (draft)
out.push(`${tops[5]}\n`);
// 7 scholarship: h3 + p + picture, accordion
out.push(section(7, serialize(byId('text-8397122a1c')) + serialize(byId('image-ae8e7bfecc')) + accordion('accordion-ff64410d26')));
// 8 slim accordion
out.push(section(8, accordion('accordion-33fecca461')));
// 9 ERG: h2 + p, cards
out.push(section(9, serialize(byId('erg')) + serialize(byId('text-b16f738bd4')) + cards(byId('container-3e1a2b3bbf'))));
// 10 partnerships: h2 + p, columns of linked logos (4 columns × 3, the source's column containers)
const cols = ['container-91b0132094', 'container-91491e2828', 'container-c63995d13f', 'container-9c84cae116'].map((id) => findAll(byId(id), (n) => n.tag === 'a' && n.href).map((a) => { const img = findAll(a, (n) => n.tag === 'img')[0]; return `${picture(img)}<p><a href="${a.href}">${esc(img.alt)}</a></p>`; }).join('\n'));
out.push(section(10, serialize(byId('partnerships')) + table('columns logos', [cols])));
// 11 policies: h2, accordion (invert)
out.push(section(11, serialize(byId('policies')) + accordion('accordion-3c4d2766c5', 'invert')));
// 12 awards: h2, cards (awards)
out.push(section(12, serialize(byId('awards')) + cards(byId('container-a3d2b5f978'), 'awards')));
// 13 disclaimer + metadata (draft)
out.push(`${tops[12]}\n${tops[13]}\n`);
writeFileSync(`${CASE}doc/diversity-equity-and-inclusion.html`, `<body>\n  <header></header>\n  <main>\n${out.join('')}  </main>\n  <footer></footer>\n</body>\n`);

// nav: top bar | brand | sections | search — from the header dump
const header = content.header;
const topTexts = findAll(header, (n) => /ntx-top-bar\b/.test(n.cls || ''))[0];
const topSpans = findAll(topTexts, (n) => n.tag === 'span' && n.text).map((n) => `<p>${esc(n.text.trim())}</p>`);
const topLinks = findAll(topTexts, (n) => n.tag === 'a' && n.text).map((n) => `<p><a href="${n.href}">${esc(n.text.trim())}</a></p>`);
const logo = findAll(header, (n) => n.tag === 'img')[0]; const logoLink = findAll(header, (n) => n.tag === 'a' && /logo-link/.test(n.cls || ''))[0];
const navItems = findAll(header, (n) => n.tag === 'a' && n.href === '#' && n.text).map((n) => `<li>${esc(n.text.trim())}</li>`);
writeFileSync(`${CASE}doc/nav.html`, `<body>\n  <header></header>\n  <main>\n<div>\n${topSpans[0]}\n${topLinks.join('\n')}\n${topSpans[1]}\n</div>\n<div>\n<p><a href="${logoLink.href}"><picture><img src="${media(logo.src)}" alt="${esc(logo.alt)}"></picture></a></p>\n</div>\n<div>\n<ul>${navItems.join('')}</ul>\n</div>\n<div>\n<p>Search</p>\n</div>\n  </main>\n  <footer></footer>\n</body>\n`);

// footer: brand + social | link lists | legal lines — from the footer dump
const footer = content.footer;
const fLogo = findAll(footer, (n) => n.tag === 'img')[0]; const fLogoLink = findAll(footer, (n) => n.tag === 'a' && /logo-link/.test(n.cls || ''))[0];
const follow = findAll(footer, (n) => /ntx-social-media__title/.test(n.cls || ''))[0];
const socials = findAll(footer, (n) => n.tag === 'a' && /ntx-social-media__item-link/.test(n.cls || '')).map((a) => `<p><a href="${a.href}">${esc(a.aria || a.text)}</a></p>`);
const lists = findAll(footer, (n) => /cmp-linklist\b/.test(n.cls || '') && (n.children || []).some((c) => c.tag === 'h2')).map((l) => {
  const h = findAll(l, (n) => n.tag === 'h2')[0]; const links = findAll(l, (n) => n.tag === 'a' && n.text);
  return `<h2>${esc(h.text.trim())}</h2>\n<ul>${links.map((a) => `<li><a href="${a.href}">${esc(a.text.trim())}</a></li>`).join('')}</ul>`;
}).join('\n');
const textBox = findAll(footer, (n) => /ntx-footer__text-box/.test(n.cls || ''))[0];
const legal = (textBox.lines || [textBox.text]).length > 1 ? textBox.lines : String(textBox.text).split(/(?=Copyright ©)/);
writeFileSync(`${CASE}doc/footer.html`, `<body>\n  <header></header>\n  <main>\n<div>\n<p><a href="${fLogoLink.href}"><picture><img src="${media(fLogo.src)}" alt="${esc(fLogo.alt)}"></picture></a></p>\n<p>${esc(follow.text.trim())}</p>\n${socials.join('\n')}\n</div>\n<div>\n${lists}\n</div>\n<div>\n${legal.map((t) => `<p>${esc(String(t).trim())}</p>`).join('\n')}\n</div>\n  </main>\n  <footer></footer>\n</body>\n`);
console.log(`fix-doc: ${out.length} sections, nav ${navItems.length} items, footer ${lists.split('<h2>').length - 1} lists, ${legal.length} legal lines`);
