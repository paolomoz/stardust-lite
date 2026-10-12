// Case workaround: media-fetch --fonts curls the font URLs and the origin's WAF (Imperva) answers 200 with a 212-byte HTML challenge,
// which media-fetch saved as .woff2 without checking the bytes (and --from-page is ignored with --fonts). Open the page in installed
// Chrome, keep the woff2 responses the page itself loads, write them under the names fonts.css declares.
// usage: node fetch-fonts.mjs <url> <fontsDir> <srcBasename=destName> ...
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const [url, dir, ...maps] = process.argv.slice(2);
const want = Object.fromEntries(maps.map((m) => m.split('=')));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const got = {};
page.on('response', async (r) => { if (/woff/.test(r.url())) console.log('resp', r.status(), r.url().slice(-60)); const b = r.url().split('?')[0].split('/').pop(); if (want[b] && !got[b]) { try { const buf = await r.body(); if (buf.length > 1000) { got[b] = buf; } } catch {} } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
await page.waitForTimeout(3000);
for (const [b, buf] of Object.entries(got)) { writeFileSync(`${dir}/${want[b]}`, buf); console.log(`${b} → ${dir}/${want[b]} ${buf.length} B`); }
for (const b of Object.keys(want)) if (!got[b]) console.log(`MISSING ${b}`);
await browser.close();
