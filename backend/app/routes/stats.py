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
