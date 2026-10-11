#!/usr/bin/env node
// spec-to-css.mjs — a block CSS DRAFT from the measurements (loop high-impact pass): for every authored section with a block, the live
// section's values placed under the block root — section padding from the inset chain, the content cap, the repeating unit as a grid
// (columns, gap, card box, padding, radius, border, background), the text styles per tag, the media box and fit, the controls' padding /
// radius / border — at the base width, with a mobile query from the 360 spec and a note on what grows at the probe width; every value
// annotated with its spec row. Default-content sections and the page scale go to styles/sections-draft.css. Agents derived these numbers by
// hand from spec rows and deep probes in every loop round (4–10 min each) and then verified them in gate rounds: the draft is edited, not derived.
// The STRUCTURE is the pipeline's (`.block > div` a row, `.block > div > div` a cell); a decorate that builds its own DOM takes the values over.
// Usage: node spec-to-css.mjs <measure-dir> --triage triage.json --doc doc/<slug>.html --out blocks [--base 1440] [--mobile 360] [--probe 2560] [--bp <px>] [--force]
//   writes blocks/<name>/<name>.draft.css (next to the block, never over <name>.css unless --force) and styles/sections-draft.css
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { arg } from './common.mjs';

const dir = process.argv[2];
if (!dir || dir.startsWith('--') || !existsSync(dir)) { console.error('usage: spec-to-css.mjs <measure-dir> --triage triage.json --doc doc/<slug>.html --out blocks [--base 1440] [--mobile 360] [--probe 2560] [--bp <px>] [--force]'); process.exit(1); }
const base = Number(arg('--base', 1440)); const mobile = Number(arg('--mobile', 360)); const probe = Number(arg('--probe', 2560));
const load = (W) => (existsSync(join(dir, `spec-${W}.json`)) ? JSON.parse(readFileSync(join(dir, `spec-${W}.json`), 'utf8')) : null);
const S = load(base); const M = load(mobile); const P = load(probe);
if (!S) { console.error(`spec-to-css: no spec-${base}.json in ${dir}`); process.exit(1); }
const summary = existsSync(join(dir, 'summary.json')) ? JSON.parse(readFileSync(join(dir, 'summary.json'), 'utf8')) : {};
const triage = typeof arg('--triage', null) === 'string' ? JSON.parse(readFileSync(arg('--triage'), 'utf8')) : null;
const doc = typeof arg('--doc', null) === 'string' ? readFileSync(arg('--doc'), 'utf8') : null;
const outDir = String(arg('--out', 'blocks')); const force = process.argv.includes('--force');

