from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.auth import require_role
from app.models import User
from app.services.verification_service import verification_service

router = APIRouter()


class VerificationReportBody(BaseModel):
    farmer_id: str
    varieties_observed: list[str] = []
    notes: str = ""


class GrowingRecordBody(BaseModel):
    farm_id: str
    variety_id: str
    season: dict
    yield_kg: float


class BulkReportBody(BaseModel):
    reports: list[dict]


def _check_error(result):
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=result.get("code", 400), detail=result["error"])
    return result


@router.post("/report")
def submit_report(body: VerificationReportBody, user: User = Depends(require_role("extension_worker"))):
    return _check_error(verification_service.submit_report(
        user.neo4j_node_id, body.farmer_id, body.varieties_observed, body.notes
    ))


@router.post("/bulk")
def bulk_submit(body: BulkReportBody, user: User = Depends(require_role("extension_worker"))):
    return {"results": verification_service.bulk_submit(user.neo4j_node_id, body.reports)}


@router.post("/growing-record")
def submit_growing_record(body: GrowingRecordBody, user: User = Depends(require_role("extension_worker"))):
    return _check_error(verification_service.submit_growing_record(
        user.neo4j_node_id, body.farm_id, body.variety_id, body.season, body.yield_kg
    ))
