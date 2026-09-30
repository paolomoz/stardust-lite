// masthead-scroll.mjs — fixed masthead state on a scroll ladder DOWN then UP: top/transform/height of the header host and its
// shadow bar, at each step. Reads the hide-on-scroll-down / show-on-scroll-up state machine off the numbers.
// Usage: node masthead-scroll.mjs <url> [W] [--sel c4d-masthead] [--step 20] [--max 600] [--consent <css>] [--dismiss <css>]
import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i < 0 ? d : (process.argv[i+1] ?? true); };
const url = process.argv[2]; const W = Number(process.argv[3] || 1440); const sel = arg('--sel', 'c4d-masthead'); const step = Number(arg('--step', 20)); const max = Number(arg('--max', 600));
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:W,height:900}, userAgent: UA, locale: 'en-US' });
await p.goto(url, { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(4000);
for (const s of [arg('--consent', null), arg('--dismiss', null)].filter(Boolean)) { try { await p.click(s, { timeout: 2000 }); } catch {} }
const read = () => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return 'MISSING'; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); const inner = e.shadowRoot ? e.shadowRoot.firstElementChild && [...e.shadowRoot.children].find((c) => c.getBoundingClientRect().height > 0) : null; const ics = inner ? getComputedStyle(inner) : null; return `y=${scrollY} host top=${Math.round(r.top)} h=${Math.round(r.height)} pos=${cs.position} cssTop=${cs.top} tf=${cs.transform} cls=[${e.className}] ${inner ? `inner ${inner.className.slice(0, 40)} top=${Math.round(inner.getBoundingClientRect().top)} tf=${ics.transform} tr=${ics.transition.slice(0, 60)}` : ''}`; }, sel);
let prev = '';
const ladder = [...Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step), ...Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => max - i * step)];
for (const y of ladder) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(250); const r = await read(); const key = r.replace(/^y=\d+ /, ''); if (key !== prev) console.log(r); prev = key; }
await b.close();
