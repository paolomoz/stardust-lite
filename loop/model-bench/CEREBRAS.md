# Running a field run on Cerebras (qwen-3.8-27b) — verified 2026-10-12

stardust-lite makes no model calls; the model is the agent (Claude Code). Claude Code speaks the Anthropic API, Cerebras the OpenAI one,
so a local LiteLLM proxy translates. Three things were needed, each found by a failing test:
1. **User settings override the shell**: `~/.claude/settings.json` sets the Foundry env in its `env` block, so `ANTHROPIC_BASE_URL` in the
   shell was ignored — a smoke test "passed" on a real Claude model. `--setting-sources project,local` leaves user settings out for one
   process. Proof: with the proxy down the run hangs; with it up, the proxy logs the Cerebras calls.
2. **Claude Code rejects unknown model names** (`unrecognized_model`): the proxy serves Qwen under the name `claude-sonnet-5-5`
   (`cerebras-litellm.yaml`) — only this local proxy maps it; records must say Qwen.
3. **Cerebras rejects `thinking_blocks`** echoed back on turn 2: a pre-call hook strips thinking content from assistant messages
   (`cerebras-strip_thinking.py`).

Proxy: `litellm --config cerebras-litellm.yaml --host 127.0.0.1 --port 4011` with `CEREBRAS_API_KEY` and a local `LITELLM_MASTER_KEY`
(never committed). Client: `env -u CLAUDE_CODE_USE_FOUNDRY -u ANTHROPIC_FOUNDRY_RESOURCE -u ANTHROPIC_FOUNDRY_API_KEY -u ANTHROPIC_MODEL
ANTHROPIC_BASE_URL=http://127.0.0.1:4011 ANTHROPIC_AUTH_TOKEN=<master key> ANTHROPIC_DEFAULT_HAIKU_MODEL=claude-sonnet-5-5
ANTHROPIC_SMALL_FAST_MODEL=claude-sonnet-5-5 claude -p … --model claude-sonnet-5-5 --setting-sources project,local`.
Model checks: tool calls (0.38 s), image input (read a screenshot heading), a ~60k-token prompt — all pass.

## The q01 run (rbc, 2026-10-12 08:58Z, stopped)
Fast but not converging: `first` 30 s after start, a round about every minute, but 28 / 38 / 29 % → 32.2 / 28.4 / 23.6 % at round 8
(16 min), oscillating; opus 5.5 high was at 10.9 / 6.4 / 4.4 after its first CSS round. It ended at 09:21:51Z by an API error: the
conversation reached 132 974 tokens past Qwen's 131 072-token window after 104 turns — Claude Code, told the model was Sonnet 5.5 (the
proxy's alias), never compacted. The user stopped the experiment. To retry: tell Claude Code the real window (an auto-compact limit at
~120 k tokens) and keep the protocol identical.
