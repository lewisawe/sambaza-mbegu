from app.db import get_session


class AntiGamingService:
    def check_velocity(self, farmer_id: str) -> bool:
        """Returns True if farmer has >10 confirmations in 7 days (suspicious)."""
        with get_session() as session:
            result = session.run(
                """
                MATCH (f:Farmer {id: $fid})<-[:OFFERED_BY]-(l)<-[:FOR_LISTING]-(e:ExchangeRequest {status: 'completed'})
                WHERE e.created_at > datetime() - duration({days: 7})
                RETURN count(e) AS cnt
                """,
                fid=farmer_id,
            ).single()
            return result["cnt"] > 10

    def check_pair_frequency(self, farmer_a: str, farmer_b: str) -> bool:
        """Returns True if pair has >3 exchanges in 30 days (suspicious)."""
        with get_session() as session:
            result = session.run(
                """
                MATCH (a:Farmer {id: $a})<-[:OFFERED_BY]-(l)<-[:FOR_LISTING]-(e:ExchangeRequest {status: 'completed'})-[:REQUESTED_BY]->(b:Farmer {id: $b})
                WHERE e.created_at > datetime() - duration({days: 30})
                WITH count(e) AS cnt1
                MATCH (b2:Farmer {id: $b})<-[:OFFERED_BY]-(l2)<-[:FOR_LISTING]-(e2:ExchangeRequest {status: 'completed'})-[:REQUESTED_BY]->(a2:Farmer {id: $a})
                WHERE e2.created_at > datetime() - duration({days: 30})
                RETURN cnt1 + count(e2) AS total
                """,
                a=farmer_a, b=farmer_b,
            ).single()
            return result["total"] > 3

    def flag_account(self, farmer_id: str, reason: str) -> None:
        with get_session() as session:
            session.run(
                "MATCH (f:Farmer {id: $fid}) SET f.flagged = true, f.flagged_reason = $reason",
                fid=farmer_id, reason=reason,
            )

    def is_flagged(self, farmer_id: str) -> bool:
        with get_session() as session:
            result = session.run(
                "MATCH (f:Farmer {id: $fid}) RETURN COALESCE(f.flagged, false) AS flagged",
                fid=farmer_id,
            ).single()
            return result["flagged"] if result else False


anti_gaming_service = AntiGamingService()
