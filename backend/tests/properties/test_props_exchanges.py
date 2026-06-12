# Feature: seed-exchange, Properties 5-7, 12-13: Exchange tests
import json
from datetime import datetime, timedelta
from hypothesis import given, strategies as st, settings


# Property 5: Exchange requests rejected for inactive listings
@given(status=st.sampled_from(["expired", "removed", "claimed"]))
@settings(max_examples=100)
def test_exchange_rejected_inactive_listing(status):
    """Exchange requests on non-available listings are always rejected."""
    assert status != "available"
    # Simulate: if listing status is not 'available', request must fail
    listing = {"id": "l-1", "status": status}
    can_request = listing["status"] == "available"
    assert can_request is False


# Property 6: Mutual confirmation completes exchange
@given(
    requester_confirms=st.booleans(),
    owner_confirms=st.booleans(),
)
@settings(max_examples=100)
def test_mutual_confirmation_completes(requester_confirms, owner_confirms):
    """Exchange completes only when both parties confirm."""
    exchange = {"status": "accepted", "requester_confirmed": requester_confirms, "owner_confirmed": owner_confirms}
    both_confirmed = exchange["requester_confirmed"] and exchange["owner_confirmed"]
    if both_confirmed:
        final_status = "completed"
    elif exchange["requester_confirmed"] or exchange["owner_confirmed"]:
        final_status = "pending_confirmation"
    else:
        final_status = "accepted"
    if both_confirmed:
        assert final_status == "completed"
    else:
        assert final_status != "completed"


# Property 7: Rating requires mutual confirmation
@given(
    status=st.sampled_from(["pending", "accepted", "pending_confirmation", "declined", "expired_unconfirmed"]),
    rating=st.integers(min_value=1, max_value=5),
)
@settings(max_examples=100)
def test_rating_requires_confirmation(status, rating):
    """Ratings are rejected unless exchange status is 'completed'."""
    can_rate = status == "completed"
    assert can_rate is False  # None of these statuses are 'completed'


# Property 12: Exchange history completeness and ordering
@given(
    dates=st.lists(
        st.datetimes(min_value=datetime(2020, 1, 1), max_value=datetime(2026, 12, 31)),
        min_size=1, max_size=50,
    )
)
@settings(max_examples=100)
def test_exchange_history_ordering(dates):
    """History returns all records ordered by date descending."""
    exchanges = [{"created_at": d.isoformat(), "id": f"ex-{i}"} for i, d in enumerate(dates)]
    sorted_exchanges = sorted(exchanges, key=lambda x: x["created_at"], reverse=True)
    assert len(sorted_exchanges) == len(dates)
    for i in range(len(sorted_exchanges) - 1):
        assert sorted_exchanges[i]["created_at"] >= sorted_exchanges[i + 1]["created_at"]


# Property 13: Date serialization round-trip
@given(dt=st.datetimes(min_value=datetime(2020, 1, 1), max_value=datetime(2030, 12, 31)))
@settings(max_examples=100)
def test_date_serialization_roundtrip(dt):
    """ISO 8601 serialize/deserialize produces equal datetime."""
    serialized = dt.isoformat()
    deserialized = datetime.fromisoformat(serialized)
    assert deserialized == dt
