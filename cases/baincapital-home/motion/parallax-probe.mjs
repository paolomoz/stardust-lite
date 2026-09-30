// parallax-probe.mjs — the advantages copy column translateY vs scroll position on the live page (GSAP scroll-linked).
import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900},userAgent:UA});
const URL_=process.argv[2]||'https://www.baincapital.com/'; await p.goto(URL_,{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(3000); try { await p.click('.agree-button',{timeout:1500}); } catch {}
const SEL=URL_.includes('baincapital.com')?'.our-advantages-box .content-col':'.bain-advantages-body'; const IMG=URL_.includes('baincapital.com')?'.advantage-box-image':'.bain-advantages-poster';
for (let y=0;y<=2800;y+=100){ await p.evaluate((y)=>window.scrollTo(0,y),y); await p.waitForTimeout(700);
  const r=await p.evaluate(({SEL,IMG})=>[...document.querySelectorAll(SEL)].map(c=>{const m=getComputedStyle(c).transform.match(/matrix\(([^)]+)\)/); const ty=m?Math.round(parseFloat(m[1].split(',')[5])):0; const img=c.closest('.our-advantages-box, .bain-advantages-item').querySelector(IMG).getBoundingClientRect(); return `ty=${String(ty).padStart(4)} imgTop=${Math.round(img.top).toString().padStart(5)}`;}).join(' | ') + ' | spot ' + [...document.querySelectorAll('.spotlight-content-wrap')].slice(0,1).map(c=>{const m=getComputedStyle(c).transform.match(/matrix\(([^)]+)\)/); return m?Math.round(parseFloat(m[1].split(',')[5])):0;}),{SEL,IMG});
  console.log('y',String(y).padStart(5),r); }
await b.close();
