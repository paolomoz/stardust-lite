// state-probe.mjs — click-state verification on the build: platform tab, commitments switch/next, presence listing, hero nav, header hide/show.
import { chromium } from 'playwright';
const url=process.argv[2]||'https://proto--sdt-baincapital--aemcoder-adobe.aem.page/drafts/home';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}});
await p.goto(url,{waitUntil:'networkidle',timeout:60000}); await p.waitForFunction(() => [...document.querySelectorAll('.block')].every((el) => el.dataset.blockStatus === 'loaded'));
const R=(sel)=>p.evaluate((sel)=>{const e=document.querySelector(sel); if(!e) return 'MISSING'; const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return `[${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}] op=${s.opacity} vis=${s.visibility} disp=${s.display} cls=${e.className.toString().slice(0,60)}`;},sel);
const scrollTo=(sel)=>p.evaluate((sel)=>document.querySelector(sel).scrollIntoView({block:'center'}),sel);
await scrollTo('.bain-platform'); await p.waitForTimeout(600);
console.log('platform panel before:', await R('.bain-platform-panels'), '| wheel', await R('.bain-platform-wheel'));
await p.click('.bain-platform-tabs .bain-platform-tab:nth-child(2)'); await p.waitForTimeout(700);
console.log('platform panel after :', await R('.bain-platform-panels'), '| active panel', await R('.bain-platform-panel.is-active'), '| title', await p.evaluate(()=>document.querySelector('.bain-platform-panel.is-active .bain-platform-panel-title').textContent), '| wheel', await R('.bain-platform-wheel'));
await p.click('.bain-platform-back'); await p.waitForTimeout(700); console.log('platform after back  :', await R('.bain-platform-panels'));
await scrollTo('.bain-commitments'); await p.waitForTimeout(600);
console.log('commitments card 1:', await p.evaluate(()=>document.querySelector('.bain-commitments-card.is-active .bain-commitments-card-title').textContent), '| list hidden item:', await p.evaluate(()=>document.querySelector('.bain-commitments-item.is-active span').textContent));
await p.click('.bain-commitments-list .bain-commitments-item:nth-child(2) a'); await p.waitForTimeout(400);
console.log('after click item 2 :', await p.evaluate(()=>document.querySelector('.bain-commitments-card.is-active .bain-commitments-card-title').textContent), '| list hidden item:', await p.evaluate(()=>document.querySelector('.bain-commitments-item.is-active span').textContent));
await p.click('.bain-commitments-nav.next'); await p.waitForTimeout(400);
console.log('after next         :', await p.evaluate(()=>document.querySelector('.bain-commitments-card.is-active .bain-commitments-card-title').textContent));
await scrollTo('.bain-presence'); await p.waitForTimeout(600);
console.log('presence before:', await R('.bain-presence-map'), '| list', await R('.bain-presence-list'));
await p.click('.bain-presence-tabs li:nth-child(2) .bain-presence-tab'); await p.waitForTimeout(500);
console.log('presence after Americas:', await R('.bain-presence-map'), '| list', await R('.bain-presence-list.is-active'), '| offices', await p.evaluate(()=>[...document.querySelectorAll('.bain-presence-list.is-active .bain-presence-city')].map(e=>e.textContent).join(', ')));
await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(500);
console.log('hero slide before:', await p.evaluate(()=>[...document.querySelectorAll('.bain-hero-slide')].findIndex(s=>s.classList.contains('is-active'))), 'nav active', await p.evaluate(()=>[...document.querySelectorAll('.bain-hero-nav-item')].findIndex(s=>s.classList.contains('is-active'))));
await p.click('.bain-hero-nav-item:nth-child(3)'); await p.waitForTimeout(600);
console.log('hero after click 3 :', await p.evaluate(()=>[...document.querySelectorAll('.bain-hero-slide')].findIndex(s=>s.classList.contains('is-active'))), 'tangram active', await p.evaluate(()=>[...document.querySelectorAll('.bain-hero-shapes')].findIndex(s=>s.classList.contains('is-active'))), 'progress', await p.evaluate(()=>document.querySelector('.bain-hero-nav-item.is-active .bain-hero-progress').style.width));
await p.waitForTimeout(6000); console.log('hero after 6s autoplay:', await p.evaluate(()=>[...document.querySelectorAll('.bain-hero-slide')].findIndex(s=>s.classList.contains('is-active'))));
for (const y of [0,300,1200,900,0]) { await p.evaluate((y)=>window.scrollTo(0,y),y); await p.waitForTimeout(500); console.log('scroll',y,'header', await p.evaluate(()=>{const h=document.querySelector('body > header'); return h.className+' top='+getComputedStyle(h).top+' h='+Math.round(h.getBoundingClientRect().height)+' backdrop='+document.querySelector('.bc-backdrop').dataset.backdrop;})); }
await b.close();
