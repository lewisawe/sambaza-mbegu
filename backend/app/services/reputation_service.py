from datetime import datetime, timedelta
from app.db import get_session

TIER_VALUES = {"Unverified": 0, "Confirmed": 1, "Champion": 2, "Seed Bank": 3}
MAX_SCORE = 50 * 3 + 50 * 2 + 40 * 1 + 3 * 5 + 10 * 2  # 305


class ReputationService:
    def compute_score(self, farmer_id: str) -> float:
        data = self._get_farmer_data(farmer_id)
        if not data:
            return 0.0
        raw = (
            data["successful_shares"] * 3
            + data["positive_ratings"] * 2
            + data["years_growing"] * 1
            + TIER_VALUES.get(data["verification_tier"], 0) * 5
            + data["photo_evidence"] * 2
        )
        return round(raw / MAX_SCORE * 100, 2)

    def get_breakdown(self, farmer_id: str) -> dict:
        data = self._get_farmer_data(farmer_id)
        if not data:
            return {}
        tier_val = TIER_VALUES.get(data["verification_tier"], 0)
        return {
            "successful_shares": {"value": data["successful_shares"], "weight": 3, "contribution": data["successful_shares"] * 3},
            "positive_ratings": {"value": data["positive_ratings"], "weight": 2, "contribution": data["positive_ratings"] * 2},
            "years_growing": {"value": data["years_growing"], "weight": 1, "contribution": data["years_growing"] * 1},
            "verification_tier": {"value": data["verification_tier"], "numeric": tier_val, "weight": 5, "contribution": tier_val * 5},
            "photo_evidence": {"value": data["photo_evidence"], "weight": 2, "contribution": data["photo_evidence"] * 2},
            "total_score": self.compute_score(farmer_id),
            "max_possible": 100.0,
        }

    def apply_new_account_penalty(self, farmer_id: str, score: float, created_at: datetime = None) -> float:
        if created_at is None:
            with get_session() as session:
                result = session.run("MATCH (f:Farmer {id: $fid}) RETURN f.created_at AS ca", fid=farmer_id)
                rec = result.single()
                if not rec or not rec["ca"]:
                    return score
                created_at = rec["ca"]
        age_days = (datetime.utcnow() - created_at).days if isinstance(created_at, datetime) else 30
        if age_days < 30:
            return score * 0.5
        return score

    def _get_farmer_data(self, farmer_id: str) -> dict:
        with get_session() as session:
            result = session.run(
                """
                MATCH (f:Farmer {id: $fid})
                OPTIONAL MATCH (f)<-[:OFFERED_BY]-(l:SeedListing)<-[:FOR_LISTING]-(ex:ExchangeRequest {status: 'completed'})
                WITH f, count(ex) AS shares
                OPTIONAL MATCH (f)<-[:OFFERED_BY]-(l2:SeedListing)<-[:FOR_LISTING]-(ex2:ExchangeRequest {status: 'completed'})
                WHERE ex2.rating >= 4
                WITH f, shares, count(ex2) AS pos_ratings
                RETURN shares AS successful_shares, pos_ratings AS positive_ratings,
                       COALESCE(f.years_growing, 0) AS years_growing,
                       COALESCE(f.verification_tier, 'Unverified') AS verification_tier,
                       COALESCE(f.photo_evidence_count, 0) AS photo_evidence
                """,
                fid=farmer_id,
            )
            rec = result.single()
            if not rec:
                return None
            return dict(rec)


reputation_service = ReputationService()
