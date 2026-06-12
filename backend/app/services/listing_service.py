import uuid
from datetime import datetime, timedelta
from app.db import get_session


class ListingService:
    def create_listing(self, farmer_id: str, variety_id: str, quantity_kg: float, expires_days: int = 90) -> dict:
        listing_id = str(uuid.uuid4())
        now = datetime.utcnow()
        expires_at = now + timedelta(days=expires_days)
        with get_session() as session:
            result = session.run(
                """
                MATCH (f:Farmer {id: $farmer_id}), (v:SeedVariety {id: $variety_id})
                CREATE (l:SeedListing {
                    id: $listing_id, quantity_kg: $quantity_kg, status: 'available',
                    created_at: datetime($created_at), expires_at: datetime($expires_at)
                })
                CREATE (l)-[:OFFERED_BY]->(f)
                CREATE (l)-[:OF_VARIETY]->(v)
                RETURN l {.*, farmer_id: f.id, variety_id: v.id, variety_name: v.name, crop: v.crop} AS listing
                """,
                farmer_id=farmer_id, variety_id=variety_id, listing_id=listing_id,
                quantity_kg=quantity_kg, created_at=now.isoformat(), expires_at=expires_at.isoformat(),
            )
            record = result.single()
            if not record:
                return None
            return record["listing"]

    def remove_listing(self, listing_id: str, farmer_id: str) -> bool:
        with get_session() as session:
            result = session.run(
                """
                MATCH (l:SeedListing {id: $listing_id})-[:OFFERED_BY]->(f:Farmer {id: $farmer_id})
                SET l.status = 'removed'
                RETURN l.id AS id
                """,
                listing_id=listing_id, farmer_id=farmer_id,
            )
            return result.single() is not None

    def expire_stale_listings(self) -> int:
        with get_session() as session:
            result = session.run(
                """
                MATCH (l:SeedListing)
                WHERE l.status = 'available' AND l.expires_at < datetime()
                SET l.status = 'expired'
                RETURN count(l) AS expired_count
                """
            )
            return result.single()["expired_count"]

    def search_listings(self, lat: float, lng: float, radius_km: float, crop: str = None, trait: str = None) -> list:
        crop_filter = "AND v.crop = $crop" if crop else ""
        trait_filter = "AND v.traits CONTAINS $trait" if trait else ""
        with get_session() as session:
            result = session.run(
                f"""
                MATCH (l:SeedListing)-[:OFFERED_BY]->(f:Farmer), (l)-[:OF_VARIETY]->(v:SeedVariety)
                WHERE l.status = 'available'
                AND point.distance(point({{latitude: f.lat, longitude: f.lng}}), point({{latitude: $lat, longitude: $lng}})) <= $radius_m
                {crop_filter} {trait_filter}
                WITH l, f, v,
                     point.distance(point({{latitude: f.lat, longitude: f.lng}}), point({{latitude: $lat, longitude: $lng}})) AS dist
                OPTIONAL MATCH (f)<-[:OFFERED_BY]-(prev:SeedListing)<-[:FOR_LISTING]-(ex:ExchangeRequest {{status: 'completed'}})
                WITH l, f, v, dist, count(ex) AS shares
                RETURN l {{.*, farmer_id: f.id, farmer_name: f.name, farmer_phone: f.phone,
                       variety_name: v.name, crop: v.crop, distance_m: dist,
                       farmer_flagged: COALESCE(f.flagged, false),
                       farmer_created_at: f.created_at,
                       reputation_score: COALESCE(f.reputation_score, 0)}} AS listing
                ORDER BY listing.reputation_score DESC
                """,
                lat=lat, lng=lng, radius_m=radius_km * 1000,
                crop=crop, trait=trait,
            )
            return [record["listing"] for record in result]


listing_service = ListingService()
