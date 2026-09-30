#!/usr/bin/env node
// spec-view.mjs — compact readout of a live-spec JSON. Usage: node spec-view.mjs <spec.json> [sectionIndex …]
import { readFileSync } from 'node:fs';
const spec = JSON.parse(readFileSync(process.argv[2], 'utf8')); const only = process.argv.slice(3).map(Number);
console.log('W', spec.W, 'doc', spec.doc);
spec.secs.forEach((s, i) => {
  if (only.length && !only.includes(i)) return;
  console.log(`\n## ${i} ${s.id} box=${JSON.stringify(s.box)} pad=${s.pad} bg=${s.bg || '-'} ${s.bgi ? `bgi=${s.bgi.slice(0, 80)}` : ''}`);
  for (const it of s.items) {
    const b = JSON.stringify(it.box).padEnd(22);
    if (it.k === 'paint') console.log(`  PAINT ${b} ${it.tag}.${it.cls.slice(0, 40).padEnd(40)} pad=${it.pad} ${it.bg || ''} ${it.bgi ? `bgi=${it.bgi.slice(0, 70)}` : ''} ${it.br ? `br=${it.br}` : ''} ${it.border ? `bd=${it.border}` : ''} ${it.tf ? `tf=${it.tf}` : ''}`);
    else if (['img', 'video', 'svg', 'iframe', 'canvas'].includes(it.k)) console.log(`  ${it.k.toUpperCase().padEnd(6)}${b} .${it.cls.slice(0, 30).padEnd(30)} fit=${it.fit} ${it.src.slice(0, 110)} ${it.alt ? `alt=${it.alt.slice(0, 30)}` : ''}`);
    else console.log(`  ${it.k.padEnd(6)}${b} ${it.ff.slice(0, 16).padEnd(16)} ${it.fs.padEnd(7)} ${it.lh.padEnd(8)} ${it.fw.padEnd(3)} ${it.tt.slice(0, 4).padEnd(5)} ${it.ta.slice(0, 5).padEnd(5)} ${it.c.padEnd(18)} ${it.inline ? 'INL ' : ''}${it.bg ? `bg=${it.bg} ` : ''}${it.pad ? `pad=${it.pad} ` : ''}${it.href ? `href=${it.href.slice(0, 50)} ` : ''}${it.fst !== 'normal' ? `${it.fst} ` : ''}| ${it.t.slice(0, 80)}`);
  }
});
