// lib/chrome-tier.mjs — preload for the vendored tools (cap-probe, motion-observe, stitch-shot) when the chrome tier or cookies are on:
// every Playwright `chromium.launch()` takes the installed Google Chrome when STARDUST_CHROME=1 (channel 'chrome', still headless), and every
// context the browser opens gets STARDUST_COOKIE's cookies for the first URL it navigates to. common.mjs's launch() adds it to NODE_OPTIONS
// (`--import <this file>`) so gate's and harness's children inherit both (cibc-careers wrote the tier, harbourvest-about the cookies, as case scripts).
import { chromium } from 'playwright';
const launch = chromium.launch.bind(chromium);
const parse = (cookie, url) => { let host; try { host = new URL(url).hostname; } catch { return []; } return String(cookie).split(/;\s*/).map((kv) => kv.trim()).filter(Boolean).map((kv) => { const i = kv.indexOf('='); return { name: kv.slice(0, i).trim(), value: kv.slice(i + 1).trim(), domain: host.replace(/^www\./, '.'), path: '/' }; }).filter((c) => c.name); };
chromium.launch = async (opts = {}) => {
  const b = await launch({ ...(process.env.STARDUST_CHROME === '1' ? { channel: 'chrome' } : {}), ...opts });
  const cookie = process.env.STARDUST_COOKIE; if (!cookie) return b;
  const armContext = (c) => { const goto = (p) => { const g = p.goto.bind(p); p.goto = async (url, o) => { await c.addCookies(parse(cookie, url)).catch(() => {}); return g(url, o); }; }; const np = c.newPage.bind(c); c.newPage = async (...a) => { const p = await np(...a); goto(p); return p; }; c.pages().forEach(goto); return c; };
  const nc = b.newContext.bind(b); b.newContext = async (...a) => armContext(await nc(...a));
  const np = b.newPage.bind(b); b.newPage = async (...a) => { const p = await np(...a); armContext(p.context()); const g = p.goto.bind(p); p.goto = async (url, o) => { await p.context().addCookies(parse(cookie, url)).catch(() => {}); return g(url, o); }; return p; };
  return b;
};
