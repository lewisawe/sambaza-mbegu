import json
from app.redis_client import redis_client
from app.db import get_session

SESSION_TTL = 60


class USSDService:
    def handle_callback(self, session_id: str, phone: str, text: str) -> dict:
        """Process AT USSD callback. Returns {"response": str, "end": bool}."""
        state = self.get_session_state(session_id)
        if not state:
            state = {"session_id": session_id, "phone": phone, "menu_path": [], "selections": {}}

        # AT sends cumulative input separated by *
        inputs = text.split("*") if text else []

        if not inputs or inputs == [""]:
            # Initial request - show main menu
            self.save_session_state(session_id, state)
            return {"response": "CON Welcome to Sambaza Mbegu\n1. Find Seeds\n2. Share Seeds\n3. My Seeds\n4. Register", "end": False}

        level = len(inputs)
        choice = inputs[-1] if inputs else ""

        if level == 1:
            return self._handle_level1(session_id, state, choice)
        elif level == 2:
            return self._handle_level2(session_id, state, inputs, choice)
        elif level == 3:
            return self._handle_level3(session_id, state, inputs)

        return {"response": "END Thank you for using Sambaza Mbegu.", "end": True}

    def _handle_level1(self, session_id, state, choice):
        if choice == "1":
            state["menu_path"] = [1]
            self.save_session_state(session_id, state)
            return {"response": "CON Find Seeds by:\n1. Sorghum\n2. Millet\n3. Cowpea\n4. Green Gram\n5. Pigeon Pea", "end": False}
        elif choice == "2":
            state["menu_path"] = [2]
            self.save_session_state(session_id, state)
            return {"response": "CON Share Seeds:\n1. Sorghum\n2. Millet\n3. Cowpea\n4. Green Gram\n5. Pigeon Pea", "end": False}
        elif choice == "3":
            listings = self._get_farmer_listings(state["phone"])
            if listings:
                lines = "\n".join([f"{i+1}. {l}" for i, l in enumerate(listings)])
                return {"response": f"END Your listings:\n{lines}", "end": True}
            return {"response": "END You have no active listings.", "end": True}
        elif choice == "4":
            return {"response": "END Registration: Please use SMS or web. Dial *384*738# again after registering.", "end": True}
        return {"response": "END Invalid choice.", "end": True}

    def _handle_level2(self, session_id, state, inputs, choice):
        crops = {"1": "sorghum", "2": "millet", "3": "cowpea", "4": "green gram", "5": "pigeon pea"}
        crop = crops.get(choice, "sorghum")
        state["selections"]["crop"] = crop

        if inputs[0] == "1":  # Find Seeds
            growers = self.find_seeds_by_crop(crop, state["phone"])
            if growers:
                lines = "\n".join([f"{g['name']} - {g['phone']}" for g in growers[:3]])
                return {"response": f"END Growers with {crop}:\n{lines}", "end": True}
            return {"response": f"END No {crop} growers found near you.", "end": True}
        elif inputs[0] == "2":  # Share Seeds
            state["menu_path"] = [2, int(choice)]
            self.save_session_state(session_id, state)
            return {"response": f"CON List your {crop} seeds for sharing?\n1. Yes\n2. No", "end": False}
        return {"response": "END Invalid choice.", "end": True}

    def _handle_level3(self, session_id, state, inputs):
        if inputs[0] == "2" and inputs[2] == "1":  # Confirm share
            crop = state["selections"].get("crop", "seeds")
            return {"response": f"END Your {crop} has been listed for 90 days. Farmers can now find you.", "end": True}
        return {"response": "END Cancelled.", "end": True}

    def find_seeds_by_crop(self, crop: str, phone: str) -> list:
        with get_session() as session:
            result = session.run(
                """
                MATCH (l:SeedListing {status: 'available'})-[:OFFERED_BY]->(f:Farmer), (l)-[:OF_VARIETY]->(v:SeedVariety)
                WHERE v.crop = $crop
                RETURN f.name AS name, f.phone AS phone, v.name AS variety
                LIMIT 3
                """,
                crop=crop,
            )
            return [dict(rec) for rec in result]

    def get_session_state(self, session_id: str) -> dict:
        data = redis_client.get(f"ussd:{session_id}")
        return json.loads(data) if data else None

    def save_session_state(self, session_id: str, state: dict) -> None:
        redis_client.setex(f"ussd:{session_id}", SESSION_TTL, json.dumps(state))

    def _get_farmer_listings(self, phone: str) -> list:
        with get_session() as session:
            result = session.run(
                """
                MATCH (l:SeedListing {status: 'available'})-[:OFFERED_BY]->(f:Farmer {phone: $phone}), (l)-[:OF_VARIETY]->(v:SeedVariety)
                RETURN v.name AS variety, l.quantity_kg AS qty
                """,
                phone=phone,
            )
            return [f"{rec['variety']} ({rec['qty']}kg)" for rec in result]


ussd_service = USSDService()
