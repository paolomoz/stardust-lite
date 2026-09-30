#!/usr/bin/env node
// video-frame.mjs — the poster of the frame the live capture shows: screenshot a hosted <video> paused at t (default 0) at 2×
// (METHOD prerequisites, hosted-video row: the player's own entry thumbnail is usually another frame — ibm-home by hand,
// stryker-home as an instrument). Verify it against the live capture's crop before uploading it as the poster.
// Usage: node video-frame.mjs <url> <W> <out.png> --video <css> [--t 0] [--scale 2] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { chromium } from 'playwright';
import { arg, openPage, overlayOpts } from './common.mjs';

const [url, W, out] = process.argv.slice(2);
if (!url || !W || !out) { console.error('usage: video-frame.mjs <url> <W> <out.png> --video <css> [--t 0] [--scale 2]'); process.exit(1); }
const sel = arg('--video', 'video'); const t = Number(arg('--t', 0)); const scale = Number(arg('--scale', 2));
const browser = await chromium.launch();
const page = await openPage(browser, url, { width: Number(W), height: 900, scale, consent: arg('--consent', null), ...overlayOpts() });
await page.waitForSelector(sel, { timeout: 30000 });
await page.evaluate(({ s, t }) => { for (const v of document.querySelectorAll(s)) { v.pause(); v.currentTime = t; } }, { s: sel, t });
await page.waitForFunction((s) => [...document.querySelectorAll(s)].every((v) => v.readyState >= 2), sel, { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(800);
const box = await page.locator(sel).first().boundingBox();
if (!box) { console.error(`video-frame: ${sel} has no box`); await browser.close(); process.exit(2); }
const state = await page.evaluate((s) => { const v = document.querySelector(s); return { readyState: v.readyState, t: v.currentTime, paused: v.paused, w: v.videoWidth, h: v.videoHeight }; }, sel);
console.log('video box', JSON.stringify(box), JSON.stringify(state), `scale ${scale}`);
await page.screenshot({ path: out, clip: { x: Math.max(0, box.x), y: box.y, width: Math.min(box.width, Number(W)), height: box.height } });
console.log(`wrote ${out} (${Math.round(Math.min(box.width, Number(W)) * scale)}×${Math.round(box.height * scale)} px)`);
await browser.close();
