// fixed-layers.mjs — list the visible position:fixed elements of a page AFTER scrolling it (a back-to-top button injected on scroll
// is in no load-time dump; the stitched capture shows it in every chunk). Usage: node fixed-layers.mjs <url> [W] [--consent <css>]
import { chromium } from 'playwright';
const [url, W = '1440'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const ci = process.argv.indexOf('--consent'); const consent = ci > 0 ? process.argv[ci + 1] : null;
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: +W, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
if (consent) { try { await page.click(consent, { timeout: 5000 }); } catch { /* no banner */ } }
for (let y = 0; y < 6000; y += 600) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(250); }
const rows = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'fixed')
  .map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName.toLowerCase(), id: e.id, cls: (e.className?.baseVal ?? e.className ?? '').toString().slice(0, 90), box: [r.x, r.y, r.width, r.height].map(Math.round), vis: r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none' }; })
  .filter((r) => r.vis));
rows.forEach((r) => console.log(`${r.tag}${r.id ? `#${r.id}` : ''} .${r.cls}  [${r.box}]`));
await browser.close();
