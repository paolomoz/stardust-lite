// lib/chrome-tier.mjs — preload for the vendored tools (cap-probe, motion-observe, stitch-shot) when the chrome tier is on: every Playwright
// `chromium.launch()` takes the installed Google Chrome (channel 'chrome', still headless). common.mjs's launch() adds it to NODE_OPTIONS
// (`--import <this file>`) so gate's and harness's children inherit the tier (cibc-careers wrote it as a case script, loop r2).
import { chromium } from 'playwright';
const launch = chromium.launch.bind(chromium);
chromium.launch = (opts = {}) => launch({ channel: 'chrome', ...opts });
