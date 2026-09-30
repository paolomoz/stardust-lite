// tangram-probe.mjs — screen-space polygons of the hero tangram clip shapes at rest (per slide), relative to the SVG box.
import { chromium } from 'playwright'; import { writeFileSync } from 'node:fs';
const W=Number(process.argv[2]||1440);
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:W,height:900},userAgent:UA});
await p.goto('https://www.baincapital.com/',{waitUntil:'domcontentloaded',timeout:90000}); await p.waitForTimeout(6000); try { await p.click('.agree-button',{timeout:1500}); } catch {}
await p.waitForTimeout(3000);
const r = await p.evaluate(()=>{
  const svg=document.querySelector('.tanagram-anim-wrap svg'); const sb=svg.getBoundingClientRect();
  const out={svgBox:[sb.x,sb.y+scrollY,sb.width,sb.height], viewBox:svg.getAttribute('viewBox'), col:(()=>{const c=document.querySelector('.tanagram-anim-col').getBoundingClientRect();return [c.x,c.y+scrollY,c.width,c.height]})(), wrap:(()=>{const c=document.querySelector('.tanagram-anim-wrap').getBoundingClientRect();return [c.x,c.y+scrollY,c.width,c.height]})(), slides:[]};
  for (const slide of svg.querySelectorAll('.slide-bg')) {
    const s={id:slide.id, cls:slide.className.baseVal, opacity:getComputedStyle(slide).opacity, shapes:[]};
    for (const el of slide.querySelectorAll(':scope > g[clip-path], :scope > rect[clip-path]')) {
      const cp=el.getAttribute('clip-path').match(/#([^)]+)/)[1]; const path=svg.querySelector('#'+cp+' path'); const ctm=el.getScreenCTM();
      const L=path.getTotalLength(); const pts=[]; for(let i=0;i<120;i++){const pt=path.getPointAtLength(L*i/120); const sp=new DOMPoint(pt.x,pt.y).matrixTransform(ctm); pts.push([sp.x-sb.x, sp.y-sb.y]);}
      // corners: points where the direction changes most (rounded triangle → pick 3-4 local maxima of turning angle)
      const ang=pts.map((p,i)=>{const a=pts[(i-3+120)%120], c=pts[(i+3)%120]; const v1=[p[0]-a[0],p[1]-a[1]], v2=[c[0]-p[0],c[1]-p[1]]; const d=Math.atan2(v2[1],v2[0])-Math.atan2(v1[1],v1[0]); return Math.abs(Math.atan2(Math.sin(d),Math.cos(d)));});
      const idx=[...ang.keys()].sort((a,b)=>ang[b]-ang[a]); const corners=[]; for(const i of idx){ if(corners.every(j=>Math.min(Math.abs(i-j),120-Math.abs(i-j))>8)) corners.push(i); if(corners.length===4) break; }
      corners.sort((a,b)=>a-b);
      const img=el.querySelector('image'); 
      s.shapes.push({tag:el.tagName, clip:cp, fill:el.getAttribute('fill'), img:img?img.getAttribute('xlink:href')||img.getAttribute('href'):null, corners:corners.map(i=>pts[i].map(v=>Math.round(v))), cornerAngles:corners.map(i=>+ang[i].toFixed(2)), bbox:(()=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return [Math.round(Math.min(...xs)),Math.round(Math.min(...ys)),Math.round(Math.max(...xs)-Math.min(...xs)),Math.round(Math.max(...ys)-Math.min(...ys))]})(), opacity:getComputedStyle(el).opacity, pts:pts.map(p=>p.map(v=>Math.round(v)))});
    }
    out.slides.push(s);
  }
  return out;
});
writeFileSync(`.work/live/tangram-${W}.json`, JSON.stringify(r,null,1));
console.log('svg', r.svgBox.map(Math.round), 'viewBox', r.viewBox, 'col', r.col.map(Math.round), 'wrap', r.wrap.map(Math.round));
for (const s of r.slides) { console.log('\n', s.id, s.cls, 'op', s.opacity); for (const sh of s.shapes) console.log('  ', sh.tag, sh.clip, sh.fill||'', 'op', sh.opacity, 'bbox', sh.bbox, 'corners', JSON.stringify(sh.corners), sh.cornerAngles, (sh.img||'').split('/').pop().slice(0,40)); }
await b.close();
