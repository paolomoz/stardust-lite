#!/usr/bin/env node
// section-view.mjs — one section's mini-gate (five-minute loop, iteration 22): the build rendered NOW at each width, its section cut out and set
// next to the same section of the last gate round's live capture, with the heights and the section's pixel %. An agent that owns one block
// checks its own section in ≈ 5 s instead of a full round (20–45 s for the whole page, and one round at a time — the fan-out runs several
// owners at once). The live side is the gate's capture (never re-fetched); the build side is fresh.
// Usage: node section-view.mjs <gate-dir> <build-url> --section <i[,j]>|header|footer [--widths 1440,360] [--out <gate-dir>/view]
//   <i> is the digest's `#i` (the build section's index). Prints one line per width and writes view-<part>-<W>.png (live | build).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { arg, launch, contextOptions, openPage, settle } from './common.mjs';

const dir = process.argv[2]; const url = process.argv[3]; const part = String(arg('--section', ''));
if (!dir || !url || !part || url.startsWith('--')) { console.error('usage: section-view.mjs <gate-dir> <build-url> --section <i[,j]>|header|footer [--widths 1440,360] [--out <dir>]'); process.exit(1); }
const widths = String(arg('--widths', '1440,360')).split(',').map(Number); const out = String(arg('--out', join(dir, 'view'))); mkdirSync(out, { recursive: true });
const secSel = String(arg('--build-sections', 'main .section'));

const cut = (png, y0, y1) => { const h = Math.max(1, Math.min(png.height, y1) - Math.max(0, y0)); const o = new PNG({ width: png.width, height: h }); PNG.bitblt(png, o, 0, Math.max(0, y0), png.width, h, 0, 0); return o; };
const browser = await launch();
for (const W of widths) {
  const livePng = join(dir, `live-${W}.png`); const tableFile = join(dir, `sections-${W}.json`);
  if (!existsSync(livePng) || !existsSync(tableFile)) { console.log(`${W}: no gate round at this width in ${dir}`); continue; }
  const table = JSON.parse(readFileSync(tableFile, 'utf8')).sections || []; const live = PNG.sync.read(readFileSync(livePng));
  const ctx = await browser.newContext(contextOptions({ width: W, height: 900 })); const page = await openPage(ctx, url, { width: W, height: 900, wait: 300 }); await settle(page, 900, 60, 400);
  const firstLive = table.find((r) => r.live)?.live.y0 ?? 0; const lastLive = [...table].reverse().find((r) => r.live)?.live.y1 ?? live.height;
  // the live range: the table rows' (consecutive indices joined); the header is above the first section, the footer below the last
  let ly0; let ly1; let idx = [];
  if (part === 'header') { ly0 = 0; ly1 = firstLive; } else if (part === 'footer') { ly0 = lastLive; ly1 = live.height; } else {
    idx = part.split(',').map(Number); const rows = table.filter((r) => idx.includes(r.index) && r.live);
    if (!rows.length) { console.log(`${W}: section ${part} has no live partner in the round's table`); await ctx.close(); continue; }
    ly0 = Math.min(...rows.map((r) => r.live.y0)); ly1 = Math.max(...rows.map((r) => r.live.y1));
  }
  const box = await page.evaluate(([p, sel, ids]) => {
    const r = (e) => { const b = e.getBoundingClientRect(); return [b.top + scrollY, b.bottom + scrollY]; };
    if (p === 'header') { const h = document.querySelector('header'); const s = document.querySelector(sel); return [0, s ? r(s)[0] : (h ? r(h)[1] : 0)]; }
    if (p === 'footer') { const all = [...document.querySelectorAll(sel)]; const f = document.querySelector('footer'); return [all.length ? r(all[all.length - 1])[1] : (f ? r(f)[0] : 0), document.documentElement.scrollHeight]; }
    // a section's range runs to the next section's top (the gate's stride): a collapsing margin is still this section's pixels
    const all = [...document.querySelectorAll(sel)]; const mine = ids.map((i) => all[i]).filter(Boolean); if (!mine.length) return null;
    const y0 = Math.min(...mine.map((e) => r(e)[0])); const last = Math.max(...ids); const next = all.slice(last + 1).find((e) => e.getBoundingClientRect().height > 0);
    return [y0, next ? r(next)[0] : Math.max(...mine.map((e) => r(e)[1]))];
  }, [part, secSel, idx]);
  if (!box) { console.log(`${W}: no build section ${part}`); await ctx.close(); continue; }
  const [by0, by1] = box.map(Math.round);
  const shot = PNG.sync.read(await page.screenshot({ fullPage: true, clip: { x: 0, y: by0, width: W, height: Math.max(1, by1 - by0) } }));
  await ctx.close();
  const a = cut(live, ly0, ly1); const b = shot; const H = Math.max(a.height, b.height); const h = Math.min(a.height, b.height);
  const a0 = cut(a, 0, h); const b0 = cut(b, 0, h); const dn = pixelmatch(a0.data, b0.data, null, W, h, { threshold: 0.1 });
  const pct = Number((((dn + W * (H - h)) / (W * H)) * 100).toFixed(2));
  const gap = 12; const o = new PNG({ width: W * 2 + gap, height: H }); o.data.fill(255);
  for (let y = 0; y < H; y += 1) for (let x = W; x < W + gap; x += 1) { const k = (y * o.width + x) * 4; o.data[k] = 255; o.data[k + 1] = 0; o.data[k + 2] = 255; }
  PNG.bitblt(a, o, 0, 0, W, a.height, 0, 0); PNG.bitblt(b, o, 0, 0, W, b.height, W + gap, 0);
  const file = join(out, `view-${part.replace(/,/g, '-')}-${W}.png`); writeFileSync(file, PNG.sync.write(o));
  console.log(`${W}: live ${ly1 - ly0} px · build ${by1 - by0} px (Δh ${by1 - by0 - (ly1 - ly0)}) · ${pct} % → ${file}`);
}
await browser.close();
process.exit(0);
