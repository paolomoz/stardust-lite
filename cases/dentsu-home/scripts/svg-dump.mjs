#!/usr/bin/env node
// svg-dump.mjs — lift the sprite symbols a page uses into standalone SVG files (the source's own paths, a measured fill baked in:
// the boilerplate's decorateIcons renders icons as <img>, which cannot inherit currentColor — travelers-home gap 5).
// usage: node svg-dump.mjs <dom.html> --out <icons-dir> --pick 'symbol-id[:fill[:name]],…'
//   reads the inline <symbol> sprite from a live-spec DOM dump; writes <name>.svg (default name = symbol id) with viewBox kept.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const [,, dom] = process.argv; const argv = process.argv; const a = (n, d) => { const i = argv.indexOf(n); return i === -1 ? d : argv[i + 1]; };
const out = a('--out', 'icons'); const pick = String(a('--pick', '')).split(',').map((s) => s.trim()).filter(Boolean);
if (!dom || !pick.length) { console.error("usage: svg-dump.mjs <dom.html> --out <dir> --pick 'id[:fill[:name]],…'"); process.exit(1); }
const html = readFileSync(dom, 'utf8'); mkdirSync(out, { recursive: true });
for (const p of pick) {
  const [id, fill = 'currentColor', name = id] = p.split(':');
  const m = html.match(new RegExp(`<symbol[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)</symbol>`));
  if (!m) { console.log(`${id}: not found`); continue; }
  const vb = (m[0].match(/viewBox="([^"]+)"/) || [])[1] || '0 0 24 24';
  let inner = m[1].replace(/\s+/g, ' ').trim();
  // bake the fill: a symbol drawn with currentColor / no fill takes the measured colour; explicit fills stay
  inner = inner.replace(/fill="currentColor"/g, `fill="${fill}"`).replace(/stroke="currentColor"/g, `stroke="${fill}"`);
  const hasFill = /fill="/.test(inner); const hasStroke = /stroke="/.test(inner);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${hasFill ? '' : ` fill="${fill}"`}${hasStroke && !hasFill ? ` stroke="${fill}"` : ''}>${inner}</svg>\n`;
  writeFileSync(join(out, `${name}.svg`), svg); console.log(`${name}.svg  viewBox ${vb}  ${svg.length} bytes  ${inner.slice(0, 120)}`);
}
