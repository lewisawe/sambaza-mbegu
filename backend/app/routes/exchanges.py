from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.auth import require_role
from app.models import User
from app.services.exchange_service import exchange_service

router = APIRouter()


class ExchangeRequestBody(BaseModel):
    listing_id: str


class RatingBody(BaseModel):
    score: int
    comment: Optional[str] = None


def _check_error(result):
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=result.get("code", 400), detail=result["error"])
    return result


@router.post("")
def create_exchange(req: ExchangeRequestBody, user: User = Depends(require_role("farmer"))):
    return _check_error(exchange_service.create_request(user.neo4j_node_id, req.listing_id))


@router.put("/{request_id}/accept")
def accept_exchange(request_id: str, user: User = Depends(require_role("farmer"))):
    return _check_error(exchange_service.accept_request(request_id, user.neo4j_node_id))


@router.put("/{request_id}/decline")
def decline_exchange(request_id: str, user: User = Depends(require_role("farmer"))):
    return _check_error(exchange_service.decline_request(request_id, user.neo4j_node_id))


@router.put("/{request_id}/confirm")
def confirm_exchange(request_id: str, user: User = Depends(require_role("farmer"))):
    return _check_error(exchange_service.confirm_exchange(request_id, user.neo4j_node_id))


@router.post("/{request_id}/rate")
def rate_exchange(request_id: str, body: RatingBody, user: User = Depends(require_role("farmer"))):
    return _check_error(exchange_service.submit_rating(request_id, user.neo4j_node_id, body.score, body.comment))


@router.get("/history")
def exchange_history(user: User = Depends(require_role("farmer"))):
    return {"exchanges": exchange_service.get_farmer_history(user.neo4j_node_id)}
