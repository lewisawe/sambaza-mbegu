import os
import re
from dataclasses import dataclass
from typing import Optional
import httpx
from app.db import get_session

AT_API_KEY = os.getenv("AT_API_KEY", "")
AT_USERNAME = os.getenv("AT_USERNAME", "sandbox")
AT_SMS_URL = "https://api.africastalking.com/version1/messaging"


@dataclass
class SMSIntent:
    command: str  # SEED, SHARE, STOP, RENEW
    crop: Optional[str] = None
    county: Optional[str] = None


class SMSService:
    def parse_message(self, text: str) -> SMSIntent:
        text = text.strip().upper()
        parts = re.split(r'\s+', text)
        command = parts[0] if parts else ""
        if command == "SEED":
            # Last token is county if we have 3+ parts and last part looks like a county
            # Convention: SEED CROP COUNTY or SEED CROP1 CROP2 COUNTY
            remaining = parts[1:]
            if len(remaining) >= 2:
                county = remaining[-1].lower()
                crop = " ".join(remaining[:-1]).lower()
            elif len(remaining) == 1:
                crop = remaining[0].lower()
                county = None
            else:
                crop, county = None, None
            return SMSIntent(command="SEED", crop=crop, county=county)
        elif command == "SHARE" and len(parts) >= 2:
            crop = " ".join(parts[1:]).lower()
            return SMSIntent(command="SHARE", crop=crop)
        elif command == "STOP":
            return SMSIntent(command="STOP")
        elif command == "RENEW":
            return SMSIntent(command="RENEW")
        return SMSIntent(command="UNKNOWN")

    def format_message(self, intent: SMSIntent) -> str:
        if intent.command == "SEED":
            parts = ["SEED"]
            if intent.crop:
                parts.append(intent.crop.upper())
            if intent.county:
                parts.append(intent.county.upper())
            return " ".join(parts)
        elif intent.command == "SHARE":
            return f"SHARE {intent.crop.upper()}" if intent.crop else "SHARE"
        elif intent.command in ("STOP", "RENEW"):
            return intent.command
        return ""

    def handle_inbound(self, phone: str, text: str) -> str:
        intent = self.parse_message(text)
        if intent.command == "SEED":
            return self._handle_search(phone, intent)
        elif intent.command == "SHARE":
            return self._handle_share(phone, intent)
        elif intent.command == "STOP":
            return "You have been unsubscribed from Sambaza Mbegu alerts."
        elif intent.command == "RENEW":
            return "Your seed listing has been renewed for 90 days."
        return "Unknown command. Send SEED [crop] [county] to search, SHARE [crop] to list, STOP to unsubscribe."

    def _handle_search(self, phone: str, intent: SMSIntent) -> str:
        with get_session() as session:
            crop_filter = "AND v.crop = $crop" if intent.crop else ""
            county_filter = "AND f.county = $county" if intent.county else ""
            result = session.run(
                f"""
                MATCH (l:SeedListing {{status: 'available'}})-[:OFFERED_BY]->(f:Farmer), (l)-[:OF_VARIETY]->(v:SeedVariety)
                WHERE 1=1 {crop_filter} {county_filter}
                RETURN f.name AS name, f.phone AS phone, v.name AS variety, f.county AS county
                LIMIT 3
                """,
                crop=intent.crop, county=intent.county,
            )
            growers = [dict(rec) for rec in result]
        if not growers:
            return f"No growers found for {intent.crop or 'seeds'} in {intent.county or 'your area'}."
        lines = [f"{g['name']} ({g['phone']}) - {g['variety']} in {g['county']}" for g in growers]
        return f"{len(growers)} growers found:\n" + "\n".join(lines)

    def _handle_share(self, phone: str, intent: SMSIntent) -> str:
        return f"Your {intent.crop} seeds are now listed for sharing. Others can find you via SEED {intent.crop.upper()}."

    def send_response(self, phone: str, message: str) -> bool:
        if not AT_API_KEY:
            return False
        resp = httpx.post(
            AT_SMS_URL,
            headers={"apiKey": AT_API_KEY, "Accept": "application/json"},
            data={"username": AT_USERNAME, "to": phone, "message": message},
        )
        return resp.status_code == 201

    def send_bulk_alerts(self, recipients: list, template: str, params: dict) -> int:
        sent = 0
        for phone in recipients:
            msg = template.format(**params)
            if self.send_response(phone, msg):
                sent += 1
        return sent


sms_service = SMSService()
