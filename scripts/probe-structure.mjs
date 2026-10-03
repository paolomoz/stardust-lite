#!/usr/bin/env node
// probe-structure.mjs — structure dump of a live page to a depth: selector (tag#id.classes[slot]), box, display/position, background,
// image src, own text with its font. Light DOM by default; --pierce descends into shadow roots (a `#` marks a shadow child). This is
// the "what are the sections" input for `live-spec --sections` and the map the triage walks. Written for travelers-home, reused by
// ibm-home (pierced) and walgreens-home.
// Usage: node probe-structure.mjs <url> [W] [--root <css>] [--depth N] [--pierce] [--out file] [--click <css> --no-settle]
//        [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { writeFileSync } from 'node:fs';
import { openPage, settle, arg, overlayOpts, launch } from './common.mjs';
import { collectStructure } from './lib/probe-collectors.mjs'; // the in-page walk (shared with measure-page)

const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
if (!url) { console.error('usage: probe-structure.mjs <url> [W] [--root <css>] [--depth N] [--pierce] [--out file] [--click <css> --no-settle]'); process.exit(1); }
const depth = Number(arg('--depth', 3)); const root = arg('--root', 'body'); const pierce = process.argv.includes('--pierce');
const b = await launch(); const p = await openPage(b, url, { width: W, ...overlayOpts(), wait: 4000 });
if (arg('--click', null)) { try { await p.click(arg('--click'), { timeout: 3000 }); await p.waitForTimeout(1500); } catch (e) { console.log('no click', arg('--click'), String(e).slice(0, 80)); } }
if (!arg('--no-settle', false)) await settle(p);
const out = await p.evaluate(collectStructure, { root, depth, pierce });
if (arg('--out', null)) { writeFileSync(arg('--out'), out); console.log(out.split('\n').length, 'lines →', arg('--out')); } else console.log(out);
await b.close();
