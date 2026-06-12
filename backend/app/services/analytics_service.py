import hashlib
from app.db import get_session

ANON_SALT = "mbegu_anon_2026"


def _anonymize(farmer_id: str) -> str:
    return hashlib.sha256(f"{farmer_id}{ANON_SALT}".encode()).hexdigest()[:16]


class AnalyticsService:
    def county_summary(self, county: str, start_date: str = None, end_date: str = None) -> dict:
        date_filter = ""
        if start_date and end_date:
            date_filter = f"AND e.created_at >= datetime('{start_date}') AND e.created_at <= datetime('{end_date}')"
        with get_session() as session:
            result = session.run(
                f"""
                MATCH (f:Farmer {{county: $county}})
                OPTIONAL MATCH (f)-[:GROWS]->(v:SeedVariety)
                WITH count(DISTINCT f) AS farmers, count(DISTINCT v) AS varieties,
                     collect(DISTINCT v.crop) AS crops, collect(DISTINCT f.ward) AS wards
                RETURN farmers, varieties, crops, wards
                """,
                county=county,
            ).single()
            exchanges = session.run(
                f"""
                MATCH (f:Farmer {{county: $county}})<-[:OFFERED_BY]-(l)<-[:FOR_LISTING]-(e:ExchangeRequest {{status: 'completed'}})
                {date_filter}
                RETURN count(e) AS exchange_count
                """,
                county=county,
            ).single()
            return {
                "county": county,
                "active_farmers": result["farmers"],
                "variety_count": result["varieties"],
                "crop_types": result["crops"],
                "wards_covered": result["wards"],
                "exchange_volume": exchanges["exchange_count"],
            }

    def extinction_risk(self) -> list:
        with get_session() as session:
            result = session.run(
                """
                MATCH (v:SeedVariety)<-[:GROWS]-(f:Farmer)
                WITH v, collect(f) AS growers, count(f) AS grower_count, avg(f.years_growing) AS avg_years
                WHERE grower_count <= 3 AND avg_years > 20
                RETURN v.id AS id, v.name AS name, v.crop AS crop, grower_count, avg_years
                ORDER BY grower_count ASC, avg_years DESC
                """
            )
            return [dict(rec) for rec in result]

    def variety_performance(self, anonymized: bool = True) -> list:
        with get_session() as session:
            result = session.run(
                """
                MATCH (v:SeedVariety)<-[:OF_VARIETY]-(gr:GrowingRecord)-[:ON_FARM]->(farm)
                OPTIONAL MATCH (gr)-[:RECORDED_BY]->(w)
                WITH v, avg(gr.yield_kg) AS avg_yield, count(gr) AS records,
                     collect(DISTINCT farm.county) AS counties
                RETURN v.name AS variety, v.crop AS crop, avg_yield, records, counties
                ORDER BY avg_yield DESC
                """
            )
            return [dict(rec) for rec in result]

    def network_topology(self, anonymized: bool = True) -> dict:
        with get_session() as session:
            result = session.run(
                """
                MATCH (a:Farmer)-[s:SHARED_WITH]->(b:Farmer)
                RETURN a.id AS source, b.id AS target, s.variety AS variety, count(s) AS weight
                """
            )
            edges = []
            nodes = set()
            for rec in result:
                src = _anonymize(rec["source"]) if anonymized else rec["source"]
                tgt = _anonymize(rec["target"]) if anonymized else rec["target"]
                nodes.add(src)
                nodes.add(tgt)
                edges.append({"source": src, "target": tgt, "variety": rec["variety"], "weight": rec["weight"]})
            return {"nodes": list(nodes), "edges": edges, "node_count": len(nodes), "edge_count": len(edges)}

    def demand_signals(self, crop_type: str = None, county: str = None) -> list:
        """Anonymized demand data for seed companies."""
        from sqlalchemy import text
        from app.postgres import SessionLocal
        db = SessionLocal()
        try:
            query = "SELECT query_crop, query_county, count(*) AS search_count FROM search_logs WHERE 1=1"
            params = {}
            if crop_type:
                query += " AND query_crop = :crop"
                params["crop"] = crop_type
            if county:
                query += " AND query_county = :county"
                params["county"] = county
            query += " GROUP BY query_crop, query_county ORDER BY search_count DESC"
            result = db.execute(text(query), params)
            return [{"crop": r[0], "county": r[1], "search_count": r[2]} for r in result]
        finally:
            db.close()


analytics_service = AnalyticsService()
