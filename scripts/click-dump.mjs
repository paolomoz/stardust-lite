#!/usr/bin/env node
// click-dump.mjs — the content a click reveals (step 1): click each control in turn (optionally after an opener) and dump a panel's
// texts, hrefs and images after every click — a carousel caption that exists only for the active slide, a tab panel behind its tab, a
// drawer's sub-menu. `content-dump` holds the authoring set at rest; `click-state` takes one click and prints geometry; this prints
// CONTENT and writes it in the dump's shape (`text` / `children`) so `harness --content <content.json>,<click-dump.json>` accepts the
// authored texts it holds (23 correctly authored captions and tab texts read as "not in the capture" — hiltongrandvacations-home).
// Usage: node click-dump.mjs <url> <W> --panel <css> --click <css> [--click <css> …] [--open <css>] [--out <file.json>] [--wait 900]
//        [--consent <css>] [--dismiss <css,…>] [--locale <tag>] [--require <css,…>]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { arg, openPage, overlayOpts } from './common.mjs';

const [url, wArg] = process.argv.slice(2); const panel = arg('--panel', null);
const clicks = process.argv.map((a, i, all) => (a === '--click' ? all[i + 1] : null)).filter((v) => v && !v.startsWith('--'));
if (!url || !wArg || !panel || !clicks.length) { console.error('usage: click-dump.mjs <url> <W> --panel <css> --click <css> [--click <css> …] [--open <css>] [--out <file.json>] [--wait 900]'); process.exit(1); }
const W = Number(wArg); const wait = Number(arg('--wait', 900)); const open = arg('--open', null);
const browser = await chromium.launch(); const page = await openPage(browser, url, { width: W, height: 900, ...overlayOpts() });

const dump = () => page.evaluate((s) => {
  const roots = [...document.querySelectorAll(s)]; if (!roots.length) return { nodes: [], lines: [`NO PANEL ${s}`] };
  const norm = (t) => t.replace(/\s+/g, ' ').trim(); const lines = [];
  const walk = (el, d) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    const n = { tag: el.tagName.toLowerCase(), box: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)] };
    const cls = [...el.classList].slice(0, 2).join(' '); if (cls) n.cls = cls;
    const own = norm([...el.childNodes].filter((x) => x.nodeType === 3).map((x) => x.textContent).join(' '));
    if (own) n.text = own;
    if (el.tagName === 'A') { n.href = el.getAttribute('href'); if (el.getAttribute('aria-label')) n.aria = el.getAttribute('aria-label'); }
    if (el.tagName === 'BUTTON' && el.getAttribute('aria-label')) n.aria = el.getAttribute('aria-label');
    if (el.tagName === 'IMG') { n.src = el.currentSrc || el.src || el.dataset.src || ''; n.alt = el.alt; }
    if (cs.display === 'none' || cs.visibility === 'hidden') n.hidden = true;
    const at = lines.length; lines.push(''); // the parent's line precedes its children's
    const kids = [...el.children].filter((c) => !/^(SCRIPT|STYLE|SVG|svg|TEMPLATE)$/.test(c.tagName)).map((c) => walk(c, d + 1)).filter(Boolean);
    if (kids.length) n.children = kids;
    if (!(n.text || n.href || n.src || kids.length)) { lines.splice(at, 1); return null; }
    lines[at] = `${'  '.repeat(d)}${n.tag}${cls ? `.${cls.replace(' ', '.')}` : ''} [${n.box.join(',')}]${n.hidden ? ' HIDDEN' : ''}${n.text ? ` ${JSON.stringify(n.text)}` : ''}${n.href ? ` -> ${n.href}` : ''}${n.aria ? ` aria=${JSON.stringify(n.aria)}` : ''}${n.src ? ` img ${n.src.slice(0, 160)} alt=${JSON.stringify(n.alt || '')}` : ''}`;
    return n;
  };
  return { nodes: roots.map((r) => walk(r, 0)).filter(Boolean), lines };
}, panel);

const states = [];
const step = async (label, selector) => {
  if (selector) {
    try { const loc = page.locator(selector).first(); await loc.scrollIntoViewIfNeeded(); await loc.click({ timeout: 8000, force: true }); } catch (e) { console.log(`click-dump: ${label} ${selector} failed — ${e.message.split('\n')[0]}`); }
    await page.waitForTimeout(wait);
  }
  const d = await dump(); states.push({ after: `${label} ${selector || ''}`.trim(), children: d.nodes });
  console.log(`== after ${`${label} ${selector || ''}`.trim()}\n${d.lines.join('\n')}`);
};
await step('rest', null);
if (open) await step('open', open);
for (const c of clicks) await step('click', c);
if (arg('--out', null)) { writeFileSync(arg('--out'), JSON.stringify({ __url: url, __W: W, __panel: panel, states }, null, 1)); console.log(`click-dump: ${states.length} states → ${arg('--out')}`); }
await browser.close();
