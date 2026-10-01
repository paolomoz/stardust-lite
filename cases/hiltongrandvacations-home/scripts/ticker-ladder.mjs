// ticker-ladder.mjs <url> <W> <sel> [--consent css] — scroll a count-up number into view and sample its text every 100 ms:
// the counter's duration and easing (the live capture catches it mid-flight; the build must run the same function).
import { chromium } from 'playwright';
const [url, W, sel] = process.argv.slice(2);
const consent = (process.argv.find((a, i, arr) => arr[i - 1] === '--consent'));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: 900 }, locale: 'en-US' });
await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
if (consent) { try { await p.click(consent, { timeout: 8000 }); } catch {} }
await p.waitForTimeout(2000);
const y = await p.evaluate((s) => { const el = document.querySelector(s); const r = el.getBoundingClientRect(); return r.top + window.scrollY; }, sel);
await p.evaluate((yy) => window.scrollTo(0, yy - 300), y);
const t0 = Date.now(); const rows = [];
for (let i = 0; i < 60; i++) {
  const txt = await p.evaluate((s) => document.querySelector(s).textContent.trim(), sel);
  rows.push(`${Date.now() - t0}ms ${txt}`);
  await p.waitForTimeout(100);
}
console.log(rows.join('\n'));
await b.close();
