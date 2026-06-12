import uuid
from datetime import datetime
from app.db import get_session


class ExchangeService:
    def create_request(self, requester_id: str, listing_id: str) -> dict:
        with get_session() as session:
            # Check listing is available
            check = session.run(
                "MATCH (l:SeedListing {id: $lid}) RETURN l.status AS status",
                lid=listing_id,
            ).single()
            if not check:
                return {"error": "Listing not found", "code": 404}
            if check["status"] != "available":
                return {"error": "Listing is not available", "code": 422}

            request_id = str(uuid.uuid4())
            result = session.run(
                """
                MATCH (l:SeedListing {id: $lid})-[:OFFERED_BY]->(owner:Farmer)
                MATCH (req:Farmer {id: $requester_id})
                CREATE (ex:ExchangeRequest {
                    id: $rid, status: 'pending', created_at: datetime($now),
                    requester_confirmed: false, owner_confirmed: false,
                    rating: null, rating_comment: null, rated_at: null
                })
                CREATE (ex)-[:FOR_LISTING]->(l)
                CREATE (ex)-[:REQUESTED_BY]->(req)
                RETURN ex {.*, requester_id: req.id, owner_id: owner.id,
                       listing_id: l.id, variety: l.variety_name} AS exchange
                """,
                lid=listing_id, requester_id=requester_id, rid=request_id, now=datetime.utcnow().isoformat(),
            )
            rec = result.single()
            return rec["exchange"] if rec else {"error": "Failed to create request", "code": 500}

    def accept_request(self, request_id: str, owner_id: str) -> dict:
        return self._update_status(request_id, owner_id, "pending", "accepted", is_owner=True)

    def decline_request(self, request_id: str, owner_id: str) -> dict:
        return self._update_status(request_id, owner_id, "pending", "declined", is_owner=True)

    def confirm_exchange(self, request_id: str, confirmer_id: str) -> dict:
        with get_session() as session:
            # Get exchange and determine role
            ex = session.run(
                """
                MATCH (e:ExchangeRequest {id: $rid})-[:FOR_LISTING]->(l)-[:OFFERED_BY]->(owner:Farmer)
                MATCH (e)-[:REQUESTED_BY]->(req:Farmer)
                RETURN e {.*} AS ex, owner.id AS owner_id, req.id AS requester_id
                """,
                rid=request_id,
            ).single()
            if not ex:
                return {"error": "Exchange not found", "code": 404}

            data = ex["ex"]
            if data["status"] not in ("accepted", "pending_confirmation"):
                return {"error": "Exchange not in confirmable state", "code": 422}

            is_owner = confirmer_id == ex["owner_id"]
            is_requester = confirmer_id == ex["requester_id"]
            if not is_owner and not is_requester:
                return {"error": "Not a party to this exchange", "code": 403}

            set_field = "owner_confirmed" if is_owner else "requester_confirmed"
            other_confirmed = data["requester_confirmed"] if is_owner else data["owner_confirmed"]

            if other_confirmed:
                # Both confirmed - complete and create graph edge
                session.run(
                    """
                    MATCH (e:ExchangeRequest {id: $rid})-[:FOR_LISTING]->(l)-[:OFFERED_BY]->(owner:Farmer)
                    MATCH (e)-[:REQUESTED_BY]->(req:Farmer)
                    MATCH (l)-[:OF_VARIETY]->(v:SeedVariety)
                    SET e.status = 'completed', e.""" + set_field + """ = true
                    CREATE (owner)-[:SHARED_WITH {date: datetime(), exchange_id: e.id, variety: v.name}]->(req)
                    RETURN e {.*, owner_id: owner.id, requester_id: req.id} AS exchange
                    """,
                    rid=request_id,
                )
                return {"status": "completed", "id": request_id}
            else:
                session.run(
                    "MATCH (e:ExchangeRequest {id: $rid}) SET e.status = 'pending_confirmation', e." + set_field + " = true",
                    rid=request_id,
                )
                return {"status": "pending_confirmation", "id": request_id}

    def submit_rating(self, request_id: str, rater_id: str, score: int, comment: str = None) -> dict:
        if score < 1 or score > 5:
            return {"error": "Rating must be 1-5", "code": 400}
        with get_session() as session:
            ex = session.run(
                """
                MATCH (e:ExchangeRequest {id: $rid})-[:REQUESTED_BY]->(req:Farmer)
                RETURN e.status AS status, e.rating AS rating, req.id AS requester_id
                """,
                rid=request_id,
            ).single()
            if not ex:
                return {"error": "Exchange not found", "code": 404}
            if ex["status"] != "completed":
                return {"error": "Can only rate completed exchanges", "code": 422}
            if ex["rating"] is not None:
                return {"error": "Already rated", "code": 409}
            if rater_id != ex["requester_id"]:
                return {"error": "Only requester can rate", "code": 403}

            session.run(
                """
                MATCH (e:ExchangeRequest {id: $rid})
                SET e.rating = $score, e.rating_comment = $comment, e.rated_at = datetime()
                """,
                rid=request_id, score=score, comment=comment,
            )
            return {"status": "rated", "score": score}

    def get_farmer_history(self, farmer_id: str) -> list:
        with get_session() as session:
            result = session.run(
                """
                MATCH (e:ExchangeRequest)-[:FOR_LISTING]->(l)-[:OFFERED_BY]->(owner:Farmer)
                MATCH (e)-[:REQUESTED_BY]->(req:Farmer)
                MATCH (l)-[:OF_VARIETY]->(v:SeedVariety)
                WHERE owner.id = $fid OR req.id = $fid
                RETURN e {.*, owner_id: owner.id, owner_name: owner.name,
                       requester_id: req.id, requester_name: req.name,
                       variety: v.name, crop: v.crop} AS exchange
                ORDER BY e.created_at DESC
                """,
                fid=farmer_id,
            )
            return [rec["exchange"] for rec in result]

    def _update_status(self, request_id: str, user_id: str, expected_status: str, new_status: str, is_owner: bool) -> dict:
        match_clause = "[:OFFERED_BY]->(actor:Farmer {id: $uid})" if is_owner else "[:REQUESTED_BY]->(actor:Farmer {id: $uid})"
        with get_session() as session:
            result = session.run(
                f"""
                MATCH (e:ExchangeRequest {{id: $rid, status: $expected}})-[:FOR_LISTING]->(l)-{match_clause}
                SET e.status = $new_status
                RETURN e {{.*}} AS exchange
                """,
                rid=request_id, uid=user_id, expected=expected_status, new_status=new_status,
            )
            rec = result.single()
            if not rec:
                return {"error": "Exchange not found or wrong state", "code": 404}
            return rec["exchange"]


exchange_service = ExchangeService()
