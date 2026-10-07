import os
from app.db import get_session
from app.services.voice_service import voice_service
from app.services.llm_provider import complete

META_TOKEN = os.getenv("META_WHATSAPP_TOKEN", "")
META_PHONE_ID = os.getenv("META_PHONE_NUMBER_ID", "")


class WhatsAppService:
    def handle_text_message(self, phone: str, text: str) -> dict:
        language = voice_service.detect_language(text)
        intent = voice_service.extract_intent(text, language)
        results = self._query_graph(intent)
        recommendation = self._generate_recommendation(intent, results, language)
        response_text = recommendation if results else f"No seeds found matching your request."
        if language != "en":
            response_text = voice_service.translate_response(response_text, language)
        return {"response": response_text, "results": results, "language": language}

    def handle_voice_note(self, phone: str, audio_url: str) -> dict:
        transcription = voice_service.transcribe(audio_url)
        intent = voice_service.extract_intent(transcription.text, transcription.language)
        results = self._query_graph(intent)
        recommendation = self._generate_recommendation(intent, results, transcription.language)
        if transcription.language != "en":
            recommendation = voice_service.translate_response(recommendation, transcription.language)
        return {"response": recommendation, "results": results, "language": transcription.language, "transcription": transcription.text}

    def generate_connect_link(self, grower_phone: str) -> str:
        clean = grower_phone.replace("+", "").replace(" ", "")
        return f"https://wa.me/{clean}"

    def _query_graph(self, intent) -> list:
        crop_filter = "AND v.crop = $crop" if intent.crop else ""
        county_filter = "AND f.county = $county" if intent.county else ""
        with get_session() as session:
            result = session.run(
                f"""
                MATCH (l:SeedListing {{status: 'available'}})-[:OFFERED_BY]->(f:Farmer), (l)-[:OF_VARIETY]->(v:SeedVariety)
                WHERE 1=1 {crop_filter} {county_filter}
                RETURN f.name AS name, f.phone AS phone, v.name AS variety, v.crop AS crop, f.county AS county
                LIMIT 5
                """,
                crop=intent.crop, county=intent.county,
            )
            return [dict(rec) for rec in result]

    def _generate_recommendation(self, intent, results: list, language: str) -> str:
        if not results:
            return "No matching seeds found."
        # Deterministic fallback used when the LLM is unavailable (no key /
        # provider 'none') or returns nothing — preserves prior behavior.
        fallback_lines = [f"• {r['variety']} from {r['name']} in {r['county']}" for r in results]
        fallback = f"Found {len(results)} growers:\n" + "\n".join(fallback_lines)
        import json
        prompt = f"""You are a Kenyan agricultural advisor. A farmer is looking for {intent.crop or 'seeds'}.
Here are available growers: {json.dumps(results)}
Write a brief recommendation (2-3 sentences) explaining why these are good options. Be concise."""
        result = complete(prompt, max_tokens=150, temperature=0.1)
        return result or fallback


whatsapp_service = WhatsAppService()
