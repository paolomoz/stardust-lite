// origin-capture.mjs <url> <outDir> <W,…> — the live origin for `gate --origin <outDir>`, captured after a SLOW scroll through the page.
// Why: si.edu's cards (`c-card-animate`) enter on scroll; the stitcher freezes motion after a fast settle, so every card below the
// settled region is captured at its entrance's first frame (faded) — half the 360 page, the last row at 1440 / 2560.
import { launch, openPage, overlayOpts } from '../../../../node_modules/stardust-lite/scripts/common.mjs';
import { stitchCapture } from '../../../../node_modules/stardust-lite/scripts/lib/stitch.mjs';
const [url, out, ws] = process.argv.slice(2);
const browser = await launch();
for (const W of ws.split(',').map(Number)) {
  const o = overlayOpts();
  const page = await openPage(browser, url, { width: W, height: 900, ...o, wait: 2500 });
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= H; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(250); }
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(1000);
  const r = await stitchCapture(page, `${out}/live-${W}.png`, { vh: 900 });
  console.log(`live-${W}.png ${r.width}x${r.height} ${r.chunks} chunks`);
  await page.close();
}
await browser.close();
