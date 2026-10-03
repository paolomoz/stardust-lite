#!/usr/bin/env node
// brief.mjs — the one-screen CSS brief of a measured page from a measure dir (measure-page's spec-<W>.json per width): per live section
// at the base width its box, paint and padding, the content x-range (the cap), the distinct TEXT STYLES (tag · size/line-height · weight ·
// family · colour · transform, with counts), the media boxes and the painted controls (padding, radius, border), then the same section's
// height and x-range at the other widths; page-wide the families with the roles they carry, the colours by count, the cap model read from
// the x-ranges. Reading the three spec-views, the structure dumps and the deep probes before the first CSS took 13 min on a 6-section page
// (scotiabank-personal, loop r1) — this is that reading, in one call, so the block CSS is drafted from it and the specs are re-read only for a row.
// Usage: node brief.mjs <measure-dir> [--widths 360,1440,2560] [--base 1440] [--triage triage.json] [--all-sections]
//   --triage   labels each section with the triage row's block / collection match (paired by the section's y at the base width)
//   --all-sections   also the 0-height and text-less sections (hidden by default)
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { arg } from './common.mjs';

const dir = process.argv[2];
if (!dir || dir.startsWith('--') || !existsSync(dir)) { console.error('usage: brief.mjs <measure-dir> [--widths 360,1440,2560] [--base 1440] [--triage triage.json] [--all-sections]'); process.exit(1); }
const widths = String(arg('--widths', '360,1440,2560')).split(',').map(Number).filter((w) => existsSync(join(dir, `spec-${w}.json`)));
if (!widths.length) { console.error(`brief: no spec-<W>.json in ${dir} (run measure-page)`); process.exit(1); }
const base = Number(arg('--base', widths.includes(1440) ? 1440 : widths[Math.floor(widths.length / 2)]));
const specs = Object.fromEntries(widths.map((w) => [w, JSON.parse(readFileSync(join(dir, `spec-${w}.json`), 'utf8'))]));
const S = specs[base]; const others = widths.filter((w) => w !== base);
const triage = typeof arg('--triage', null) === 'string' && existsSync(arg('--triage')) ? JSON.parse(readFileSync(arg('--triage'), 'utf8')) : null;
const all = process.argv.includes('--all-sections');

