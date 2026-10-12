#!/bin/bash
# Model × effort benchmark, phase 1 (2026-10-12): every configuration on ONE page (rbc about), serial, fresh repo and agent per run.
# Each run is a headless Claude Code process with the model and effort pinned (full model names — the `sonnet` alias resolved to a model
# this deployment does not serve). The field protocol is loop/five-min/PROMPT.md, the code frozen at one stardust-lite SHA.
# Output per run: <out>/<id>.json (the CLI's json result: model usage, turns, cost, duration) and <out>/<id>.log (stderr).
set -u
OUT="$(cd "$(dirname "$0")" && pwd)"
SHA=d6725ab281d3cc074153c39f0c2b14a736e8ff4a
URL=https://www.rbc.com/about-rbc.html
# id model effort — interleaved so no model always runs at the same hour; b01 and b10 are the baseline (Opus 5.5, high) twice: the noise
RUNS=(
  "b01 claude-opus-5-5 high"
  "b02 claude-sonnet-5-5 low"
  "b03 claude-fable-5-1 medium"
  "b04 claude-opus-5-5 low"
  "b05 claude-sonnet-5-5 high"
  "b06 claude-fable-5-1 low"
  "b07 claude-opus-5-5 medium"
  "b08 claude-sonnet-5-5 medium"
  "b09 claude-fable-5-1 high"
  "b09r claude-fable-5-1 high"
  "b10 claude-opus-5-5 high"
)
for r in "${RUNS[@]}"; do
  read -r ID MODEL EFFORT <<< "$r"
  [ -f "$OUT/$ID.json" ] && { echo "$ID done already — skipped"; continue; }
  REPO="sdt-rbc-$ID"
  PROMPT="You are doing one timed field run of the stardust-lite migration method. Read /Users/paolo/stardust/stardust-lite/loop/five-min/PROMPT.md and follow it exactly (setup not counted, then the clock from \`first\`, stop at the gate's \`stop:\` line, post-clock deploy + served gate + leak, the write-up, the concise return). HARD STOP: 40 min after t0 (not 60) — then append a line '<UTC time> CLOCK STOP (reason)' to TIMING.log, deploy and write up.
URL = $URL
SLUG = rbc-home
REPO = $REPO
SHA = $SHA
Rules: if the GitHub repo already exists, STOP and report. Do NOT open anything under /Users/paolo/stardust/stardust-lite/cases/, loop/ (other than PROMPT.md) or any other sdt-* work dir — this page was migrated before and the run must not reuse that work. Use the reading cards \`first\` names (gate/cards/INDEX.md) and \`section-view\` (it accepts a block name or anchor text). \`first\` downloads font files into fonts/ — commit them with the code. The page decoration turns a bold link into \`a.button\` (style that, not \`strong a\`). Never print a token. Preview only, never publish."
  echo "$(date -u +%FT%TZ) START $ID $MODEL $EFFORT" >> "$OUT/runs.log"
  ( cd /Users/paolo/stardust/2026-10 && claude -p "$PROMPT" --model "$MODEL" --effort "$EFFORT" --output-format json --permission-mode auto \
      --add-dir /Users/paolo/stardust/2026-10 /Users/paolo/stardust/stardust-lite /Users/paolo/.claude --max-budget-usd 60 \
      > "$OUT/$ID.json" 2> "$OUT/$ID.log" )
  echo "$(date -u +%FT%TZ) END   $ID rc=$?" >> "$OUT/runs.log"
done
echo "$(date -u +%FT%TZ) PHASE 1 DONE" >> "$OUT/runs.log"
