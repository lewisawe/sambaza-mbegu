from fastapi import APIRouter
from app.db import get_session

router = APIRouter()

@router.get("")
async def get_stats():
    query = """
    MATCH (f:Farmer) WITH count(f) AS farmers
    MATCH (s:SeedVariety) WITH farmers, count(s) AS seeds
    MATCH (:Farmer)-[g:GROWS]->(:SeedVariety) WITH farmers, seeds, count(g) AS grow_links
    MATCH (:Farmer)-[sh:SHARED_WITH]->(:Farmer) WITH farmers, seeds, grow_links, count(sh) AS shares
    MATCH (l:Location) WITH farmers, seeds, grow_links, shares, count(DISTINCT l.county) AS counties
    RETURN farmers, seeds, grow_links, shares, counties
    """
    with get_session() as session:
        result = session.run(query)
        record = result.single()
    if not record:
        return {}
    return dict(record)


@router.get("/extinction-risk")
async def extinction_risk():
    """Varieties grown by 3 or fewer farmers with long cultivation history."""
    query = """
    MATCH (s:SeedVariety)<-[g:GROWS]-(f:Farmer)
    WITH s, count(f) AS growers, avg(2026 - g.since_year) AS avg_years
    WHERE growers <= 3 AND avg_years > 15
    OPTIONAL MATCH (s)-[:HAS_TRAIT]->(t:Trait)
    RETURN s.local_name AS variety, s.crop_type AS crop, growers,
           round(avg_years) AS avg_years_grown,
           collect(DISTINCT t.name) AS traits
    ORDER BY growers ASC, avg_years DESC
    """
    with get_session() as session:
        result = session.run(query)
        records = [dict(r) for r in result]
    return records


@router.get("/network-hubs")
async def network_hubs():
    """Farmers who are single points of failure in the sharing network."""
    query = """
    MATCH (f:Farmer)-[:SHARED_WITH]->(recipient:Farmer)
    WITH f, count(DISTINCT recipient) AS downstream_farmers
    WHERE downstream_farmers >= 3
    MATCH (f)-[:LOCATED_IN]->(l:Location)
    OPTIONAL MATCH (f)-[:GROWS]->(s:SeedVariety)
    RETURN f.name AS farmer, l.county AS county, downstream_farmers,
           collect(DISTINCT s.local_name) AS varieties_shared
    ORDER BY downstream_farmers DESC
    LIMIT 10
    """
    with get_session() as session:
        result = session.run(query)
        records = [dict(r) for r in result]
    return records
