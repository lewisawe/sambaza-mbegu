from fastapi import APIRouter
from app.db import get_session

router = APIRouter()

@router.get("/{farmer_id}/network")
async def get_farmer_network(farmer_id: str):
    query = """
    MATCH (f:Farmer) WHERE elementId(f) = $farmer_id
    OPTIONAL MATCH (f)-[s:SHARED_WITH]->(recipient:Farmer)
    OPTIONAL MATCH (f)-[r:RECEIVED_FROM]->(source:Farmer)
    OPTIONAL MATCH (f)-[g:GROWS]->(seed:SeedVariety)
    OPTIONAL MATCH (f)-[:LOCATED_IN]->(l:Location)
    RETURN f {.*, id: elementId(f)} AS farmer,
           l {.*} AS location,
           collect(DISTINCT seed {.*, id: elementId(seed)}) AS seeds,
           collect(DISTINCT recipient {.*, id: elementId(recipient), rel: s {.*}}) AS shared_with,
           collect(DISTINCT source {.*, id: elementId(source), rel: r {.*}}) AS received_from
    """
    with get_session() as session:
        result = session.run(query, {"farmer_id": farmer_id})
        record = result.single()
    if not record:
        return {"error": "Farmer not found"}
    return dict(record)
