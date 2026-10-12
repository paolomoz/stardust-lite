// local-fragments.mjs — a no-DA run's chrome: the authored nav / footer documents as the serve dir's `<path>.plain.html` (the pipeline's
// fragment is the document's <main> content; its media are rewritten to the local copies under <serve>/drafts/media).
// Usage: node local-fragments.mjs <doc-dir> <serve-dir> <media-dir> [--host <the media host the author step wrote>]
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const [docDir, serve, media] = process.argv.slice(2); const host = process.argv.includes('--host') ? process.argv[process.argv.indexOf('--host') + 1] : null;
mkdirSync(join(serve, 'drafts', 'media'), { recursive: true });
for (const k of ['nav', 'footer']) {
  const src = readFileSync(join(docDir, `${k}.html`), 'utf8'); let main = (/<main>([\s\S]*)<\/main>/.exec(src) || [, src])[1].trim();
  main = main.replace(/(src|href|srcset)="https?:\/\/[^"]*?\/drafts\/media\/([^"?]+)[^"]*"/g, (m, attr, f) => { if (existsSync(join(media, f))) copyFileSync(join(media, f), join(serve, 'drafts', 'media', f)); return `${attr}="/drafts/media/${f}"`; });
  if (host) main = main.split(host).join('');
  writeFileSync(join(serve, 'drafts', `${k}.plain.html`), main); console.log(`local-fragments: ${k} → ${join(serve, 'drafts', `${k}.plain.html`)} (${main.length} bytes)`);
}
