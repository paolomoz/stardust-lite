// asset-capture.mjs — the bytes a WAF refuses to every out-of-page fetch (curl, node fetch, a browser navigation: media-fetch --browser
// prints "unreachable"), read from the page's OWN responses: open the page once (common.mjs launch/openPage, --chrome tier, --consent,
// --hide), log every response whose URL matches --match (regex) and whose host is in --hosts, write the bodies under --out with
// media-fetch's a-z0-9 names, print a manifest line per file. Fonts and images alike (fonts go to --fonts when given).
//   node scripts/asset-capture.mjs <url> --out media --fonts fonts [--hosts www.usa.canon.com] [--match '\.(png|svg|webp|jpe?g|otf|ttf|woff2?)(\?|$)'] [--width 1440] [--consent <css>] [--hide <css>]
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { launch, openPage, arg, overlayOpts, settle } from '../../../../node_modules/stardust-lite/scripts/common.mjs';

const url = process.argv[2]; const out = String(arg('--out', 'media')); const fontsDir = arg('--fonts', null);
const hosts = String(arg('--hosts', new URL(url).hostname)).split(',');
const match = new RegExp(String(arg('--match', '\\.(png|svg|webp|jpe?g|gif|otf|ttf|woff2?)(\\?|$)'), 'i'));
const width = Number(arg('--width', 1440));
const safe = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
mkdirSync(out, { recursive: true }); if (fontsDir) mkdirSync(String(fontsDir), { recursive: true });
const o = overlayOpts(); const browser = await launch(); const seen = new Map(); const pending = [];
const page = await openPage(browser, url, { width, consent: o.consent, dismiss: o.dismiss, locale: o.locale, before: (p) => p.on('response', (r) => {
  const u = r.url(); let h; try { h = new URL(u).hostname; } catch { return; }
  if (!hosts.includes(h) || !match.test(u) || seen.has(u) || r.status() !== 200) return;
  seen.set(u, true);
  pending.push(r.body().then((buf) => {
    const path = new URL(u).pathname; const ext = (extname(path) || '').toLowerCase(); const isFont = /\.(otf|ttf|woff2?)$/.test(ext);
    const name = safe(path.split('/').pop().replace(/\.[a-z0-9]+$/i, '')) + ext; const dir = isFont && fontsDir ? String(fontsDir) : out;
    writeFileSync(join(dir, name), buf); console.log(`${r.status()} ${(r.headers()['content-type'] || '').split(';')[0].padEnd(16)} ${String(buf.length).padStart(8)}  ${u.slice(-90)} → ${dir}/${name}`);
  }).catch((e) => console.error(`asset-capture: ${u} — ${String(e.message).slice(0, 80)}`)));
}) });
await settle(page); await page.waitForTimeout(1500); await Promise.all(pending); await browser.close();
console.log(`asset-capture: ${seen.size} file(s) from ${url}`);
