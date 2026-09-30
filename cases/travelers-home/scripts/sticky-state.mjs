// sticky-state.mjs — scroll to Y, wait, dump the hero quote card in its sticky state (box, paint, children) + screenshot of the viewport top.
import { chromium } from 'playwright';
const [,, url, wArg, yArg, out] = process.argv; const W = Number(wArg), Y = Number(yArg);
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch(); const p = await b.newPage({ viewport:{width:W,height:900}, userAgent: UA });
await p.goto(url, { waitUntil:'domcontentloaded', timeout:90000 }); await p.waitForTimeout(2500);
await p.evaluate(async (Y) => { for (let y = 0; y <= Y; y += 150) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, Y); }, Y); await p.waitForTimeout(1500);
await p.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: 400 } });
console.log(await p.evaluate(() => {
  const sel = (el) => `${el.tagName.toLowerCase()}${[...el.classList].slice(0,4).map(c=>'.'+c).join('')}`;
  const box = (el) => { const r = el.getBoundingClientRect(); return `[${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}]`; };
  const walk = (el, d, max) => { const L=[]; if (d>max) return L; const r=el.getBoundingClientRect(); const cs=getComputedStyle(el); if ((r.width===0||r.height===0||cs.display==='none'||cs.visibility==='hidden') && d>0) return L; const own=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim(); L.push(`${'  '.repeat(d)}${sel(el)} vp${box(el)} ${cs.position} ${cs.display} bg=${cs.backgroundColor} ${cs.boxShadow!=='none'?'sh='+cs.boxShadow.slice(0,60):''} pad=${cs.padding} mar=${cs.margin} z=${cs.zIndex} tf=${cs.transform} anim=${cs.animationName} ${cs.animationDuration} ${own?`${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight} ${cs.color} "${own.slice(0,40)}"`:''}`); for (const c of el.children) L.push(...walk(c, d+1, max)); return L; };
  const o = document.querySelector('.hero__overlay'); const ph = document.querySelector('.sticky-placeholder');
  return `scrollY=${scrollY}\nplaceholder ${ph ? box(ph) + ' h=' + getComputedStyle(ph).height : 'none'}\n` + walk(o, 0, 5).join('\n');
}));
await b.close();
