// lib/recipes.mjs — the authoring recipe of a block: how a source unit (one member of a section's repeating structure, or the
// section itself) becomes one block row, expressed in the content dump's leaf kinds, so `author` writes the block table from the dump
// and nobody types a per-site `build-doc` again (SCALING-PLAN §2.E, batch-7 rollout pass 4). Pure: reads the authored HTML of a case
// document and the fingerprint lib's kinds; no browser.
//
// recipe (blocks.json `blocks[].recipe`, v1):
// {
//   "rows": "unit" | "fixed" | "leaf" | "key-value",
//            unit      — a container: one row per member of the section's repeating unit (cards, carousel slides, tabs); a lone node
//                        whose leaf kinds equal the unit's is a 1-row block too (a tile after a rule — marriott's Hyatt tile)
//            fixed     — a simple block with one row (hero, columns 1 × N, quote): the section's content minus the default content
//                        the recipe peels off (`defaultContentBefore` kinds at the start, `defaultContentAfter` kinds at the end)
//            leaf      — a simple block with one property per row (a hero: picture row, mobile picture row, video-link row): each
//                        remaining leaf is a row of one cell, in dump order
//            key-value — configuration rows name / value (`ad`, `section-metadata`): `keys` below; display copy never lands here (D14)
//   "cells": [ { "name": "image" | "body" | …,                 // a label for the report, nothing reads it
//                "from": "picture" | "video" | "heading" | "text" | "link" | "list" | "icon" | "quote" | "embed" | "hidden" | "rest"
//                        | [ …several ],                        // the dump kinds this cell accepts (generalised: any h1–h6 is `heading`,
//                                                               // p / li text is `text`, a / button is `link`, img / picture / bg is `picture`)
//                "take": N,                                     // at most N structural children of the unit feed this cell (two cells that
//                                                               // accept the same kind split on a structural boundary; `take` bounds the first)
//                "heading": "h3",                               // re-level every heading in this cell (a modal's h2 authored as the card's h3)
//                "link": "strong" | "em" | "plain",             // button weight for the cell's links (default: the dump — a filled link is
//                                                               // strong, an outlined one em, else plain)
//                "join": true,                                  // merge the cell's texts into one paragraph (a prefix + a number)
//                "wrap": "p" | null } ],                        // pictures are always `<p><picture>`; `null` writes a bare picture (legacy)
//              `from: "hidden"` fills the cell from the k-th root of the extra content sources (`author --content a.json,hidden.json`)
//              for the k-th unit whose link is dead (`javascript:` / `#`): content a click reveals (modals — marriott's brand tiles);
//              `from: "rest"` takes every leaf no other cell accepted (the warning "did not fit the recipe" is then impossible)
//   "headRow": [ cells ] | null,            // a container's own rows before the units (a title row), same cell spec
//   "keys": [ { "name": "slot", "from": "text" | null, "value": "constant" | null } ],   // key-value rows
//   "sectionStyle": "hero" | null,          // the section-metadata style the approving case gave the section this block sits in
//   "metadata": { "key": "from" } | null,   // extra section-metadata rows (reserved)
//   "defaultContentBefore": ["heading", "text"], "defaultContentAfter": ["link"],   // kinds authored outside the block in the case
//   "variantRules": { "divider": "hr-before" } | null,   // a variant the engine adds when the source shows the rule (an <hr> before the unit)
//   "_hand": true,                          // written by hand: `block-inventory scan --cases` keeps it (merge by name + variant)
//   "_derivedFrom": "home.html#2", "_notes": [ … ]   // derived from the case document (section index), with what did not derive
// }
// What recipes cannot express yet is a BACKLOG row, not a special case here.

const HEAD = /^h[1-6]$/;
export const KINDS = ['picture', 'video', 'heading', 'text', 'link', 'list', 'icon', 'quote', 'embed', 'hidden', 'rest'];
/** Generalise a dump kind (fingerprint.kindOf) to a recipe kind. */
export const recipeKind = (k) => (HEAD.test(k) ? 'heading' : k === 'p' || k === 'li' ? 'text' : k === 'a' || k === 'button' ? 'link' : k === 'blockquote' ? 'quote' : k === 'ul' || k === 'ol' ? 'list' : k === 'picture' || k === 'video' || k === 'icon' || k === 'embed' ? k : k);

