// dom-peek.mjs <url> <width> <css> [<css>…] — outerHTML (trimmed) and box of the first match per selector, after load + 3 s.
import { chromium } from 'playwright';
const [url, w, ...sels] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
for (const s of sels) {
  const r = await p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const bx = e.getBoundingClientRect(); return { box: [bx.x, bx.y + scrollY, bx.width, bx.height].map(Math.round), cls: e.className, html: e.outerHTML.replace(/\s+/g, ' ').slice(0, 1500) }; }, s);
  console.log('==', s, JSON.stringify(r, null, 1));
}
await b.close();
