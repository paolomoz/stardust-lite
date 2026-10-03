// attr-dump.mjs — attributes of the elements a selector matches on the settled live page (src, data-src, srcset, href, aria-label …):
// what content-dump skips for a lazy or hidden <img> (the footer's social icons: two imgs per link, one display:none).
//   node scripts/attr-dump.mjs <url> <W> --sel <css> [--attrs src,data-src,srcset,alt,href,aria-label,class] [--consent <css>] [--hide <css>]
import { launch, openPage, arg, overlayOpts, settle } from '../../../../node_modules/stardust-lite/scripts/common.mjs';
const url = process.argv[2]; const W = Number(process.argv[3] || 1440); const sel = String(arg('--sel', 'img'));
const attrs = String(arg('--attrs', 'src,data-src,srcset,alt,href,aria-label,class')).split(',');
const o = overlayOpts(); const browser = await launch();
const page = await openPage(browser, url, { width: W, consent: o.consent, dismiss: o.dismiss, locale: o.locale }); await settle(page);
const rows = await page.evaluate(({ sel, attrs }) => [...document.querySelectorAll(sel)].map((el) => { const r = el.getBoundingClientRect(); const o = { tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)], display: getComputedStyle(el).display }; for (const a of attrs) { const v = el.getAttribute(a); if (v != null) o[a] = v; } if (el.tagName === 'IMG') o.currentSrc = el.currentSrc; const bg = getComputedStyle(el).backgroundImage; if (bg && bg !== 'none') o.bg = bg; return o; }), { sel, attrs });
for (const r of rows) console.log(JSON.stringify(r)); await browser.close();
