#!/usr/bin/env node
// css-lint.mjs — the block CSS against the method before the first harness (loop high-impact pass): the round causes that recurred in ten
// rounds, each one or two gate rounds — a selector outside the block root, a hover affordance that enters layout (a border / padding on
// :hover), `!important`, an id in a selector outside :where(), `object-fit: cover` where every live image is `fill`, a font-size no spec row
// holds, `-webkit-font-smoothing` from habit, a foundation rule with three or more compounds reaching into main (it silently beats a block's
// longhand). One line per finding (file:line), exit 1 when any. Light parser: comments stripped, one level of @media.
// Usage: node css-lint.mjs [<site-repo>] [--measure <dir>] [--blocks blocks] [--styles styles]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { arg } from './common.mjs';

const repo = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '.';
const blocksDir = join(repo, String(arg('--blocks', 'blocks'))); const stylesDir = join(repo, String(arg('--styles', 'styles')));
const measure = typeof arg('--measure', null) === 'string' ? arg('--measure') : ['migration/cases', 'migration/pages'].flatMap((d) => (existsSync(join(repo, d)) ? readdirSync(join(repo, d)).map((c) => join(repo, d, c, 'measure')) : [])).find((d) => existsSync(join(d, 'spec-1440.json'))) || null;
const spec = measure && existsSync(join(measure, 'spec-1440.json')) ? JSON.parse(readFileSync(join(measure, 'spec-1440.json'), 'utf8')) : null;
const sizesOf = (sp) => (sp ? new Set(sp.secs.flatMap((s) => s.items.filter((it) => it.fs).map((it) => Math.round(parseFloat(it.fs) * 2) / 2))) : null);
const specSizes = sizesOf(spec); const spec360 = measure && existsSync(join(measure, 'spec-360.json')) ? JSON.parse(readFileSync(join(measure, 'spec-360.json'), 'utf8')) : null; const sizes360 = sizesOf(spec360);
const specFits = spec ? new Set(spec.secs.flatMap((s) => s.items.filter((it) => it.k === 'img').map((it) => it.fit || 'fill'))) : null;

