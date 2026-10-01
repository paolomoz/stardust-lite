#!/usr/bin/env node
// content-view.mjs — reading-order view of a content-dump JSON: one line per node that carries text, a link, media, a background or a
// border, with its box, font (incl. text-transform) and href; texts printed in FULL. A viewer that truncated at 160 chars cost
// stryker-home a round (BACKLOG #57) and usta2-home wrote the second one: this is the instrument. Containers with a background or an id
// are printed too (they name the bands). Indentation = tree depth.
// Usage: node content-view.mjs <content.json> [<root-key>] [--texts]   (--texts: only the texts, one per line — the typing list)
import { readFileSync } from 'node:fs';
import { arg } from './common.mjs';

const [file, rootKey] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!file) { console.error('usage: content-view.mjs <content.json> [<root-key>] [--texts]'); process.exit(1); }
const d = JSON.parse(readFileSync(file, 'utf8')); const roots = rootKey ? [rootKey] : Object.keys(d).filter((k) => !k.startsWith('__'));
const textsOnly = arg('--texts', false);
const line = (n, depth) => {
  const pad = '  '.repeat(depth); const b = n.box ? `[${n.box[0]},${n.box[1]},${n.box[2]}x${n.box[3]}]` : '';
  let s = `${pad}${n.tag}${n.id ? `#${n.id}` : ''}${n.cls ? `.${n.cls.split(' ')[0]}` : ''} ${b}`;
  if (n.bg) s += ` bg=${n.bg}`; if (n.bgi) s += ` bgi=${n.bgi}`; if (n.border) s += ` border=${n.border}`; if (n.shadow) s += ` shadow=${n.shadow}`;
  if (n.font) s += ` | ${n.font}`; if (n.href) s += ` -> ${n.href}`; if (n.target) s += ` target=${n.target}`;
  if (n.src) s += ` src=${n.src} nat=${JSON.stringify(n.nat)} alt=${JSON.stringify(n.alt)}`;
  if (n.placeholder) s += ` placeholder=${JSON.stringify(n.placeholder)}`; if (n.aria) s += ` aria=${JSON.stringify(n.aria)}`;
  if (n.text !== undefined) s += `\n${pad}  TEXT: ${JSON.stringify(n.text)}`;
  if (n.markup && n.markup !== n.text) s += `\n${pad}  MARKUP: ${n.markup}`;
  return s;
};
const show = (n, depth) => {
  if (textsOnly) { if (n.text) console.log(n.text); }
  else if (n.text !== undefined || n.href || n.src || n.bgi || n.placeholder || n.border || n.bg || n.id || depth < 3) console.log(line(n, depth));
  (n.children || []).forEach((c) => show(c, depth + 1));
};
for (const r of roots) { if (!textsOnly) console.log(`===== ${r}`); (d[r] || []).forEach((n) => show(n, 0)); }
if (!textsOnly) console.log(`doc ${d.__doc} title ${JSON.stringify(d.__title)} desc ${JSON.stringify(d.__desc)}`);
