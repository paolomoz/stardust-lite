import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(process.argv[2], { waitUntil: 'networkidle' });
await p.click('#nav .nav-item:nth-child(1) .nav-toggle');
await p.waitForTimeout(300);
console.log(await p.evaluate(() => { const t = document.querySelector('#nav .nav-item:nth-child(1) .nav-toggle'); const u = document.querySelector('#nav .nav-item:nth-child(1) .nav-panel'); const r = u.getBoundingClientRect(); return { expanded: t.getAttribute('aria-expanded'), pinned: t.closest('li').dataset.pinned, display: getComputedStyle(u).display, rect: [r.x, r.y, r.width, r.height], headNext: t.closest('.nav-item-head').nextElementSibling?.className }; }));
await b.close();
