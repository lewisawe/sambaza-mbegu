import uuid
from datetime import datetime
from sqlalchemy import text
from app.postgres import SessionLocal
from app.models import Alert
from app.db import get_session
from app.services.sms_service import sms_service


class AlertService:
    def check_availability_matches(self, listing_crop: str, listing_county: str) -> list:
        """When a new listing is created, find farmers who previously searched for this crop."""
        db = SessionLocal()
        try:
            result = db.execute(
                text("""
                    SELECT DISTINCT sl.farmer_id, u.phone
                    FROM search_logs sl JOIN users u ON sl.farmer_id = u.id
                    WHERE sl.query_crop = :crop AND sl.query_county = :county
                """),
                {"crop": listing_crop, "county": listing_county},
            )
            alerts = []
            for row in result:
                alert = Alert(
                    id=str(uuid.uuid4()), type="availability",
                    recipient_id=row[0],
                    message=f"A farmer near you just listed {listing_crop} seeds! Search again to connect.",
                    channel="sms", created_at=datetime.utcnow(),
                )
                db.add(alert)
                alerts.append({"phone": row[1], "message": alert.message})
            db.commit()
            return alerts
        finally:
            db.close()

    def check_planting_windows(self, weather_data: dict) -> list:
        """Check rainfall data and notify farmers in zones where season is starting."""
        alerts = []
        zone = weather_data.get("zone", "")
        season_start = weather_data.get("season_start", False)
        if not season_start:
            return []
        with get_session() as session:
            result = session.run(
                """
                MATCH (f:Farmer {county: $zone})-[:GROWS]->(v:SeedVariety)
                RETURN DISTINCT f.phone AS phone, v.crop AS crop
                """,
                zone=zone,
            )
            for rec in result:
                alerts.append({
                    "phone": rec["phone"],
                    "message": f"{rec['crop']} planting season starting in {zone}. Dial *384*738# to find varieties.",
                    "type": "planting_window",
                })
        return alerts

    def check_sharing_reminders(self) -> list:
        """Find farmers whose crops are approaching harvest time and remind them to list surplus."""
        alerts = []
        with get_session() as session:
            result = session.run(
                """
                MATCH (f:Farmer)-[:GROWS]->(v:SeedVariety)
                WHERE NOT EXISTS { MATCH (l:SeedListing {status: 'available'})-[:OFFERED_BY]->(f), (l)-[:OF_VARIETY]->(v) }
                RETURN f.phone AS phone, v.crop AS crop, f.county AS county
                LIMIT 50
                """
            )
            for rec in result:
                alerts.append({
                    "phone": rec["phone"],
                    "message": f"Do you have surplus {rec['crop']} seeds? List them to help nearby farmers. Send: SHARE {rec['crop'].upper()}",
                    "type": "sharing_reminder",
                })
        return alerts

    def check_weather_risks(self, weather_data: dict) -> list:
        """When drought probability > 60%, suggest drought-resistant varieties."""
        alerts = []
        zone = weather_data.get("zone", "")
        drought_prob = weather_data.get("drought_probability", 0)
        if drought_prob <= 60:
            return []
        with get_session() as session:
            # Find drought-resistant varieties nearby
            result = session.run(
                """
                MATCH (v:SeedVariety)-[:HAS_TRAIT]->(t:Trait {name: 'drought-tolerant'})
                MATCH (f:Farmer)-[:GROWS]->(v)
                WHERE f.county = $zone
                RETURN v.name AS variety, v.crop AS crop, f.county AS county
                LIMIT 3
                """,
                zone=zone,
            )
            varieties = [dict(rec) for rec in result]
            # Find farmers in the zone to alert
            farmers = session.run(
                "MATCH (f:Farmer {county: $zone}) RETURN f.phone AS phone",
                zone=zone,
            )
            for f in farmers:
                msg = f"Drought risk >{drought_prob}% in {zone}."
                if varieties:
                    msg += f" Drought-resistant {varieties[0]['crop']} available nearby."
                alerts.append({"phone": f["phone"], "message": msg, "type": "weather_risk"})
        return alerts

    def dispatch_alerts(self, alerts: list) -> int:
        sent = 0
        for a in alerts:
            if sms_service.send_response(a["phone"], a["message"]):
                sent += 1
        return sent


alert_service = AlertService()