const rgb = (c) => String(c || '').replace(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/, (_, r, g, b, a) => (a !== undefined && Number(a) < 1 ? `#${[r, g, b].map((x) => Number(x).toString(16).padStart(2, '0')).join('')}/${a}` : `#${[r, g, b].map((x) => Number(x).toString(16).padStart(2, '0')).join('')}`));
const onPage = (it, W) => it.box && it.box[2] > 1 && it.box[3] > 1 && it.box[0] + it.box[2] > 0 && it.box[0] < W;
const fam = (ff) => String(ff || '').split(',')[0].replace(/["']/g, '').trim();
const count = (list) => { const m = new Map(); for (const k of list) m.set(k, (m.get(k) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
const xr = (items, W) => { const on = items.filter((it) => onPage(it, W) && it.k !== 'paint'); if (!on.length) return null; const x0 = Math.min(...on.map((it) => it.box[0])); const x1 = Math.max(...on.map((it) => it.box[0] + it.box[2])); return [x0, x1]; };
const isText = (it) => !['paint', 'img', 'video', 'svg', 'iframe', 'canvas'].includes(it.k);
// the same section at another width: by index when the counts agree, else by id
const twin = (W, i) => { const o = specs[W]; if (!o) return null; if (o.secs.length === S.secs.length) return o.secs[i]; return o.secs.find((s) => s.id === S.secs[i].id) || null; };
const label = (s) => { if (!triage?.sections) return ''; const row = triage.sections.find((r) => r.spec && r.spec.box && Math.abs(r.spec.box[1] - s.box[1]) <= 2) || triage.sections.find((r) => r.box && Math.abs(r.box[1] - s.box[1]) <= 2); if (!row) return ''; const m = row.match || {}; return ` ‹${row.chrome ? row.chrome : m.block || row.collection || 'default'}${m.kind ? ` ${m.kind}` : ''}${row.sectionStyle ? ` · ${row.sectionStyle}` : ''}›`; };

console.log(`brief: ${S.url} — base ${base}${others.length ? `, also ${others.join(', ')}` : ''} | doc ${widths.map((w) => `${w}: ${specs[w].doc}`).join(' / ')} | body bg ${rgb(S.bodyBg)} | body class "${String(S.body || '').slice(0, 60)}"`);
// families → the roles they carry at the base width
const roles = new Map();
for (const s of S.secs) for (const it of s.items) if (isText(it) && onPage(it, base) && it.t) { const f = fam(it.ff); if (!roles.has(f)) roles.set(f, new Map()); const r = roles.get(f); const key = `${it.k} ${it.fs}/${it.lh} ${it.fw}`; r.set(key, (r.get(key) || 0) + 1); }
console.log(`fonts: ${[...roles.entries()].map(([f, r]) => `${f} — ${[...r.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, n]) => `${k} ×${n}`).join(', ')}`).join(' | ')}`);
console.log(`faces loaded: ${[...new Set(S.fonts || [])].slice(0, 12).join('; ')}`);
const textColours = count(S.secs.flatMap((s) => s.items.filter((it) => isText(it) && onPage(it, base) && it.t).map((it) => rgb(it.c))));
const bgColours = count(S.secs.flatMap((s) => [s.bg, ...s.items.filter((it) => it.k === 'paint' && onPage(it, base)).map((it) => it.bg)].filter((c) => c && c !== 'rgba(0, 0, 0, 0)').map(rgb)));
console.log(`colours: text ${textColours.slice(0, 6).map(([c, n]) => `${c} ×${n}`).join(', ')} | backgrounds ${bgColours.slice(0, 6).map(([c, n]) => `${c} ×${n}`).join(', ')}`);
// the cap: the widest content x-range per width over the content sections (chrome excluded)
const capOf = (W) => { const o = specs[W]; const rs = o.secs.filter((s) => !/^(HEADER|FOOTER)\b/.test(s.id)).map((s) => xr(s.items, W)).filter(Boolean); if (!rs.length) return '—'; const wides = count(rs.map(([a, b]) => b - a)).slice(0, 3); return `${wides.map(([w, n]) => `${w} wide ×${n}`).join(', ')} (x ${Math.min(...rs.map((r) => r[0]))}..${Math.max(...rs.map((r) => r[1]))})`; };
console.log(`cap: ${widths.map((w) => `${w}: ${capOf(w)}`).join(' | ')} — a width that holds from the base to the probe is a fixed cap (module or content, cap-probe names the placement); one that grows is fluid`);
console.log('');
S.secs.forEach((s, i) => {
  const items = s.items.filter((it) => onPage(it, base));
  const texts = items.filter((it) => isText(it) && it.t);
  if (!all && (s.box[3] === 0 || (!texts.length && !items.some((it) => ['img', 'video', 'svg'].includes(it.k))))) { if (s.box[3] === 0) console.log(`#${i} ${s.id.slice(0, 40)} y${s.box[1]} h0 — spacing (margin ${s.mar})`); return; }
  const tw = others.map((W) => { const t = twin(W, i); if (!t) return `${W}: —`; const r = xr(t.items, W); return `${W}: h${t.box[3]}${r ? ` x${r[0]}..${r[1]}` : ''}`; });
  const r = xr(items, base);
  console.log(`#${i} ${s.id.slice(0, 48)}${label(s)} y${s.box[1]} h${s.box[3]} pad ${s.pad}${s.bg && s.bg !== 'rgba(0, 0, 0, 0)' ? ` bg ${rgb(s.bg)}` : ''}${s.bgi ? ' bgi' : ''}${r ? ` | content x${r[0]}..${r[1]} (${r[1] - r[0]})` : ''} | ${tw.join(' | ')}`);
  const styles = count(texts.map((it) => `${it.k}${it.inline ? '·inl' : ''} ${it.fs}/${it.lh} ${it.fw} ${fam(it.ff)} ${rgb(it.c)}${it.tt && it.tt !== 'none' ? ` ${it.tt}` : ''}${it.ta && !['start', 'left'].includes(it.ta) ? ` ${it.ta}` : ''}${it.fst && it.fst !== 'normal' ? ` ${it.fst}` : ''}${it.td && it.td !== 'none' ? ` ${it.td}` : ''}`));
  if (styles.length) console.log(`   text  ${styles.slice(0, 10).map(([k, n]) => `${k} ×${n}`).join(' | ')}${styles.length > 10 ? ` | +${styles.length - 10} more` : ''}`);
  const media = items.filter((it) => ['img', 'video', 'svg', 'iframe'].includes(it.k));
  if (media.length) console.log(`   media ${count(media.map((it) => `${it.k} ${it.box[2]}×${it.box[3]}${it.fit && it.fit !== 'fill' ? ` ${it.fit}` : ''}`)).slice(0, 8).map(([k, n]) => `${k} ×${n}`).join(' | ')}${items.filter((it) => it.k === 'paint' && it.bgi).length ? ` | bgi on ${items.filter((it) => it.k === 'paint' && it.bgi).map((it) => `${it.tag}.${String(it.cls).split(' ')[0]} ${it.box[2]}×${it.box[3]}`).slice(0, 3).join(', ')}` : ''}`);
  const paints = items.filter((it) => it.k === 'paint' && (it.pad !== '0px' || it.br || it.border || it.shadow) && !(it.box[2] >= base - 2 && it.pad === '0px'));
  if (paints.length) console.log(`   paint ${count(paints.map((it) => `${it.tag}.${String(it.cls).split(' ')[0]} ${it.box[2]}×${it.box[3]} pad ${it.pad}${it.bg && it.bg !== 'rgba(0, 0, 0, 0)' ? ` bg ${rgb(it.bg)}` : ''}${it.br ? ` br ${it.br}` : ''}${it.border ? ` bd ${String(it.border).split(' | ')[0].slice(0, 28)}` : ''}${it.shadow ? ' shadow' : ''}`)).slice(0, 8).map(([k, n]) => `${k} ×${n}`).join(' | ')}`);
  // rhythm: the vertical gaps at the base width between consecutive text / media boxes (the next box starting below the previous bottom),
  // the top gap from the section's y and the bottom gap to its end — paddings and margins read as pixels (7 min by hand, cibc-careers)
  const seq = items.filter((it) => isText(it) ? it.t && !it.inline : ['img', 'video', 'svg', 'iframe'].includes(it.k)).sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
  if (seq.length) { const g = []; let prevBottom = s.box[1]; let col = null; for (const it of seq) { const top = it.box[1]; if (top >= prevBottom - 2) { const gap = top - prevBottom; g.push(`${gap >= 0 ? gap : 0} → ${it.k}(${it.box[3]})`); prevBottom = top + it.box[3]; col = it.box[0]; } else if (col !== null && Math.abs(it.box[0] - col) > 8) { /* a second column at the same y: skipped */ } }
    const bottom = s.box[1] + s.box[3] - prevBottom; console.log(`   rhythm ${g.slice(0, 14).join('  ')}${g.length > 14 ? `  … +${g.length - 14}` : ''}  → bottom ${bottom}`); }
  const ents = s.items.filter((it) => it.ent).length; if (ents) console.log(`   note  ${ents} items read in an entrance state (rest boxes used by pair / sections)`);
});
console.log(`\nre-read a row with: spec-view ${dir}/spec-<W>.json <i>; paint not on a node: deep-probe <url> <W> --sels …`);
