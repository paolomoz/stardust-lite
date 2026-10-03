#!/usr/bin/env node
// video-frame.mjs — the poster of the frame the live capture shows: screenshot a hosted <video> paused at t (default 0) at 2×
// (METHOD prerequisites, hosted-video row: the player's own entry thumbnail is usually another frame — ibm-home by hand,
// stryker-home as an instrument). Verify it against the live capture's crop before uploading it as the poster.
// A player in an IFRAME (Vimeo, YouTube — the common hosted case) has no <video> this page can pause: pass --box <css> (the player's box
// or the hero section) and --hide <css,…> (the veil, text and controls over it) and the box is screenshotted at load as it is
// (hiltongrandvacations-home wrote `hero-poster.mjs` for it). --hide works for the <video> path too.
// Usage: node video-frame.mjs <url> <W> <out.png> [--video <css> [--t 0]] [--box <css>] [--hide <css,…>] [--scale 2] [--wait 3000]
//        [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { arg, openPage, overlayOpts, launch } from './common.mjs';

const [url, W, out] = process.argv.slice(2);
if (!url || !W || !out) { console.error('usage: video-frame.mjs <url> <W> <out.png> [--video <css> [--t 0]] [--box <css>] [--hide <css,…>] [--scale 2]'); process.exit(1); }
const boxSel = arg('--box', null); const sel = arg('--video', 'video'); const t = Number(arg('--t', 0)); const scale = Number(arg('--scale', 2));
const hide = String(arg('--hide', '')).split(',').map((s) => s.trim()).filter(Boolean); const wait = Number(arg('--wait', 3000));
const browser = await launch();
const page = await openPage(browser, url, { width: Number(W), height: 900, scale, ...overlayOpts() });
const target = boxSel || sel;
const found = await page.waitForSelector(target, { timeout: 30000 }).catch(() => null);
if (!found) {
  const iframes = await page.evaluate(() => [...document.querySelectorAll('iframe')].filter((f) => f.getBoundingClientRect().width > 200).map((f) => `${f.src.slice(0, 80)} ${Math.round(f.getBoundingClientRect().width)}×${Math.round(f.getBoundingClientRect().height)}`));
  console.error(`video-frame: no ${target} on the page${iframes.length ? ` — the player is an iframe (${iframes.join('; ')}): pass --box <css> --hide <css,…>` : ''}`);
  await browser.close(); process.exit(2);
}
if (!boxSel) {
  await page.evaluate(({ s, t }) => { for (const v of document.querySelectorAll(s)) { v.pause(); v.currentTime = t; } }, { s: sel, t });
  await page.waitForFunction((s) => [...document.querySelectorAll(s)].every((v) => v.readyState >= 2), sel, { timeout: 15000 }).catch(() => {});
} else await page.waitForTimeout(wait); // the iframe player's first frame
if (hide.length) {
  const n = await page.evaluate((sels) => { let n = 0; for (const s of sels) for (const el of document.querySelectorAll(s)) { el.style.visibility = 'hidden'; n += 1; } return n; }, hide);
  console.log(`hid ${n} element(s) matching ${hide.join(', ')}`);
}
await page.waitForTimeout(800);
const box = await page.locator(target).first().boundingBox();
if (!box) { console.error(`video-frame: ${target} has no box`); await browser.close(); process.exit(2); }
const state = boxSel ? await page.evaluate((s) => { const f = document.querySelector(s)?.querySelector('iframe') || document.querySelector(`${s} iframe`); return f ? { iframe: f.src.slice(0, 120) } : { iframe: null }; }, boxSel)
  : await page.evaluate((s) => { const v = document.querySelector(s); return { readyState: v.readyState, t: v.currentTime, paused: v.paused, w: v.videoWidth, h: v.videoHeight }; }, sel);
console.log(boxSel ? 'box' : 'video box', JSON.stringify(box), JSON.stringify(state), `scale ${scale}`);
await page.screenshot({ path: out, clip: { x: Math.max(0, box.x), y: box.y, width: Math.min(box.width, Number(W)), height: box.height } });
console.log(`wrote ${out} (${Math.round(Math.min(box.width, Number(W)) * scale)}×${Math.round(box.height * scale)} px)`);
await browser.close();
