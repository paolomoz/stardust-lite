#!/usr/bin/env node
// block-inventory.mjs — the blocks a site already has, as data: `migration/blocks.json`, one row per block + variant, so page 2's triage
// matches the site's inventory before the Block Collection and nobody re-invents `cards` under another name (SCALING-PLAN §2.B,
// batch-7 rollout). Pure Node: reads `blocks/*/<name>.{js,css}`, a finished case's REGISTER.md triage table, its `doc/*.html` and
// `measure/content-<W>.json`, and the site profile's page numbers. Pass 4 fills the authoring recipe (lib/recipes.mjs documents it).
//   scan  [--site-repo .] [--case <case-dir>]… --out migration/blocks.json [--all] [--cases]
//         --cases derives a recipe for every block that occurs in a case's doc/*.html (the block's rows and cells read back into dump
//         kinds; the occurrence with the most rows wins; a 1-row variant of a container inherits `unit`); a recipe written by hand
//         (`recipe._hand: true`) in the existing blocks.json survives the rescan (merged by name + variant).
//   recipe <name> [variant] --from <doc.html> [--triage triage.json --unit <section index>] [--blocks migration/blocks.json] [--write]
//         derives one recipe from an authored document; with a triage and its section index, says which dump kinds of that unit land
//         in which cell and which do not fit. Prints the JSON; --write stores it in blocks.json (as hand-written: `_hand: true`).
//         rows from blocks/ (variants from the CSS `.name.variant` selectors; shape inferred from decorate: container when it iterates
//         the rows, key-value when it reads name/value pairs, simple otherwise — marked `_inferred`), refined by every --case given:
//         the register's "block · shape · collection match · rows × cols" column names shape / collection / rows × cols / variants,
//         the case's content dump gives each block's source fingerprint (lib/fingerprint.mjs) by section order, `doc/*.html` the
//         authoring example (the block's first row), `migration/site.json` the pixel budget of the page that approved it.
//         `fragment` and `widget` (the boilerplate's infrastructure blocks) are skipped unless --all.
//   diff  <triage.json> --blocks migration/blocks.json   per section: covered by block (variant) | collection match only | new; the
//         novelty share. Re-matches the triage's stored fingerprints against the inventory given (another site's, a newer one). Exit 0.
//   print [--blocks migration/blocks.json]   the markdown table.
//   budgets --gate-dir <dir> [--blocks migration/blocks.json] [--site-repo .]   (re)compute the per-block budgets from an existing gate
//         dir's `sections-<W>.json` (pass 5's per-section table) without a rescan; scan does the same for every --case that has a
//         `gate-served/` (else `gate/`) with those files. Per width the budget of a block is the MAX pixel % of the sections that carry
//         it (plus the profile's noise floor when it has one), `budget._source: "sections"`; a block no section carries (header, footer,
//         a variant the template page does not use) keeps the page's number, `_source: "page"` (BACKLOG 152 / 155).
//
// blocks.json shape (v1):
// { "_schema": "stardust-lite/block-inventory@1", "_writtenAt", "_source": { "siteRepo", "cases": [] }, "blocks": [
//   { "name", "variant": "brands" | null, "shape": simple|key-value|container|null, "rowsCols": "6 × 2" | null,
//     "collection": hero|cards|columns|tabs|accordion|carousel|quote|embed|header|footer|null,
//     "authoringExample": "<div><div>…</div><div>…</div></div>" | null,          // the block's first row from the case's document
//     "sourceSignature": { "classes": [..] | null, "fingerprint": { pattern, repeat, unit, unitSig, cols, kinds, … } | null },
//     "recipe": { rows, cells, … } | null (lib/recipes.mjs), "budget": { "360", "base", "probe", "_source": "sections"|"page", "_sections": { key: [{ index, anchorText, pct }] } },
//     "approvedIn": "home" | null, "document": "home"|"nav"|"footer"|null,
//     "_inferred": ["shape", "classes", …], "_notes": [..] } ] }
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { arg } from './common.mjs';
import { splitSections, fingerprint, dropGeneric, allClasses, matchSection, rowsCols, COLLECTIONS } from './lib/fingerprint.mjs';
import { parseDoc, deriveRecipe, describeRecipe } from './lib/recipes.mjs';

const [,, cmd, target] = process.argv;
const usage = () => { console.error('usage: block-inventory.mjs scan [--site-repo .] [--case <case-dir>]… --out migration/blocks.json [--all] [--cases]\n       block-inventory.mjs diff <triage.json> --blocks migration/blocks.json\n       block-inventory.mjs recipe <name> [variant] --from <doc.html> [--triage triage.json --unit <i>] [--blocks migration/blocks.json] [--write]\n       block-inventory.mjs print [--blocks migration/blocks.json]\n       block-inventory.mjs budgets --gate-dir <dir> [--blocks migration/blocks.json] [--site-repo .]'); process.exit(1); };
if (!cmd || !['scan', 'diff', 'print', 'recipe', 'budgets'].includes(cmd) || (['diff', 'recipe'].includes(cmd) && (!target || target.startsWith('--')))) usage();

