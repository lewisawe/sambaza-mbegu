# Feature: seed-exchange, Property 24: Alert matching correctness
from hypothesis import given, strategies as st, settings

CROPS = ["sorghum", "millet", "cowpea", "maize", "beans", "pigeon pea"]
COUNTIES = ["machakos", "kitui", "makueni", "meru", "embu"]


# Property 24: Alert matching correctness
@given(
    listing_crop=st.sampled_from(CROPS),
    listing_county=st.sampled_from(COUNTIES),
    search_history=st.lists(
        st.fixed_dictionaries({
            "farmer_id": st.text(min_size=5, max_size=10, alphabet="abcdef0123456789"),
            "crop": st.sampled_from(CROPS),
            "county": st.sampled_from(COUNTIES),
        }),
        min_size=0, max_size=20,
    ),
)
@settings(max_examples=100)
def test_alert_matching_correctness(listing_crop, listing_county, search_history):
    """Farmers who searched for the listed crop in the same county get alerted; others don't."""
    should_alert = [
        s for s in search_history
        if s["crop"] == listing_crop and s["county"] == listing_county
    ]
    should_not_alert = [
        s for s in search_history
        if s["crop"] != listing_crop or s["county"] != listing_county
    ]
    alerted_ids = {s["farmer_id"] for s in should_alert}
    not_alerted_ids = {s["farmer_id"] for s in should_not_alert} - alerted_ids

    for s in should_alert:
        assert s["farmer_id"] in alerted_ids
    for fid in not_alerted_ids:
        assert fid not in alerted_ids
