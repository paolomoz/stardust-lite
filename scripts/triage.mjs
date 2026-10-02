#!/usr/bin/env node
// triage.mjs — the draft of step 2's triage table from a page's content dump, as JSON and markdown: per section its structural
// fingerprint, repeat count, media / text ratio, source component classes, the match against the site's block inventory (block +
// variant + confidence), the collection match when the inventory has nothing, the default-content guess (heads, ledes, closing links
// outside the repeating unit) and the rows × cols a container would need; per page the novelty (share of sections with no inventory
// match). It drafts, it never decides: an ambiguous match is `weak` with both candidates in the notes, and the markdown has the cases'
// triage columns so the agent edits a row instead of writing one (SCALING-PLAN §2.C, batch-7 rollout). Pure Node: no browser.
// Usage: node triage.mjs <content.json> --blocks migration/blocks.json --out triage.json [--md triage.md] [--spec spec-<W>.json]
//        [--structure structure.txt] [--root <dump key>] [--sections <sel,…>] [--depth 6]
//        node triage.mjs --from-md triage.md --out triage.json   round trip: the agent edited the markdown (the block label in the
//        block column, the section style column) → the JSON `author` reads is updated (match.block / variant / kind, sectionStyle)
//   <content.json>  what content-dump wrote (header / main / footer roots, or the roots the case dumped — `--root` names the main one)
//   --blocks        block-inventory's blocks.json; a missing file is an empty inventory (every match is then collection or new)
//   --sections      simple selectors (`tag.class#id`) for the section roots when the automatic split (the children of the first node
//                   under main with more than one child; a `main` / `article` child is flattened) does not fit — the profile's cap
//                   module selectors are a starting point
//   --spec          live-spec's spec-<W>.json: each dump section is paired with the live section band it overlaps (id, box)
//   --structure     probe-structure's structure.txt: the structure line of each section root (selector, box, display)
// triage.json: { _schema, _writtenAt, _source, page: { title, width, doc }, sections: [{ index, chrome: header|footer|null, anchorText, box,
//   fingerprint, repeat, groups, mediaRatio, media, texts, links, classes, defaultContent: [{tag, text}], match: { kind: inventory|collection|
//   new|default, block, variant, confidence: strong|weak|null }, sectionStyle: null (the agent's; author reads it), rowsCols, shape, candidates, spec, structure, notes: [] }],
//   novelty, coveredBy: { inventory, collection, default, new }, signature per section (the full fingerprint, for block-inventory diff) }
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { arg } from './common.mjs';
import { splitSections, fingerprint, dropGeneric, allClasses, matchSection, rowsCols } from './lib/fingerprint.mjs';