// ───────────────────────────── authored HTML → sections / blocks / cells ─────────────────────────────
// Balanced-div walking over machine-written content HTML (the lint's technique); not a browser-grade parser.
const divEnd = (s, start) => { const re = /<div\b|<\/div>/gi; re.lastIndex = start; let depth = 0; let m; while ((m = re.exec(s))) { if (m[0][1] === '/') { depth -= 1; if (depth === 0) return m.index + m[0].length; } else depth += 1; } return s.length; };
export function childDivs(inner) {
  const out = []; const re = /<div\b[^>]*>/gi; let m;
  while ((m = re.exec(inner))) { const end = divEnd(inner, m.index); out.push({ openTag: m[0], outer: inner.slice(m.index, end), inner: inner.slice(m.index + m[0].length, end - 6), start: m.index, end }); re.lastIndex = end; }
  return out;
}
const classOf = (openTag) => ((openTag.match(/class="([^"]*)"/i) || [])[1] || '').trim();
export const stripTags = (html) => String(html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<\/(?:p|li|div|h[1-6])>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); // textContent-like: inline tags add no space
const decode = (t) => t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
/** The texts a document holds the way `harness --content` reads them: the own text of every heading / paragraph / list item (nested
 * lists, divs and paragraphs excluded), `:icon:` tokens dropped, whitespace collapsed, ≥ 3 chars, not a URL. */
export function textsOf(html) {
  const out = [];
  const re = /<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi; let m;
  const src = String(html || '').replace(/<(ul|ol)\b[\s\S]*?<\/\1>/gi, (list) => list.replace(/<li\b[^>]*>([\s\S]*?)(?=<li\b|<\/(ul|ol)>)/gi, (li, inner) => `\u0001LI\u0001${inner}`)); // flatten li boundaries
  while ((m = re.exec(src))) { if (m[1] === 'li') continue; const t = decode(stripTags(m[2].replace(/:[a-z0-9-]+:/g, ' '))); if (t.length >= 3 && !/^https?:/.test(t)) out.push(t); }
  const li = /\u0001LI\u0001([\s\S]*?)(?=\u0001LI\u0001|<\/(?:ul|ol)>)/g;
  while ((m = li.exec(src))) { const own = m[1].replace(/<(ul|ol)\b[\s\S]*$/i, '').replace(/<\/li>[\s\S]*$/i, ''); const t = decode(stripTags(own.replace(/:[a-z0-9-]+:/g, ' '))); if (t.length >= 3 && !/^https?:/.test(t)) out.push(t); }
  return out;
}
/** Parse an authored document (or a bare <main>) into sections: each with its ordered items (default-content chunks and blocks), the
 * blocks' rows × cells (HTML), the section-metadata style and the texts. */
export function parseDoc(html) {
  const main = (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || [, html])[1];
  const sections = [];
  childDivs(main).forEach((sec, index) => {
    const kids = childDivs(sec.inner); const items = []; let cursor = 0; const blocks = []; let style = null; const metadata = {};
    const pushDefault = (chunk) => { if (stripTags(chunk) || /<(picture|img)\b/i.test(chunk)) items.push({ type: 'default', html: chunk.trim(), tags: [...chunk.matchAll(/<(h[1-6]|p|ul|ol|picture)\b/gi)].map((m) => m[1].toLowerCase()) }); };
    for (const k of kids) {
      pushDefault(sec.inner.slice(cursor, k.start)); cursor = k.end;
      const cls = classOf(k.openTag); if (!cls) { pushDefault(k.outer); continue; }
      const [name, ...variant] = cls.split(/\s+/);
      const rows = childDivs(k.inner).map((r) => childDivs(r.inner).map((c) => c.inner.trim()));
      if (name === 'section-metadata') { for (const [kk, v] of rows) { const key = stripTags(kk).toLowerCase(); if (key === 'style') style = stripTags(v); else metadata[key] = stripTags(v); } continue; }
      const block = { name, variant: variant.length ? variant.join(' ') : null, classes: cls, rows, rowsCols: `${rows.length} × ${Math.max(0, ...rows.map((r) => r.length))}`, html: k.outer };
      blocks.push(block); items.push({ type: 'block', ...block });
    }
    pushDefault(sec.inner.slice(cursor));
    sections.push({ index, html: sec.inner, items, blocks, style, metadata, texts: textsOf(sec.inner), isMetadata: blocks.length === 1 && blocks[0].name === 'metadata' && items.length === 1 });
  });
  return sections;
}

// ───────────────────────────── derive a recipe from a case document ─────────────────────────────
/** The recipe kinds a cell's HTML holds, in order (a `<p>` holding only a picture is `picture`; a `<p>` holding only a link is `link`). */
export function kindsOfCell(cellHtml) {
  const kinds = []; const h = String(cellHtml || '');
  // top-level elements only (a picture inside a <p> classifies the <p>)
  const tops = []; let i = 0;
  while (i < h.length) {
    const open = h.slice(i).match(/<(h[1-6]|p|ul|ol|blockquote|picture|a|img|br)\b[^>]*>/i); if (!open) break;
    const tag = open[1].toLowerCase(); const start = i + open.index; let end;
    if (tag === 'img' || tag === 'br') end = start + open[0].length; else { const close = h.indexOf(`</${tag}>`, start); end = close === -1 ? h.length : close + tag.length + 3; }
    tops.push({ tag, html: h.slice(start, end) }); i = end;
  }
  for (const t of tops) {
    if (HEAD.test(t.tag)) kinds.push('heading');
    else if (t.tag === 'ul' || t.tag === 'ol') kinds.push('list');
    else if (t.tag === 'blockquote') kinds.push('quote');
    else if (t.tag === 'picture' || t.tag === 'img') kinds.push('picture');
    else if (t.tag === 'a') kinds.push(/\.(mp4|webm|m3u8)(\?|$)/i.test((t.html.match(/href="([^"]*)"/) || [])[1] || '') ? 'video' : 'link');
    else if (t.tag === 'p') {
      const inner = t.html.replace(/^<p\b[^>]*>/i, '').replace(/<\/p>$/i, '').trim();
      if (/^<picture\b[\s\S]*<\/picture>$/i.test(inner) || /^<img\b[^>]*>$/i.test(inner)) kinds.push('picture');
      else if (/^(<(strong|em)>)*<a\b[^>]*>[\s\S]*<\/a>(<\/(strong|em)>)*$/i.test(inner)) kinds.push(/\.(mp4|webm|m3u8)(\?|$)/i.test((inner.match(/href="([^"]*)"/) || [])[1] || '') ? 'video' : 'link');
      else if (/^(<a\b[^>]*>)?:[a-z0-9-]+:(<\/a>)?$/i.test(inner)) kinds.push('icon');
      else kinds.push('text');
    }
  }
  return kinds;
}
const linkWeight = (cellHtml) => { const links = [...String(cellHtml).matchAll(/<p>(?:<(strong|em)>)?<a\b/gi)].map((m) => (m[1] || 'plain').toLowerCase()); if (!links.length) return null; return links.every((w) => w === links[0]) ? links[0] : null; };
const headingTag = (cellHtml) => { const hs = [...String(cellHtml).matchAll(/<(h[1-6])\b/gi)].map((m) => m[1].toLowerCase()); return hs.length && hs.every((h) => h === hs[0]) ? hs[0] : null; };
const isBare = (cellHtml) => !/<(p|h[1-6]|ul|ol|picture|img|div)\b/i.test(cellHtml);
const defaultKinds = (items) => { const out = []; for (const it of items) for (const tag of it.tags) { const k = HEAD.test(tag) ? 'heading' : tag === 'p' ? (/<p>(<(strong|em)>)*<a\b/.test(it.html) ? 'link' : 'text') : tag === 'picture' ? 'picture' : 'list'; if (!out.includes(k)) out.push(k); } return out; };

/** Derive a recipe from one block of a parsed section (`parseDoc`), with the section's fingerprint when known (repeat count decides
 * unit vs fixed when the document alone is ambiguous). Returns { recipe, notes }. */
export function deriveRecipe(block, section, { fingerprint = null, doc = 'doc' } = {}) {
  const notes = []; const rows = block.rows.filter((r) => r.length);
  if (!rows.length) return { recipe: null, notes: ['block has no rows'] };
  const cols = rows.map((r) => r.length); const maxCols = Math.max(...cols);
  const idx = section.items.findIndex((it) => it.type === 'block' && it.html === block.html);
  const before = defaultKinds(section.items.slice(0, idx).filter((it) => it.type === 'default'));
  const after = defaultKinds(section.items.slice(idx + 1).filter((it) => it.type === 'default'));
  const base = { sectionStyle: section.style || null, metadata: null, defaultContentBefore: before, defaultContentAfter: after, variantRules: null, _derivedFrom: `${doc}#${section.index}`, _notes: notes };
  // key-value: two cells per row, the first bare text, most values bare too
  const kv = rows.every((r) => r.length === 2 && isBare(r[0]) && stripTags(r[0]).length <= 40) && rows.filter((r) => isBare(r[1])).length >= Math.ceil(rows.length / 2);
  if (kv) {
    const keys = rows.map(([k, v]) => { const kinds = kindsOfCell(v); return { name: stripTags(k).toLowerCase(), from: kinds.length ? kinds[0] : null, value: isBare(v) ? decode(stripTags(v)) : null }; });
    notes.push('values are configuration: the engine writes the constants and fills `from` keys from the unit');
    return { recipe: { rows: 'key-value', cells: null, headRow: null, keys, ...base }, notes };
  }
  // a title row before the units: the first row's cell count differs from the rest
  let headRow = null; let unitRows = rows;
  if (rows.length >= 3 && cols[0] !== cols[1] && cols.slice(1).every((c) => c === cols[1])) { headRow = cellsFor([rows[0]]); unitRows = rows.slice(1); notes.push('first row read as the block\'s own title row (headRow)'); }
  const repeat = fingerprint?.repeat ?? null;
  const kindsPerRow = unitRows.map((r) => r.map(kindsOfCell));
  const oneLeafRows = unitRows.length >= 2 && maxCols === 1 && kindsPerRow.every((r) => r[0].length === 1) && (repeat === null || repeat < 2) && new Set(kindsPerRow.map((r) => r[0][0])).size > 1;
  let rowsMode = unitRows.length >= 2 ? (oneLeafRows ? 'leaf' : 'unit') : 'fixed';
  if (rowsMode === 'unit' && repeat !== null && repeat < 2 && unitRows.length <= 2) { rowsMode = 'fixed'; notes.push(`${unitRows.length} rows but the source has no repeating unit — read as fixed`); }
  const cells = cellsFor(unitRows);
  // the document's cell holds text the source unit does not show (a logo tile whose link opens a modal): the cell is fed by what the
  // link opens — an extra content source (`author --content dump.json,hidden.json`)
  const sig = fingerprint?.unitSig || [];
  if (sig.length && sig.includes('link') && !sig.includes('heading') && !sig.includes('text')) for (const c of cells) if (c.from.some((k) => ['heading', 'text'].includes(k))) { c.from = [...c.from, 'hidden']; notes.push(`cell "${c.name}": the unit shows no text (${sig.join('+')}) — fed by the content its link opens (hidden)`); }
  if (rowsMode === 'leaf') { const kinds = [...new Set(kindsPerRow.map((r) => r[0][0]))]; return { recipe: { rows: 'leaf', cells: [{ name: 'property', from: kinds }], headRow: null, keys: null, ...base }, notes }; }
  if (block.variant && /\bdivider\b/.test(block.variant)) { base.variantRules = { divider: 'hr-before' }; notes.push('variant `divider`: the engine adds it when the source shows an <hr> before the unit'); }
  if (cells.some((c) => !c.from.length)) notes.push(`empty cell(s) in every row: ${cells.filter((c) => !c.from.length).map((c) => c.name).join(', ')}`);
  return { recipe: { rows: rowsMode, cells, headRow, keys: null, ...base }, notes };
}
/** One cell spec per column from the rows given: `from` = the union of kinds the column holds, `heading` / `link` when uniform, `take`
 * when the next column accepts a kind this one does too (the column's largest leaf count bounds it). */
function cellsFor(rows) {
  const n = Math.max(...rows.map((r) => r.length)); const cells = [];
  for (let i = 0; i < n; i++) {
    const htmls = rows.map((r) => r[i] ?? ''); const kindsList = htmls.map(kindsOfCell); const from = [...new Set(kindsList.flat())];
    const heads = htmls.map(headingTag).filter(Boolean); const weights = htmls.map(linkWeight).filter(Boolean);
    const cell = { name: from.length === 1 && from[0] === 'picture' ? 'image' : from.includes('heading') || from.includes('text') ? 'body' : from.join('+') || 'empty', from };
    if (heads.length && heads.every((h) => h === heads[0])) cell.heading = heads[0];
    if (weights.length && weights.every((w) => w === weights[0]) && weights.length === htmls.filter((h) => /<a\b/.test(h)).length) cell.link = weights[0];
    cells.push({ ...cell, _maxLeaves: Math.max(...kindsList.map((k) => k.length)) });
  }
  for (let i = 0; i < cells.length - 1; i++) { if (cells[i].from.some((k) => cells[i + 1].from.includes(k))) cells[i].take = Math.max(1, cells[i]._maxLeaves); }
  for (const c of cells) delete c._maxLeaves;
  return cells;
}

/** The fallback when a block has no recipe: by shape and the stored fingerprint — a container with media is picture + rest, a simple
 * block one row of rest; the report says the default was used. */
// the Block Collection's authoring shapes, for a template page whose inventory is empty (every section stopped `author` and the case wrote
// its own generator — scotiabank-personal, loop r1): a collection match drafts through these; the approved document then derives the real recipe
const COLLECTION = {
  hero: { rows: 'fixed', cells: [{ name: 'body', from: ['rest'] }], defaultContentBefore: [], defaultContentAfter: [] },
  cards: { rows: 'unit', cells: [{ name: 'image', from: ['picture', 'video', 'icon'], take: 1 }, { name: 'body', from: ['rest'] }] },
  carousel: { rows: 'unit', cells: [{ name: 'image', from: ['picture', 'video'], take: 1 }, { name: 'body', from: ['rest'] }] },
  tabs: { rows: 'unit', cells: [{ name: 'label', from: ['heading', 'text', 'link'], take: 1 }, { name: 'panel', from: ['rest', 'hidden'] }], controlsAreUnits: true },
  accordion: { rows: 'unit', cells: [{ name: 'summary', from: ['heading', 'text', 'link'], take: 1 }, { name: 'body', from: ['rest', 'hidden'] }], controlsAreUnits: true },
  columns: { rows: 'fixed', cells: [{ name: 'column', from: ['rest'] }], cellsFromChildren: true },
  quote: { rows: 'leaf', cells: [{ name: 'quote', from: ['quote', 'text', 'rest'] }], defaultContentBefore: [], defaultContentAfter: [] },
  embed: { rows: 'leaf', cells: [{ name: 'link', from: ['link', 'embed', 'video', 'rest'] }], defaultContentBefore: [], defaultContentAfter: [] },
  video: { rows: 'leaf', cells: [{ name: 'link', from: ['video', 'link', 'picture', 'rest'] }], defaultContentBefore: [], defaultContentAfter: [] },
  table: { rows: 'unit', cells: [{ name: 'cells', from: ['rest'] }] },
};
export function defaultRecipe(row, name = null) {
  const f = row?.sourceSignature?.fingerprint || null; const sig = f?.unitSig || f?.kinds || [];
  if (row?.shape === 'key-value') return { rows: 'key-value', cells: null, headRow: null, keys: [], sectionStyle: null, defaultContentBefore: [], defaultContentAfter: [], _notes: ['default recipe: no keys known'] };
  const col = COLLECTION[String(name || row?.name || '').toLowerCase()];
  if (col && !f) return { headRow: null, keys: null, sectionStyle: null, defaultContentBefore: ['heading', 'text'], defaultContentAfter: ['link'], ...col, _collectionDefault: true, _notes: [`default recipe: the Block Collection's ${name || row?.name} shape (no recipe in blocks.json)`] };
  const container = row?.shape === 'container' || (f && f.repeat >= 2);
  const cells = sig.includes('media') ? [{ name: 'image', from: ['picture', 'video'], take: 1 }, { name: 'body', from: ['rest'] }] : [{ name: 'body', from: ['rest'] }];
  return { rows: container ? 'unit' : 'fixed', cells, headRow: null, keys: null, sectionStyle: null, defaultContentBefore: ['heading', 'text'], defaultContentAfter: ['link'], _notes: ['default recipe (no recipe in blocks.json): picture + rest'] };
}
/** Merge a derived recipe into an inventory row: a hand-written recipe (`_hand: true`) survives; else the derived one replaces. */
export function mergeRecipe(row, derived) { if (row.recipe?._hand) return row.recipe; return derived || row.recipe || null; }
export const describeRecipe = (r) => (!r ? '—' : r.rows === 'key-value' ? `key-value ${(r.keys || []).map((k) => k.name).join('/')}` : `${r.rows}${r.headRow ? '+head' : ''} [${(r.cells || []).map((c) => (Array.isArray(c.from) ? c.from.join('|') : c.from) + (c.take ? `≤${c.take}` : '')).join('] [')}]${r._hand ? ' ✎' : ''}`);
