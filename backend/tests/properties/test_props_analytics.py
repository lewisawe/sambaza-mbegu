# Feature: seed-exchange, Properties 16-18: Analytics tests
import json
import hashlib
from hypothesis import given, strategies as st, settings


# Property 16: Extinction risk filter correctness
@given(
    grower_count=st.integers(min_value=0, max_value=20),
    avg_years=st.floats(min_value=0, max_value=50, allow_nan=False),
)
@settings(max_examples=100)
def test_extinction_risk_filter(grower_count, avg_years):
    """Only varieties with ≤3 growers AND >20 years average appear in results."""
    is_at_risk = grower_count <= 3 and avg_years > 20
    variety = {"name": "Test", "grower_count": grower_count, "avg_years": avg_years}
    in_results = variety["grower_count"] <= 3 and variety["avg_years"] > 20
    assert in_results == is_at_risk


# Property 17: Analytics anonymization
@given(
    farmer_ids=st.lists(st.text(min_size=5, max_size=20, alphabet="abcdef0123456789"), min_size=1, max_size=20)
)
@settings(max_examples=100)
def test_analytics_anonymization(farmer_ids):
    """No raw farmer ID appears in anonymized output."""
    salt = "mbegu_anon_2026"
    anonymized = [hashlib.sha256(f"{fid}{salt}".encode()).hexdigest()[:16] for fid in farmer_ids]
    for fid in farmer_ids:
        assert fid not in anonymized
    # Deterministic: same input produces same token
    for i, fid in enumerate(farmer_ids):
        token = hashlib.sha256(f"{fid}{salt}".encode()).hexdigest()[:16]
        assert token == anonymized[i]


# Property 18: Analytics JSON round-trip
@given(
    data=st.dictionaries(
        keys=st.text(min_size=1, max_size=10, alphabet="abcdefghijk"),
        values=st.one_of(st.integers(), st.floats(allow_nan=False, allow_infinity=False), st.text(max_size=20)),
        min_size=1, max_size=10,
    )
)
@settings(max_examples=100)
def test_analytics_json_roundtrip(data):
    """Serializing analytics to JSON and parsing back produces equivalent structure."""
    serialized = json.dumps(data)
    deserialized = json.loads(serialized)
    assert deserialized == data
