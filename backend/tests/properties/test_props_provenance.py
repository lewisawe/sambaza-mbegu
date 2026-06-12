# Feature: seed-exchange, Property 22: Provenance chain serialization round-trip
import json
from hypothesis import given, strategies as st, settings
from app.services.provenance_story_service import ProvenanceStoryService

svc = ProvenanceStoryService()


# Property 22: Provenance chain serialization round-trip
@given(
    chain=st.lists(
        st.fixed_dictionaries({
            "grower": st.text(min_size=1, max_size=20, alphabet="abcdefghijklmnopqrstuvwxyz "),
            "county": st.sampled_from(["Machakos", "Kitui", "Makueni", "Meru", "Embu"]),
            "years": st.integers(min_value=1, max_value=40),
            "shared_date": st.none() | st.just("2024-03-15T10:00:00"),
            "recipient": st.none() | st.text(min_size=1, max_size=20, alphabet="abcdefghijklmnopqrstuvwxyz "),
        }),
        min_size=1, max_size=10,
    )
)
@settings(max_examples=100)
def test_provenance_chain_roundtrip(chain):
    """Serializing provenance chain to JSON and parsing back produces original structure."""
    serialized = svc.serialize_chain_for_llm(chain)
    deserialized = svc.parse_chain_json(serialized)
    assert deserialized == chain
