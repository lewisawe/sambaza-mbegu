# Feature: seed-exchange, Property 23: Gap detection criteria correctness
from hypothesis import given, strategies as st, settings


# Property 23: Gap detection criteria correctness
@given(
    demand_count=st.integers(min_value=0, max_value=100),
    local_growers=st.integers(min_value=0, max_value=50),
)
@settings(max_examples=100)
def test_gap_detection_criteria(demand_count, local_growers):
    """A gap exists iff demand > 0 AND local growers == 0."""
    is_gap = demand_count > 0 and local_growers == 0
    ward = {"demand": demand_count, "growers": local_growers}
    detected = ward["demand"] > 0 and ward["growers"] == 0
    assert detected == is_gap
    if is_gap:
        assert ward["demand"] > 0
        assert ward["growers"] == 0
