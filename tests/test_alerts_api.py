import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from fastapi.testclient import TestClient
from app.main import app, init_seed_data
from app.database.session import engine, Base, SessionLocal

from app.models.models import Responder, Alert, AlertAssignment

# Ensure tables & seed data are initialized for testing
Base.metadata.create_all(bind=engine)
db = SessionLocal()
init_seed_data(db)
# Reset responder availability so tests are deterministic
db.query(Responder).update({"availability": "AVAILABLE", "status": "AVAILABLE"})
db.commit()
db.close()

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]

def test_get_devices():
    response = client.get("/api/devices")
    assert response.status_code == 200
    devices = response.json()
    assert len(devices) >= 4
    assert devices[0]["device_id"] == "SOS-NH44-001"

def test_create_and_get_alert():
    payload = {
        "device_id": "SOS-NH44-001",
        "type": "ACCIDENT",
        "severity": "CRITICAL",
        "trigger_source": "IMPACT_DETECTED",
        "confirmed_by_user": True
    }
    create_res = client.post("/api/alerts", json=payload)
    assert create_res.status_code == 201
    alert_data = create_res.json()
    assert "SOS-2026-" in alert_data["alert_id"]
    assert alert_data["status"] == "RESPONDER_ASSIGNED"

    # Fetch details
    detail_res = client.get(f"/api/alerts/{alert_data['alert_id']}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["assignments"]) > 0

def test_duplicate_alert_suppression():
    payload = {
        "device_id": "SOS-NH44-002",
        "type": "ACCIDENT",
        "severity": "CRITICAL",
        "trigger_source": "IMPACT_DETECTED",
        "confirmed_by_user": True
    }
    res1 = client.post("/api/alerts", json=payload)
    assert res1.status_code == 201
    alert1 = res1.json()

    # Immediate second call should suppress duplicate and return existing alert ID
    res2 = client.post("/api/alerts", json=payload)
    assert res2.status_code == 201
    alert2 = res2.json()
    assert alert1["alert_id"] == alert2["alert_id"]
