"""Swappable LLM provider abstraction.

One thin interface — ``complete`` (sync) and ``acomplete`` (async) — that
every chat-LLM call site in the app routes through. Dispatch is chosen by the
``LLM_PROVIDER`` env var:

    featherless  -> Featherless (OpenAI-compatible) chat/completions
    openai       -> OpenAI chat/completions
    local        -> any OpenAI-compatible base URL (LLM_BASE_URL)
    bedrock      -> AWS Bedrock (best-effort; stubbed-with-TODO if SDK missing)
    anthropic    -> Anthropic Messages API (best-effort)
    none / unset -> safe no-op returning "" so callers hit their existing
                    graceful fallbacks (non-AI features keep working with NO key)

Config (all optional; no real secrets in the repo):
    LLM_PROVIDER  provider key (default: 'featherless' if FEATHERLESS_API_KEY
                  is set, else 'none')
    LLM_MODEL     model id (default: the current Llama 3.1 8B Instruct)
    LLM_API_KEY   generic key; falls back to FEATHERLESS_API_KEY / OPENAI_API_KEY
    LLM_BASE_URL  base URL for provider='local' (OpenAI-compatible)

Returning "" from any provider is always safe: callers already treat an empty
string as "no LLM available" and fall back to deterministic output.
"""

import os
import httpx

DEFAULT_MODEL = "meta-llama/Meta-Llama-3.1-8B-Instruct"

FEATHERLESS_URL = "https://api.featherless.ai/v1/chat/completions"
OPENAI_URL = "https://api.openai.com/v1/chat/completions"
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"


def _provider() -> str:
    explicit = os.getenv("LLM_PROVIDER", "").strip().lower()
    if explicit:
        return explicit
    # Back-compat default: if a Featherless key is present, keep using it.
    if os.getenv("FEATHERLESS_API_KEY"):
        return "featherless"
    return "none"


def _model() -> str:
    return os.getenv("LLM_MODEL", DEFAULT_MODEL)


def _api_key(provider: str) -> str:
    generic = os.getenv("LLM_API_KEY", "")
    if generic:
        return generic
    if provider == "featherless":
        return os.getenv("FEATHERLESS_API_KEY", "")
    if provider in ("openai", "local"):
        return os.getenv("OPENAI_API_KEY", "")
    if provider == "anthropic":
        return os.getenv("ANTHROPIC_API_KEY", "")
    return ""


def _openai_compatible_url(provider: str) -> str:
    if provider == "featherless":
        return FEATHERLESS_URL
    if provider == "openai":
        return OPENAI_URL
    if provider == "local":
        base = os.getenv("LLM_BASE_URL", "").rstrip("/")
        if not base:
            return ""
        return f"{base}/v1/chat/completions" if not base.endswith("/chat/completions") else base
    return ""


def _payload(prompt: str, max_tokens: int, temperature: float) -> dict:
    return {
        "model": _model(),
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": temperature,
    }


def _parse_openai(data: dict) -> str:
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        return ""


# --- sync ---

def complete(prompt: str, *, max_tokens: int = 256, temperature: float = 0.1) -> str:
    """Return an LLM completion, or "" when no provider/key is configured.

    Never raises on a missing/unknown provider — callers rely on "" to trigger
    their deterministic fallbacks.
    """
    provider = _provider()
    if provider == "none":
        return ""

    key = _api_key(provider)

    if provider in ("featherless", "openai", "local"):
        url = _openai_compatible_url(provider)
        if not url or not key:
            return ""
        try:
            resp = httpx.post(
                url,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json=_payload(prompt, max_tokens, temperature),
                timeout=30,
            )
            resp.raise_for_status()
            return _parse_openai(resp.json())
        except Exception:
            return ""

    if provider == "anthropic":
        if not key:
            return ""
        try:
            resp = httpx.post(
                ANTHROPIC_URL,
                headers={
                    "x-api-key": key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": _model(),
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "messages": [{"role": "user", "content": prompt}],
                },
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            parts = data.get("content", [])
            if parts and isinstance(parts, list):
                return parts[0].get("text", "")
            return ""
        except Exception:
            return ""

    if provider == "bedrock":
        # Best-effort: AWS Bedrock via boto3 if available, else safe no-op.
        # TODO: full Bedrock wiring (region, model id mapping) — stubbed so the
        # provider switch exists without requiring the SDK/credentials.
        try:
            import json
            import boto3  # type: ignore
            client = boto3.client("bedrock-runtime")
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": [{"role": "user", "content": prompt}],
            })
            resp = client.invoke_model(modelId=_model(), body=body)
            payload = json.loads(resp["body"].read())
            parts = payload.get("content", [])
            if parts and isinstance(parts, list):
                return parts[0].get("text", "")
            return ""
        except Exception:
            return ""

    # Unknown provider -> safe no-op.
    return ""


# --- async (for ai.py) ---

async def acomplete(prompt: str, *, max_tokens: int = 256, temperature: float = 0.1) -> str:
    """Async variant of ``complete``. Same contract: "" when unavailable."""
    provider = _provider()
    if provider == "none":
        return ""

    key = _api_key(provider)

    if provider in ("featherless", "openai", "local"):
        url = _openai_compatible_url(provider)
        if not url or not key:
            return ""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    url,
                    headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                    json=_payload(prompt, max_tokens, temperature),
                )
                resp.raise_for_status()
                return _parse_openai(resp.json())
        except Exception:
            return ""

    if provider == "anthropic":
        if not key:
            return ""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    ANTHROPIC_URL,
                    headers={
                        "x-api-key": key,
                        "anthropic-version": "2023-06-01",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": _model(),
                        "max_tokens": max_tokens,
                        "temperature": temperature,
                        "messages": [{"role": "user", "content": prompt}],
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                parts = data.get("content", [])
                if parts and isinstance(parts, list):
                    return parts[0].get("text", "")
                return ""
        except Exception:
            return ""

    if provider == "bedrock":
        # boto3 is sync; run the sync path. TODO: native async if needed.
        return complete(prompt, max_tokens=max_tokens, temperature=temperature)

    return ""
