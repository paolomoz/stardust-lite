#!/usr/bin/env node
// measure-view.mjs — compact readout of a stardust `measure.mjs --json` file (the selector-driven measurement that has --headed, for a
// bot-managed origin live-spec.mjs cannot open). One line per match: selector, rect, display, size/line-height/weight/family, colour,
// bg, padding, radius, text. Usage: node measure-view.mjs <measure.json> [width] [--filter <regex>]
import { readFileSync } from 'node:fs';
const [,, file, wArg] = process.argv; const fi = process.argv.indexOf('--filter'); const filter = fi > -1 ? new RegExp(process.argv[fi + 1]) : null;
const j = JSON.parse(readFileSync(file, 'utf8')); const url = Object.keys(j.pages)[0]; const pg = j.pages[url];
const widths = wArg && !wArg.startsWith('--') ? [wArg] : Object.keys(pg);
for (const W of widths) {
  console.log(`\n# ${url} @ ${W}  root ${JSON.stringify(j.root[url][W])}`);
  for (const [sel, matches] of Object.entries(pg[W])) {
    if (filter && !filter.test(sel)) continue;
    if (!matches || !matches.length) { console.log(`${sel}  MISSING`); continue; }
    for (const m of matches) {
      const p = m.props || {}; const r = m.rect; const short = (v) => (v || '').replace(/rgba?\(/g, '(').replace(/, /g, ',');
      console.log(`${sel}${matches.length > 1 ? `[${m.index}/${m.of}]` : ''}`.padEnd(52), `[${r.x},${r.y},${r.w},${r.h}]`.padEnd(24), (p.display || '').padEnd(12), `${p.fontSize}/${p.lineHeight} ${p.fontWeight} ${(p.fontFamily || '').split(',')[0].replace(/"/g, '').slice(0, 14)}`.padEnd(34), short(p.color).padEnd(14), p.backgroundColor && !/\(0,0,0,0\)/.test(short(p.backgroundColor)) ? `bg=${short(p.backgroundColor)}` : '', p.backgroundImage && p.backgroundImage !== 'none' ? `bgi=${p.backgroundImage.slice(0, 40)}` : '', p.padding && p.padding !== '0px' ? `pad=${p.padding}` : '', p.margin && p.margin !== '0px' ? `mar=${p.margin}` : '', p.gap && p.gap !== 'normal' ? `gap=${p.gap}` : '', p.borderRadius && p.borderRadius !== '0px' ? `br=${p.borderRadius}` : '', p.border && !/^0px/.test(p.border) ? `bd=${p.border.slice(0, 30)}` : '', p.maxWidth && p.maxWidth !== 'none' ? `maxw=${p.maxWidth}` : '', p.boxShadow && p.boxShadow !== 'none' ? `sh=${p.boxShadow.slice(0, 30)}` : '', p.textAlign && p.textAlign !== 'start' ? `ta=${p.textAlign}` : '', p.letterSpacing && p.letterSpacing !== 'normal' ? `ls=${p.letterSpacing}` : '', p.objectFit && p.objectFit !== 'fill' ? `fit=${p.objectFit}` : '', m.rendition ? `rend=${JSON.stringify(m.rendition).slice(0, 120)}` : '', m.visible === false ? 'HIDDEN' : '', m.text ? `| ${m.text.slice(0, 70)}` : '');
    }
  }
}
