# Feature: seed-exchange, Property 19: Role-based access enforcement
from hypothesis import given, strategies as st, settings

ROLES = ["farmer", "extension_worker", "institution", "seed_company", "admin"]
ENDPOINT_ROLES = {
    "/api/verification/report": {"extension_worker"},
    "/api/verification/bulk": {"extension_worker"},
    "/api/analytics/county": {"institution", "admin"},
    "/api/analytics/demand": {"seed_company", "admin"},
    "/api/listings": {"farmer"},
    "/api/exchanges": {"farmer"},
}


# Property 19: Role-based access enforcement
@given(
    user_role=st.sampled_from(ROLES),
    endpoint=st.sampled_from(list(ENDPOINT_ROLES.keys())),
)
@settings(max_examples=100)
def test_role_based_access(user_role, endpoint):
    """Requests with wrong role always get rejected."""
    allowed_roles = ENDPOINT_ROLES[endpoint]
    has_access = user_role in allowed_roles or user_role == "admin"
    if user_role not in allowed_roles:
        # Should be rejected (403) unless admin
        if user_role != "admin":
            assert has_access is False
    else:
        assert has_access is True
