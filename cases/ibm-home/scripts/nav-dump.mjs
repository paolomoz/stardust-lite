// nav-dump.mjs — content capture of the Carbon masthead: L0 items (text, href, kind), each mega menu's tabs (heading link + category
// links with title/description/href, view-all link), simple dropdown items, the global-bar icons; and the footer groups + legal nav.
// Reads the light DOM (slotted content = the authored content), clicking each L0 menu so lazy panels populate. Writes JSON.
// Usage: node nav-dump.mjs <url> [W] --out nav.json [--consent <css>] [--dismiss <css>]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : (process.argv[i+1] ?? true); };
const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport:{width:W,height:900}, userAgent: UA, locale: 'en-US', extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' } });
const p = await ctx.newPage(); await p.goto(url, { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(4000);
for (const s of [arg('--consent', null), arg('--dismiss', null)].filter(Boolean)) { try { await p.click(s, { timeout: 2000 }); } catch {} }
const n = await p.evaluate(() => document.querySelectorAll('c4d-top-nav > *').length);
for (let i = 0; i < n; i += 1) { const tag = await p.evaluate((i) => document.querySelectorAll('c4d-top-nav > *')[i].tagName, i); if (/MENU$/.test(tag)) { try { await p.click(`c4d-top-nav > :nth-child(${i + 1})`, { timeout: 2000 }); await p.waitForTimeout(1200); await p.keyboard.press('Escape'); await p.waitForTimeout(300); } catch {} } }
const out = await p.evaluate(() => {
  const T = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const own = (e) => [...e.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join(' ').replace(/\s+/g, ' ').trim();
  const l0 = [...document.querySelectorAll('c4d-top-nav > *')].map((el) => {
    const tag = el.tagName.toLowerCase();
    const item = { tag, text: '', href: el.getAttribute('href') || null, title: el.getAttribute('menu-label') || el.getAttribute('trigger-content') || null };
    if (tag === 'c4d-top-nav-item') { item.text = T(el); }
    if (tag === 'c4d-top-nav-menu') { item.text = el.getAttribute('trigger-content') || el.getAttribute('menu-label') || own(el); item.items = [...el.querySelectorAll('c4d-top-nav-menu-item')].map((x) => ({ text: T(x), href: x.getAttribute('href') })); }
    if (tag === 'c4d-megamenu-top-nav-menu') {
      item.text = el.getAttribute('trigger-content') || el.getAttribute('menu-label') || own(el);
      const mm = el.querySelector('c4d-megamenu'); item.layout = mm ? mm.getAttribute('layout') : null;
      item.tabs = [...el.querySelectorAll('c4d-megamenu-tab')].map((t) => ({ id: t.id, text: T(t), target: t.getAttribute('target') }));
      item.viewAll = [...el.querySelectorAll('c4d-megamenu-link-with-icon, c4d-megamenu-left-navigation a')].map((a) => ({ text: T(a), href: a.getAttribute('href') || a.querySelector('a')?.getAttribute('href') })).filter((x) => x.text);
      item.panels = [...el.querySelectorAll('[id^="panel-"], c4d-megamenu-right-navigation')].map((pn) => ({
        id: pn.id || pn.closest('[id^="panel-"]')?.id, heading: (() => { const h = pn.querySelector('c4d-megamenu-heading'); return h ? { text: T(h), href: h.getAttribute('href') || h.querySelector('a')?.getAttribute('href') } : null; })(),
        groups: [...pn.querySelectorAll('c4d-megamenu-category-group')].map((g) => ({ heading: (() => { const h = g.querySelector('c4d-megamenu-category-group-heading, c4d-megamenu-category-heading'); return h ? { text: T(h), href: h.getAttribute('href') } : null; })(), links: [...g.querySelectorAll('c4d-megamenu-category-link')].map((l) => ({ title: l.getAttribute('title') || T(l.querySelector('[slot=heading], span:first-child')), desc: own(l) || T(l.querySelector('span:last-child')), href: l.getAttribute('href'), raw: l.outerHTML.replace(/\s+/g, ' ').slice(0, 400) })) })),
        directLinks: [...pn.querySelectorAll(':scope > c4d-megamenu-category-link, c4d-megamenu-right-navigation > c4d-megamenu-category-link')].map((l) => ({ title: l.getAttribute('title'), desc: own(l), href: l.getAttribute('href') })),
        viewAll: (() => { const v = pn.querySelector('[slot=view-all], c4d-megamenu-link-with-icon'); return v ? { text: T(v), href: v.getAttribute('href') } : null; })(),
      })).filter((pn) => pn.heading || pn.groups.length);
    }
    return item;
  });
  const logo = document.querySelector('c4d-masthead-logo'); const bar = [...document.querySelectorAll('c4d-masthead-global-bar > *')].map((e) => ({ tag: e.tagName.toLowerCase(), cls: e.className, text: T(e), href: e.getAttribute('href'), label: e.getAttribute('aria-label') || e.getAttribute('trigger-label'), inner: e.innerHTML.replace(/\s+/g, ' ').slice(0, 300) }));
  const search = document.querySelector('c4d-search-with-typeahead'); const profileItems = [...document.querySelectorAll('c4d-masthead-profile-item')].map((e) => ({ text: T(e), href: e.getAttribute('href') }));
  const footer = { logo: (() => { const l = document.querySelector('c4d-footer-logo'); return l ? { href: l.getAttribute('href'), svg: l.querySelector('svg')?.outerHTML.slice(0, 3000) } : null; })(),
    groups: [...document.querySelectorAll('c4d-footer-nav-group')].map((g) => ({ title: g.getAttribute('title-text') || T(g.querySelector('[slot=title]')) || g.getAttribute('title'), items: [...g.querySelectorAll('c4d-footer-nav-item')].map((i) => ({ text: T(i), href: i.getAttribute('href') })) })),
    legal: [...document.querySelectorAll('c4d-legal-nav-item, c4d-legal-nav-cookie-preferences-placeholder')].map((i) => ({ tag: i.tagName.toLowerCase(), text: T(i), href: i.getAttribute('href') })),
    locale: (() => { const l = document.querySelector('c4d-locale-button'); return l ? { text: T(l), href: l.getAttribute('href'), box: JSON.stringify(l.getBoundingClientRect().toJSON()) } : null; })(),
    footerAttrs: [...(document.querySelector('c4d-footer')?.attributes || [])].map((a) => `${a.name}=${a.value}`) };
  const mastheadAttrs = [...(document.querySelector('c4d-masthead')?.attributes || [])].map((a) => `${a.name}=${a.value}`);
  return { logoHref: logo?.getAttribute('href'), logoSvg: logo?.querySelector('svg')?.outerHTML.slice(0, 3000), l0, bar, searchAttrs: search ? [...search.attributes].map((a) => `${a.name}=${a.value}`) : null, profileItems, footer, mastheadAttrs, promo: (() => { const b = document.querySelector('c4d-promo-banner'); return b ? b.outerHTML.replace(/\s+/g, ' ').slice(0, 1500) : null; })() };
});
writeFileSync(arg('--out', 'nav.json'), JSON.stringify(out, null, 1));
console.log('L0:', out.l0.map((i) => `${i.text} [${i.tag}${i.tabs ? ` ${i.tabs.length} tabs / ${i.panels.length} panels` : ''}${i.items ? ` ${i.items.length} items` : ''}]`).join(' | '));
console.log('bar:', out.bar.map((b) => `${b.tag} ${b.label || b.text}`).join(' | ')); console.log('footer groups:', out.footer.groups.map((g) => `${g.title} (${g.items.length})`).join(' | '), '| legal', out.footer.legal.length, '| locale', out.footer.locale ? out.footer.locale.text : 'none');
await b.close();
