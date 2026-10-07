from sqlalchemy import text
from app.db import get_session
from app.postgres import SessionLocal
from app.services.llm_provider import complete


class GapDetectionService:
    def detect_gaps(self, county: str) -> list:
        """Find wards where search demand exists but no local growers within 20km."""
        # Get demand signals from search logs
        db = SessionLocal()
        try:
            result = db.execute(
                text("SELECT query_crop, query_county, count(*) AS demand FROM search_logs WHERE query_county = :county GROUP BY query_crop, query_county ORDER BY demand DESC"),
                {"county": county},
            )
            demand = [{"crop": r[0], "county": r[1], "demand": r[2]} for r in result]
        finally:
            db.close()

        gaps = []
        with get_session() as session:
            for d in demand:
                if not d["crop"]:
                    continue
                # Check if growers exist within the county
                grower_check = session.run(
                    """
                    MATCH (f:Farmer {county: $county})-[:GROWS]->(v:SeedVariety {crop: $crop})
                    RETURN count(f) AS grower_count, collect(DISTINCT f.ward) AS wards
                    """,
                    county=county, crop=d["crop"],
                ).single()
                grower_count = grower_check["grower_count"] if grower_check else 0
                if grower_count == 0:
                    # Find nearest source
                    nearest = session.run(
                        """
                        MATCH (f:Farmer)-[:GROWS]->(v:SeedVariety {crop: $crop})
                        WHERE f.county <> $county
                        RETURN f.county AS source_county, f.name AS source_farmer
                        LIMIT 1
                        """,
                        county=county, crop=d["crop"],
                    ).single()
                    gaps.append({
                        "county": county,
                        "crop": d["crop"],
                        "demand_count": d["demand"],
                        "local_growers": 0,
                        "nearest_source": nearest["source_county"] if nearest else "Unknown",
                        "recommended_action": f"Connect {county} farmers with {nearest['source_county'] if nearest else 'external'} growers",
                    })
        return sorted(gaps, key=lambda g: g["demand_count"], reverse=True)

    def generate_summary(self, gap: dict) -> str:
        import json
        fallback = f"High demand for {gap['crop']} in {gap['county']} with no local growers. {gap['demand_count']} searches recorded. Nearest source: {gap.get('nearest_source', 'unknown')}."
        prompt = f"Write a one-sentence human-readable summary of this seed coverage gap for a county agriculture officer: {json.dumps(gap)}"
        result = complete(prompt, max_tokens=100, temperature=0.1)
        return result or fallback


gap_detection_service = GapDetectionService()
