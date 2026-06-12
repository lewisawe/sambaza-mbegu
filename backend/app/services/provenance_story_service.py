import os
import json
import httpx
from app.db import get_session

FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY", "")
FEATHERLESS_URL = "https://api.featherless.ai/v1/chat/completions"


class ProvenanceStoryService:
    def generate_story(self, variety_id: str) -> dict:
        chain = self._get_provenance_chain(variety_id)
        if not chain:
            return {"story": "No provenance data available for this variety.", "chain": []}
        chain_json = self.serialize_chain_for_llm(chain)
        story = self._call_llm(chain_json, len(chain))
        return {"story": story, "chain": chain}

    def serialize_chain_for_llm(self, chain: list) -> str:
        return json.dumps(chain, default=str)

    def parse_chain_json(self, json_str: str) -> list:
        return json.loads(json_str)

    def _get_provenance_chain(self, variety_id: str) -> list:
        with get_session() as session:
            result = session.run(
                """
                MATCH (v:SeedVariety) WHERE elementId(v) = $vid
                MATCH (f:Farmer)-[:GROWS]->(v)
                OPTIONAL MATCH (f)-[s:SHARED_WITH]->(recipient:Farmer)
                RETURN f.name AS grower, f.county AS county, f.years_growing AS years,
                       s.date AS shared_date, recipient.name AS recipient, recipient.county AS recipient_county,
                       v.name AS variety_name
                ORDER BY f.years_growing DESC
                """,
                vid=variety_id,
            )
            return [dict(rec) for rec in result]

    def _call_llm(self, chain_json: str, event_count: int) -> str:
        if not FEATHERLESS_API_KEY:
            return f"This variety has a provenance chain of {event_count} sharing events."
        length_instruction = "Summarize in 3-4 sentences." if event_count > 5 else "Write 2-3 sentences."
        prompt = f"""You are writing a provenance story for a Kenyan indigenous seed variety.
Based on this sharing history, write a compelling narrative about the seed's journey.
{length_instruction}
Highlight: origin, geographic spread, years of cultivation, and any notable survival.

Provenance data: {chain_json}"""
        resp = httpx.post(
            FEATHERLESS_URL,
            headers={"Authorization": f"Bearer {FEATHERLESS_API_KEY}"},
            json={"model": "meta-llama/Meta-Llama-3.1-8B-Instruct", "messages": [{"role": "user", "content": prompt}], "max_tokens": 200},
            timeout=15,
        )
        try:
            return resp.json()["choices"][0]["message"]["content"]
        except Exception:
            return f"This variety has been shared across {event_count} growers over multiple regions."


provenance_story_service = ProvenanceStoryService()
