// click-dump.mjs <url> <W> --panel <css> [--open <css>] --click <css> [--click <css> …] [--consent css]
// Click each control in turn (optionally after an opener) and dump the panel's texts, hrefs and images: the hidden
// states of a carousel caption, a tab panel, a drawer sub-menu — content the dump does not hold at rest.
import { chromium } from 'playwright';
const args = process.argv.slice(2); const [url, W] = args;
const opt = (k) => args[args.indexOf(k) + 1];
const clicks = args.map((a, i) => (a === '--click' ? args[i + 1] : null)).filter(Boolean);
const panel = opt('--panel'); const consent = args.includes('--consent') ? opt('--consent') : null; const open = args.includes('--open') ? opt('--open') : null;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: 900 }, locale: 'en-US' });
await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
if (consent) { try { await p.click(consent, { timeout: 8000 }); } catch {} }
await p.waitForTimeout(1500);
const dump = (sel) => p.evaluate((s) => {
  const root = document.querySelector(s); if (!root) return 'NO PANEL ' + s;
  const out = []; const walk = (el, d) => {
    for (const c of el.children) {
      const r = c.getBoundingClientRect(); const cs = getComputedStyle(c);
      const own = [...c.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).filter(Boolean).join(' ');
      const bits = [];
      if (own) bits.push(JSON.stringify(own));
      if (c.tagName === 'A') bits.push('-> ' + c.getAttribute('href'));
      if (c.tagName === 'IMG') bits.push('img ' + (c.currentSrc || c.src).slice(0, 400) + ' alt=' + JSON.stringify(c.alt));
      if (c.tagName === 'BUTTON' || c.tagName === 'A') bits.push('aria=' + (c.getAttribute('aria-label') || ''));
      if (bits.length || c.children.length) out.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}${c.className && typeof c.className === 'string' ? '.' + c.className.split(' ').slice(0, 2).join('.') : ''} [${Math.round(r.x)},${Math.round(r.y + scrollY)},${Math.round(r.width)}x${Math.round(r.height)}] ${cs.display === 'none' ? 'HIDDEN ' : ''}${bits.join(' ')}`);
      if (c.children.length && d < 9) walk(c, d + 1);
    }
  }; walk(root, 0); return out.join('\n');
}, sel);
if (open) { await p.click(open, { timeout: 8000 }); await p.waitForTimeout(800); console.log(`== after open ${open}\n` + await dump(panel)); }
for (const c of clicks) {
  try { await p.locator(c).first().scrollIntoViewIfNeeded(); await p.locator(c).first().click({ timeout: 8000, force: true }); } catch (e) { console.log(`click failed ${c}: ${e.message.split('\n')[0]}`); }
  await p.waitForTimeout(900);
  console.log(`== after click ${c}\n` + await dump(panel));
}
await b.close();
