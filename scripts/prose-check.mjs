// prose-check — the method's prose against the loop baseline (loop/prose-baseline.json): bytes per file, total, cap = baseline × 1.10.
//   node scripts/prose-check.mjs [--baseline loop/prose-baseline.json]   exit 1 when the total is over the cap
import { existsSync, readFileSync } from 'node:fs';
const args = process.argv.slice(2);
const basePath = args.includes('--baseline') ? args[args.indexOf('--baseline') + 1] : 'loop/prose-baseline.json';
const base = JSON.parse(readFileSync(basePath, 'utf8'));
let total = 0;
const rows = Object.keys(base.files).map((f) => {
  const bytes = existsSync(f) ? Buffer.byteLength(readFileSync(f, 'utf8')) : 0; total += bytes;
  const d = bytes - base.files[f].bytes;
  return `${f.padEnd(36)} ${String(bytes).padStart(7)}  ${(d >= 0 ? '+' : '') + d}`;
});
console.log(rows.join('\n'));
const pct = ((total / base.totalBytes - 1) * 100).toFixed(2);
const ok = total <= base.capBytes;
console.log(`prose: ${total} bytes, baseline ${base.totalBytes} (${pct >= 0 ? '+' : ''}${pct} %), cap ${base.capBytes} — ${ok ? 'OK' : 'OVER'}`);
process.exit(ok ? 0 : 1);
