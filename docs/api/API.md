# REST API & WebSocket Reference Manual

## 1. Overview

Base URL: `http://localhost:8000/api`  
Interactive OpenAPI / Swagger Documentation: `http://localhost:8000/docs`

---

## 2. API Endpoints

### 2.1 Devices API (`/api/devices`)
- `GET /api/devices`: List all registered roadside SOS Digital Twin units.
- `GET /api/devices/{device_id}`: Fetch detailed status & telemetry of a specific device.
- `GET /api/devices/{device_id}/events`: Retrieve historical event logs for a unit.
- `POST /api/devices/{device_id}/telemetry`: Endpoint for receiving telemetry updates.

### 2.2 Alerts API (`/api/alerts`)
- `GET /api/alerts`: List active and historical emergency alerts.
- `POST /api/alerts`: Create a new emergency alert (triggers automatic Haversine responder dispatch).
- `GET /api/alerts/{alert_id}`: Fetch alert details, assigned responders, and timeline history.
- `PATCH /api/alerts/{alert_id}/status`: Update alert lifecycle status (`RESPONDER_ASSIGNED` → `EN_ROUTE` → `ARRIVED` → `RESOLVED`).

### 2.3 Responders API (`/api/responders`)
- `GET /api/responders`: List all emergency response units (Ambulances, Police, Hospitals).
- `GET /api/responders/nearby`: Rank available responders by geodesic Haversine distance (`?lat=21.1458&lon=79.0882`).
- `POST /api/responders/{responder_id}/status`: Update availability/status of a responder.

### 2.4 Simulation API (`/api/simulation`)
- `POST /api/simulation/trigger`: Execute specific Digital Twin simulation scenarios (`IMPACT_DETECTED`, `LOW_BATTERY`, `NETWORK_FAILURE`, `RESTORE_DEVICE`).
- `POST /api/simulation/demo-scenario`: Run 1-Click Portfolio Demo scenario.

---

## 3. Real-Time WebSockets (`/ws`)

WebSocket Endpoint: `ws://localhost:8000/ws`

### Sample WebSocket Event (Alert Created)
```json
{
  "type": "ALERT_CREATED",
  "data": {
    "alert_id": "SOS-2026-000001",
    "device_id": "SOS-NH44-001",
    "type": "ACCIDENT",
    "severity": "CRITICAL",
    "trigger_source": "IMPACT_DETECTED",
    "status": "RESPONDER_ASSIGNED",
    "latitude": 21.1458,
    "longitude": 79.0882,
    "priority_score": 9.2
  }
}
```
