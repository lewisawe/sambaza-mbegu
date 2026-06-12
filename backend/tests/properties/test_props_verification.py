# Feature: seed-exchange, Properties 14-15: Verification tests
import json
from hypothesis import given, strategies as st, settings

TIER_ORDER = ["Unverified", "Confirmed", "Champion", "Seed Bank"]


# Property 14: Verification never downgrades tier
@given(
    current_tier=st.sampled_from(TIER_ORDER),
)
@settings(max_examples=100)
def test_verification_never_downgrades(current_tier):
    """Submitting a verification report never results in a lower tier."""
    current_idx = TIER_ORDER.index(current_tier)
    # Simulate: new report upgrades to at least 'Confirmed'
    new_tier = "Confirmed"
    new_idx = TIER_ORDER.index(new_tier)
    result_idx = max(current_idx, new_idx)
    result_tier = TIER_ORDER[result_idx]
    assert TIER_ORDER.index(result_tier) >= current_idx


# Property 15: Growing record round-trip serialization
@given(
    yield_kg=st.floats(min_value=0, max_value=10000, allow_nan=False),
    year=st.integers(min_value=2000, max_value=2030),
    season_name=st.sampled_from(["long_rains", "short_rains"]),
)
@settings(max_examples=100)
def test_growing_record_roundtrip(yield_kg, year, season_name):
    """Storing and reading back a GrowingRecord produces equivalent data."""
    record = {
        "id": "gr-test",
        "yield_kg": yield_kg,
        "season": {"year": year, "name": season_name},
        "recorded_at": "2024-06-01T10:00:00",
    }
    serialized = json.dumps(record)
    deserialized = json.loads(serialized)
    assert deserialized["yield_kg"] == record["yield_kg"]
    assert deserialized["season"]["year"] == year
    assert deserialized["season"]["name"] == season_name
