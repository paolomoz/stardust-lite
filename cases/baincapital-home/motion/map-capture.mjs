// map-capture.mjs — capture the contact section's amCharts world map (text hidden) as a static asset per width.
import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch();
for (const W of [1440, 2560, 360]) {
  const VH = 900; const p = await b.newPage({viewport:{width:W,height:VH},userAgent:UA,deviceScaleFactor:1});
  await p.goto('https://www.baincapital.com/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(3000); try { await p.click('.agree-button',{timeout:1500}); } catch {}
  await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}});
  await p.evaluate(()=>{document.querySelector('footer.site-footer').style.display='none';}); await p.waitForTimeout(500); const top = await p.evaluate(()=>{const s=document.querySelector('.contact-section'); return Math.round(s.getBoundingClientRect().top+scrollY);});
  await p.evaluate((top)=>window.scrollTo(0,top),top); await p.waitForTimeout(7000);
  const info = await p.evaluate(()=>{const s=document.querySelector('.contact-section'); const c=s.querySelector('canvas'); s.querySelectorAll('h2,.filter-wrap,.regionList,.locationregionData').forEach(e=>{e.style.visibility='hidden';}); document.querySelector('header.site-header').style.visibility='hidden'; const r=s.getBoundingClientRect(); const cr=c?c.getBoundingClientRect():null; return {sec:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)], canvas:cr?[Math.round(cr.x),Math.round(cr.y),Math.round(cr.width),Math.round(cr.height)]:null, bg:getComputedStyle(document.querySelector('.site-bg-color')).backgroundColor, sy:scrollY};});
  await p.waitForTimeout(500);
  const r=info.sec; const clipY=Math.max(0,r[1]); const clipH=Math.min(r[3]-(clipY-r[1]), VH-clipY);
  await p.screenshot({path:`.work/live/map-${W}.png`, clip:{x:0,y:clipY,width:W,height:clipH}});
  const px = await p.evaluate(()=>{const c=document.querySelector('.contact-section canvas'); if(!c) return 'nocanvas'; try{const ctx=c.getContext('2d'); const d=ctx.getImageData(0,0,c.width,c.height).data; let n=0; for(let i=0;i<d.length;i+=4*97){ if(d[i+3]>0) n++; } return 'painted samples '+n;}catch(e){return 'err '+e.message}}); console.log(W, JSON.stringify(info), 'clip', clipY, clipH, px);
  await p.close();
}
await b.close();
