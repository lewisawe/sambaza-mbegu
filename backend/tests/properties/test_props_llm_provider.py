# Phase 6: focused coverage for the new LLM provider dispatch (new logic).
# No network calls — httpx is monkeypatched where a provider would reach out.
import importlib
import pytest

import app.services.llm_provider as llm


def _reload_clean(monkeypatch, **env):
    """Reload the module with a controlled environment."""
    for k in ("LLM_PROVIDER", "LLM_MODEL", "LLM_API_KEY", "LLM_BASE_URL",
              "FEATHERLESS_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"):
        monkeypatch.delenv(k, raising=False)
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    return importlib.reload(llm)


def test_no_provider_no_key_returns_empty(monkeypatch):
    """(a) No provider + no key -> complete() returns '' and raises nothing."""
    mod = _reload_clean(monkeypatch)
    assert mod._provider() == "none"
    assert mod.complete("hello", max_tokens=5) == ""


def test_unknown_provider_is_safe_noop(monkeypatch):
    """(b) Unknown LLM_PROVIDER -> safe no-op ''."""
    mod = _reload_clean(monkeypatch, LLM_PROVIDER="definitely-not-real")
    assert mod.complete("hello", max_tokens=5) == ""


def test_env_switch_selects_provider(monkeypatch):
    """(c) Provider selection reads the env switch."""
    mod = _reload_clean(monkeypatch, LLM_PROVIDER="openai", LLM_API_KEY="k")
    assert mod._provider() == "openai"
    # featherless default kicks in only via the back-compat key
    mod2 = _reload_clean(monkeypatch, FEATHERLESS_API_KEY="fk")
    assert mod2._provider() == "featherless"
    # explicit 'none' wins even if a legacy key is present
    mod3 = _reload_clean(monkeypatch, LLM_PROVIDER="none", FEATHERLESS_API_KEY="fk")
    assert mod3._provider() == "none"
    assert mod3.complete("x", max_tokens=1) == ""


def test_env_switch_routes_to_correct_url(monkeypatch):
    """Dispatch uses the URL for the selected provider (no real request)."""
    mod = _reload_clean(monkeypatch, LLM_PROVIDER="openai", LLM_API_KEY="k")
    captured = {}

    class _Resp:
        def raise_for_status(self):
            pass

        def json(self):
            return {"choices": [{"message": {"content": "ok"}}]}

    def fake_post(url, **kwargs):
        captured["url"] = url
        return _Resp()

    monkeypatch.setattr(mod.httpx, "post", fake_post)
    out = mod.complete("hi", max_tokens=5)
    assert out == "ok"
    assert captured["url"] == mod.OPENAI_URL


def test_provider_errors_fall_back_to_empty(monkeypatch):
    """A provider exception never propagates — returns '' for graceful fallback."""
    mod = _reload_clean(monkeypatch, LLM_PROVIDER="openai", LLM_API_KEY="k")

    def boom(url, **kwargs):
        raise RuntimeError("network down")

    monkeypatch.setattr(mod.httpx, "post", boom)
    assert mod.complete("hi", max_tokens=5) == ""


@pytest.fixture(autouse=True)
def _restore_module():
    """Reload the module clean after each test so global env state doesn't leak."""
    yield
    importlib.reload(llm)
