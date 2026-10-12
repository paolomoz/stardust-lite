// ys.mjs <url> <width> — y of landmark texts on the build (compare with spec-view-<W>.txt rows)
import { chromium } from 'playwright';
const [url, w] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const out = []; const want = ['Explore from Anywhere!', 'Plan Your Visit', 'What interests you?', 'Featured', 'Explore more by topic', 'Sidedoor Podcast', 'Membership', 'Smithsonian Story', 'Smithsonian Collection Spotlight', 'Shop', 'Magazine'];
  document.querySelectorAll('h2,h3,a,p,img,footer').forEach((e) => { const t = e.textContent.trim(); if (want.includes(t) || (e.tagName === 'IMG' && out.filter((o) => o[0] === 'IMG').length < 30)) { const bx = e.getBoundingClientRect(); out.push([e.tagName, t.slice(0, 30), Math.round(bx.x), Math.round(bx.y + scrollY), Math.round(bx.width), Math.round(bx.height)]); } });
  const f = document.querySelector('footer').getBoundingClientRect(); out.push(['FOOTER', '', 0, Math.round(f.y + scrollY), 0, Math.round(f.height)]);
  return out;
});
r.forEach((x) => console.log(x.join(' ')));
await b.close();
