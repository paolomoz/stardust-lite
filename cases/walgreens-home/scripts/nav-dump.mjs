// nav-dump.mjs — the header's menu content: each L0 dropdown opened in turn (click), the opened panel dumped as a tree of links
// with boxes, fonts and columns; the account dropdown; the store selector; at 360 the hamburger menu. Panels are hidden at rest
// and populate lazily, so live-spec reads none of it.
// Usage: node nav-dump.mjs <url> [W] --out file.json [--shots dir]
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { openPage, arg, overlayOpts } from '../../../scripts/common.mjs';
const url = process.argv[2]; const W = Number(process.argv[3] || 1440); const shots = arg('--shots', null); if (shots) mkdirSync(shots, { recursive: true });
const b = await chromium.launch(); const p = await openPage(b, url, { width: W, height: 1000, consent: arg('--consent', null), ...overlayOpts(), wait: 4000 });
const DUMP = `(root) => {
  const R = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)]; };
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.replace(/\\s+/g, ' ').trim()).filter(Boolean).join(' ');
  const walk = (e) => { if (['SCRIPT','STYLE','SVG'].includes(e.tagName) || !vis(e)) return null; const s = getComputedStyle(e); const n = { tag: e.tagName.toLowerCase(), box: R(e) }; if (e.id) n.id = e.id; const cls = [...e.classList].slice(0,3).join(' '); if (cls) n.cls = cls; const t = own(e); if (t) { n.text = t; n.font = s.fontFamily.split(',')[0].replace(/"/g,'') + ' ' + s.fontSize + '/' + s.lineHeight + ' ' + s.fontWeight + ' ' + s.color; } if (e.tagName === 'A') n.href = e.getAttribute('href'); if (e.tagName === 'IMG') { n.src = e.currentSrc; n.alt = e.alt; } if (!/rgba\\(0, 0, 0, 0\\)/.test(s.backgroundColor)) n.bg = s.backgroundColor; if (s.borderTopWidth !== '0px' && s.borderTopStyle !== 'none') n.border = s.borderTopWidth + ' ' + s.borderTopColor; if (s.boxShadow !== 'none') n.shadow = s.boxShadow; const kids = [...e.children].map(walk).filter(Boolean); if (kids.length) n.children = kids; if (kids.length === 1 && !n.text && !n.href && !n.src && !n.bg && !n.border && !n.id) return kids[0]; if (!kids.length && !n.text && !n.href && !n.src && !n.bg) return null; return n; };
  return walk(root);
}`;
const out = { W, menus: [] };
if (W >= 900) {
  const titles = []; for (const h of await p.$$('.nav__bottom-container a.dropdown__title')) { const bb = await h.boundingBox(); if (bb && bb.width > 0) titles.push(h); }
  for (const t of titles) {
    const label = (await t.innerText()).trim();
    const before = await p.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).length);
    await t.hover({ force: true, timeout: 5000 }); await p.waitForTimeout(800);
    try { await t.click({ timeout: 1500, force: true }); } catch { /* hover-only menu */ }
    await p.waitForTimeout(1200);
    const panel = await p.evaluate((D) => { const cands = [...document.querySelectorAll('.nav__bottom-container *')].filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.height > 80 && r.width > 200 && r.top > 100 && s.visibility !== 'hidden' && s.display !== 'none' && e.querySelectorAll('a').length > 3; }); const best = cands.sort((a, b) => a.querySelectorAll('*').length - b.querySelectorAll('*').length).filter((e) => !cands.some((o) => o !== e && e.contains(o) && o.querySelectorAll('a').length === e.querySelectorAll('a').length)).sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0]; return best ? eval(D)(best) : null; }, DUMP);
    out.menus.push({ label, panel });
    if (shots) await p.screenshot({ path: `${shots}/menu-${label.replace(/\W+/g, '-')}.png` });
    await p.keyboard.press('Escape'); await p.mouse.click(720, 700); await p.waitForTimeout(400);
  }
  for (const [name, sel] of [['account', '.account-trigger'], ['store', '#store-selector-trigger-desktop button, #store-selector-trigger-desktop']]) {
    try { await p.click(sel, { timeout: 2000 }); await p.waitForTimeout(1200); out[name] = await p.evaluate((D) => { const cands = [...document.querySelectorAll('body *')].filter((e) => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return (s.position === 'absolute' || s.position === 'fixed') && r.height > 60 && r.width > 150 && r.top < 700 && s.visibility !== 'hidden' && s.display !== 'none'; }); return cands.slice(0, 3).map((c) => eval(D)(c)); }, DUMP); if (shots) await p.screenshot({ path: `${shots}/${name}.png` }); await p.keyboard.press('Escape'); await p.mouse.click(720, 800); await p.waitForTimeout(400); } catch (e) { out[name] = String(e).slice(0, 120); }
  }
} else {
  try { await p.click('.show-on-mobile button, .show-on-mobile a, [aria-label*="Menu" i]', { timeout: 3000 }); await p.waitForTimeout(1500); out.mobileMenu = await p.evaluate((D) => { const cands = [...document.querySelectorAll('body *')].filter((e) => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return (s.position === 'absolute' || s.position === 'fixed') && r.height > 200 && r.width > 200 && s.visibility !== 'hidden'; }); return cands.slice(0, 2).map((c) => eval(D)(c)); }, DUMP); if (shots) await p.screenshot({ path: `${shots}/mobile-menu.png` }); } catch (e) { out.mobileMenu = String(e).slice(0, 160); }
}
writeFileSync(arg('--out', 'nav.json'), JSON.stringify(out, null, 1)); console.log('menus', out.menus.length, Object.keys(out));
await b.close();
