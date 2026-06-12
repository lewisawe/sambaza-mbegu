# Feature: seed-exchange, Property 20: SMS parse/format round-trip
from hypothesis import given, strategies as st, settings
from app.services.sms_service import SMSService, SMSIntent

sms = SMSService()

CROPS = ["sorghum", "millet", "cowpea", "maize", "beans", "pigeon pea"]
COUNTIES = ["machakos", "kitui", "makueni", "meru", "embu"]


# Property 20: SMS parse/format round-trip
@given(
    command=st.sampled_from(["SEED", "SHARE", "STOP", "RENEW"]),
    crop=st.sampled_from(CROPS),
    county=st.sampled_from(COUNTIES),
)
@settings(max_examples=100)
def test_sms_parse_format_roundtrip(command, crop, county):
    """Parsing an SMS and formatting back produces equivalent keyword string."""
    if command == "SEED":
        original = f"SEED {crop.upper()} {county.upper()}"
    elif command == "SHARE":
        original = f"SHARE {crop.upper()}"
    elif command in ("STOP", "RENEW"):
        original = command
    else:
        return

    intent = sms.parse_message(original)
    formatted = sms.format_message(intent)
    assert formatted == original
