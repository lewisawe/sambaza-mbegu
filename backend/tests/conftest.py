import pytest
from datetime import datetime, timedelta
from app.services.sms_service import SMSIntent


@pytest.fixture
def sample_farmer():
    return {
        "id": "farmer-001",
        "name": "Wanjiku Muthoni",
        "phone": "+254700000001",
        "county": "Machakos",
        "years_growing": 15,
        "verification_tier": "Confirmed",
        "photo_evidence_count": 3,
        "created_at": datetime(2024, 1, 1),
        "flagged": False,
    }


@pytest.fixture
def sample_listing():
    return {
        "id": "listing-001",
        "variety_id": "var-001",
        "quantity_kg": 5.0,
        "status": "available",
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=90),
    }