function parse(css) { // → [{ sel, decls: [[prop, value]], media, line }]
  const rules = []; let media = null; let i = 0; const lineOf = (pos) => css.slice(0, pos).split('\n').length;
  const src = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  while (i < src.length) {
    const open = src.indexOf('{', i); if (open < 0) break;
    const head = src.slice(i, open).trim(); const start = i; i = open + 1;
    if (/^@media|^@supports|^@container/.test(head)) { media = head; continue; }
    if (/^@keyframes|^@font-face|^@layer|^@property/.test(head)) { let depth = 1; while (i < src.length && depth) { if (src[i] === '{') depth++; else if (src[i] === '}') depth--; i++; } continue; }
    const close = src.indexOf('}', i); const body = src.slice(i, close < 0 ? src.length : close); i = close < 0 ? src.length : close + 1;
    rules.push({ sel: head, decls: body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => { const k = d.indexOf(':'); return [d.slice(0, k).trim().toLowerCase(), d.slice(k + 1).trim()]; }), media, line: lineOf(start) });
    while (i < src.length && /\s/.test(src[i])) i++; if (src[i] === '}') { media = null; i++; }
  }
  return rules;
}
const findings = []; const F = (file, line, msg) => findings.push(`${file}:${line}  ${msg}`);
const LAYOUT = /^(border(-\w+)?(-width)?|padding(-\w+)?|margin(-\w+)?|width|height|font-size|line-height|outline-offset|top|left|right|bottom|gap)$/;
if (existsSync(blocksDir)) for (const name of readdirSync(blocksDir)) {
  const file = join(blocksDir, name, `${name}.css`); if (!existsSync(file)) continue;
  const rules = parse(readFileSync(file, 'utf8')); const root = new RegExp(`\\.${name.replace(/[-]/g, '\\-')}(\\b|[.\\s:>\\[])`);
  for (const r of rules) {
    for (const sel of r.sel.split(',').map((s) => s.trim())) {
      const scoped = root.test(sel) || /^(main\s+)?\.section\b|^body\b|^:root|^html\b/.test(sel) || (/^(header|footer)$/.test(name) && /^(header|footer|nav|\.nav-|\.footer-)/.test(sel)) || /^:where\(/.test(sel); // a header / footer decorate's own classes are its root
      if (!scoped) F(file, r.line, `selector outside the block root: "${sel}" — every rule carries .${name} (METHOD step 4)`);
      if (/#[a-z]/i.test(sel.replace(/:where\([^)]*\)/g, ''))) F(file, r.line, `id in a selector: "${sel}" — an id outranks every class rule the block writes; put resets in :where()`);
      if (/:(hover|focus|focus-visible|active)\b/.test(sel)) for (const [p, v] of r.decls) if (LAYOUT.test(p) && !/^0(px)?$|transparent|currentcolor/i.test(v) && !/^border-color$/.test(p)) F(file, r.line, `hover affordance enters layout: ${p}: ${v} on "${sel}" — text-decoration, or a transparent border present at rest (cibc, 1 px per row)`);
    }
    for (const [p, v] of r.decls) {
      if (/!important/.test(v)) F(file, r.line, `!important on ${p} — a specificity fight hides a reset or a foundation rule; fix the selector`);
      if (p === '-webkit-font-smoothing') F(file, r.line, `-webkit-font-smoothing from habit — the live page has no such rule unless the spec says so (manulife: headings rendered light)`);
      if (p === 'object-fit' && specFits && specFits.size && !specFits.has(v)) F(file, r.line, `object-fit: ${v} — every live image in the spec is ${[...specFits].join(' / ')} (mfs, bny: two gates on cover vs fill)`);
      if (p === 'font-size' && specSizes && /^\d+(\.\d+)?px$/.test(v)) { const mobileQ = r.media && /max-width|<=|<\s*\d/.test(r.media) && !/min-width|>=/.test(r.media); const set = mobileQ ? sizes360 : specSizes; if (set) { const n = Math.round(parseFloat(v) * 2) / 2; if (!set.has(n) && ![...set].some((s) => Math.abs(s - n) <= 0.5)) F(file, r.line, `font-size ${v}${r.media ? ` in ${r.media.slice(0, 30)}` : ''} — no spec row at ${mobileQ ? 360 : 1440} has it (nearest ${[...set].sort((a, b) => Math.abs(a - n) - Math.abs(b - n))[0]}px): a value typed from habit, or the other width's`); } }
    }
  }
}
if (existsSync(stylesDir)) for (const f of readdirSync(stylesDir).filter((x) => x.endsWith('.css'))) {
  const file = join(stylesDir, f); const rules = parse(readFileSync(file, 'utf8'));
  for (const r of rules) for (const sel of r.sel.split(',').map((s) => s.trim())) {
    const compounds = sel.replace(/:where\([^)]*\)/g, ':where()').split(/\s*[>+~\s]\s*/).filter(Boolean).length;
    if (compounds >= 3 && /^(main|footer|header)\b/.test(sel) && !/^:where/.test(sel) && /-wrapper\b|\.block\b|>\s*div\b|\bdiv\s*$/.test(sel) && r.decls.some(([p]) => /^(max-width|width|padding(-\w+)?|margin(-\w+)?|display)$/.test(p))) F(file, r.line, `foundation rule with ${compounds} compounds reaching into a block's area: "${sel}" — it beats a block's longhand silently (cibc footer, canon shell): :where() the chrome part or move it to the block`);
    if (/#[a-z]/i.test(sel) && !/^:where/.test(sel)) F(file, r.line, `id in a foundation selector: "${sel}" — outranks every block rule; :where() it`);
  }
}
if (findings.length) { console.log(findings.join('\n')); console.log(`css-lint: ${findings.length} finding(s) — each cost a gate round in a loop case; fix before the first harness`); process.exit(1); }
console.log(`css-lint: clean (${existsSync(blocksDir) ? readdirSync(blocksDir).length : 0} blocks${spec ? `, spec ${measure}` : ', no spec: value checks skipped — pass --measure'})`);
