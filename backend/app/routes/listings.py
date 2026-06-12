from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from app.auth import require_role
from app.models import User
from app.services.listing_service import listing_service

router = APIRouter()


class CreateListingRequest(BaseModel):
    variety_id: str
    quantity_kg: float
    expires_days: int = 90


@router.post("")
def create_listing(req: CreateListingRequest, user: User = Depends(require_role("farmer"))):
    if req.quantity_kg <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be positive")
    listing = listing_service.create_listing(
        farmer_id=user.neo4j_node_id, variety_id=req.variety_id,
        quantity_kg=req.quantity_kg, expires_days=req.expires_days,
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Farmer or variety not found in graph")
    return listing


@router.delete("/{listing_id}")
def remove_listing(listing_id: str, user: User = Depends(require_role("farmer"))):
    removed = listing_service.remove_listing(listing_id, user.neo4j_node_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Listing not found or not owned by you")
    return {"status": "removed"}


@router.get("/search")
def search_listings(
    lat: float = Query(...), lng: float = Query(...),
    radius_km: float = Query(default=30),
    crop: str = Query(default=None), trait: str = Query(default=None),
):
    results = listing_service.search_listings(lat, lng, radius_km, crop, trait)
    return {"listings": results, "count": len(results)}