/** Recipes for every block occurring in the documents given: { 'name|variant': { recipe, notes, rows } } — the occurrence with the
 * most rows wins; a 1-row occurrence of a block another occurrence shows as `unit` (same name, any variant, same cell kinds) is `unit`. */
function recipesFromDocs(docs, fpFor = () => null) {
  const best = {};
  for (const [docName, html] of Object.entries(docs)) {
    const sections = parseDoc(html);
    for (const sec of sections) for (const b of sec.blocks) {
      if (['metadata', 'section-metadata'].includes(b.name)) continue;
      const key = `${b.name}|${b.variant || ''}`; const { recipe, notes } = deriveRecipe(b, sec, { fingerprint: fpFor(b.name, b.variant), doc: `${docName}.html` });
      if (!recipe) continue;
      if (!best[key] || b.rows.length > best[key].rows) best[key] = { recipe, notes, rows: b.rows.length, name: b.name, variant: b.variant };
    }
  }
  for (const r of Object.values(best)) {
    if (r.recipe.rows !== 'fixed' || r.rows !== 1) continue;
    const sib = Object.values(best).find((o) => o.name === r.name && o !== r && o.recipe.rows === 'unit' && JSON.stringify((o.recipe.cells || []).map((c) => c.from)) === JSON.stringify((r.recipe.cells || []).map((c) => c.from)));
    if (sib) { r.recipe.rows = 'unit'; r.notes.push(`1 row in the document; \`unit\` like ${sib.name}${sib.variant ? ` (${sib.variant})` : ''}`); }
  }
  return best;
}

const read = (f) => (existsSync(f) ? readFileSync(f, 'utf8') : null);
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const isDir = (d) => existsSync(d) && statSync(d).isDirectory();
const argAll = (name) => process.argv.flatMap((a, i) => (a === name && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? [process.argv[i + 1]] : []));
const table = (rows, head) => { const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length))); const line = (r) => `| ${r.map((c, i) => String(c ?? '').padEnd(w[i])).join(' | ')} |`; console.log(line(head)); console.log(`|${w.map((x) => '-'.repeat(x + 2)).join('|')}|`); rows.forEach((r) => console.log(line(r))); };
const label = (b) => `${b.name}${b.variant ? ` (${b.variant})` : ''}`;
const INFRA = ['fragment', 'widget'];

/** The per-section tables a gate dir holds: { '<W>': sections-<W>.json parsed } (pass 5 writes them with --per-section / --chrome / --budget). */
function sectionTables(gateDir) {
  const out = {}; if (!isDir(gateDir)) return out;
  for (const f of readdirSync(gateDir)) { const m = f.match(/^sections-(\d+)\.json$/); if (!m) continue; const j = readJson(join(gateDir, f)); if (j?.sections) out[m[1]] = { file: join(gateDir, f), ...j }; }
  return out;
}
/** Per-block budgets from the per-section tables: for every width's `budgetKey`, a block's budget is the MAX pixel % over the sections
 * that carry it (the gate's block per section: the triage row, else the `.block` class), plus `noise` (the profile's floor, 0 when
 * unknown). Rows a table names get `budget._source: 'sections'` and `_sections[key]`; the others keep what they had. Returns the rows
 * touched and the blocks a table named that the inventory lacks. */
function applySectionBudgets(rows, tables, { noise = 0 } = {}) {
  const tokens = (v) => String(v || '').trim().split(/\s+/).filter(Boolean).sort().join(' ');
  const find = (name, variant) => { const c = rows.filter((r) => r.name === name); if (!c.length) return null; return c.find((r) => tokens(r.variant) === tokens(variant)) || (variant ? c.find((r) => !r.variant) : null) || c[0]; };
  const touched = new Set(); const unknown = new Set(); const widths = Object.keys(tables).map(Number).sort((a, b) => a - b);
  for (const W of widths) {
    const t = tables[W]; const key = t.budgetKey || (W === 360 ? '360' : W >= 1920 ? 'probe' : 'base');
    for (const sec of t.sections) {
      if (!sec.block || sec.pct === null || sec.pct === undefined) continue;
      const r = find(sec.block, sec.variant); if (!r) { unknown.add(`${sec.block}${sec.variant ? ` (${sec.variant})` : ''}`); continue; }
      if (!touched.has(r)) { r.budget = { 360: r.budget?.[360] ?? null, base: r.budget?.base ?? null, probe: r.budget?.probe ?? null, _source: 'sections', _page: r.budget && r.budget._source !== 'sections' ? { 360: r.budget[360] ?? null, base: r.budget.base ?? null, probe: r.budget.probe ?? null } : r.budget?._page ?? null, _sections: {} }; touched.add(r); }
      const list = (r.budget._sections[key] = r.budget._sections[key] || []);
      if (list.some((x) => x.width === W && x.index === sec.index)) continue;
      list.push({ width: W, index: sec.index, anchorText: (sec.anchorText || '').slice(0, 40), pct: sec.pct, dh: sec.dh ?? null });
      const max = Math.max(...list.map((x) => x.pct));
      r.budget[key] = Number((max + (Number(noise) || 0)).toFixed(2));
    }
  }
  for (const r of touched) { r._notes = (r._notes || []).filter((n) => !/^budget from|^budget: /.test(n)); r._notes.push(`budget: per-section max from ${widths.map((W) => `sections-${W}.json`).join(', ')}${noise ? ` + noise floor ${noise}` : ''}`); }
  return { touched: [...touched], unknown: [...unknown], widths };
}
const noiseFloor = (siteJson) => { const n = siteJson?.noise?.floor1440; return typeof n === 'number' && Number.isFinite(n) ? n : 0; };

