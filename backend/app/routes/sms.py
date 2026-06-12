from fastapi import APIRouter, Form
from app.services.sms_service import sms_service

router = APIRouter()


@router.post("/callback")
def sms_callback(from_: str = Form(alias="from"), text: str = Form(...)):
    response_text = sms_service.handle_inbound(from_, text)
    sms_service.send_response(from_, response_text)
    return {"status": "ok"}
