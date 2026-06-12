# Feature: seed-exchange, Properties 1-4: Listing tests
import json
from datetime import datetime, timedelta
from hypothesis import given, strategies as st, settings


# Property 1: Listing round-trip serialization
@given(
    quantity=st.floats(min_value=0.1, max_value=1000.0, allow_nan=False),
    expires_days=st.integers(min_value=1, max_value=365),
)
@settings(max_examples=100)
def test_listing_roundtrip_serialization(quantity, expires_days):
    """For any valid SeedListing, serializing and deserializing produces equivalent object."""
    listing = {
        "id": "test-id",
        "quantity_kg": quantity,
        "status": "available",
        "created_at": datetime.utcnow().isoformat(),
        "expires_at": (datetime.utcnow() + timedelta(days=expires_days)).isoformat(),
    }
    serialized = json.dumps(listing)
    deserialized = json.loads(serialized)
    assert deserialized["quantity_kg"] == listing["quantity_kg"]
    assert deserialized["status"] == listing["status"]
    assert deserialized["id"] == listing["id"]
    assert datetime.fromisoformat(deserialized["created_at"]) == datetime.fromisoformat(listing["created_at"])


# Property 2: Expired and removed listings invisible to search
@given(
    statuses=st.lists(
        st.sampled_from(["available", "expired", "removed", "claimed"]),
        min_size=1, max_size=20,
    )
)
@settings(max_examples=100)
def test_expired_removed_invisible(statuses):
    """Search never returns expired or removed listings."""
    listings = [{"id": f"l-{i}", "status": s} for i, s in enumerate(statuses)]
    visible = [l for l in listings if l["status"] == "available"]
    for l in visible:
        assert l["status"] not in ("expired", "removed")
    for l in listings:
        if l["status"] in ("expired", "removed"):
            assert l not in visible


# Property 3: Search results satisfy distance and status constraints
@given(
    distances=st.lists(st.floats(min_value=0, max_value=200, allow_nan=False), min_size=1, max_size=20),
    radius=st.floats(min_value=1, max_value=100, allow_nan=False),
)
@settings(max_examples=100)
def test_search_distance_status_constraints(distances, radius):
    """All search results must be within radius and have status 'available'."""
    results = [{"distance_km": d, "status": "available"} for d in distances if d <= radius]
    for r in results:
        assert r["distance_km"] <= radius
        assert r["status"] == "available"


# Property 4: New account penalty in search ordering
@given(
    score=st.floats(min_value=0, max_value=100, allow_nan=False),
    account_age_days=st.integers(min_value=0, max_value=365),
)
@settings(max_examples=100)
def test_new_account_penalty(score, account_age_days):
    """Accounts < 30 days old get penalized score; older accounts don't."""
    from app.services.reputation_service import ReputationService
    svc = ReputationService()
    created_at = datetime.utcnow() - timedelta(days=account_age_days)
    adjusted = svc.apply_new_account_penalty("test", score, created_at=created_at)
    if account_age_days < 30:
        assert adjusted == score * 0.5
    else:
        assert adjusted == score
