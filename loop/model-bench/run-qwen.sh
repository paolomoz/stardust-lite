#!/bin/bash
# The Qwen 3.8 27B (Cerebras) run on rbc — the same protocol and frozen code as phase 1; setup done beforehand by the usual agent (the
# repo-creation skill lives in the user settings this process must exclude). Through the local LiteLLM proxy (CEREBRAS.md), user settings
# left out so the Foundry env cannot take over; it refuses to start when the proxy is down (no silent fallback to a Claude model).
set -u
OUT="$(cd "$(dirname "$0")" && pwd)"; ID=${1:-q01}
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4011/health/liveliness | grep -q 200 || { echo "proxy down — not starting"; exit 1; }
KEY=$(cat /Users/paolo/stardust/bench/.litellm-key)
set -a; source /Users/paolo/.claude/.env; set +a
PROMPT="You are doing one timed field run of the stardust-lite migration method. Read /Users/paolo/stardust/stardust-lite/loop/five-min/PROMPT.md. SETUP IS ALREADY DONE (not counted): the work dir is /Users/paolo/stardust/2026-10/sdt-rbc-$ID (repo aemcoder-adobe/sdt-rbc-$ID, branch blocks-first, stardust-lite installed, ./tl created). Start at 'The clock' and follow the rest of PROMPT.md exactly (the clock from \`first\`, stop at the gate's \`stop:\` line, post-clock deploy + served gate + leak, the write-up, the concise return). HARD STOP: 40 min after t0 — then append a line '<UTC time> CLOCK STOP (reason)' to TIMING.log, deploy and write up.
URL = https://www.rbc.com/about-rbc.html
SLUG = rbc-home
REPO = sdt-rbc-$ID
SHA = d6725ab281d3cc074153c39f0c2b14a736e8ff4a
Rules: Do NOT open anything under /Users/paolo/stardust/stardust-lite/cases/, loop/ (other than PROMPT.md) or any other sdt-* work dir — this page was migrated before and the run must not reuse that work. Use the reading cards \`first\` names (gate/cards/INDEX.md) and \`section-view\` (it accepts a block name or anchor text). \`first\` downloads font files into fonts/ — commit them with the code. The page decoration turns a bold link into \`a.button\` (style that, not \`strong a\`). Never print a token. Preview only, never publish."
echo "$(date -u +%FT%TZ) START $ID qwen-3.8-27b(cerebras) default" >> "$OUT/runs.log"
( cd "/Users/paolo/stardust/2026-10/sdt-rbc-$ID" && env -u CLAUDE_CODE_USE_FOUNDRY -u ANTHROPIC_FOUNDRY_RESOURCE -u ANTHROPIC_FOUNDRY_API_KEY -u ANTHROPIC_MODEL \
    ANTHROPIC_BASE_URL=http://127.0.0.1:4011 ANTHROPIC_AUTH_TOKEN="$KEY" ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-sonnet-5-5 ANTHROPIC_SMALL_FAST_MODEL=claude-sonnet-5-5 \
    CLAUDE_CODE_ENABLE_AUTO_MODE=1 API_TIMEOUT_MS=600000 \
    claude -p "$PROMPT" --model claude-sonnet-5-5 --setting-sources project,local --permission-mode auto --output-format json \
      --add-dir /Users/paolo/stardust/2026-10 /Users/paolo/stardust/stardust-lite /Users/paolo/.claude --max-budget-usd 60 < /dev/null \
      > "$OUT/$ID.json" 2> "$OUT/$ID.log" )
echo "$(date -u +%FT%TZ) END   $ID rc=$?" >> "$OUT/runs.log"
