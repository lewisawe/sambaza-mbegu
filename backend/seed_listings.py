"""Seed sample listings from existing graph farmers/varieties."""
import uuid
from datetime import datetime, timedelta
from app.db import get_session


def seed():
    with get_session() as session:
        result = session.run(
            """
            MATCH (f:Farmer)-[:GROWS]->(v:SeedVariety)
            RETURN f.id AS farmer_id, v.id AS variety_id, v.name AS variety_name, v.crop AS crop
            LIMIT 20
            """
        )
        rows = [dict(r) for r in result]

    count = 0
    with get_session() as session:
        for r in rows:
            lid = str(uuid.uuid4())
            now = datetime.utcnow()
            expires = now + timedelta(days=90)
            session.run(
                """
                MATCH (f:Farmer {id: $fid}), (v:SeedVariety {id: $vid})
                CREATE (l:SeedListing {
                    id: $lid, quantity_kg: 5.0, status: 'available',
                    created_at: datetime($now), expires_at: datetime($exp)
                })
                CREATE (l)-[:OFFERED_BY]->(f)
                CREATE (l)-[:OF_VARIETY]->(v)
                """,
                fid=r["farmer_id"], vid=r["variety_id"], lid=lid,
                now=now.isoformat(), exp=expires.isoformat(),
            )
            count += 1
    print(f"Created {count} seed listings.")


if __name__ == "__main__":
    seed()