// ───────────────────────────── scan ─────────────────────────────
if (cmd === 'scan') {
  const repo = resolve(arg('--site-repo', '.')); const blocksDir = join(repo, 'blocks');
  if (!isDir(blocksDir)) { console.error(`block-inventory: ${blocksDir} not found (pass --site-repo <dir>)`); process.exit(1); }
  const out = resolve(arg('--out', join(repo, 'migration', 'blocks.json')));
  const names = readdirSync(blocksDir).filter((n) => isDir(join(blocksDir, n)) && (existsSync(join(blocksDir, n, `${n}.js`)) || existsSync(join(blocksDir, n, `${n}.css`)))).filter((n) => arg('--all', false) || !INFRA.includes(n)).sort();
  const rows = []; const rowFor = (name, variant, create = true) => { let r = rows.find((x) => x.name === name && (x.variant || null) === (variant || null)); if (!r && create) { r = { name, variant: variant || null, shape: null, rowsCols: null, collection: COLLECTIONS.includes(name) ? name : null, authoringExample: null, sourceSignature: { classes: null, fingerprint: null }, recipe: null, budget: { 360: null, base: null, probe: null }, approvedIn: null, document: null, _inferred: [], _notes: [] }; rows.push(r); } return r; };
  const normVariant = (v) => (v ? v.split(/[,\s]+/).map((x) => x.trim()).filter(Boolean).join(' ') : null);

  // 1. blocks/ — variants from the CSS, shape from the decorate
  const codeInfo = {};
  for (const name of names) {
    const css = read(join(blocksDir, name, `${name}.css`)) || ''; const js = read(join(blocksDir, name, `${name}.js`)) || '';
    const variants = new Set();
    for (const m of css.matchAll(new RegExp(`\\.${name.replace(/[-]/g, '\\-')}((?:\\.[a-z][a-z0-9-]*)+)(?![\\w-])`, 'g'))) {
      const parts = m[1].split('.').filter(Boolean).filter((c) => !/^(block|is-|has-|js-)/.test(c) && !/-(wrapper|container)$/.test(c) && !/^(active|open|closed|hidden|visible|loading|loaded)$/.test(c));
      if (parts.length) variants.add(parts.join(' '));
    }
    const container = /\[\.\.\.\s*block\.children\]|block\.children|querySelectorAll\(\s*['"`]:scope\s*>\s*div['"`]|\brows\s*=\s*\[/.test(js) && /forEach|for\s*\(|\.map\(/.test(js);
    const keyValue = /readBlockConfig|toClassName\(\s*\w+\.children\[0\]|\.children\[0\]\.textContent[^;]*\.toLowerCase|config\[/.test(js);
    const shape = ['header', 'footer'].includes(name) ? null : keyValue ? 'key-value' : container ? 'container' : 'simple';
    codeInfo[name] = { variants: [...variants], shape };
  }

  // 2. the cases — register rows, dump fingerprints, documents, budgets
  const cases = argAll('--case').map((c) => resolve(c));
  const parseRegister = (md) => {
    const lines = md.split('\n'); const head = lines.findIndex((l) => /^\|\s*#\s*\|/.test(l) && /rows × cols/.test(l));
    if (head === -1) return null;
    const cells = (l) => l.replace(/\\\|/g, '\u0001').split('|').slice(1, -1).map((c) => c.trim().replace(/\u0001/g, '|'));
    const cols = cells(lines[head]).map((c) => c.toLowerCase()); const iBlock = cols.findIndex((c) => /rows × cols/.test(c)); const iDef = cols.findIndex((c) => /default content/.test(c)); const iSec = cols.findIndex((c) => /section/.test(c)); const iStyle = cols.findIndex((c) => /style/.test(c));
    const out = [];
    for (let i = head + 2; i < lines.length && /^\|/.test(lines[i]); i++) { const c = cells(lines[i]); if (!/^\d+$/.test(c[0] || '')) continue; out.push({ idx: Number(c[0]), section: c[iSec] || '', defaultContent: c[iDef] || '', block: c[iBlock] || '', style: c[iStyle] || '' }); }
    return out;
  };
  const statements = (cell, known) => {
    const list = [];
    for (const st of cell.split(/;\s*/)) {
      const named = [...st.matchAll(/`([a-z][a-z0-9-]*)(?:\s*\(([^)]*)\))?`/g)].filter((m) => known.includes(m[1]));
      if (!named.length) continue;
      const shape = (st.match(/\b(simple|key-value|container)\b/) || [])[1] || null;
      const collection = (st.match(/BC \*\*([a-z-]+)\*\*/) || [])[1] || null;
      const rc = st.match(/((?:\d+\s*\/\s*)*\d+)\s*×\s*(\d+)/); const rowsColsText = rc ? `${rc[1].replace(/\s*\/\s*/g, ' / ')} × ${rc[2]}` : null;
      const classes = [...st.matchAll(/`\.([a-z][\w-]*)`/g)].map((m) => m[1]);
      for (const m of named) list.push({ name: m[1], variant: normVariant(m[2]), shape, collection, rowsCols: rowsColsText, classes });
    }
    return list;
  };
  const firstRow = (html, classAttr) => {
    const open = html.indexOf(`<div class="${classAttr}">`); if (open === -1) return null;
    const closeOf = (from) => { const re = /<div\b|<\/div>/g; re.lastIndex = from; let depth = 0; let m; while ((m = re.exec(html))) { depth += m[0] === '</div>' ? -1 : 1; if (depth === 0) return m.index + m[0].length; } return -1; };
    const end = closeOf(open); if (end === -1) return null;
    const inner = html.slice(html.indexOf('>', open) + 1, end - 6);
    const r0 = inner.indexOf('<div'); if (r0 === -1) return null;
    const rEnd = (() => { const re = /<div\b|<\/div>/g; re.lastIndex = r0; let depth = 0; let m; while ((m = re.exec(inner))) { depth += m[0] === '</div>' ? -1 : 1; if (depth === 0) return m.index + m[0].length; } return -1; })();
    if (rEnd === -1) return null;
    return inner.slice(r0, rEnd).replace(/\s+/g, ' ').replace(/>([^<]{70,})</g, (m, t) => `>${t.slice(0, 60)}…<`).trim();
  };
  const firstSection = (html) => { const m = html.match(/<main>\s*<div>([\s\S]*?)<\/div>\s*<div>/); return m ? m[1].replace(/\s+/g, ' ').replace(/>([^<]{70,})</g, (x, t) => `>${t.slice(0, 60)}…<`).trim().slice(0, 600) : null; };

  const siteJson = readJson(join(repo, 'migration', 'site.json'));
  const sourceCases = [];
  for (const caseDir of cases) {
    if (!isDir(caseDir)) { console.error(`block-inventory: case ${caseDir} not found — skipped`); continue; }
    const caseName = basename(caseDir); sourceCases.push(caseDir);
    const register = read(join(caseDir, 'REGISTER.md')) || read(join(caseDir, 'README.md')) || '';
    const regRows = parseRegister(register);
    if (!regRows) console.error(`block-inventory: ${caseName}: no triage table (header with "rows × cols") in REGISTER.md — code-only rows`);
    const docs = {}; const docDir = join(caseDir, 'doc'); if (isDir(docDir)) for (const f of readdirSync(docDir).filter((f) => f.endsWith('.html'))) docs[f.replace(/\.html$/, '')] = read(join(docDir, f));
    const page = siteJson?.pages?.find((p) => p.template === caseName || (p.path || '').replace(/\/$/, '').endsWith(`/${caseName}`)) || null;
    const budget = page ? { 360: page.served?.['360'] ?? page.proto?.['360'] ?? null, base: page.served?.base ?? page.proto?.base ?? null, probe: page.served?.probe ?? page.proto?.probe ?? null } : null;
    const budgetNote = page ? (page.served ? null : 'budget from the prototype gate (no served numbers in site.json)') : siteJson ? `site.json has no pages[] row for "${caseName}"` : 'no migration/site.json in the site repo (run site-profile init)';
    // the dump at the base width (the widest ≤ 1440, else any)
    const M = join(caseDir, 'measure'); const dumps = isDir(M) ? readdirSync(M).filter((f) => /^content-\d+\.json$/.test(f)).map((f) => ({ f, w: Number(f.match(/\d+/)[0]) })).sort((a, b) => a.w - b.w) : [];
    const pick = dumps.filter((d) => d.w <= 1440).pop() || dumps[0];
    const dump = pick ? readJson(join(M, pick.f)) : null;
    const split = dump ? splitSections(dump) : null;
    const fps = split ? split.sections.map((n) => fingerprint(n)) : [];
    const generic = dropGeneric(fps);
    const fpHeader = split?.header ? fingerprint(split.header) : null; const fpFooter = split?.footer ? fingerprint(split.footer) : null;
    const footerSubs = split?.footer ? (() => { let n = split.footer; while (n.children?.length === 1) n = n.children[0]; return (n.children || []).map((c) => fingerprint(c)); })() : [];
    const mainRows = (regRows || []).filter((r) => !/^(header|footer)\b/i.test(r.section));
    const headerRow = (regRows || []).find((r) => /^header\b/i.test(r.section)); const footerRow = (regRows || []).find((r) => /^footer\b/i.test(r.section));
    const aligned = mainRows.length === fps.length;
    if (regRows && !aligned) console.error(`block-inventory: ${caseName}: ${mainRows.length} triage rows vs ${fps.length} dump sections — fingerprints assigned by heading text where it matches, else left null`);
    const fpFor = (row, i) => { if (aligned) return fps[i]; const t = row.section.toLowerCase(); return fps.find((f) => f.anchorText && t.includes(f.anchorText.toLowerCase().slice(0, 20))) || null; };
    const strip = (fp) => fp && { pattern: fp.pattern, repeat: fp.repeat, groups: fp.groups, unit: fp.unit, unitSig: fp.unitSig, unitCols: fp.unitCols, cols: fp.cols, kinds: fp.kinds, media: fp.media, texts: fp.texts, links: fp.links, mediaRatio: fp.mediaRatio, headingBefore: fp.headingBefore, linkAfter: fp.linkAfter, controls: fp.controls, sliderHint: fp.sliderHint, classes: fp.classes, anchorText: fp.anchorText, width: pick?.w ?? null };
    const apply = (st, fp, docName, rowDesc) => {
      const r = rowFor(st.name, st.variant);
      if (st.shape && !r.shape) r.shape = st.shape; else if (st.shape && r.shape !== st.shape && !r._inferred.includes('shape')) r._notes.push(`${caseName} states shape ${st.shape}`);
      if (st.collection) r.collection = st.collection; if (st.rowsCols && !r.rowsCols) r.rowsCols = st.rowsCols;
      if (st.classes.length) r.sourceSignature.classes = [...new Set([...(r.sourceSignature.classes || []), ...st.classes])];
      else if (fp && !r.sourceSignature.classes) { const cls = allClasses(fp); if (cls.length) { r.sourceSignature.classes = cls; if (!r._inferred.includes('classes')) r._inferred.push('classes'); } }
      if (fp && !r.sourceSignature.fingerprint) r.sourceSignature.fingerprint = strip(fp);
      if (!r.approvedIn) { r.approvedIn = caseName; if (budget) r.budget = { ...budget, _source: 'page' }; if (budgetNote) r._notes.push(budgetNote); }
      if (!r.authoringExample) { const html = docs[docName] || docs.home || Object.values(docs)[0]; if (html) { r.authoringExample = ['header', 'footer'].includes(r.name) ? firstSection(html) : firstRow(html, [r.name, ...(r.variant ? r.variant.split(' ') : [])].join(' ')); r.document = r.authoringExample ? docName : null; } }
      if (!r.authoringExample) r._notes.push(`no <div class="${[r.name, r.variant].filter(Boolean).join(' ')}"> in ${caseName}/doc/*.html`);
      if (rowDesc && !r._notes.some((n) => n.startsWith('source:'))) r._notes.push(`source: ${rowDesc.replace(/\s+/g, ' ').slice(0, 160)}`);
    };
    if (regRows) {
      mainRows.forEach((row, i) => { const fp = fpFor(row, i); for (const st of statements(row.block, names)) apply(st, fp, 'home', row.section); });
      if (headerRow) for (const st of statements(headerRow.block, names)) apply(st, fpHeader, 'nav', headerRow.section);
      if (footerRow) { const sts = statements(footerRow.block, names); let k = 0; for (const st of sts) { const fp = st.name === 'footer' ? fpFooter : footerSubs[k++] || null; apply(st, fp, 'footer', footerRow.section); if (st.name !== 'footer' && fp) { const r = rowFor(st.name, st.variant); if (!r._inferred.includes('fingerprint-by-order')) r._inferred.push('fingerprint-by-order'); } } }
    }
    if (generic.length) console.error(`block-inventory: ${caseName}: generic classes dropped from signatures: ${generic.join(' ')}`);
  }

  // 3. code-only rows for every variant the CSS names and no register claimed; a default row only when the block has no variants
  //    or the document uses the bare class
  const docsAll = sourceCases.flatMap((c) => { const d = join(c, 'doc'); return isDir(d) ? readdirSync(d).filter((f) => f.endsWith('.html')).map((f) => read(join(d, f))) : []; }).join('\n');
  for (const name of names) {
    const info = codeInfo[name]; const have = rows.filter((r) => r.name === name);
    for (const v of info.variants) if (!have.some((r) => r.variant === v)) { const r = rowFor(name, v); r._notes.push('variant from the CSS only — no triage row names it'); }
    const hasVariantRows = rows.some((r) => r.name === name && r.variant);
    if (!hasVariantRows || docsAll.includes(`<div class="${name}">`) || ['header', 'footer'].includes(name)) { const r = rowFor(name, null); if (!r.approvedIn && !hasVariantRows && !['header', 'footer'].includes(name)) r._notes.push('code only — no case approved it'); }
    for (const r of rows.filter((x) => x.name === name)) { if (!r.shape && info.shape) { r.shape = info.shape; r._inferred.push('shape'); } if (['header', 'footer'].includes(name)) r.collection = name; }
  }
  // a class that rows of DIFFERENT blocks share is a layout utility (a widget wrapper, a centred container), not a signature
  const byClass = new Map(); for (const r of rows) for (const c of r.sourceSignature.classes || []) byClass.set(c, (byClass.get(c) || new Set()).add(r.name));
  const shared = [...byClass].filter(([, set]) => set.size >= 2).map(([c]) => c);
  if (shared.length) { for (const r of rows) if (r.sourceSignature.classes) { const drop = r.sourceSignature.classes.filter((c) => shared.includes(c)); if (drop.length) { r.sourceSignature.classes = r.sourceSignature.classes.filter((c) => !shared.includes(c)); if (!r.sourceSignature.classes.length) r.sourceSignature.classes = null; r._notes.push(`classes shared across blocks dropped: ${drop.join(' ')}`); } } console.error(`block-inventory: classes shared by several blocks dropped from signatures: ${shared.join(' ')}`); }
  rows.sort((a, b) => (a.name === b.name ? String(a.variant || '').localeCompare(String(b.variant || '')) : a.name.localeCompare(b.name)));
  for (const r of rows) { if (!r.sourceSignature.classes) r._notes.push('no source classes named or read'); if (!r.sourceSignature.fingerprint) r._notes.push('no fingerprint (no dump section mapped)'); if (!r._inferred.length) delete r._inferred; }
  // 3b. per-block budgets from the template's per-section tables (gate-served/ first, else gate/) — a copied page number is a mean
  //     (marriott: brands 0.49 % on a page approved at 0.33 %, hero 0.02 % — BACKLOG 152); the page number stays for the rows no table names
  for (const caseDir of sourceCases) {
    const tables = { ...sectionTables(join(caseDir, 'gate')), ...sectionTables(join(caseDir, 'gate-served')) }; // served wins per width
    if (!Object.keys(tables).length) { console.error(`block-inventory: ${basename(caseDir)}: no gate-served/ or gate/ sections-<W>.json — budgets are the page's numbers (run gate --per-section on the served page, then \`block-inventory budgets --gate-dir\`)`); continue; }
    const { touched, unknown, widths } = applySectionBudgets(rows, tables, { noise: noiseFloor(siteJson) });
    console.error(`block-inventory: ${basename(caseDir)}: budgets of ${touched.length} rows from the per-section tables at ${widths.join(' / ')} (${Object.values(tables).map((t) => t.file.replace(`${caseDir}/`, '')).join(', ')})${unknown.length ? `; blocks named there that the inventory lacks: ${unknown.join(', ')}` : ''}`);
  }
  // 4. recipes: a hand-written one in the existing file survives; --cases derives the rest from the case documents
  const previous = readJson(out)?.blocks || [];
  for (const r of rows) { const prev = previous.find((p) => p.name === r.name && (p.variant || null) === (r.variant || null)); if (prev?.recipe?._hand) r.recipe = prev.recipe; else if (prev?.recipe && !arg('--cases', false)) r.recipe = prev.recipe; }
  if (arg('--cases', false)) {
    const docs = {}; for (const c of sourceCases) { const d = join(c, 'doc'); if (isDir(d)) for (const f of readdirSync(d).filter((f) => f.endsWith('.html'))) docs[`${basename(c)}/${f.replace(/\.html$/, '')}`] = read(join(d, f)); }
    const derived = recipesFromDocs(docs, (name, variant) => rows.find((r) => r.name === name && (r.variant || null) === (variant || null))?.sourceSignature?.fingerprint || null);
    let n = 0; let kept = 0;
    for (const r of rows) { const d = derived[`${r.name}|${r.variant || ''}`]; if (r.recipe?._hand) { kept += 1; continue; } if (d) { r.recipe = { ...d.recipe, _notes: [...(d.recipe._notes || []), ...d.notes.filter((x) => !(d.recipe._notes || []).includes(x))] }; n += 1; } else if (!['header', 'footer'].includes(r.name) && !r.recipe) r._notes.push('no recipe: the block occurs in no case document (write one by hand: recipe._hand)'); }
    console.error(`block-inventory: recipes derived for ${n} rows from ${Object.keys(docs).length} documents${kept ? `, ${kept} hand-written kept` : ''}`);
  }
  const json = { _schema: 'stardust-lite/block-inventory@1', _writtenAt: new Date().toISOString(), _source: { siteRepo: repo, cases: sourceCases }, blocks: rows };
  mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, JSON.stringify(json, null, 1));
  printTable(rows);
  console.log(`\n${rows.length} rows (${names.length} blocks) → ${out}`);
  process.exit(0);
}

function printTable(rows) {
  table(rows.map((b) => { const f = b.sourceSignature?.fingerprint; const sig = [b.sourceSignature?.classes?.slice(0, 2).join(' '), f ? `${f.unit || f.pattern.slice(0, 30)}${f.repeat ? ` ×${f.repeat}` : ''}` : null].filter(Boolean).join(' · ') || '—'; return [b.name, b.variant || '—', `${b.shape || '—'}${b._inferred?.includes('shape') ? '?' : ''}`, b.collection || '—', b.rowsCols || '—', sig, b.budget && (b.budget.base != null || b.budget['360'] != null || b.budget.probe != null) ? `${b.budget['360'] ?? '—'} / ${b.budget.base ?? '—'} / ${b.budget.probe ?? '—'}${b.budget._source === 'sections' ? ' ◂sections' : b.budget._source === 'page' ? ' ◂page' : ''}` : '—', b.approvedIn || '—', describeRecipe(b.recipe)]; }), ['block', 'variant', 'shape', 'collection', 'rows × cols', 'source signature (classes · unit)', 'budget 360 / base / probe %', 'approved in', 'recipe (rows [cells])']);
}
const loadBlocks = () => { const f = resolve(arg('--blocks', join('migration', 'blocks.json'))); const j = readJson(f); if (!j?.blocks) { console.error(`block-inventory: ${f} unreadable — run scan first`); process.exit(1); } return { file: f, blocks: j.blocks }; };

// ───────────────────────────── recipe ─────────────────────────────
if (cmd === 'recipe') {
  const variantArg = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : null;
  const from = arg('--from', null); if (!from || from === true) usage();
  const html = read(resolve(from)); if (!html) { console.error(`block-inventory: ${from} unreadable`); process.exit(1); }
  const blocksPath = resolve(arg('--blocks', join('migration', 'blocks.json'))); const inv = readJson(blocksPath);
  const row = inv?.blocks?.find((b) => b.name === target && (b.variant || null) === variantArg) || null;
  const derived = recipesFromDocs({ [basename(from, '.html')]: html }, () => row?.sourceSignature?.fingerprint || null);
  const hit = derived[`${target}|${variantArg || ''}`];
  if (!hit) { console.error(`block-inventory: no <div class="${[target, variantArg].filter(Boolean).join(' ')}"> in ${from} (blocks there: ${[...new Set(Object.values(derived).map((d) => `${d.name}${d.variant ? ` (${d.variant})` : ''}`))].join(', ')})`); process.exit(2); }
  const recipe = hit.recipe;
  // with a triage section: which dump kinds of the unit land where
  const triageFile = arg('--triage', null); const unitIdx = arg('--unit', null);
  if (triageFile && unitIdx !== null) {
    const tri = readJson(resolve(triageFile)); const sec = tri?.sections?.find((x) => String(x.index) === String(unitIdx));
    if (!sec) console.error(`block-inventory: no section ${unitIdx} in ${triageFile}`);
    else {
      const kinds = (sec.signature?.unitSig?.length ? sec.signature.unitSig : sec.signature?.kinds || []).map((k) => (k === 'media' ? 'picture' : k));
      const cells = recipe.cells || []; const landing = kinds.map((k) => { const i = cells.findIndex((c) => (Array.isArray(c.from) ? c.from : [c.from]).includes(k) || (Array.isArray(c.from) ? c.from : [c.from]).includes('rest')); return `${k} → ${i >= 0 ? `cell ${i + 1} (${cells[i].name})` : 'does not fit'}`; });
      console.log(`unit of section ${unitIdx} (${sec.fingerprint}, ×${sec.repeat}): ${landing.join('; ')}`);
      recipe._notes.push(`checked against triage section ${unitIdx}: ${landing.join('; ')}`);
    }
  }
  console.log(JSON.stringify(recipe, null, 1));
  console.log(`\n${target}${variantArg ? ` (${variantArg})` : ''}: ${describeRecipe(recipe)} — from ${from} (${hit.rows} row(s))${hit.notes.length ? `; ${hit.notes.join('; ')}` : ''}`);
  if (arg('--write', false)) {
    if (!inv?.blocks) { console.error(`block-inventory: ${blocksPath} unreadable — run scan first`); process.exit(1); }
    let r = row; if (!r) { r = { name: target, variant: variantArg, shape: recipe.rows === 'unit' ? 'container' : recipe.rows === 'key-value' ? 'key-value' : 'simple', rowsCols: null, collection: COLLECTIONS.includes(target) ? target : null, authoringExample: null, sourceSignature: { classes: null, fingerprint: null }, recipe: null, budget: { 360: null, base: null, probe: null }, approvedIn: null, document: null, _notes: ['row created by `block-inventory recipe --write`'] }; inv.blocks.push(r); }
    r.recipe = { ...recipe, _hand: true }; inv._writtenAt = new Date().toISOString(); writeFileSync(blocksPath, JSON.stringify(inv, null, 1));
    console.log(`written to ${blocksPath} as hand-written (survives rescans)`);
  }
  process.exit(0);
}

// ───────────────────────────── budgets ─────────────────────────────
if (cmd === 'budgets') {
  const gateDir = arg('--gate-dir', null); if (typeof gateDir !== 'string') usage();
  const { file, blocks } = loadBlocks(); const inv = readJson(file);
  const tables = sectionTables(resolve(gateDir));
  if (!Object.keys(tables).length) { console.error(`block-inventory: no sections-<W>.json in ${resolve(gateDir)} (gate writes them with --per-section, --chrome or --budget)`); process.exit(2); }
  const siteJson = readJson(join(resolve(arg('--site-repo', '.')), 'migration', 'site.json'));
  const before = Object.fromEntries(blocks.map((b) => [label(b), JSON.stringify({ 360: b.budget?.[360] ?? null, base: b.budget?.base ?? null, probe: b.budget?.probe ?? null })]));
  const { touched, unknown, widths } = applySectionBudgets(blocks, tables, { noise: noiseFloor(siteJson) });
  inv.blocks = blocks; inv._writtenAt = new Date().toISOString(); inv._budgets = { gateDir: resolve(gateDir), tables: Object.values(tables).map((t) => t.file), widths, noise: noiseFloor(siteJson) };
  writeFileSync(file, JSON.stringify(inv, null, 1));
  table(blocks.map((b) => { const now = { 360: b.budget?.[360] ?? null, base: b.budget?.base ?? null, probe: b.budget?.probe ?? null }; const secs = b.budget?._sections ? Object.entries(b.budget._sections).map(([k, l]) => `${k}: ${l.map((x) => `#${x.index} ${x.pct}`).join(', ')}`).join('; ') : ''; return [label(b), b.budget?._source || '—', now[360] ?? '—', now.base ?? '—', now.probe ?? '—', before[label(b)] === JSON.stringify(now) ? '' : `was ${before[label(b)].replace(/"/g, '').replace(/[{}]/g, '')}`, secs.slice(0, 70)]; }), ['block', 'source', '360', 'base', 'probe', 'change', 'sections (index pct)']);
  console.log(`\n${touched.length} of ${blocks.length} rows from ${Object.values(tables).map((t) => basename(t.file)).join(', ')} in ${resolve(gateDir)}${noiseFloor(siteJson) ? ` (+ noise floor ${noiseFloor(siteJson)})` : ''}${unknown.length ? `; named there but not in the inventory: ${unknown.join(', ')}` : ''} → ${file}`);
  process.exit(0);
}

// ───────────────────────────── print ─────────────────────────────
if (cmd === 'print') { const { file, blocks } = loadBlocks(); printTable(blocks); console.log(`\n${blocks.length} rows from ${file}`); process.exit(0); }

// ───────────────────────────── diff ─────────────────────────────
if (cmd === 'diff') {
  const triage = readJson(resolve(target)); if (!triage?.sections) { console.error(`block-inventory: ${target} is not a triage JSON`); process.exit(1); }
  const { file, blocks } = loadBlocks();
  const rows = []; const counts = { inventory: 0, collection: 0, default: 0, new: 0 }; let mainCount = 0;
  for (const s of triage.sections) {
    const fp = s.signature ? { ...s.signature, defaultContent: s.defaultContent || [] } : null;
    const m = fp ? matchSection(fp, blocks, { chrome: s.chrome || null }) : { kind: 'new', block: null, variant: null, confidence: null, notes: ['no fingerprint stored'] };
    if (!s.chrome) { mainCount++; counts[m.kind] = (counts[m.kind] || 0) + 1; }
    const cover = m.kind === 'inventory' ? `covered by ${m.block}${m.variant ? ` (${m.variant})` : ''} (${m.confidence})` : m.kind === 'collection' ? `collection match only: ${m.guess?.collection}` : m.kind === 'default' ? 'default content' : `new${m.block ? ` (${m.block}?)` : ''}`;
    rows.push([s.index, (s.chrome || s.anchorText || '(no text)').slice(0, 40), (s.fingerprint || '').slice(0, 48), fp && !s.chrome && m.kind !== 'default' ? rowsCols(fp) : '—', cover, (m.notes || []).join('; ').slice(0, 90)]);
  }
  table(rows, ['#', 'section', 'fingerprint', 'rows × cols', 'coverage', 'notes']);
  const novelty = mainCount ? counts.new / mainCount : 0;
  console.log(`\nnovelty ${(novelty * 100).toFixed(0)} % (${counts.new} new of ${mainCount} sections; ${counts.inventory} covered, ${counts.collection} collection only, ${counts.default} default content) — ${triage._source?.content || target} vs ${file}`);
  process.exit(0);
}
