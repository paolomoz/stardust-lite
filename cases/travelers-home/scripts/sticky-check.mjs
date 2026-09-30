// sticky-check.mjs — does the prototype's hero card stick and un-stick like the source? Prints class + box at a scroll ladder.
import { chromium } from 'playwright';
const [,, url, wArg] = process.argv; const W = Number(wArg || 1440);
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:W,height:900} });
p.on('pageerror', (e) => console.log('pageerror', String(e).slice(0, 200)));
await p.goto(url, { waitUntil:'networkidle' }); await p.waitForTimeout(1500);
for (const y of [0, 500, 800, 900, 1200, 2000, 900, 500, 0]) {
  await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(400);
  console.log(await p.evaluate((y) => { const c = document.querySelector('.hero-card'); const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); return `y=${y} scrollY=${scrollY} class=${c.className} vp[${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}] pos=${cs.position} bg=${cs.backgroundColor} anim=${cs.animationName} placeholder=${document.querySelector('.hero-card-placeholder')?.style.height}`; }, y));
}
await b.close();
