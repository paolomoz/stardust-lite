// rects.mjs <url> <W> <css> [<css>…] — the child rects (tag.class, x,y,w,h, display) of every match, on any page. A one-line answer to
// "what is inside this box" when deep-probe's per-selector rows leave the tree ambiguous.
import { chromium } from 'playwright';
const [url, W, ...sels] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +W, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
for (const sel of sels) {
  const rows = await page.evaluate((s) => [...document.querySelectorAll(s)].map((el) => {
    const r = (e) => { const b = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}${e.className ? '.' + String(e.className).split(' ')[0] : ''} [${Math.round(b.x)},${Math.round(b.y + scrollY)},${Math.round(b.width)},${Math.round(b.height)}] ${getComputedStyle(e).display}`; };
    return `${r(el)}\n` + [...el.children].map((c) => `    ${r(c)}`).join('\n');
  }), sel);
  console.log(`== ${sel}\n${rows.join('\n')}`);
}
await browser.close();
