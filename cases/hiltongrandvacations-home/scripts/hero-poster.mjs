// hero-poster.mjs <url> <W> <out.png> [--consent css] — screenshot the hero's video box with the overlay, text and controls hidden:
// the poster of the frame the live page shows at load (video-frame.mjs needs a <video>; this hero is a Vimeo iframe).
import { chromium } from 'playwright';
const [url, W, out] = process.argv.slice(2);
const consent = (process.argv.find((a, i, arr) => arr[i - 1] === '--consent'));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: 900 }, locale: 'en-US' });
await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
if (consent) { try { await p.click(consent, { timeout: 8000 }); } catch {} }
await p.waitForTimeout(3000);
const box = await p.evaluate(() => {
  const s = document.querySelector('section.video-container');
  for (const el of s.querySelectorAll(':scope > div.absolute, :scope > div.w-full.h-full.absolute, header, app-rich-text, button, p, .text-cnt, app-button')) el.style.visibility = 'hidden';
  for (const el of document.querySelectorAll('header#navigation, .osano-cm-window, button.fixed')) el.style.visibility = 'hidden';
  const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height };
});
await p.waitForTimeout(500);
await p.screenshot({ path: out, clip: box });
console.log(out, box);
await b.close();
