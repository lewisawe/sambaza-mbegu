import uuid
from datetime import datetime
from app.db import get_session

TIER_ORDER = ["Unverified", "Confirmed", "Champion", "Seed Bank"]


class VerificationService:
    def submit_report(self, worker_id: str, farmer_id: str, varieties_observed: list, notes: str = "") -> dict:
        report_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with get_session() as session:
            result = session.run(
                """
                MATCH (f:Farmer {id: $fid}), (w:Farmer {id: $wid})
                CREATE (r:VerificationReport {id: $rid, visit_date: datetime($now), notes: $notes, varieties_observed: $varieties})
                CREATE (r)-[:SUBMITTED_BY]->(w)
                CREATE (r)-[:VERIFIES]->(f)
                WITH f, r
                SET f.verification_tier = CASE
                    WHEN f.verification_tier IS NULL OR f.verification_tier = 'Unverified' THEN 'Confirmed'
                    ELSE f.verification_tier
                END,
                f.last_verified = datetime($now)
                RETURN r {.*, farmer_id: f.id, new_tier: f.verification_tier} AS report
                """,
                fid=farmer_id, wid=worker_id, rid=report_id, now=now, notes=notes, varieties=varieties_observed,
            )
            rec = result.single()
            if not rec:
                return {"error": "Farmer or worker not found", "code": 404}
            # Mark GROWS relationships as verified
            for var in varieties_observed:
                session.run(
                    """
                    MATCH (f:Farmer {id: $fid})-[g:GROWS]->(v:SeedVariety)
                    WHERE v.name = $vname OR v.id = $vname
                    SET g.verified = true, g.verified_date = datetime($now)
                    """,
                    fid=farmer_id, vname=var, now=now,
                )
            return rec["report"]

    def bulk_submit(self, worker_id: str, reports: list) -> list:
        results = []
        for r in reports:
            try:
                res = self.submit_report(worker_id, r["farmer_id"], r.get("varieties_observed", []), r.get("notes", ""))
                if isinstance(res, dict) and "error" in res:
                    results.append({"farmer_id": r["farmer_id"], "status": "failed", "error": res["error"]})
                else:
                    results.append({"farmer_id": r["farmer_id"], "status": "success", "report_id": res.get("id")})
            except Exception as e:
                results.append({"farmer_id": r.get("farmer_id"), "status": "failed", "error": str(e)})
        return results

    def submit_growing_record(self, worker_id: str, farm_id: str, variety_id: str, season: dict, yield_kg: float) -> dict:
        record_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        with get_session() as session:
            result = session.run(
                """
                MATCH (farm:Farm {id: $farm_id}), (v:SeedVariety {id: $vid}), (w:Farmer {id: $wid})
                MERGE (s:Season {year: $year, name: $season_name})
                CREATE (gr:GrowingRecord {id: $rid, yield_kg: $yield_kg, recorded_at: datetime($now), notes: ''})
                CREATE (gr)-[:ON_FARM]->(farm)
                CREATE (gr)-[:OF_VARIETY]->(v)
                CREATE (gr)-[:IN_SEASON]->(s)
                CREATE (gr)-[:RECORDED_BY]->(w)
                RETURN gr {.*, farm_id: farm.id, variety_id: v.id, season_year: s.year, season_name: s.name} AS record
                """,
                farm_id=farm_id, vid=variety_id, wid=worker_id, rid=record_id,
                year=season.get("year", 2024), season_name=season.get("name", "long_rains"),
                yield_kg=yield_kg, now=now,
            )
            rec = result.single()
            if not rec:
                return {"error": "Farm, variety, or worker not found", "code": 404}
            return rec["record"]


verification_service = VerificationService()
