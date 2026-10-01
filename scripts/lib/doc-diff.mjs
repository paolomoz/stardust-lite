#!/usr/bin/env node
// lib/doc-diff.mjs — the structural diff of two authored documents (a generated one against the committed ground truth): per section
// the block names / variants, rows × cols per block, and the text SET (the own text of headings, paragraphs and list items, the way
// `harness --content` reads them) — a prose diff says nothing useful about a document that is mostly tables (batch-7 rollout pass 4,
// the replay gate of `author`). Pure Node.
// Usage: node lib/doc-diff.mjs <reference.html> <candidate.html> [--texts 8] [--json]
// Output: one row per section (reference order; a candidate section without a partner is `+`), then the summary — sections equal,
// block structure identical in N of M sections, texts identical X % (|A ∩ B| / |A| over the reference's texts). Exit 0 always.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseDoc } from './recipes.mjs';

const norm = (t) => t.replace(/[ \s]+/g, ' ').replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s*([,.;:!?])\s*/g, '$1 ').replace(/\s+/g, ' ').trim().toLowerCase();
const blockLabel = (b) => `${b.name}${b.variant ? ` (${b.variant})` : ''} ${b.rowsCols}`;
/** Compare two documents. Returns { rows: [{ index, ref, cand, blocksEqual, textsEqual, missing, extra }], summary }. */
export function docDiff(refHtml, candHtml, { maxTexts = 8 } = {}) {
  const A = parseDoc(refHtml).filter((s) => !s.isMetadata); const B = parseDoc(candHtml).filter((s) => !s.isMetadata);
  const rows = []; let blocksSame = 0; let inter = 0; let total = 0; let candTotal = 0;
  const n = Math.max(A.length, B.length);
  for (let i = 0; i < n; i++) {
    const a = A[i] || null; const b = B[i] || null;
    const la = a ? a.blocks.map(blockLabel) : []; const lb = b ? b.blocks.map(blockLabel) : [];
    const ta = new Set((a?.texts || []).map(norm)); const tb = new Set((b?.texts || []).map(norm));
    const missing = [...ta].filter((t) => !tb.has(t)); const extra = [...tb].filter((t) => !ta.has(t));
    const blocksEqual = a && b && JSON.stringify(la) === JSON.stringify(lb) && (a.style || null) === (b.style || null);
    if (a && b && JSON.stringify(la) === JSON.stringify(lb)) blocksSame += 1;
    inter += ta.size - missing.length; total += ta.size; candTotal += tb.size;
    rows.push({ index: i, ref: a ? `${la.join(' + ') || 'default'}${a.style ? ` · ${a.style}` : ''}` : '—', cand: b ? `${lb.join(' + ') || 'default'}${b.style ? ` · ${b.style}` : ''}` : '—', blocksEqual: !!blocksEqual, styleEqual: !!(a && b && (a.style || null) === (b.style || null)), texts: `${ta.size - missing.length}/${ta.size}`, textsEqual: !missing.length && !extra.length, missing: missing.slice(0, maxTexts), extra: extra.slice(0, maxTexts), missingCount: missing.length, extraCount: extra.length });
  }
  const summary = { sectionsRef: A.length, sectionsCand: B.length, sectionsEqual: A.length === B.length, blocksIdentical: blocksSame, textsRef: total, textsCand: candTotal, textsIdentical: inter, textsPct: total ? Math.round((inter / total) * 1000) / 10 : 100 };
  return { rows, summary };
}
export const printDiff = ({ rows, summary }, log = console.log) => {
  const w = (s, n) => String(s ?? '').slice(0, n).padEnd(n);
  log(`${w('#', 3)} ${w('reference (blocks · style)', 52)} ${w('candidate', 52)} ${w('struct', 7)} ${w('texts', 8)} differences`);
  for (const r of rows) { log(`${w(r.index, 3)} ${w(r.ref, 52)} ${w(r.cand, 52)} ${w(r.blocksEqual ? '=' : r.styleEqual ? 'blocks≠' : 'style≠', 7)} ${w(r.texts, 8)} ${r.missing.map((t) => `−"${t.slice(0, 60)}"`).concat(r.extra.map((t) => `+"${t.slice(0, 60)}"`)).join(' ')}${r.missingCount > r.missing.length || r.extraCount > r.extra.length ? ' …' : ''}`); }
  log(`\nsections ${summary.sectionsRef} vs ${summary.sectionsCand} (${summary.sectionsEqual ? 'equal' : 'DIFFERENT'}); block structure identical in ${summary.blocksIdentical} of ${summary.sectionsRef}; texts identical ${summary.textsIdentical} of ${summary.textsRef} (${summary.textsPct} %), candidate has ${summary.textsCand}`);
};
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [ref, cand] = process.argv.slice(2).filter((a) => !a.startsWith('--') && !/^\d+$/.test(a));
  if (!ref || !cand) { console.error('usage: doc-diff.mjs <reference.html> <candidate.html> [--texts 8] [--json]'); process.exit(1); }
  const i = process.argv.indexOf('--texts'); const maxTexts = i > -1 ? Number(process.argv[i + 1]) : 8;
  const d = docDiff(readFileSync(ref, 'utf8'), readFileSync(cand, 'utf8'), { maxTexts });
  if (process.argv.includes('--json')) console.log(JSON.stringify(d, null, 1)); else printDiff(d);
}
