#!/usr/bin/env node
// cards.mjs — one reading card per build section (next phase, item 4): what the agent read for 1.5–6 min a run with its own flatten scripts
// (lenovo `flat.py`, waters, santanderus) — the section's live range from the gate's table, the measured values INSIDE that range at 1440 and
// 360 (text styles, media boxes, painted units and controls, the vertical rhythm, the content x-range), the round's numbers (Δh, % per width),
// the file that owns the section, and the live | build crop of the round's own captures at 1440 and 360 (no browser: the gate's PNGs).
// Values are the live page's measurements, never its CSS.
// Usage: node cards.mjs <gate-dir> <measure-dir> [--widths 1440,360] [--out <gate-dir>/cards]
//   Writes <out>/INDEX.md (one line per section) and <out>/<i>.md + <out>/<i>-<W>.png; prints the INDEX path.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';
import { arg } from './common.mjs';

const gate = process.argv[2]; const measure = process.argv[3];
if (!gate || !measure || measure.startsWith('--')) { console.error('usage: cards.mjs <gate-dir> <measure-dir> [--widths 1440,360] [--out <gate-dir>/cards]'); process.exit(1); }
const widths = String(arg('--widths', '1440,360')).split(',').map(Number); const out = String(arg('--out', join(gate, 'cards'))); mkdirSync(out, { recursive: true });
const tables = Object.fromEntries([...new Set([...widths, 360, 1440, 2560])].map((W) => { try { return [W, JSON.parse(readFileSync(join(gate, `sections-${W}.json`), 'utf8')).sections || []]; } catch { return [W, null]; } }).filter(([, t]) => t));
const specs = Object.fromEntries(widths.map((W) => { try { return [W, JSON.parse(readFileSync(join(measure, `spec-${W}.json`), 'utf8'))]; } catch { return [W, null]; } }).filter(([, s]) => s));
const base = tables[1440] ? 1440 : Number(Object.keys(tables)[0]);
if (!tables[base]) { console.error(`cards: no sections-<W>.json in ${gate} (run a gate round first)`); process.exit(1); }

