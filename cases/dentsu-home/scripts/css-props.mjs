#!/usr/bin/env node
// css-props.mjs — computed CSS properties (any property, incl. min-height, flex, width %) and running animations (name,
// duration, keyframes) for a list of selectors at one width. deep-probe prints a fixed property set; this reads what you name.
// usage: node css-props.mjs <url> <W> --sels <file> --props <p1,p2,…> [--anim] [--consent <css>] [--dismiss <css,…>] [--locale <tag>]
// sels file: one CSS selector per line (`#` / `//` comments). Prints every match: rect, the named properties, and with --anim the
// element's animations (name, duration, iterations, keyframes) — stitch-shot pauses animations, so the 0 % frame is the capture state.
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { arg, openPage, settle, overlayOpts } from '../../../../node_modules/stardust-lite/scripts/common.mjs';
const url = process.argv[2]; const W = Number(process.argv[3] || 1440);
const selsFile = arg('--sels'); const props = String(arg('--props', 'min-height,height,width,flex')).split(',');
if (!url || !selsFile) { console.error('usage: css-props.mjs <url> <W> --sels <file> --props <p1,p2,…> [--anim]'); process.exit(1); }
const sels = readFileSync(selsFile, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#') && !s.startsWith('//'));
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: W, consent: arg('--consent', null), ...overlayOpts() });
await settle(page, 600, 100, 1200);
const out = await page.evaluate(([sels, props, anim]) => sels.map((sel) => {
  const els = [...document.querySelectorAll(sel)].slice(0, 6);
  return { sel, matches: els.map((el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    const o = { rect: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width * 100) / 100, Math.round(r.height * 100) / 100], props: {} };
    for (const p of props) o.props[p] = cs.getPropertyValue(p);
    if (anim) o.anims = el.getAnimations({ subtree: false }).map((a) => ({ name: a.animationName || a.constructor.name, duration: a.effect.getTiming().duration, iterations: a.effect.getTiming().iterations, easing: a.effect.getTiming().easing, delay: a.effect.getTiming().delay, direction: a.effect.getTiming().direction, keyframes: a.effect.getKeyframes().map((k) => { const { composite, computedOffset, easing, ...rest } = k; return { offset: computedOffset, ...rest }; }) }));
    return o;
  }) };
}), [sels, props, Boolean(arg('--anim', false))]);
for (const s of out) { console.log(s.sel + (s.matches.length ? '' : ': (none)')); for (const m of s.matches) { console.log('  ' + JSON.stringify(m.rect) + ' ' + Object.entries(m.props).map(([k, v]) => `${k}=${v}`).join(' ')); if (m.anims?.length) console.log('    anim ' + JSON.stringify(m.anims)); } }
await browser.close();
