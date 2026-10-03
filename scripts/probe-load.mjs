#!/usr/bin/env node
// probe-load.mjs — the first look at a live page BEFORE any overlay is dismissed: HTTP status and final URL, title, lang, fixed/sticky
// layers, consent/privacy candidates, shadow-root count and custom tags (a web-components origin needs the composed-tree tier),
// header/footer/main and their children with boxes. Written for travelers-home, reused by ibm-home and walgreens-home.
// W may be a list (`360,1440,2560`): a layer fixed at the base width may scroll at 360 (a 244 px header, fixed at ≥ 900 only, was
// built fixed at 360 too — 20 % of the 360 number for two rounds, usta2-home). Run it at every gated width.
// Usage: node probe-load.mjs <url> [W[,W…]] [--headed] [--locale <tag>] [--shot out.png]
import { UA, arg, overlayOpts, launch, cookiesFor } from './common.mjs';
import { firstLook } from './lib/probe-collectors.mjs'; // the in-page reading (shared with measure-page)

const url = process.argv[2]; const widths = String(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 1440).split(',').map(Number);
if (!url) { console.error('usage: probe-load.mjs <url> [W[,W…]] [--headed] [--locale <tag>] [--shot out.png]'); process.exit(1); }
const headed = process.argv.includes('--headed'); const { locale, consent, dismiss } = overlayOpts(); // the profile's overlays, when one is in use (nothing is clicked here)
const b = await launch();
for (const W of widths) {
if (widths.length > 1) console.log(`\n=== W ${W}`);
const p = await b.newPage({ viewport: { width: W, height: 900 }, userAgent: UA, ...(locale ? { locale, extraHTTPHeaders: { 'Accept-Language': `${locale},${locale.split('-')[0]};q=0.9` } } : {}) });
const ck = cookiesFor(url, overlayOpts().cookie); if (ck.length) await p.context().addCookies(ck);
const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
console.log('status', r.status(), 'url', p.url()); await p.waitForTimeout(5000);
if (p.url().split('#')[0] !== url.split('#')[0]) console.log(`URL CHANGED ${url} → ${p.url()} — a redirect or a JS forward (edition, locale, attestation page): is this the page to measure? (--cookie / --locale pin the edition)`);
const info = await p.evaluate(firstLook);
console.log(JSON.stringify(info, null, 1));
if (!info.fixed.length) console.log(`no fixed or sticky layer at ${W}`);
if (info.tallHeader) console.log(`NOTE: ${info.tallHeader}`);
if (info.breakpoints?.length) console.log(`breakpoints (media queries by count): ${info.breakpoints.join(', ')}`);
if (info.unassigned?.length) console.log(`UNASSIGNED painted band(s) outside header / main / footer at ${W} — content no default root dumps; add them to --roots: ${info.unassigned.join(' ; ')}`);
// the known controls (flags or the site profile): does each still resolve on this first look? (`site-profile check` does the same per width)
for (const sel of [consent, ...dismiss].filter(Boolean)) { const n = await p.evaluate((s) => { try { return document.querySelectorAll(s).length; } catch { return -1; } }, sel); console.log(`overlay control ${sel}: ${n < 0 ? 'invalid selector' : n ? `${n} match${n > 1 ? 'es' : ''}` : 'ABSENT'}`); }
if (arg('--shot', null)) await p.screenshot({ path: widths.length > 1 ? arg('--shot').replace(/(\.\w+)?$/, `-${W}$1`) : arg('--shot') });
await p.close();
}
await b.close();