// ── helpers (brief's readers) ──
const rgb = (c) => String(c || '').replace(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/, (_, r, g, b, a) => (a !== undefined && Number(a) < 1 ? `rgb(${r} ${g} ${b} / ${Math.round(Number(a) * 100)}%)` : `#${[r, g, b].map((x) => Number(x).toString(16).padStart(2, '0')).join('')}`));
const onPage = (it, W) => it.box && it.box[2] > 1 && it.box[3] > 1 && it.box[0] + it.box[2] > 0 && it.box[0] < W;
const fam = (ff) => String(ff || '').split(',')[0].replace(/["']/g, '').trim();
const count = (list) => { const m = new Map(); for (const k of list) m.set(k, (m.get(k) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
const isText = (it) => !['paint', 'img', 'video', 'svg', 'iframe', 'canvas'].includes(it.k);
const xr = (items, W) => { const on = items.filter((it) => onPage(it, W) && it.k !== 'paint'); if (!on.length) return null; return [Math.min(...on.map((it) => it.box[0])), Math.max(...on.map((it) => it.box[0] + it.box[2]))]; };
const twin = (spec, i) => { if (!spec) return null; if (spec.secs.length === S.secs.length) return spec.secs[i]; return spec.secs.find((s) => s.id === S.secs[i].id) || null; };
const font = (it) => `${it.fw && it.fw !== '400' ? `${it.fw} ` : ''}${it.fs}${it.lh && it.lh !== 'normal' ? `/${it.lh}` : ''} '${fam(it.ff)}'`;
const bp = Number(arg('--bp', 0)) || (() => { const b = (summary.breakpoints || []).map((s) => /^min (\d+) ×(\d+)$/.exec(s)).filter(Boolean).map((m) => [Number(m[1]), Number(m[2])]).filter(([px]) => px >= 600 && px <= 1200).sort((a, b) => b[1] - a[1]); return b.length ? b[0][0] : 900; })();

// ── the authored sections ↔ triage rows ↔ live sections ──
// author writes one section per non-chrome triage row, in order; the document's block class names are the truth (the triage holds the draft's)
const docSections = doc ? (() => { const main = doc.slice(doc.indexOf('<main'), doc.lastIndexOf('</main>')); const out = []; let depth = 0; let start = -1; const re = /<div\b[^>]*>|<\/div>/g; let m; const mainOpen = main.indexOf('>') + 1; re.lastIndex = mainOpen; while ((m = re.exec(main))) { if (m[0][1] === '/') { depth -= 1; if (depth === 0 && start >= 0) { out.push(main.slice(start, m.index + 6)); start = -1; } } else { if (depth === 0) start = m.index; depth += 1; } } return out; })() : [];
const isContentSection = (h) => !/^<div>\s*<div class="metadata">[\s\S]*<\/div>\s*<\/div>\s*$/.test(h.trim()) && /<(h[1-6]|p|ul|ol|div class="(?!section-metadata)|picture|img|a )/.test(h);
const docSectionsAll = docSections.slice(); docSections.length = 0; docSections.push(...docSectionsAll.filter(isContentSection));
const blockOf = (secHtml) => { const m = secHtml.match(/<div class="((?!section-metadata|metadata)[a-z][a-z0-9-]*(?: [a-z0-9-]+)*)">/); return m ? m[1].split(/\s+/) : null; };
const styleOf = (secHtml) => { const m = secHtml.match(/<div class="section-metadata">[\s\S]*?<div>\s*style\s*<\/div>\s*<div>([^<]*)<\/div>/i); return m ? m[1].trim() : null; };
const rows = triage ? triage.sections.filter((r) => !r.chrome && !r.drop) : []; // a dropped row has no document section: counting it shifted every nth-of-type by one (deloitte)
const liveIndexFor = (row) => { if (!row?.spec?.box) return -1; return S.secs.findIndex((s) => Math.abs(s.box[1] - row.spec.box[1]) <= 2 && Math.abs(s.box[3] - row.spec.box[3]) <= 2) ?? -1; };
if (docSections.length && rows.length && docSections.length !== rows.length) console.error(`spec-to-css: the document has ${docSections.length} sections, the triage ${rows.length} non-chrome rows — paired by order up to the shorter (the authored order is the triage's)`);

const px = (n) => `${Math.round(n)}px`;
const pageCap = (() => { const rs = S.secs.filter((s) => !/^(HEADER|FOOTER)\b/.test(s.id)).map((s) => xr(s.items, base)).filter(Boolean).map(([a, b]) => b - a); if (!rs.length) return null; const c = count(rs.map((w) => Math.round(w / 8) * 8)); return c[0][1] >= 2 ? c[0][0] : Math.max(...rs); })(); // the most common content width (±8), else the widest: the page cap

function textRules(items, W, sel, prev) {
  // one rule per tag with its most common style; inline spans are skipped (buttons are read as controls below)
  const texts = items.filter((it) => isText(it) && it.t && onPage(it, W) && !it.inline && !/^(span|a|button|input|label)$/.test(it.k));
  const byTag = new Map(); for (const it of texts) { const k = it.k; if (!byTag.has(k)) byTag.set(k, []); byTag.get(k).push(it); }
  const out = [];
  for (const [tag, list] of byTag) {
    const key = count(list.map((it) => `${it.fs}|${it.lh}|${it.fw}|${fam(it.ff)}|${it.c}|${it.tt}|${it.ta}|${it.ls}`))[0][0].split('|');
    const [fs, lh, fw, ff, c, tt, ta, ls] = key; const sig = `${fs}|${lh}|${fw}|${ff}|${c}|${tt}|${ta}`;
    if (prev && prev.get(tag) === sig) continue; // the mobile query repeats only what changes
    const decl = [`font: ${fw !== '400' ? `${fw} ` : ''}${fs}${lh !== 'normal' ? `/${lh}` : ''} '${ff}'`, `color: ${rgb(c)}`, ...(tt && tt !== 'none' ? [`text-transform: ${tt}`] : []), ...(ta && !['start', 'left'].includes(ta) ? [`text-align: ${ta}`] : []), ...(ls && ls !== 'normal' ? [`letter-spacing: ${ls}`] : [])];
    out.push({ tag, sig, css: `${sel} ${tag} { ${decl.join('; ')}; }  /* ×${list.length} "${String(list[0].t).slice(0, 28)}" */` });
  }
  return out;
}
function unitOf(items, W, contentW) {
  // the repeating unit: a painted CONTAINER (it holds ≥ 2 other items) repeated at one size — never a control (canon: the three cards had no
  // paint of their own and the unit read as their 319×42 buttons: padding, border and a 92 px gap on the card). Without a painted container the
  // unit is the column of a repeated image (same size, ≥ 2): its x-range from the image's top to the next row (exp/five-min replay)
  const inBox = (o, b) => o.box[0] >= b[0] - 1 && o.box[0] + o.box[2] <= b[0] + b[2] + 1 && o.box[1] >= b[1] - 1 && o.box[1] + o.box[3] <= b[1] + b[3] + 1;
  const isCtl = (it) => /^(a|button)$/.test(it.tag) || /\b(btn|button)\b/i.test(String(it.cls || ''));
  const holds = (it) => items.filter((o) => o !== it && o.k !== 'paint' && onPage(o, W) && inBox(o, it.box)).length >= 2;
  const shape = (m, synth) => {
    // the columns are the units FULLY in the viewport: a slider's half-shown next card made toryburch's 5-up row a 6-column grid
    const xs = [...new Set(m.filter((it) => it.box[1] === m[0].box[1] && it.box[0] >= -1 && it.box[0] + it.box[2] <= W + 1).map((it) => it.box[0]))].sort((a, b) => a - b);
    const gap = xs.length > 1 ? xs[1] - xs[0] - m[0].box[2] : null; const ys = [...new Set(m.map((it) => it.box[1]))].sort((a, b) => a - b);
    let first = m[0]; let h = m[0].box[3];
    if (synth) { const b = m[0].box; const nextY = ys.length > 1 ? ys[1] : Infinity; const col = items.filter((o) => o.k !== 'paint' && onPage(o, W) && o.box[0] >= b[0] - 1 && o.box[0] + o.box[2] <= b[0] + b[2] + 1 && o.box[1] >= b[1] && o.box[1] < nextY); h = Math.max(...col.map((o) => o.box[1] + o.box[3])) - b[1]; first = { tag: 'div', cls: '(image column)', box: [b[0], b[1], b[2], h] }; }
    return { w: m[0].box[2], h, n: m.length, perRow: xs.length, gap, first, rowGap: ys.length > 1 ? ys[1] - ys[0] - h : null };
  };
  const cands = count(items.filter((it) => it.k === 'paint' && onPage(it, W) && !isCtl(it) && it.box[2] < (contentW || W) * 0.8 && it.box[3] >= 40 && it.box[2] >= 80 && holds(it)).map((it) => `${it.box[2]}×${it.box[3]}`)).filter(([, n]) => n >= 2);
  if (cands.length) {
    const [wh] = cands.sort((a, b) => b[1] - a[1] || (Number(b[0].split('×')[1]) - Number(a[0].split('×')[1])))[0];
    return shape(items.filter((it) => it.k === 'paint' && `${it.box[2]}×${it.box[3]}` === wh).sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]), false);
  }
  const imgs = count(items.filter((it) => ['img', 'video'].includes(it.k) && onPage(it, W) && it.box[2] >= 80 && it.box[2] < (contentW || W) * 0.8).map((it) => `${it.box[2]}×${it.box[3]}`)).filter(([, n]) => n >= 2);
  if (!imgs.length) return null;
  const [wh] = imgs.sort((a, b) => b[1] - a[1])[0];
  return shape(items.filter((it) => ['img', 'video'].includes(it.k) && `${it.box[2]}×${it.box[3]}` === wh).sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]), true);
}
function controls(items, W, sel) {
  const ctl = items.filter((it) => it.k === 'paint' && /^(a|button)$/.test(it.tag) && onPage(it, W) && it.pad && it.pad !== '0px');
  if (!ctl.length) return [];
  const [key, n] = count(ctl.map((it) => `${it.pad}|${it.br || ''}|${it.border ? String(it.border).split(' | ')[0] : ''}|${it.bg || ''}`))[0]; const [pad, br, bd, bg] = key.split('|');
  const label = items.find((it) => isText(it) && it.inline && it.cbox); // the span inside the control carries the text style
  return [`${sel} a.button, ${sel} .button { display: inline-block; padding: ${pad};${br ? ` border-radius: ${br};` : ''}${bd ? ` border: ${bd};` : ''}${bg ? ` background: ${rgb(bg)};` : ''}${label ? ` font: ${font(label)}; color: ${rgb(label.c)};` : ''} }  /* ${n} control(s) ${ctl[0].box[2]}×${ctl[0].box[3]} "${(label && label.t) || ''}" — filled = bold link, outlined = italic in the document */`];
}
function mediaRules(items, W, sel) {
  const imgs = items.filter((it) => ['img', 'video'].includes(it.k) && onPage(it, W) && it.box[2] >= 48);
  if (!imgs.length) return [];
  const [wh, n] = count(imgs.map((it) => `${it.box[2]}×${it.box[3]}|${it.fit || 'fill'}`))[0]; const [w, rest] = wh.split('×'); const [h, fit] = rest.split('|');
  // the crop's anchor (object-position): sherwin-williams' agent swept it against the capture to fit two photos (2.5 min)
  const op = count(imgs.filter((it) => `${it.box[2]}×${it.box[3]}` === wh.split('|')[0]).map((it) => it.op || '')).filter(([v]) => v)[0]?.[0];
  return [`${sel} img { width: 100%; aspect-ratio: ${w} / ${h}; object-fit: ${fit};${op ? ` object-position: ${op};` : ''} height: auto; }  /* ${n} × ${w}×${h} ${fit}${imgs.some((it) => it.broken) ? ' — a BROKEN live image paints its alt text: register it' : ''} */`];
}

const files = new Map(); const sectionsDraft = []; const pageScale = new Map();
S.secs.forEach((s, k) => { for (const it of s.items) if (isText(it) && it.t && onPage(it, base) && !it.inline && /^(h[1-6]|p|li)$/.test(it.k)) { const key = `${it.k}: ${font(it)} ${rgb(it.c)}`; pageScale.set(key, (pageScale.get(key) || 0) + 1); } });
// a block used by more than one section is scoped to each section: three carousels and a brands grid drafted on one `.carousel` selector and
// only the last applied (marriott)
const classesAt = (row, i) => blockOf(docSections[i] || '') || (row.match.block && row.match.kind !== 'default' ? [row.match.block, ...(row.match.variant ? row.match.variant.split(/\s+/) : [])] : null);
const blockUses = count(rows.map((r, i) => classesAt(r, i)).filter(Boolean).map((c) => c.join('.'))); const repeated = new Set(blockUses.filter(([, n]) => n > 1).map(([k]) => k));
rows.forEach((row, i) => {
  const secHtml = docSections[i] || ''; const classes = blockOf(secHtml) || (row.match.block && row.match.kind !== 'default' ? [row.match.block, ...(row.match.variant ? row.match.variant.split(/\s+/) : [])] : null);
  const style = styleOf(secHtml) || row.sectionStyle || null;
  const k = liveIndexFor(row); const live = k >= 0 ? S.secs[k] : null;
  if (!live) { console.error(`spec-to-css: section ${i} (${classes ? classes.join(' ') : 'default'}) — no live section pairs with the triage row's spec box; skipped`); return; }
  const m = twin(M, k); const p = twin(P, k);
  const items = live.items.filter((it) => onPage(it, base)); const r = xr(items, base); const contentW = r ? r[1] - r[0] : null;
  const head = `/* ${classes ? classes.join(' ') : `section ${i} (default content${style ? `, style "${style}"` : ''})`} — document section #${i} ← live section #${k} "${live.id.slice(0, 40)}" y${live.box[1]} h${live.box[3]} at ${base}${m ? `; ${mobile}: h${m.box[3]}` : ''}${p ? `; ${probe}: h${p.box[3]}` : ''}\n   DRAFT from the spec: structure is the pipeline's (.block > div = row, > div > div = cell); every value is the live page's, annotated. Edit; the decorate's own DOM takes these values. */`;
  const lines = [head]; let innerPad = false; // the card's text cell carries the picture → text gap as padding
  const sel = classes ? `${repeated.has(classes.join('.')) ? `main .section:nth-of-type(${i + 1}) ` : ''}.${classes.join('.')}` : `main .section${style ? `.${style.split(/[,\s]+/).filter(Boolean).map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-')).join('.')}` : `:nth-of-type(${i + 1})`}`;
  // the section's padding: from its edge to the first / last CONTENT box of any kind (text, picture, unit paint, control) — the inset chain
  // reads to the last TEXT, and a section ending in cards or a button read `bottom 615` (acs-about: no drafted padding was usable)
  const inset = live.inset;
  const content = items.filter((it) => !(it.k === 'paint' && it.box[2] >= live.box[2] - 4) && it.box[3] > 0);
  const padOf = (sec, its) => { const c = its.filter((it) => !(it.k === 'paint' && it.box[2] >= sec.box[2] - 4) && it.box[3] > 0); if (!c.length) return [inset ? inset.first : null, inset ? inset.last : null]; return [Math.max(0, Math.min(...c.map((it) => it.box[1])) - sec.box[1]), Math.max(0, sec.box[1] + sec.box[3] - Math.max(...c.map((it) => it.box[1] + it.box[3])))]; };
  const [padTop, padBottom] = content.length ? padOf(live, items) : [inset ? inset.first : null, inset ? inset.last : null];
  const bg = live.bg && live.bg !== 'rgba(0, 0, 0, 0)' ? live.bg : (items.find((it) => it.k === 'paint' && it.box[2] >= base - 2 && it.bg) || {}).bg;
  // without a section style the block's section is scoped to ITSELF (as a default-content section is): an unscoped `main .section` put the
  // last block section's padding and navy background on every section of the page (exp/five-min replay: manulife 85–94 %)
  const sectionSel = classes ? `main .section${style ? `.${style.split(/[,\s]+/).filter(Boolean).map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-')).join('.')}` : `:nth-of-type(${i + 1})`}` : sel;
  const secDecl = [...(padTop !== null ? [`padding: ${px(Math.max(0, padTop))} 0 ${px(Math.max(0, padBottom))}`] : []), ...(bg ? [`background: ${rgb(bg)}`] : []), ...(live.bgi ? [`background-image: ${live.bgi.slice(0, 120)}${live.bgs ? `; background-size: ${live.bgs.split(' ')[0]}; background-position: ${live.bgs.split(' ').slice(1, 3).join(' ')}` : ''}`] : [])];
  const insetNote = inset ? ` /* inset top ${inset.first}: ${inset.top.join(' → ')}; bottom ${inset.last}: ${inset.bottom.join(' → ')} */` : '';
  if (secDecl.length) (classes ? sectionsDraft : lines).push(`${sectionSel} { ${secDecl.join('; ')}; }${insetNote}${classes && !style ? '  /* this section only: name a section style to share it across pages */' : ''}`);
  if (classes) {
    if (contentW && pageCap && Math.abs(contentW - pageCap) > 8) lines.push(`${sel} { max-width: ${px(contentW)}; margin: 0 auto; }  /* content x ${r[0]}..${r[1]} (the page cap is ${pageCap}) */`);
    const u = unitOf(items, base, contentW);
    if (u) {
      lines.push(`${sel} { display: grid; grid-template-columns: repeat(${u.perRow}, minmax(0, 1fr)); ${u.gap !== null ? `column-gap: ${px(u.gap)}; ` : ''}${u.rowGap !== null ? `row-gap: ${px(u.rowGap)}; ` : ''}}  /* unit ${u.n} × ${u.w}×${u.h} (${u.first.tag}.${String(u.first.cls).split(' ')[0]}), ${u.perRow} per row, first at y${u.first.box[1]} */`);
      const f = u.first; const cardDecl = [...(f.bg ? [`background: ${rgb(f.bg)}`] : []), ...(f.br ? [`border-radius: ${f.br}`] : []), ...(f.border ? [`border: ${String(f.border).split(' | ')[0]}`] : []), ...(f.pad && f.pad !== '0px' ? [`padding: ${f.pad}`] : []), ...(f.shadow ? [`box-shadow: ${f.shadow}`] : [])];
      if (cardDecl.length) lines.push(`${sel} > div { ${cardDecl.join('; ')}; }  /* the unit's own paint */`);
      // the unit's INNER inset: the texts' offset from the card's edges (and from its picture's bottom) is the text cell's padding — the
      // drafts gave the card's box and paint, never the 24–34 px the text sits in (takeda, acs: every card's text flush to its edge)
      const ub = f.box; innerPad = false; const inU = (it) => it.box[0] >= ub[0] - 1 && it.box[0] + it.box[2] <= ub[0] + ub[2] + 1 && it.box[1] >= ub[1] - 1 && it.box[1] + it.box[3] <= ub[1] + ub[3] + 1;
      const ut = items.filter((it) => isText(it) && it.t && onPage(it, base) && inU(it)); const upic = items.filter((it) => ['img', 'video'].includes(it.k) && inU(it)).sort((a, b) => a.box[1] - b.box[1])[0];
      if (ut.length && (f.bg || f.border || f.shadow)) {
        const l = Math.min(...ut.map((it) => it.box[0])) - ub[0]; const r = ub[0] + ub[2] - Math.max(...ut.map((it) => it.box[0] + it.box[2])); const t0 = Math.min(...ut.map((it) => it.box[1])) - (upic ? upic.box[1] + upic.box[3] : ub[1]); const b0 = ub[1] + ub[3] - Math.max(...ut.map((it) => it.box[1] + it.box[3]));
        const pad = [t0, Math.min(r, l + 8), b0, l].map((v) => Math.max(0, Math.min(v, 80)));
        if (pad.some((v) => v > 2)) { innerPad = true; lines.push(`${sel} > div > div${upic ? ':not(:has(> picture, > p > picture))' : ''} { padding: ${pad.map(px).join(' ')}; }  /* the texts in the card: ${l} from the left, ${t0} below ${upic ? 'the picture' : 'the top'}, ${b0} above the bottom (right capped at left + 8: a short line ends early) */`); }
      }
      // inner paints of the unit (a content strip, a media box) — listed, not placed
      const inner = count(items.filter((it) => it.k === 'paint' && it !== f && it.box[0] >= f.box[0] && it.box[0] + it.box[2] <= f.box[0] + f.box[2] + 1 && it.box[1] >= f.box[1] && it.box[1] + it.box[3] <= f.box[1] + f.box[3] + 1).map((it) => `${it.tag}.${String(it.cls).split(' ')[0]} ${it.box[2]}×${it.box[3]} at +${it.box[1] - f.box[1]}${it.pad && it.pad !== '0px' ? ` pad ${it.pad}` : ''}${it.bg ? ` bg ${rgb(it.bg)}` : ''}${it.br ? ` br ${it.br}` : ''}`));
      if (inner.length) lines.push(`/* inside the first unit: ${inner.slice(0, 6).map(([k2, n]) => `${k2}${n > 1 ? ` ×${n}` : ''}`).join(' | ')} */`);
    }
    lines.push(...textRules(items, base, sel).map((t) => t.css));
    lines.push(...mediaRules(items, base, sel));
    // text OVER the picture (a hero, a banner): the texts' boxes sit inside the largest picture's box — the picture fills the block from
    // behind and the text keeps its measured offset from the picture's edges (takeda: the title drafted below a 500 px image, +120 px)
    const big = items.filter((it) => ['img', 'video'].includes(it.k) && onPage(it, base)).sort((a, b) => b.box[2] * b.box[3] - a.box[2] * a.box[3])[0];
    const over = big ? items.filter((it) => isText(it) && it.t && onPage(it, base) && it.box[0] >= big.box[0] - 1 && it.box[0] + it.box[2] <= big.box[0] + big.box[2] + 1 && it.box[1] >= big.box[1] - 1 && it.box[1] + it.box[3] <= big.box[1] + big.box[3] + 1) : [];
    if (big && over.length && big.box[2] * big.box[3] >= live.box[2] * live.box[3] * 0.4) {
      const tx = Math.min(...over.map((it) => it.box[0])); const ty = Math.min(...over.map((it) => it.box[1])); const tb = Math.max(...over.map((it) => it.box[1] + it.box[3]));
      const left = tx - big.box[0]; const top = ty - big.box[1]; const bottom = big.box[1] + big.box[3] - tb; const align = bottom < top * 0.6 ? 'flex-end' : top < bottom * 0.6 ? 'flex-start' : 'center';
      lines.push(`${sel} { position: relative; isolation: isolate; display: flex; flex-direction: column; justify-content: ${align}; min-height: ${px(big.box[3])}; }  /* ${over.length} text(s) over the ${big.box[2]}×${big.box[3]} picture: left ${left}, top ${top}, bottom ${bottom} */`);
      lines.push(`${sel} picture { position: absolute; inset: 0; z-index: -1; } ${sel} picture img { width: 100%; height: 100%; aspect-ratio: auto; object-fit: cover; }`);
      lines.push(`${sel} > div { padding: ${align === 'flex-start' ? px(top) : 0} ${px(Math.max(0, big.box[0] + big.box[2] - Math.max(...over.map((it) => it.box[0] + it.box[2]))))} ${align === 'flex-end' ? px(bottom) : 0} ${px(left)}; }`);
      const mbig = m ? m.items.filter((it) => ['img', 'video'].includes(it.k) && onPage(it, mobile)).sort((a, b) => b.box[2] * b.box[3] - a.box[2] * a.box[3])[0] : null;
      if (mbig) lines.push(`@media (max-width: ${bp - 1}px) { ${sel} { min-height: ${px(mbig.box[3])}; } }  /* the picture at ${mobile}: ${mbig.box[2]}×${mbig.box[3]} */`);
    }
    lines.push(...controls(items, base, sel));
    // rhythm: the gaps between consecutive boxes (the brief's line), as a comment the margins come from
    // with a repeating unit the rhythm is read INSIDE the first unit: across a grid row it jumped from one card's heading to the next row's
    // image and wrote `.cards h3 { margin: 0 0 244px }` into every card (exp/five-min replay: takeda, ten grids each ~250 px a card too tall)
    const within = (it, b) => it.box[0] >= b[0] - 1 && it.box[0] + it.box[2] <= b[0] + b[2] + 1 && it.box[1] >= b[1] - 1 && it.box[1] + it.box[3] <= b[1] + b[3] + 1;
    const scopeBox = u ? u.first.box : live.box;
    const seq = items.filter((it) => (isText(it) ? it.t && !it.inline : ['img', 'video', 'svg'].includes(it.k)) && (!u || within(it, scopeBox))).sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
    if (seq.length) {
      const g = []; const after = new Map(); let prevBottom = scopeBox[1]; let prevTag = null;
      for (const it of seq) { if (it.box[1] >= prevBottom - 2) { const gap = Math.max(0, it.box[1] - prevBottom); g.push(`${gap} → ${it.k}(${it.box[3]})`); if (prevTag) { if (!after.has(prevTag)) after.set(prevTag, []); after.get(prevTag).push(gap); } prevBottom = it.box[1] + it.box[3]; prevTag = it.k; } }
      lines.push(`/* rhythm at ${base}${u ? ' inside the first unit' : ''}: ${g.slice(0, 12).join('  ')}  → bottom ${scopeBox[1] + scopeBox[3] - prevBottom} */`);
      const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
      for (const [tag, gaps] of after) if (/^(h[1-6]|p|ul|ol|img|picture)$/.test(tag) && gaps.length && !(innerPad && /^(img|picture)$/.test(tag))) lines.push(`${sel} ${tag} { margin: 0 0 ${px(med(gaps))}; }  /* the gap after ${tag} ×${gaps.length}${gaps.length > 1 ? ` (${gaps.join('/')})` : ''} — a margin, or the next child's padding */`);
    }
    // mobile: what differs at 360
    if (m) {
      const mi = m.items.filter((it) => onPage(it, mobile)); const mr = xr(mi, mobile); const mu = unitOf(mi, mobile, mr ? mr[1] - mr[0] : null);
      const prevSigs = new Map(textRules(items, base, sel).map((t) => [t.tag, t.sig])); const mt = textRules(mi, mobile, `  ${sel}`, prevSigs);
      const mob = [];
      const [mTop, mBottom] = padOf(m, m.items.filter((it) => onPage(it, mobile))); if (mTop !== null && (mTop !== padTop || mBottom !== padBottom)) { const rule = `${sectionSel} { padding: ${px(mTop)} 0 ${px(mBottom)}; }  /* edge → first / last content at ${mobile} */`; if (classes) sectionsDraft.push(`@media (max-width: ${bp - 1}px) { ${rule} }`); else mob.push(`  ${rule}`); } // a block section's mobile padding with its base padding in sections-draft — in the block file it was lost on a rewrite (bms)
      if (u && (!mu || mu.perRow !== u.perRow)) mob.push(`  ${sel} { grid-template-columns: ${mu ? `repeat(${mu.perRow}, minmax(0, 1fr))` : '1fr'};${mu && mu.rowGap !== null ? ` row-gap: ${px(mu.rowGap)};` : ''} }  /* unit ${mu ? `${mu.n} × ${mu.w}×${mu.h}, ${mu.perRow} per row` : 'stacked'} at ${mobile} */`);
      mob.push(...mt.map((t) => t.css)); mob.push(...mediaRules(mi, mobile, `  ${sel}`).filter((x) => !mediaRules(items, base, sel).map((y) => y.replace(sel, '')).includes(x.replace(`  ${sel}`, ''))));
      if (mob.length) lines.push(`@media (max-width: ${bp - 1}px) {  /* the source's breakpoint ${bp} (media queries by count: ${(summary.breakpoints || []).slice(0, 3).join(', ') || 'unknown — 900 assumed'}) */\n${mob.join('\n')}\n}`);
    }
    if (p) { const pr = xr(p.items.filter((it) => onPage(it, probe)), probe); const pw = pr ? pr[1] - pr[0] : null; if (pw && contentW) lines.push(`/* at ${probe}: content ${pw} wide (${base}: ${contentW}) — ${Math.abs(pw - contentW) <= 8 ? 'a fixed cap: max-width holds' : `fluid: grows ${pw - contentW} px — write the width as a fraction or min(100% - gutter, cap), never the ${base} pixel value`}; height ${p.box[3]} (${base}: ${live.box[3]}) */`); }
    const name = classes[0]; const file = join(outDir, name, `${name}.draft.css`); if (!files.has(file)) files.set(file, []); files.get(file).push(lines.join('\n'));
  } else {
    sectionsDraft.push(lines.join('\n'));
    if (contentW && pageCap && Math.abs(contentW - pageCap) > 8) sectionsDraft.push(`${sel} > div { max-width: ${px(contentW)}; margin: 0 auto; }  /* content x ${r[0]}..${r[1]} */`);
    sectionsDraft.push(...textRules(items, base, sel).map((t) => t.css));
  }
});
// the chrome: header and footer drafts from the spec's HEADER / FOOTER rows — the structure is the foundation skeleton's (nav > .nav-brand /
// .nav-sections / .nav-tools; .footer > .footer-N), the values the live chrome's; the fixed / sticky state from the measure summary's first look
for (const [kind, re] of [['header', /^HEADER\b/], ['footer', /^FOOTER\b/]]) {
  // ONE row: the topmost header, the last footer — an in-section `<header>` read as a second HEADER row drafted `header .header { height }` twice
  // and the second won (takeda, old measurements; BACKLOG 206 / 207)
  const all = S.secs.filter((s) => re.test(s.id)); if (!all.length) continue; const secsK = [kind === 'header' ? all[0] : all[all.length - 1]];
  const lines = []; const root = kind === 'header' ? 'header .header' : 'footer .footer';
  secsK.forEach((live, j) => {
    const items = live.items.filter((it) => onPage(it, base)); const r = xr(items, base); const k = S.secs.indexOf(live); const m = twin(M, k); const p = twin(P, k);
    const fixed = (summary.fixedLayers?.[String(base)] || []).find((f) => new RegExp(`^${kind}\\b`).test(f.split(' [')[0]));
    lines.push(`/* ${kind}${secsK.length > 1 ? ` (${j + 1} of ${secsK.length})` : ''} — live "${live.id.slice(0, 40)}" h${live.box[3]} at ${base}${m ? `; ${mobile}: h${m.box[3]}` : ''}${p ? `; ${probe}: h${p.box[3]}` : ''}${fixed ? `; ${fixed.split(' ').pop()} layer at rest (${fixed.split(' [')[0]})` : '; in the flow at rest'}${summary.scrolled?.[String(base)]?.gone?.length ? '; hides on scroll' : ''}\n   DRAFT: values are the live chrome's; the structure is the foundation skeleton's (nav > .nav-brand / .nav-sections / .nav-tools, .footer > .footer-N) */`);
    const bg = live.bg && live.bg !== 'rgba(0, 0, 0, 0)' ? live.bg : (items.find((it) => it.k === 'paint' && it.box[2] >= base - 2 && it.bg) || {}).bg;
    // a 0 px box is the wrong element at this width (a mobile-only footer read at 1440 — pgatour), not a height
    lines.push(`${root} {${live.box[3] > 0 ? ` height: ${px(live.box[3])};` : ''}${bg ? ` background: ${rgb(bg)};` : ''}${live.inset ? ` padding: ${px(Math.max(0, live.inset.first))} 0 ${px(Math.max(0, live.inset.last))};` : ''} }  /* box h${live.box[3]}${r ? `, content x${r[0]}..${r[1]} (${r[1] - r[0]})` : ''}${live.inset ? `; inset ${live.inset.top.join(' → ')} / ${live.inset.bottom.join(' → ')}` : ''} */`);
    if (r && pageCap && Math.abs((r[1] - r[0]) - pageCap) > 8) lines.push(`${root} > div, ${root} nav { max-width: ${px(r[1] - r[0])}; margin: 0 auto; }  /* the chrome's own cap */`);
    const logos = items.filter((it) => ['img', 'svg'].includes(it.k) && it.box[2] >= 40 && it.box[3] >= 16 && it.box[2] <= 400); if (logos.length) lines.push(`${root} .nav-brand img, ${root} .footer-1 img { width: ${px(logos[0].box[2])}; height: ${px(logos[0].box[3])}; }  /* the first image ${logos[0].box[2]}×${logos[0].box[3]} at x${logos[0].box[0]} y${logos[0].box[1] - live.box[1]} (a logo) */`);
    const links = items.filter((it) => isText(it) && it.t && (it.k === 'a' || (it.inline && it.href)) && onPage(it, base)); if (links.length) { const [key, n] = count(links.map((it) => `${it.fs}|${it.lh}|${it.fw}|${fam(it.ff)}|${it.c}|${it.tt}`))[0]; const [fs, lh, fw, ff, c, tt] = key.split('|'); const xs = links.filter((it) => it.box[1] === links[0].box[1]).map((it) => it.box).sort((a, b) => a[0] - b[0]); const gaps = xs.slice(1).map((b, i) => b[0] - (xs[i][0] + xs[i][2])).filter((g) => g > 0); lines.push(`${root} a { font: ${fw !== '400' ? `${fw} ` : ''}${fs}${lh !== 'normal' ? `/${lh}` : ''} '${ff}'; color: ${rgb(c)};${tt && tt !== 'none' ? ` text-transform: ${tt};` : ''} }  /* ${n} of ${links.length} links; the first row's gaps ${gaps.slice(0, 6).join('/') || '—'} px */`); }
    lines.push(...textRules(items.filter((it) => !(it.k === 'a')), base, root).map((t) => t.css));
    lines.push(...controls(items, base, root));
    const bars = items.filter((it) => it.k === 'paint' && it.box[2] >= base - 2 && it.box[3] >= 20 && it.box[3] < live.box[3]).map((it) => `${it.tag}.${String(it.cls).split(' ')[0]} h${it.box[3]} at +${it.box[1] - live.box[1]}${it.bg ? ` bg ${rgb(it.bg)}` : ''}${it.border ? ` bd ${String(it.border).split(' | ')[0].slice(0, 24)}` : ''}`); if (bars.length) lines.push(`/* full-width bars inside: ${[...new Set(bars)].slice(0, 6).join(' | ')} */`);
    // the desktop layout the foundation leaves as a comment: brand / sections / tools in one row, the hamburger hidden, the first level of the
    // sections in a row at the measured gap (a run with no agent had the drawer layout at 1440: every nav level as a list)
    if (kind === 'header') { const ls = items.filter((it) => isText(it) && it.t && (it.k === 'a' || it.href) && onPage(it, base)); const row = ls.filter((it) => Math.abs(it.box[1] - (ls[0]?.box[1] ?? 0)) <= 4).map((it) => it.box).sort((a, b) => a[0] - b[0]); const gs = row.slice(1).map((b, i) => b[0] - row[i][0] - row[i][2]).filter((g) => g > 0 && g < 120).sort((a, b) => a - b); const gap = gs.length ? gs[Math.floor(gs.length / 2)] : 24;
      lines.push(`@media (min-width: ${bp}px) {  /* the desktop row (the foundation's commented rule); first-level gap ${gap} px from the link row */\n  header nav { grid-template: 'brand sections tools' auto / auto 1fr auto; column-gap: ${px(gap)}; }\n  header nav .nav-hamburger { display: none; }\n  header nav .nav-sections { display: block; }\n  header nav .nav-sections > ul { display: flex; flex-wrap: wrap; gap: ${px(gap)}; align-items: center; }\n  header nav .nav-tools ul { display: flex; gap: ${px(gap)}; align-items: center; }\n}`); }
    if (m) { const mbg = m.bg && m.bg !== 'rgba(0, 0, 0, 0)' ? m.bg : null; lines.push(`@media (max-width: ${bp - 1}px) { ${root} {${m.box[3] > 0 ? ` height: ${px(m.box[3])};` : ''}${mbg && mbg !== bg ? ` background: ${rgb(mbg)};` : ''} }  /* ${mobile}: h${m.box[3]}${(summary.fixedLayers?.[String(mobile)] || []).some((f) => new RegExp(`^${kind}\\b`).test(f)) ? ', fixed / sticky' : ', in the flow'} */ }`); }
  });
  const file = join(outDir, kind, `${kind}.draft.css`); files.set(file, lines.map((l) => l).length ? [lines.join('\n')] : []);
}
// write
const MARK = '/* ── spec-to-css draft (below this line is regenerated) ── */';
for (const [file, parts] of files) {
  mkdirSync(dirname(file), { recursive: true }); const target = force ? file.replace('.draft.css', '.css') : file;
  // header / footer: the foundation's structure rules stay — --force once wrote the draft OVER them (the nav grid, the hidden dropdowns, the
  // drawer gone: every no-agent header a list); the draft is appended below a mark and a re-run replaces only that part
  const chrome = /[\\/](header|footer)[\\/]\1\.(draft\.)?css$/.test(target) && force && existsSync(target);
  const keep = chrome ? readFileSync(target, 'utf8').split(MARK)[0].trimEnd() : null;
  writeFileSync(target, chrome ? `${keep}\n\n${MARK}\n${parts.join('\n\n')}\n` : `${parts.join('\n\n')}\n`); console.log(`${target}: ${parts.length} section(s)`); }
const scale = [...pageScale.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `   ${k} ×${n}`).join('\n');
const sd = [`/* sections-draft.css — the default-content sections and the page scale, from ${dir} (spec ${base}${M ? ` / ${mobile}` : ''}${P ? ` / ${probe}` : ''}). Merge into styles.css; every value is the live page's. */`, `/* page type scale at ${base} (most common per tag — the body row and the headings in styles.css):\n${scale} */`, `/* page cap: content ${pageCap || '?'} wide at ${base}${P ? ` — ${(() => { const rs = P.secs.filter((s) => !/^(HEADER|FOOTER)\b/.test(s.id)).map((s) => xr(s.items, probe)).filter(Boolean).map(([a, b]) => b - a); const c = count(rs)[0]; return c ? `${c[0]} at ${probe}: ${Math.abs(c[0] - pageCap) <= 8 ? 'a fixed cap' : 'fluid'}` : '?'; })()}` : ''} (cap-probe names the placement: shell, content or module) */`, ...sectionsDraft];
// the PAGE cap: the content column every section's wrapper sits in — the foundation leaves it a comment for the agent, and a run with no
// agent had none (takeda: card grids 1316 wide against the live 1200). Fixed when the probe width keeps it, a fraction of the viewport when
// it grows; the 360 gutter from the mobile spec's most common content x
const capOf = (spec, W) => { if (!spec) return null; const rs = spec.secs.filter((x) => !/^(HEADER|FOOTER)\b/.test(x.id)).map((x) => xr(x.items, W)).filter(Boolean); if (!rs.length) return null; const c = count(rs.map(([a, b]) => Math.round((b - a) / 8) * 8)); const g = count(rs.map(([a]) => Math.round(a / 4) * 4)); return { w: c[0][0], x: g[0][0] }; };
const capP = capOf(P, probe); const capM = capOf(M, mobile);
if (pageCap && pageCap < base - 16) {
  const fluid = capP && capP.w > pageCap + 16;
  sd.push(`/* the page cap at ${base}: ${pageCap}${capP ? `; at ${probe}: ${capP.w}${fluid ? ' (it grows: a fraction of the viewport, held at the probe value)' : ' (fixed)'}` : ''} */\nmain > .section > div { max-width: ${fluid ? `min(${px(capP.w)}, ${Number(((100 * pageCap) / base).toFixed(2))}vw)` : px(pageCap)}; margin-left: auto; margin-right: auto; }`);
}
if (pageCap && pageCap < base - 16 && capM) sd.push(`@media (max-width: ${(bp || 900) - 1}px) {  /* at ${mobile} the column is the viewport less the gutter (content from x ${capM.x}) */\n  main > .section > div { max-width: none;${capM.x > 0 && capM.x < 48 ? ` padding-left: ${px(capM.x)}; padding-right: ${px(capM.x)};` : ''} }\n}`);
const sdText = `${sd.join('\n\n')}\n`; // imported FIRST by styles.css (first.mjs): its normal specificity beats the foundation's `main > .section`, the agent's rules below win ties
mkdirSync('styles', { recursive: true }); writeFileSync(join('styles', 'sections-draft.css'), sdText); console.log(`styles/sections-draft.css: ${sectionsDraft.length} rule(s)`);
