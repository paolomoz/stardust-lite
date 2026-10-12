#!/usr/bin/env node
// local-fragments.mjs — the chrome of a run with no branch host (a local prototype, `first --no-da` on a repo that is not on EDS yet): the
// authored nav / footer documents become the serve dir's `<path>.plain.html`, the fragment the runtime fetches (the pipeline's fragment is
// the document's <main> content). Their media are rewritten to local copies under <serve>/drafts/media. Without it the harness exits 4 on
// `--fragments` (no host answers) and without `--fragments` the chrome renders blank (bmc-home: a hand-written copy of this, 2026-10-12).
// Usage: node local-fragments.mjs <doc-dir> <serve-dir> [--media <media-dir>] [--paths nav=/drafts/nav,footer=/drafts/footer]
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { arg } from './common.mjs';

const [docDir, serve] = process.argv.slice(2);
if (!docDir || !serve || docDir.startsWith('--')) { console.error('usage: local-fragments.mjs <doc-dir> <serve-dir> [--media <media-dir>] [--paths nav=/drafts/nav,footer=/drafts/footer]'); process.exit(1); }
const media = arg('--media', null);
const paths = Object.fromEntries(String(arg('--paths', 'nav=/drafts/nav,footer=/drafts/footer')).split(',').map((kv) => kv.split('=')));
let n = 0;
for (const [k, path] of Object.entries(paths)) {
  const src = join(docDir, `${k}.html`); if (!existsSync(src)) { console.log(`local-fragments: ${src} missing — the ${k} renders blank`); continue; }
  let main = (/<main>([\s\S]*)<\/main>/.exec(readFileSync(src, 'utf8')) || [null, readFileSync(src, 'utf8')])[1].trim();
  const out = join(serve, `${path}.plain.html`); const mediaDir = join(serve, 'drafts', 'media'); mkdirSync(dirname(out), { recursive: true }); mkdirSync(mediaDir, { recursive: true });
  // a media URL on any host's /drafts/media/ (the author step writes the branch host's) → the local copy, served from /drafts/media/
  main = main.replace(/(src|href|srcset)="https?:\/\/[^"]*?\/drafts\/media\/([^"?]+)[^"]*"/g, (m, attr, f) => {
    if (typeof media === 'string' && existsSync(join(media, f))) copyFileSync(join(media, f), join(mediaDir, f)); else console.log(`local-fragments: ${k} media ${f} not in ${media}`);
    return `${attr}="/drafts/media/${f}"`;
  });
  writeFileSync(out, main); n += 1; console.log(`local-fragments: ${k} → ${out} (${main.length} bytes)`);
}
process.exit(n ? 0 : 1);
