// fetch-bytes.mjs — save asset bytes from the responses a real browser page receives while it loads (a WAF origin answers 403 to curl,
// node fetch and even an in-page fetch() whose Sec-Fetch-Dest is not the asset's). usage:
//   node fetch-bytes.mjs <page-url> --out <dir> --match <regex> [--widths 360,1440] [--chrome] [--consent <css>]
// prints: name status bytes content-type per matched response; a URL seen at two widths is written once.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { basename } from 'node:path';
const a = process.argv.slice(2); const page = a.shift();
const opt = (n, d) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : d; };
const out = opt('--out', 'bytes'); const re = new RegExp(opt('--match', '\\.woff2'));
const widths = opt('--widths', '1440').split(',').map(Number); const consent = opt('--consent', null);
const chrome = a.includes('--chrome') || process.env.STARDUST_CHROME === '1';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: chrome ? 'chrome' : undefined, headless: true });
const seen = new Set();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36' }); const pg = await ctx.newPage();
  pg.on('response', async (res) => {
    const u = res.url(); if (!re.test(u) || seen.has(u)) return; seen.add(u);
    try { const b = await res.body(); const name = decodeURIComponent(basename(new URL(u).pathname)).replace(/[^a-zA-Z0-9._-]/g, '-');
      if (res.status() === 200) writeFileSync(`${out}/${name}`, b);
      console.log(name, res.status(), b.length, res.headers()['content-type'], w); } catch (e) { console.log(u, 'body error', e.message); }
  });
  await pg.goto(page, { waitUntil: 'load', timeout: 90000 });
  if (consent) await pg.click(consent, { timeout: 5000 }).catch(() => {});
  for (let y = 0; y < 6000; y += 600) { await pg.mouse.wheel(0, 600); await pg.waitForTimeout(250); }
  await pg.waitForTimeout(3000); await ctx.close();
}
await browser.close();
