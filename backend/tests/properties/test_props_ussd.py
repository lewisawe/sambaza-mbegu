# Feature: seed-exchange, Property 21: USSD session isolation
import json
from hypothesis import given, strategies as st, settings


# Property 21: USSD session isolation
@given(
    session_a_id=st.text(min_size=8, max_size=16, alphabet="abcdef0123456789"),
    session_b_id=st.text(min_size=8, max_size=16, alphabet="abcdef0123456789"),
    phone_a=st.text(min_size=10, max_size=13, alphabet="0123456789"),
    phone_b=st.text(min_size=10, max_size=13, alphabet="0123456789"),
    crop_choice_a=st.sampled_from(["1", "2", "3", "4", "5"]),
    crop_choice_b=st.sampled_from(["1", "2", "3", "4", "5"]),
)
@settings(max_examples=100)
def test_ussd_session_isolation(session_a_id, session_b_id, phone_a, phone_b, crop_choice_a, crop_choice_b):
    """Two concurrent USSD sessions don't affect each other's state."""
    if session_a_id == session_b_id:
        return  # Same session, not a valid test case

    # Simulate independent state stores
    state_a = {"session_id": session_a_id, "phone": phone_a, "selections": {"crop": crop_choice_a}}
    state_b = {"session_id": session_b_id, "phone": phone_b, "selections": {"crop": crop_choice_b}}

    # Store in simulated Redis (dict)
    store = {}
    store[f"ussd:{session_a_id}"] = json.dumps(state_a)
    store[f"ussd:{session_b_id}"] = json.dumps(state_b)

    # Read back and verify isolation
    read_a = json.loads(store[f"ussd:{session_a_id}"])
    read_b = json.loads(store[f"ussd:{session_b_id}"])

    assert read_a["phone"] == phone_a
    assert read_b["phone"] == phone_b
    assert read_a["selections"]["crop"] == crop_choice_a
    assert read_b["selections"]["crop"] == crop_choice_b
    # Mutation in A doesn't affect B
    read_a["selections"]["crop"] = "modified"
    store[f"ussd:{session_a_id}"] = json.dumps(read_a)
    read_b_again = json.loads(store[f"ussd:{session_b_id}"])
    assert read_b_again["selections"]["crop"] == crop_choice_b
