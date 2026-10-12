// svg-symbols.mjs — split the named <symbol>s of an SVG sprite into standalone icons/<name>.svg (fill: currentColor; the
// build inlines them with decorateBlockIcons so the CSS colour applies). Usage: node svg-symbols.mjs <sprite.svg> <out-dir> name[,name…]
import { readFileSync, writeFileSync } from 'node:fs';
const [sprite, out, names] = process.argv.slice(2);
const src = readFileSync(sprite, 'utf8');
for (const name of names.split(',')) {
  const m = src.match(new RegExp(`<symbol[^>]*id="${name}"[^>]*>([\\s\\S]*?)</symbol>`));
  if (!m) { console.error(`${name}: not in ${sprite}`); continue; }
  const vb = (m[0].match(/viewBox="([^"]+)"/) || [, '0 0 24 24'])[1];
  const body = m[1].replace(/fill="(?!none)[^"]*"/g, 'fill="currentColor"');
  writeFileSync(`${out}/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="currentColor">${body.trim()}</svg>\n`);
  console.log(`${name}.svg viewBox ${vb} ${body.length} b`);
}
