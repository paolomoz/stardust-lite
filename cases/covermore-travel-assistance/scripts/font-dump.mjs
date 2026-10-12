// font-dump.mjs — save the @font-face sources the live page embeds as data: URIs (the site inlines its webfonts in CSS;
// media-list records the face but no file request). Usage: node font-dump.mjs <url> <out-dir> [family-regex]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const [url, out, re = '.'] = process.argv.slice(2);
if (!url || !out) { console.error('usage: node font-dump.mjs <url> <out-dir> [family-regex]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForTimeout(3000);
const faces = await page.evaluate(() => {
  const outp = [];
  for (const ss of document.styleSheets) {
    let rules; try { rules = ss.cssRules; } catch { continue; }
    for (const r of rules) if (r instanceof CSSFontFaceRule) outp.push({ family: r.style.fontFamily, weight: r.style.fontWeight, style: r.style.fontStyle, src: r.style.src, sheet: ss.href });
  }
  return outp;
});
const rx = new RegExp(re, 'i');
for (const f of faces) {
  const fam = f.family.replace(/^["']|["']$/g, '');
  if (!rx.test(fam)) continue;
  const m = f.src.match(/url\("?data:([^;,]+)(;charset=[^;,]+)?;base64,([^"')]+)"?\)/);
  if (!m) { console.log(`${fam} ${f.weight} ${f.style}: external ${f.src.slice(0, 120)}`); continue; }
  const ext = /woff2/.test(m[1]) || m[3].startsWith('d09GMg') ? 'woff2' : 'woff';
  const name = `${fam.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.${ext}`;
  const buf = Buffer.from(m[3], 'base64');
  fs.writeFileSync(path.join(out, name), buf);
  console.log(`${fam} ${f.weight} ${f.style} → ${name} (${buf.length} bytes, ${m[1]}) from ${f.sheet}`);
}
await browser.close();
