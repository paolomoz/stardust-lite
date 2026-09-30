// hero-frame.mjs — screenshot a hosted <video> at t = 0 at 2× (the poster of the frame the live capture shows; METHOD prerequisites,
// hosted video row). usage: node hero-frame.mjs <url> <W> <out.png> --video <css> [--consent <css>] [--locale <tag>] [--dismiss <css,…>]
import { chromium } from 'playwright';
import { arg, openPage, overlayOpts } from '../../../scripts/common.mjs';
const [url, W, out] = process.argv.slice(2);
const sel = arg('--video', 'video');
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: Number(W), height: 900 }, deviceScaleFactor: 2 });
const page = await openPage(ctx, url, { width: Number(W), consent: arg('--consent', null), ...overlayOpts() });
await page.waitForSelector(sel, { timeout: 30000 });
await page.evaluate((s) => { for (const v of document.querySelectorAll(s)) { v.pause(); v.currentTime = 0; } }, sel);
await page.waitForTimeout(1500);
const box = await page.locator(sel).first().boundingBox();
console.log('video box', JSON.stringify(box), 'readyState', await page.evaluate((s) => document.querySelector(s).readyState, sel), 't', await page.evaluate((s) => document.querySelector(s).currentTime, sel));
await page.screenshot({ path: out, clip: { x: Math.max(0, box.x), y: box.y, width: Math.min(box.width, Number(W)), height: box.height } });
console.log('wrote', out);
await browser.close();
