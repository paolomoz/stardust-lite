#!/usr/bin/env node
// text-ladder.mjs — a text that changes with time (a count-up statistic, a rotating headline, a typed line): scroll it into view and
// sample it every --every ms for --for ms; prints each change with its time and, per selector, the first and last value, when the
// change started and ended, and whether a numeric run is linear or eased. `motion-observe` and `scroll-probe` read transforms and paint,
// not a text's value; the chunked capture catches such a text at an intermediate value, deterministically, and the block must run the
// same function (hiltongrandvacations-home: two count-ups, the register kind "live entrance caught mid-flight").
// Usage: node text-ladder.mjs <url> <W> --sels <css,…> [--every 100] [--for 6000] [--no-scroll] [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { chromium } from 'playwright';
import { arg, openPage, overlayOpts } from './common.mjs';

const [url, wArg] = process.argv.slice(2); const sels = String(arg('--sels', '')).split(',').map((s) => s.trim()).filter(Boolean);
if (!url || !wArg || !sels.length) { console.error('usage: text-ladder.mjs <url> <W> --sels <css,…> [--every 100] [--for 6000] [--no-scroll]'); process.exit(1); }
const W = Number(wArg); const every = Number(arg('--every', 100)); const span = Number(arg('--for', 6000));
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: W, height: 900, consent: arg('--consent', null), ...overlayOpts() });
const missing = await page.evaluate((ss) => ss.filter((s) => !document.querySelector(s)), sels);
if (missing.length) { console.error(`text-ladder: no match for ${missing.join(' | ')}`); await browser.close(); process.exit(2); }
if (!arg('--no-scroll', false)) await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sels[0]);
const t0 = Date.now(); const rows = []; const last = {};
while (Date.now() - t0 <= span) {
  const texts = await page.evaluate((ss) => ss.map((s) => (document.querySelector(s)?.textContent || '').replace(/\s+/g, ' ').trim()), sels);
  const t = Date.now() - t0;
  sels.forEach((s, i) => { if (texts[i] !== last[s]) { rows.push({ t, s, v: texts[i] }); last[s] = texts[i]; } });
  await page.waitForTimeout(every);
}
rows.forEach((r) => console.log(`${String(r.t).padStart(6)} ms  ${r.s}  ${JSON.stringify(r.v)}`));
for (const s of sels) {
  const R = rows.filter((r) => r.s === s); if (R.length < 2) { console.log(`\n${s}: no change in ${span} ms ("${R[0]?.v ?? ''}")`); continue; }
  const num = (v) => Number(v.replace(/[^0-9.-]/g, '')); const nums = R.map((r) => num(r.v)); const numeric = nums.every(Number.isFinite);
  const start = R[1].t - every; const end = R[R.length - 1].t; const dur = end - start;
  let shape = '';
  if (numeric && R.length >= 6) { // compare the rate of the first and the second half of the run: equal → linear, else eased
    const mid = R[Math.floor(R.length / 2)]; const r1 = (num(mid.v) - nums[0]) / Math.max(1, mid.t - start); const r2 = (nums[nums.length - 1] - num(mid.v)) / Math.max(1, end - mid.t);
    shape = Math.abs(r1 - r2) <= 0.15 * Math.max(Math.abs(r1), Math.abs(r2)) ? 'linear' : r1 > r2 ? 'eased out (fast → slow)' : 'eased in (slow → fast)';
  }
  console.log(`\n${s}: "${R[0].v}" → "${R[R.length - 1].v}" in ${R.length - 1} changes, started ≈ ${start} ms after the scroll, ran ≈ ${dur} ms${shape ? `, ${shape}` : ''}`);
}
await browser.close();
