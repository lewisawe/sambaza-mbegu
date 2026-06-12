from fastapi import APIRouter, Form
from fastapi.responses import PlainTextResponse
from app.services.ussd_service import ussd_service

router = APIRouter()


@router.post("/callback")
def ussd_callback(
    sessionId: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form(default=""),
):
    result = ussd_service.handle_callback(sessionId, phoneNumber, text)
    return PlainTextResponse(content=result["response"])
