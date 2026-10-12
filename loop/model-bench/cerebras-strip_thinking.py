# LiteLLM proxy hook: Cerebras rejects assistant `thinking_blocks`; Claude Code sends back the thinking the proxy produced from Qwen's
# reasoning. Strip thinking content from assistant messages before the call (Anthropic-format and OpenAI-format fields alike).
from litellm.integrations.custom_logger import CustomLogger

class StripThinking(CustomLogger):
    async def async_pre_call_hook(self, user_api_key_dict, cache, data, call_type):
        for m in data.get("messages") or []:
            if m.get("role") != "assistant":
                continue
            m.pop("thinking_blocks", None); m.pop("reasoning_content", None)
            if isinstance(m.get("content"), list):
                m["content"] = [c for c in m["content"] if not (isinstance(c, dict) and c.get("type") in ("thinking", "redacted_thinking"))] or ""
        return data

strip_thinking = StripThinking()
