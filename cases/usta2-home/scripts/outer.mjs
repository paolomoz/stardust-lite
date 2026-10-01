// outer.mjs <url> <W> <css> — the runtime outerHTML of the first match (what the browser actually holds, not a serialisation a parser re-fixes)
import { chromium } from 'playwright';
const [url, W, sel] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +W, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
console.log(await page.evaluate((s) => document.querySelector(s)?.outerHTML.replace(/<source[^>]*>/g, ''), sel));
await browser.close();
