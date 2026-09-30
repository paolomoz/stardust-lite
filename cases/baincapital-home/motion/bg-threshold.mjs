import { chromium } from 'playwright';
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900},userAgent:UA});
await p.goto('https://www.baincapital.com/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(3000); try { await p.click('.agree-button',{timeout:1500}); } catch {}
let prev=null;
for (let y=0;y<=8000;y+=20){ await p.evaluate((y)=>window.scrollTo(0,y),y); await p.waitForTimeout(350);
  const r=await p.evaluate(()=>{const c=getComputedStyle(document.querySelector('.site-bg-color')).backgroundColor; const im=getComputedStyle(document.querySelector('.site-bg-image')).opacity; const h=document.querySelector('header.site-header').className.replace('site-header fixed-top','').trim(); const secs=[...document.querySelectorAll('.section-wrapper > section')].map(s=>Math.round(s.getBoundingClientRect().top)); return c+' img'+im+' hdr['+h+'] tops '+secs.join(',');});
  if(r.split(' tops')[0]!==prev){ console.log('y',y,r); prev=r.split(' tops')[0]; } }
// scroll back up to see header show
for (const y of [7000,6800,6600,300,100,0]) { await p.evaluate((y)=>window.scrollTo(0,y),y); await p.waitForTimeout(900); console.log('up y',y, await p.evaluate(()=>document.querySelector('header.site-header').className+' | '+getComputedStyle(document.querySelector('header.site-header')).transform+' top:'+getComputedStyle(document.querySelector('header.site-header')).top+' | bottom-header bg '+getComputedStyle(document.querySelector('.bottom-header')).backgroundColor+' | h '+document.querySelector('header.site-header').getBoundingClientRect().height)); }
await b.close();
