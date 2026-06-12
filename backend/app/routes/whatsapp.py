import os
from fastapi import APIRouter, Request, Query
from fastapi.responses import PlainTextResponse
from app.services.whatsapp_service import whatsapp_service

router = APIRouter()
VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN", "mbegu_verify")


@router.get("/webhook")
def verify_webhook(hub_mode: str = Query(alias="hub.mode", default=""), hub_token: str = Query(alias="hub.verify_token", default=""), hub_challenge: str = Query(alias="hub.challenge", default="")):
    if hub_mode == "subscribe" and hub_token == VERIFY_TOKEN:
        return PlainTextResponse(content=hub_challenge)
    return PlainTextResponse(content="Forbidden", status_code=403)


@router.post("/webhook")
async def handle_webhook(request: Request):
    body = await request.json()
    entries = body.get("entry", [])
    for entry in entries:
        for change in entry.get("changes", []):
            messages = change.get("value", {}).get("messages", [])
            for msg in messages:
                phone = msg.get("from", "")
                if msg.get("type") == "text":
                    result = whatsapp_service.handle_text_message(phone, msg["text"]["body"])
                elif msg.get("type") == "audio":
                    audio_url = msg.get("audio", {}).get("url", "")
                    result = whatsapp_service.handle_voice_note(phone, audio_url)
                else:
                    continue
    return {"status": "ok"}
