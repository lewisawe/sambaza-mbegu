import os
import httpx
from dataclasses import dataclass
from typing import Optional
from app.services.llm_provider import complete

WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


@dataclass
class TranscriptionResult:
    text: str
    language: str
    confidence: float = 1.0


@dataclass
class SearchIntent:
    crop: Optional[str] = None
    trait: Optional[str] = None
    county: Optional[str] = None
    raw_text: str = ""


class VoiceService:
    def transcribe(self, audio_url: str) -> TranscriptionResult:
        """Transcribe audio via Whisper API."""
        if not OPENAI_API_KEY:
            return TranscriptionResult(text="", language="en")
        audio_data = httpx.get(audio_url).content
        resp = httpx.post(
            WHISPER_URL,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            files={"file": ("audio.ogg", audio_data, "audio/ogg")},
            data={"model": "whisper-1", "response_format": "verbose_json"},
        )
        data = resp.json()
        return TranscriptionResult(
            text=data.get("text", ""),
            language=self._normalize_language(data.get("language", "en")),
        )

    def detect_language(self, text: str) -> str:
        """Detect language: sw (Swahili), kam (Kikamba), or en (English)."""
        sw_markers = ["nataka", "mbegu", "mimi", "kupanda", "mahindi", "mtama", "nazi"]
        kam_markers = ["nthaka", "mbeu", "nyie", "kuthua"]
        text_lower = text.lower()
        if any(w in text_lower for w in kam_markers):
            return "kam"
        if any(w in text_lower for w in sw_markers):
            return "sw"
        return "en"

    def extract_intent(self, text: str, language: str) -> SearchIntent:
        """Extract seed search intent from text using the LLM provider."""
        prompt = f"""Extract seed search intent from this farmer's message ({language}).
Return JSON with keys: crop, trait, county. Use null for missing fields.
Message: "{text}"
JSON:"""
        content = complete(prompt, max_tokens=100, temperature=0.1)
        if not content:
            return SearchIntent(raw_text=text)
        try:
            import json
            data = json.loads(content)
            return SearchIntent(crop=data.get("crop"), trait=data.get("trait"), county=data.get("county"), raw_text=text)
        except Exception:
            return SearchIntent(raw_text=text)

    def translate_response(self, text: str, target_language: str) -> str:
        """Translate response to target language via the LLM provider."""
        if target_language == "en":
            return text
        lang_name = "Swahili" if target_language == "sw" else "Kikamba"
        result = complete(f"Translate to {lang_name}: {text}", max_tokens=200, temperature=0.1)
        return result or text

    def _normalize_language(self, lang: str) -> str:
        if lang in ("sw", "swahili"):
            return "sw"
        if lang in ("kam", "kikamba"):
            return "kam"
        return "en"


voice_service = VoiceService()
