#!/usr/bin/env node
// nav-panels.mjs — case instrument: hover each top-level item of a hover-opened menu and dump the VISIBLE panel subtree
// (box, bg, border, font, text, href). `click-state` needs a --click and the Kadence mega panels open on hover only (a click
// navigates); `motion-observe` resolves hidden first matches. Usage: node nav-panels.mjs <url> <W> --items <css> [--consent <css>] [--depth 10]
import { chromium } from 'playwright';
import { arg, openPage, overlayOpts } from '../../../../node_modules/stardust-lite/scripts/common.mjs';
const [url, wArg] = process.argv.slice(2); const items = arg('--items', null); const depth = Number(arg('--depth', 10));
if (!url || !wArg || !items) { console.error('usage: nav-panels.mjs <url> <W> --items <css> [--consent <css>] [--depth 10]'); process.exit(1); }
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: Number(wArg), height: 900, consent: arg('--consent', null), ...overlayOpts() });
const n = await page.locator(items).count();
for (let i = 0; i < n; i += 1) {
  const li = page.locator(items).nth(i); await li.locator('> a').first().hover(); await page.waitForTimeout(700);
  const lines = await li.evaluate((root, depth) => {
    const out = []; const norm = (t) => t.replace(/\s+/g, ' ').trim();
    const walk = (el, d) => {
      if (d > depth) return; const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0' || r.width === 0) return;
      const own = norm([...el.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join(' '));
      const bg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? ` bg=${cs.backgroundColor}` : '';
      const bd = cs.borderTopWidth !== '0px' ? ` bdt=${cs.borderTopWidth} ${cs.borderTopColor}` : ''; const bl = cs.borderLeftWidth !== '0px' ? ` bdl=${cs.borderLeftWidth} ${cs.borderLeftColor}` : '';
      const pad = cs.padding !== '0px' ? ` pad=${cs.padding}` : ''; const sh = cs.boxShadow !== 'none' ? ` sh=${cs.boxShadow}` : '';
      const font = own ? ` ${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.color}${cs.textTransform !== 'none' ? ' ' + cs.textTransform : ''}` : '';
      const href = el.tagName === 'A' ? ` -> ${el.getAttribute('href')}` : '';
      out.push(`${'  '.repeat(d)}${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''} [${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)},${Math.round(r.height)}]${bg}${bd}${bl}${sh}${pad}${font}${own ? ' ' + JSON.stringify(own.slice(0, 60)) : ''}${href}`);
      [...el.children].forEach((c) => { if (!/^(SCRIPT|STYLE|svg|SVG)$/.test(c.tagName)) walk(c, d + 1); });
    };
    walk(root, 0); return out;
  }, depth);
  console.log(`=== item ${i + 1}`); console.log(lines.join('\n'));
  await page.mouse.move(5, 500); await page.waitForTimeout(400);
}
await browser.close();
