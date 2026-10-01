#!/usr/bin/env node
// nav-dump.mjs — the off-canvas navigation drawer of www.audemarspiguet.com: opened by the hamburger, four category buttons
// (Collections, Savoir-Faire, Our World, Services) each swap a panel in; the panel content is in the DOM only after the click.
// Dumps, per category: the panel's links (text, href, box, font) and pictures; the drawer geometry at rest and open; one screenshot
// per state when --shots <dir>. Case template (site selectors) — the sibling of ibm-home's nav-dump.
// Usage: node nav-dump.mjs <url> [W] --out file.json [--shots dir] [--consent <css>] [--locale <tag>]
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { openPage, arg, overlayOpts } from '../../../../node_modules/stardust-lite/scripts/common.mjs';

const url = process.argv[2]; const W = Number(process.argv[3] || 1440); const out = arg('--out', 'nav.json'); const shots = arg('--shots', null);
if (!url) { console.error('usage: nav-dump.mjs <url> [W] --out file.json [--shots dir]'); process.exit(1); }
if (shots) mkdirSync(shots, { recursive: true });
const b = await chromium.launch(); const p = await openPage(b, url, { width: W, consent: arg('--consent', null), ...overlayOpts(), wait: 4000 });
const dump = () => p.evaluate(() => {
  const box = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const d = document.querySelector('#drawer__r_1_'); if (!d) return null;
  const font = (el) => { const c = getComputedStyle(el); return `${c.fontFamily.split(',')[0]} ${c.fontSize}/${c.lineHeight} ${c.fontWeight} ${c.color} ${c.textTransform} ls=${c.letterSpacing}`; };
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.left >= 0 && r.left < innerWidth && getComputedStyle(el).visibility !== 'hidden'; };
  return {
    drawer: box(d), bg: getComputedStyle(d.querySelector('.ap-drawer__container') || d).backgroundColor,
    containers: [...d.querySelectorAll('.ap-drawer__container, .ap-react-navigation__side-column, .ap-react-navigation__panel, [class*=panel], [class*=column]')].filter(vis).map((c) => ({ cls: c.className.slice(0, 90), box: box(c), bg: getComputedStyle(c).backgroundColor })),
    items: [...d.querySelectorAll('a, button, h2, h3, h4, h5, p, img')].filter(vis).map((el) => ({ tag: el.tagName.toLowerCase(), text: (el.alt || el.textContent).replace(/\s+/g, ' ').trim().slice(0, 100), href: el.href || el.currentSrc || '', box: box(el), font: el.tagName === 'IMG' ? '' : font(el), cls: el.className.toString().slice(0, 80), expanded: el.getAttribute('aria-expanded'), selected: el.getAttribute('aria-selected') || (el.className.toString().includes('active') ? 'active' : null) })),
  };
});
const result = { rest: await dump(), states: [] };
await p.click('.ap-react-navigation__top-start-column button', { timeout: 5000 }); await p.waitForTimeout(1500);
result.open = await dump(); if (shots) await p.screenshot({ path: `${shots}/drawer-open-${W}.png` });
console.log('open drawer', JSON.stringify(result.open.drawer), result.open.items.length, 'items');
const cats = await p.$$('#drawer__r_1_ .ap-react-navigation__side-column-categories button, #drawer__r_1_ button[class*=category]');
console.log('categories', cats.length);
for (let i = 0; i < cats.length; i += 1) {
  const label = (await cats[i].textContent()).trim();
  try { await cats[i].click({ timeout: 3000 }); } catch (e) { console.log('click failed', label, String(e).slice(0, 80)); continue; }
  await p.waitForTimeout(1800);
  const st = await dump(); st.label = label; result.states.push(st);
  if (shots) await p.screenshot({ path: `${shots}/drawer-${i}-${label.replace(/\W+/g, '-')}-${W}.png` });
  const links = st.items.filter((it) => it.tag === 'a');
  console.log(`== ${label}: ${st.items.length} items, ${links.length} links`);
  for (const it of st.items) console.log(`   ${it.tag.padEnd(6)} ${JSON.stringify(it.box).padEnd(22)} ${it.text.slice(0, 50).padEnd(52)} ${it.href.slice(0, 80)} | ${it.font}`);
}
writeFileSync(out, JSON.stringify(result, null, 1)); console.log('→', out);
await b.close();
