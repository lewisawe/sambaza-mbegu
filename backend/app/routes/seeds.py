from fastapi import APIRouter, Query
from typing import Optional
from app.db import get_session

router = APIRouter()

@router.get("/search")
async def search_seeds(
    crop: Optional[str] = None,
    trait: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: float = 30,
    county: Optional[str] = None,
):
    query = """
    MATCH (f:Farmer)-[g:GROWS]->(s:SeedVariety)
    MATCH (f)-[:LOCATED_IN]->(l:Location)
    WHERE 1=1
    """
    params = {}

    if crop:
        query += " AND toLower(s.crop_type) = toLower($crop)"
        params["crop"] = crop
    if trait:
        query += " AND EXISTS { MATCH (s)-[:HAS_TRAIT]->(t:Trait) WHERE toLower(t.name) = toLower($trait) }"
        params["trait"] = trait
    if county:
        query += " AND toLower(l.county) = toLower($county)"
        params["county"] = county
    if lat and lng:
        query += " AND point.distance(point({latitude: f.lat, longitude: f.lng}), point({latitude: $lat, longitude: $lng})) <= $radius"
        params["lat"] = lat
        params["lng"] = lng
        params["radius"] = radius_km * 1000

    query += """
    RETURN s {.*, id: elementId(s)} AS seed,
           f {.*, id: elementId(f)} AS farmer,
           l {.*} AS location,
           g {.*} AS grows_info
    LIMIT 20
    """

    with get_session() as session:
        result = session.run(query, params)
        records = [dict(r) for r in result]
    return records


@router.get("/{seed_id}/provenance")
async def get_provenance(seed_id: str):
    query = """
    MATCH (s:SeedVariety) WHERE elementId(s) = $seed_id
    MATCH path = (f:Farmer)-[:RECEIVED_FROM*0..10]->(origin:Farmer)
    WHERE (f)-[:GROWS]->(s)
    WITH f, origin, path, s
    MATCH (f)-[:LOCATED_IN]->(l:Location)
    MATCH (origin)-[g:GROWS]->(s)
    RETURN f {.*, id: elementId(f)} AS farmer,
           l {.*} AS location,
           g {.*} AS grows_info,
           length(path) AS depth,
           [n IN nodes(path) | n {.*, id: elementId(n)}] AS chain
    ORDER BY depth
    LIMIT 50
    """
    with get_session() as session:
        result = session.run(query, {"seed_id": seed_id})
        records = [dict(r) for r in result]
    return records


@router.get("/recommend")
async def recommend_seeds(
    soil: Optional[str] = None,
    climate: Optional[str] = None,
    county: Optional[str] = None,
):
    query = """
    MATCH (s:SeedVariety)
    WHERE 1=1
    """
    params = {}

    if soil:
        query += " AND EXISTS { MATCH (s)-[:THRIVES_IN]->(st:SoilType) WHERE toLower(st.name) = toLower($soil) }"
        params["soil"] = soil
    if climate:
        query += " AND EXISTS { MATCH (s)-[:SUITED_FOR]->(cz:ClimateZone) WHERE toLower(cz.name) = toLower($climate) }"
        params["climate"] = climate

    query += """
    OPTIONAL MATCH (s)-[:HAS_TRAIT]->(t:Trait)
    OPTIONAL MATCH (f:Farmer)-[g:GROWS]->(s)
    """

    if county:
        query += " OPTIONAL MATCH (f)-[:LOCATED_IN]->(l:Location) WHERE toLower(l.county) = toLower($county)"
        params["county"] = county

    query += """
    RETURN s {.*, id: elementId(s)} AS seed,
           collect(DISTINCT t.name) AS traits,
           count(DISTINCT f) AS grower_count,
           avg(g.success_rating) AS avg_success
    ORDER BY avg_success DESC, grower_count DESC
    LIMIT 10
    """

    with get_session() as session:
        result = session.run(query, params)
        records = [dict(r) for r in result]
    return records


@router.get("/{seed_id}/story")
async def get_provenance_story(seed_id: str):
    from app.services.provenance_story_service import provenance_story_service
    return provenance_story_service.generate_story(seed_id)
