// sticky-form.mjs — geometry of the sticky quote bar's visible controls (display:contents form: measure the leaf controls directly)
import { chromium } from 'playwright';
const [,, url, wArg, yArg] = process.argv; const W = Number(wArg), Y = Number(yArg);
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:W,height:900}, userAgent: UA });
await p.goto(url, { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(2500);
await p.evaluate(async (Y) => { for (let y = 0; y <= Y; y += 150) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, Y); }, Y); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => {
  const o = document.querySelector('.hero__overlay'); const out = [];
  o.querySelectorAll('*').forEach((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); if (r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || cs.display === 'none') return; const own = [...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim(); if (!own && !e.matches('select,input,button,svg,img')) return; out.push(`${e.tagName.toLowerCase()}.${[...e.classList].slice(0,3).join('.')} [${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}] ${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.color} bg=${cs.backgroundColor} pad=${cs.padding} bd=${cs.borderTop} "${own.slice(0,40)}"`); });
  return out.join('\n');
}));
await b.close();
