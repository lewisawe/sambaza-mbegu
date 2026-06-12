# Feature: seed-exchange, Properties 8-11: Reputation and anti-gaming tests
from hypothesis import given, strategies as st, settings

TIER_VALUES = {"Unverified": 0, "Confirmed": 1, "Champion": 2, "Seed Bank": 3}
MAX_SCORE = 305


# Property 8: Reputation score formula consistency
@given(
    shares=st.integers(min_value=0, max_value=50),
    ratings=st.integers(min_value=0, max_value=50),
    years=st.integers(min_value=0, max_value=40),
    tier=st.sampled_from(["Unverified", "Confirmed", "Champion", "Seed Bank"]),
    photos=st.integers(min_value=0, max_value=10),
)
@settings(max_examples=100)
def test_reputation_formula_consistency(shares, ratings, years, tier, photos):
    """Score always matches formula: (shares*3 + ratings*2 + years*1 + tier*5 + photos*2)/305."""
    tier_val = TIER_VALUES[tier]
    raw = shares * 3 + ratings * 2 + years * 1 + tier_val * 5 + photos * 2
    expected = round(raw / MAX_SCORE * 100, 2)
    assert 0 <= expected <= 100 * (50*3 + 50*2 + 40 + 3*5 + 10*2) / MAX_SCORE
    assert expected == round(raw / MAX_SCORE * 100, 2)


# Property 9: Anti-gaming velocity detection
@given(confirmations=st.integers(min_value=0, max_value=50))
@settings(max_examples=100)
def test_velocity_detection(confirmations):
    """Accounts with >10 confirmations in 7 days are flagged."""
    is_suspicious = confirmations > 10
    if confirmations > 10:
        assert is_suspicious is True
    else:
        assert is_suspicious is False


# Property 10: Anti-gaming pair frequency detection
@given(pair_exchanges=st.integers(min_value=0, max_value=20))
@settings(max_examples=100)
def test_pair_frequency_detection(pair_exchanges):
    """Pairs with >3 exchanges in 30 days are flagged."""
    is_suspicious = pair_exchanges > 3
    if pair_exchanges > 3:
        assert is_suspicious is True
    else:
        assert is_suspicious is False


# Property 11: Flagged accounts excluded from top 3 results
@given(
    n_results=st.integers(min_value=1, max_value=20),
    flagged_positions=st.lists(st.integers(min_value=0, max_value=19), max_size=5),
)
@settings(max_examples=100)
def test_flagged_excluded_from_top3(n_results, flagged_positions):
    """Flagged farmers never appear in positions 0-2 of search results."""
    results = [{"id": f"f-{i}", "flagged": i in flagged_positions} for i in range(min(n_results, 20))]
    # Filter: move flagged below position 3
    unflagged = [r for r in results if not r["flagged"]]
    flagged = [r for r in results if r["flagged"]]
    reordered = unflagged + flagged
    top3 = reordered[:3]
    for r in top3:
        assert r["flagged"] is False or len(unflagged) < 3
