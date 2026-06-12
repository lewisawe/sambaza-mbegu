import os
import json
import httpx
from fastapi import APIRouter
from pydantic import BaseModel
from app.db import get_session

router = APIRouter()

FEATHERLESS_API_KEY = os.getenv("FEATHERLESS_API_KEY", "")
FEATHERLESS_URL = "https://api.featherless.ai/v1/chat/completions"
MODEL = "meta-llama/Meta-Llama-3.1-8B-Instruct"

EXTRACT_PROMPT = """You are a seed search assistant for Kenyan farmers.
Extract search parameters from the farmer's message.
Return JSON only: {"crop": null, "traits": [], "soil": null, "climate": null, "county": null}
Use null for anything not mentioned. Arrays can be empty.

Valid traits: drought_resistant, short_season, pest_resistant, high_yield, low_input
Valid soils: acidic, sandy, loamy, clay, volcanic
Valid climates: arid, semi_arid, sub_humid, humid, highland
Valid counties: Machakos, Kitui, Makueni, Tharaka-Nithi, Meru, Embu
Valid crops: Sorghum, Millet, Cowpea, Pigeon Pea, Green Gram, Maize

Farmer's message: "{input}"
"""

RECOMMEND_PROMPT = """You are an agricultural advisor helping a Kenyan smallholder farmer choose seeds.
Based on the search results below, explain why these varieties are good matches.
Be specific: mention distance, years grown, success ratings, and relevant conditions.
Write in simple English. 2-3 sentences per variety. Max 3 varieties.

Farmer's query: {query}
Search results: {results}
"""


class AISearchRequest(BaseModel):
    query: str


async def call_llm(prompt: str) -> str:
    if not FEATHERLESS_API_KEY:
        return ""
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            FEATHERLESS_URL,
            headers={"Authorization": f"Bearer {FEATHERLESS_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 512,
                "temperature": 0.1,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


def build_query(params: dict) -> tuple[str, dict]:
    query = """
    MATCH (f:Farmer)-[g:GROWS]->(s:SeedVariety)
    MATCH (f)-[:LOCATED_IN]->(l:Location)
    WHERE 1=1
    """
    p = {}

    if params.get("crop"):
        query += " AND toLower(s.crop_type) = toLower($crop)"
        p["crop"] = params["crop"]
    if params.get("traits"):
        for i, t in enumerate(params["traits"]):
            key = f"trait_{i}"
            query += f" AND EXISTS {{ MATCH (s)-[:HAS_TRAIT]->(t:Trait) WHERE toLower(t.name) = toLower(${key}) }}"
            p[key] = t
    if params.get("soil"):
        query += " AND EXISTS { MATCH (s)-[:THRIVES_IN]->(st:SoilType) WHERE toLower(st.name) = toLower($soil) }"
        p["soil"] = params["soil"]
    if params.get("climate"):
        query += " AND EXISTS { MATCH (s)-[:SUITED_FOR]->(cz:ClimateZone) WHERE toLower(cz.name) = toLower($climate) }"
        p["climate"] = params["climate"]
    if params.get("county"):
        query += " AND toLower(l.county) = toLower($county)"
        p["county"] = params["county"]

    query += """
    RETURN s {.*, id: elementId(s)} AS seed,
           f {.*, id: elementId(f)} AS farmer,
           l {.*} AS location,
           g {.*} AS grows_info
    ORDER BY g.success_rating DESC
    LIMIT 10
    """
    return query, p


@router.post("/ai-search")
async def ai_search(req: AISearchRequest):
    # Step 1: Extract structured params from natural language
    extract_response = await call_llm(EXTRACT_PROMPT.format(input=req.query))

    # Parse JSON from LLM response
    params = {}
    try:
        # Find JSON in response
        text = extract_response.strip()
        start = text.find("{")
        end = text.rfind("}") + 1
        if start >= 0 and end > start:
            params = json.loads(text[start:end])
    except (json.JSONDecodeError, ValueError):
        pass

    # Clean nulls
    params = {k: v for k, v in params.items() if v is not None and v != []}

    # Step 2: Query Neo4j
    cypher, query_params = build_query(params)
    with get_session() as session:
        result = session.run(cypher, query_params)
        records = [dict(r) for r in result]

    # Step 3: Generate recommendation reasoning
    recommendation = ""
    if records and FEATHERLESS_API_KEY:
        summary = [
            {
                "variety": r["seed"].get("local_name"),
                "crop": r["seed"].get("crop_type"),
                "farmer": r["farmer"].get("name"),
                "county": r["location"].get("county"),
                "since_year": r["grows_info"].get("since_year"),
                "success_rating": r["grows_info"].get("success_rating"),
            }
            for r in records[:5]
        ]
        recommendation = await call_llm(
            RECOMMEND_PROMPT.format(query=req.query, results=json.dumps(summary))
        )

    return {"results": records, "recommendation": recommendation, "extracted_params": params}
