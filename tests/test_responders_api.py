import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from fastapi.testclient import TestClient
from app.main import app, init_seed_data
from app.database.session import engine, Base, SessionLocal
from app.models.models import Responder

Base.metadata.create_all(bind=engine)
db = SessionLocal()
init_seed_data(db)
db.close()

client = TestClient(app)

def test_list_responders():
    res = client.get("/api/responders")
    assert res.status_code == 200
    responders = res.json()
    assert len(responders) >= 6

def test_get_nearby_responders():
    res = client.get("/api/responders/nearby?lat=21.1458&lon=79.0882&limit=3")
    assert res.status_code == 200
    responders = res.json()
    assert len(responders) <= 3
    assert "distance_km" in responders[0]

def test_update_responder_status():
    res = client.post("/api/responders/AMB-001/status", json={"status": "EN_ROUTE", "availability": "ASSIGNED"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "EN_ROUTE"
    assert data["availability"] == "ASSIGNED"