// ── --from-md: the markdown edited by the agent back into the JSON (the block column's first `name (variant)` label, the style column)
if (arg('--from-md', null)) {
  const mdFile = resolve(arg('--from-md')); const outFile = resolve(arg('--out', 'triage.json'));
  const json = (() => { try { return JSON.parse(readFileSync(outFile, 'utf8')); } catch { return null; } })();
  if (!json?.sections) { console.error(`triage: --from-md needs the JSON it updates at --out (${outFile} unreadable)`); process.exit(1); }
  const lines = readFileSync(mdFile, 'utf8').split('\n'); const head = lines.findIndex((l) => /^\|\s*#\s*\|/.test(l));
  if (head === -1) { console.error(`triage: no table in ${mdFile}`); process.exit(1); }
  const cells = (l) => l.replace(/\\\|/g, '\u0001').split('|').slice(1, -1).map((c) => c.trim().replace(/\u0001/g, '|'));
  const cols = cells(lines[head]).map((c) => c.toLowerCase()); const iBlock = cols.findIndex((c) => /block/.test(c)); const iStyle = cols.findIndex((c) => /style/.test(c));
  let changed = 0;
  for (let i = head + 2; i < lines.length && /^\|/.test(lines[i]); i++) {
    const c = cells(lines[i]); const row = json.sections.find((s) => String(s.index) === c[0]); if (!row) continue;
    const style = iStyle >= 0 ? c[iStyle].replace(/`/g, '').trim() : ''; const newStyle = style && style !== '—' ? style : null;
    if ((row.sectionStyle || null) !== newStyle) { row.sectionStyle = newStyle; changed += 1; }
    if (iBlock >= 0 && !row.chrome) {
      const cell = c[iBlock]; const isDefault = cell.trim() === '—';
      const m = cell.match(/`([a-z][a-z0-9-]*)(?:\s*\(([^)]*)\))?`/); const isNew = /\*\*new\*\*/.test(cell);
      const kind = isDefault ? 'default' : isNew ? 'new' : m ? 'inventory' : row.match.kind;
      const block = isDefault ? null : m ? m[1] : row.match.block; const variant = isDefault ? null : m && m[2] && m[2] !== '?' ? m[2].trim() : m ? null : row.match.variant;
      if (kind !== row.match.kind || block !== row.match.block || (variant || null) !== (row.match.variant || null)) { row.match = { ...row.match, kind, block, variant: variant || null, confidence: kind === 'inventory' ? 'agent' : row.match.confidence }; row.notes = [...(row.notes || []), `edited in ${basename(mdFile)}`]; changed += 1; }
    }
  }
  const mainCount = json.sections.filter((s) => !s.chrome).length; const counts = { inventory: 0, collection: 0, default: 0, new: 0 };
  json.sections.filter((s) => !s.chrome).forEach((s) => { counts[s.match.kind] = (counts[s.match.kind] || 0) + 1; }); json.coveredBy = counts; json.novelty = mainCount ? Number((counts.new / mainCount).toFixed(2)) : 0;
  json._source = { ...json._source, md: mdFile }; json._writtenAt = new Date().toISOString();
  writeFileSync(outFile, JSON.stringify(json, null, 1));
  console.log(`triage: ${changed} row field(s) updated from ${mdFile} → ${outFile} (novelty ${Math.round(json.novelty * 100)} %)`);
  process.exit(0);
}

const file = process.argv[2];
if (!file || file.startsWith('--')) { console.error('usage: triage.mjs <content.json> --blocks migration/blocks.json --out triage.json [--md triage.md] [--spec spec-<W>.json] [--structure structure.txt] [--root <dump key>] [--sections <sel,…>]'); process.exit(1); }
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const dump = readJson(resolve(file)); if (!dump) { console.error(`triage: ${file} unreadable`); process.exit(1); }
const blocksFile = resolve(arg('--blocks', 'migration/blocks.json')); const inventory = readJson(blocksFile);
const blocks = inventory?.blocks || []; if (!inventory) console.error(`triage: ${blocksFile} not found — matching against an empty inventory (collection / new only)`);
const out = resolve(arg('--out', 'triage.json')); const md = arg('--md', null);
const specFile = arg('--spec', null); const spec = specFile ? readJson(resolve(specFile)) : null;
const structure = arg('--structure', null) && existsSync(resolve(arg('--structure'))) ? readFileSync(resolve(arg('--structure')), 'utf8').split('\n') : null;
const depth = Number(arg('--depth', 6));
const sectionSels = arg('--sections', null) ? String(arg('--sections')).split(',').map((s) => s.trim()).filter(Boolean) : null;

const split = splitSections(dump, { root: arg('--root', null), sections: sectionSels });
if (!split.sections.length) { console.error(`triage: no sections under "${split.mainKey}" (keys: ${Object.keys(dump).filter((k) => !k.startsWith('__')).join(', ')}) — pass --root or --sections`); process.exit(2); }
const width = (() => { const m = basename(file).match(/-(\d+)\.json$/); if (m) return Number(m[1]); const r = dump[split.mainKey]?.[0]; return r?.box ? r.box[2] : null; })();

const fps = split.sections.map((n) => fingerprint(n, { depth }));
const generic = dropGeneric(fps);
const entries = [];
if (split.header) entries.push({ chrome: 'header', node: split.header, fp: fingerprint(split.header, { depth }) });
fps.forEach((fp, i) => entries.push({ chrome: null, node: split.sections[i], fp }));
if (split.footer) entries.push({ chrome: 'footer', node: split.footer, fp: fingerprint(split.footer, { depth }) });

const overlap = (a, b) => Math.max(0, Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1]));
const specFor = (box) => { if (!spec?.secs || !box) return null; let best = null; for (const s of spec.secs) { if (!s.box) continue; const o = overlap(box, s.box); if (o > 0 && (!best || o > best.o)) best = { o, s }; } return best ? { id: best.s.id, box: best.s.box, overlap: Math.round(best.o) } : null; };
const structureFor = (box) => { if (!structure || !box) return null; const re = new RegExp(`\\sy${box[1]}\\s+w\\d+\\s+h${box[3]}\\b`); return structure.find((l) => re.test(l))?.trim() || null; };

const sections = []; const counts = { inventory: 0, collection: 0, default: 0, new: 0 }; let mainCount = 0;
entries.forEach((e, index) => {
  const { fp } = e; const m = matchSection(fp, blocks, { chrome: e.chrome });
  if (!e.chrome) { mainCount++; counts[m.kind] = (counts[m.kind] || 0) + 1; }
  const row = blocks.find((b) => b.name === m.block && (b.variant || null) === (m.variant || null)) || blocks.find((b) => b.name === m.block) || null;
  const shape = e.chrome ? null : m.kind === 'inventory' && row?.shape ? row.shape : m.kind === 'default' ? null : fp.repeat >= 2 ? 'container' : 'simple';
  const notes = [...m.notes]; if (fp.controls.length) notes.push(`controls outside the unit: ${fp.controls.join(' ')}`); if (fp.groups) notes.push(`${fp.groups.length} groups of ${fp.groups.join(' / ')} rows under their own headings`); if (fp.defaultCount > fp.defaultContent.length) notes.push(`default content truncated to ${fp.defaultContent.length} of ${fp.defaultCount}`);
  const { defaultContent, ...signature } = fp;
  sections.push({ index, chrome: e.chrome, anchorText: fp.anchorText, box: fp.box, fingerprint: fp.pattern, repeat: fp.repeat, groups: fp.groups, mediaRatio: fp.mediaRatio, media: fp.media, texts: fp.texts, links: fp.links, classes: fp.classes, defaultContent, match: { kind: m.kind, block: m.block, variant: m.variant, confidence: m.confidence }, sectionStyle: e.chrome ? null : (m.kind === 'inventory' && row?.recipe?.sectionStyle) || null, collection: m.kind === 'inventory' ? row?.collection ?? m.guess?.collection ?? null : m.guess?.collection ?? null, rowsCols: e.chrome || m.kind === 'default' ? null : rowsCols(fp), shape, candidates: m.candidates || [], spec: specFor(fp.box), structure: structureFor(fp.box), notes, signature });
});
const novelty = mainCount ? Number((counts.new / mainCount).toFixed(2)) : 0;
const json = { _schema: 'stardust-lite/triage@1', _writtenAt: new Date().toISOString(), _source: { content: resolve(file), blocks: inventory ? blocksFile : null, spec: specFile ? resolve(specFile) : null, structure: arg('--structure', null) ? resolve(arg('--structure')) : null, mainKey: split.mainKey, root: arg('--root', null), sections: sectionSels, genericClassesDropped: generic }, page: { title: dump.__title || null, width, doc: dump.__doc || null, sections: mainCount }, sections, novelty, coveredBy: counts };
mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, JSON.stringify(json, null, 1));

// the human view — the cases' triage columns
const label = (b, v) => `\`${b}${v ? ` (${v})` : ''}\``;
const blockCell = (s) => {
  const m = s.match; const rc = s.rowsCols ? ` · ${s.rowsCols}` : '';
  if (s.chrome) return m.kind === 'inventory' ? `${label(s.chrome)} · BC **${s.chrome}** — in the inventory` : `${label(s.chrome)} · BC **${s.chrome}** — **new** (no ${s.chrome} block yet)`;
  if (m.kind === 'default') return '—';
  const bc = s.collection ? `BC **${s.collection}**` : 'no collection shape';
  if (m.kind === 'inventory') return `${label(m.block, m.variant)} · ${s.shape} · ${bc}${rc} — **${m.confidence}**${s.notes.length ? `: ${s.notes[0]}` : ''}`;
  if (m.kind === 'collection') return `${label(m.block, '?')} · ${s.shape} · ${bc}${rc} — **collection only**: ${s.notes[0]}`;
  return `**new** ${m.block ? label(m.block, '?') : ''} · ${s.shape} · ${bc}${rc} — ${s.notes[0]}`;
};
const defCell = (s) => (s.chrome ? `${s.chrome} doc` : s.defaultContent.length ? s.defaultContent.map((d) => (d.tag === 'a' || d.tag === 'button' ? `closing link "${d.text.slice(0, 30)}"` : d.tag)).join(', ') : '—');
const secCell = (s) => `${s.chrome ? s.chrome : s.anchorText ? `"${s.anchorText}"` : '(no text)'} ${s.box ? `${s.box[2]}×${s.box[3]}` : ''} — \`${s.fingerprint}\`${s.repeat ? ` (unit ×${s.repeat}, media ${Math.round(s.mediaRatio * 100)} %)` : ''}${allClasses(s.signature).length ? ` · ${allClasses(s.signature).slice(0, 3).join(' ')}` : ''}`;
const lines = [`# ${json.page.title || basename(file)} — triage draft (${width ? `${width}, ` : ''}${new Date().toISOString().slice(0, 10)}; from \`triage\`: review every row, flip what is wrong)`, '', `| # | section (live${width ? `, ${width}` : ''}) | default content | block · shape · collection match · rows × cols | section style |`, '|---|---|---|---|---|'];
const md1 = (t) => String(t).replace(/\|/g, '\\|'); // a note such as "variants tie: feature | promise" shifted the columns of --from-md (sdt-dentsu)
for (const s of sections) lines.push(`| ${s.index} | ${md1(secCell(s))} | ${md1(defCell(s))} | ${md1(blockCell(s))} | ${s.sectionStyle ? `\`${md1(s.sectionStyle)}\`` : '—'} |`);
lines.push('', 'Edit a row here (the block label in the block column, the section style) and run `triage --from-md triage.md --out triage.json` so `author` reads it.', `Novelty **${Math.round(novelty * 100)} %** (${counts.new} new of ${mainCount} sections; ${counts.inventory} covered by the inventory, ${counts.collection} collection only, ${counts.default} default content) against \`${inventory ? blocksFile : 'no inventory'}\`.`);
if (generic.length) lines.push(`Generic classes dropped from the signatures: ${generic.map((c) => `\`${c}\``).join(', ')}.`);
if (md) { writeFileSync(resolve(md), lines.join('\n') + '\n'); }

// terminal table
const w = (s, n) => String(s ?? '').slice(0, n).padEnd(n);
console.log(`${w('#', 3)} ${w('section', 34)} ${w('fingerprint', 44)} ${w('rows×cols', 12)} ${w('match', 36)} ${w('conf', 7)} notes`);
for (const s of sections) { const m = s.match; const mt = s.chrome ? `${s.chrome}: ${m.kind}` : m.kind === 'inventory' ? `${m.block}${m.variant ? ` (${m.variant})` : ''}` : m.kind === 'collection' ? `collection: ${s.collection}` : m.kind === 'default' ? 'default content' : `NEW${s.collection ? ` (${s.collection}?)` : ''}`; console.log(`${w(s.index, 3)} ${w(s.chrome || s.anchorText || '(no text)', 34)} ${w(s.fingerprint, 44)} ${w(s.rowsCols || '—', 12)} ${w(mt, 36)} ${w(m.confidence || '—', 7)} ${(s.notes[0] || '').slice(0, 80)}`); }
console.log(`\nnovelty ${Math.round(novelty * 100)} % (${counts.new} new / ${mainCount} sections; inventory ${counts.inventory}, collection ${counts.collection}, default ${counts.default}) → ${out}${md ? ` + ${resolve(md)}` : ''}`);
