from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.auth import require_role
from app.models import User
from app.services.analytics_service import analytics_service
from app.services.gap_detection_service import gap_detection_service

router = APIRouter()


@router.get("/county/{county}")
def county_summary(
    county: str,
    start_date: Optional[str] = None, end_date: Optional[str] = None,
    user: User = Depends(require_role("institution", "admin")),
):
    return analytics_service.county_summary(county, start_date, end_date)


@router.get("/gaps/{county}")
def gap_report(county: str, user: User = Depends(require_role("institution", "admin"))):
    gaps = gap_detection_service.detect_gaps(county)
    return {"county": county, "gaps": gaps}


@router.get("/extinction-risk")
def extinction_risk(user: User = Depends(require_role("institution", "admin"))):
    return {"at_risk": analytics_service.extinction_risk()}


@router.get("/performance")
def variety_performance(user: User = Depends(require_role("institution", "admin"))):
    return {"varieties": analytics_service.variety_performance(anonymized=True)}


@router.get("/topology")
def network_topology(user: User = Depends(require_role("institution", "admin"))):
    return analytics_service.network_topology(anonymized=True)


@router.get("/demand")
def demand_signals(
    crop: Optional[str] = None, county: Optional[str] = None,
    user: User = Depends(require_role("seed_company", "admin")),
):
    return {"signals": analytics_service.demand_signals(crop, county)}