const rgb = (c) => String(c || '').replace(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/, (_, r, g, b, a) => (a !== undefined && Number(a) < 1 ? `rgb(${r} ${g} ${b} / ${Math.round(Number(a) * 100)}%)` : `#${[r, g, b].map((x) => Number(x).toString(16).padStart(2, '0')).join('')}`));
const fam = (ff) => String(ff || '').split(',')[0].replace(/["']/g, '').trim();
const count = (list) => { const m = new Map(); for (const k of list) m.set(k, (m.get(k) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
const isText = (it) => !['paint', 'img', 'video', 'svg', 'iframe', 'canvas'].includes(it.k);
const onPage = (it, W) => it.box && it.box[2] > 1 && it.box[3] > 1 && it.box[0] + it.box[2] > 0 && it.box[0] < W;
const inRange = (it, y0, y1) => it.box && it.box[1] + it.box[3] / 2 >= y0 && it.box[1] + it.box[3] / 2 < y1;
const itemsIn = (W, y0, y1) => (specs[W]?.secs || []).flatMap((s) => s.items).filter((it) => onPage(it, W) && inRange(it, y0, y1));

function values(W, y0, y1) {
  const items = itemsIn(W, y0, y1); if (!items.length) return [`- ${W}: no measured items in y${y0}–${y1}`];
  const L = [];
  const texts = items.filter((it) => isText(it) && it.t);
  const xs = items.filter((it) => it.k !== 'paint'); const x0 = Math.min(...xs.map((it) => it.box[0])); const x1 = Math.max(...xs.map((it) => it.box[0] + it.box[2]));
  L.push(`- ${W}: live y${y0}–${y1} (h${y1 - y0}), content x${Math.round(x0)}..${Math.round(x1)} (${Math.round(x1 - x0)} wide)`);
  const st = count(texts.filter((it) => !it.inline).map((it) => `${it.k} ${it.fs}/${it.lh} ${it.fw} '${fam(it.ff)}' ${rgb(it.c)}${it.tt && it.tt !== 'none' ? ` ${it.tt}` : ''}${it.ta && it.ta !== 'start' && it.ta !== 'left' ? ` ${it.ta}` : ''}${it.ls && it.ls !== 'normal' ? ` ls ${it.ls}` : ''}`));
  if (st.length) L.push(`  - text: ${st.slice(0, 8).map(([k, n]) => `${k}${n > 1 ? ` ×${n}` : ''}`).join(' · ')}`);
  const media = count(items.filter((it) => ['img', 'video', 'svg', 'iframe'].includes(it.k)).map((it) => `${it.k} ${it.box[2]}×${it.box[3]}${it.fit ? ` ${it.fit}` : ''}${it.op ? ` @${it.op}` : ''} at x${it.box[0]}`));
  if (media.length) L.push(`  - media: ${media.slice(0, 6).map(([k, n]) => `${k}${n > 1 ? ` ×${n}` : ''}`).join(' · ')}`);
  const paints = count(items.filter((it) => it.k === 'paint' && ((it.bg && it.bg !== 'rgba(0, 0, 0, 0)') || it.br || it.border || it.shadow)).map((it) => `${it.tag} ${it.box[2]}×${it.box[3]}${it.bg && it.bg !== 'rgba(0, 0, 0, 0)' ? ` bg ${rgb(it.bg)}` : ''}${it.br ? ` radius ${it.br}` : ''}${it.pad && it.pad !== '0px' ? ` pad ${it.pad}` : ''}${it.border ? ` border ${String(it.border).split(' | ')[0]}` : ''}${it.shadow ? ' shadow' : ''}`));
  if (paints.length) L.push(`  - paint: ${paints.slice(0, 6).map(([k, n]) => `${k}${n > 1 ? ` ×${n}` : ''}`).join(' · ')}`);
  // the rhythm: gaps between consecutive text / media boxes down the range (a box starting below the previous bottom), the last to the end
  const seq = items.filter((it) => (isText(it) ? it.t && !it.inline : ['img', 'video', 'svg'].includes(it.k))).sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
  if (seq.length) { const g = []; let prev = y0; for (const it of seq) { if (it.box[1] >= prev - 2) { g.push(`${Math.round(it.box[1] - prev)} → ${it.k}(${it.box[3]})`); prev = it.box[1] + it.box[3]; } } L.push(`  - rhythm: ${g.slice(0, 12).join('  ')}${g.length > 12 ? ' …' : ''}  → bottom ${Math.round(y1 - prev)}`); }
  return L;
}

// a crop pair from the round's captures: live | build at one width, scaled to ≤ 1600 px wide and ≤ 1400 tall
const pngs = {}; const load = (f) => { if (!(f in pngs)) pngs[f] = existsSync(f) ? PNG.sync.read(readFileSync(f)) : null; return pngs[f]; };
function crop(W, ly0, ly1, by0, by1, file) {
  const L = load(join(gate, `live-${W}.png`)); const B = load(join(gate, `build-${W}.png`)); if (!L || !B) return false;
  const h = Math.min(1400 * (W >= 1440 ? 2 : 1), Math.max(ly1 - ly0, by1 - by0)); const gap = 12; const scale = Math.min(1, 1600 / (W * 2 + gap));
  const ow = Math.round((W * 2 + gap) * scale); const oh = Math.max(1, Math.round(h * scale)); const o = new PNG({ width: ow, height: oh }); o.data.fill(255);
  for (let y = 0; y < oh; y += 1) {
    const sy = Math.floor(y / scale);
    for (let x = 0; x < ow; x += 1) {
      const sx = Math.floor(x / scale); const k = (y * ow + x) * 4; let src = null; let px = 0; let py = 0;
      if (sx < W) { src = L; px = sx; py = ly0 + sy; if (sy >= ly1 - ly0) src = null; } else if (sx >= W + gap) { src = B; px = sx - W - gap; py = by0 + sy; if (sy >= by1 - by0) src = null; } else { o.data[k] = 255; o.data[k + 1] = 0; o.data[k + 2] = 255; continue; }
      if (!src || py < 0 || py >= src.height || px >= src.width) continue; const j = (py * src.width + px) * 4; o.data[k] = src.data[j]; o.data[k + 1] = src.data[j + 1]; o.data[k + 2] = src.data[j + 2];
    }
  }
  writeFileSync(file, PNG.sync.write(o)); return true;
}

const owner = (r) => (r.block ? `blocks/${r.block}/${r.block}.css` : 'styles/styles.css (default content — scope by `main .section:nth-of-type(n)`)');
const index = ['# Reading cards — one per build section (the digest\'s #i)', '', '| # | block | live h (1440) | Δh 360 / 1440 / 2560 | % 360 / 1440 / 2560 | card |', '|---|---|---|---|---|---|'];
for (const r of tables[base]) {
  const at = (W) => (tables[W] || []).find((x) => x.index === r.index);
  const lines = [`# #${r.index} ${r.block || 'default content'} — "${String(r.anchorText || '').slice(0, 60)}"`, '', `Owner: \`${owner(r)}\` · section \`main .section:nth-of-type(${r.index + 1})\` (when the build's sections are all main > .section)`, ''];
  lines.push(`Round: ${[360, 1440, 2560].map((W) => { const x = at(W); return x ? `${W} Δh ${x.dh ?? '—'} · ${x.pct ?? '—'} %` : `${W} —`; }).join(' | ')}`, '');
  lines.push('Measured (the live page, inside this section\'s range at each width):');
  for (const W of widths) { const x = at(W); if (x?.live) lines.push(...values(W, x.live.y0, x.live.y1)); else lines.push(`- ${W}: no live partner in the round's table`); }
  const imgs = [];
  for (const W of widths) { const x = at(W); if (x?.live && x?.build && crop(W, x.live.y0, x.live.y1, x.build.y0, x.build.y1, join(out, `${r.index}-${W}.png`))) imgs.push(`${r.index}-${W}.png`); }
  lines.push('', `Crops (live | build, the round's captures): ${imgs.map((f) => join(out, f)).join('  ') || '—'}`);
  writeFileSync(join(out, `${r.index}.md`), `${lines.join('\n')}\n`);
  index.push(`| ${r.index} | ${r.block || 'default'} | ${r.live ? r.live.h : '—'} | ${[360, 1440, 2560].map((W) => at(W)?.dh ?? '—').join(' / ')} | ${[360, 1440, 2560].map((W) => at(W)?.pct ?? '—').join(' / ')} | ${join(out, `${r.index}.md`)} |`);
}
writeFileSync(join(out, 'INDEX.md'), `${index.join('\n')}\n`);
console.log(`cards: ${tables[base].length} section card(s) → ${join(out, 'INDEX.md')}`);
process.exit(0);
