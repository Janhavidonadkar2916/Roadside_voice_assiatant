# MQTT Topic Contract & Message Specifications

## 1. Overview

The system uses Eclipse Mosquitto MQTT broker (`localhost:1883`) for real-time messaging between Digital Twin instances and the FastAPI backend.

---

## 2. Topic Structure

| Topic Pattern | Direction | Description | QoS |
| :--- | :--- | :--- | :---: |
| `sos/device/{device_id}/telemetry` | Twin → Backend | Periodic heartbeat & telemetry (battery, temp, sensor states) | 0 |
| `sos/device/{device_id}/events` | Twin → Backend | High-priority emergency events (`IMPACT_DETECTED`, `VOICE_EMERGENCY`) | 1 |
| `sos/device/{device_id}/state` | Twin → Backend | Device connection lifecycle state (`ONLINE`, `OFFLINE`) | 1 |
| `sos/device/{device_id}/commands` | Backend → Twin | Remote control commands sent to Digital Twin units | 1 |

---

## 3. Payload Schemas

### 3.1 Telemetry Payload (`sos/device/{device_id}/telemetry`)
```json
{
  "device_id": "SOS-NH44-001",
  "name": "NH44 KM 512 SOS Unit",
  "battery": 87,
  "temperature": 31.2,
  "network": "CONNECTED",
  "microphone": "ACTIVE",
  "button": "NORMAL",
  "impact_sensor": "NORMAL",
  "highway": "NH44",
  "kilometer_marker": 512.0,
  "latitude": 21.1458,
  "longitude": 79.0882,
  "timestamp": "2026-09-13T14:45:00Z"
}
```

### 3.2 Event Payload (`sos/device/{device_id}/events`)
```json
{
  "device_id": "SOS-NH44-001",
  "event_type": "IMPACT_DETECTED",
  "severity": "CRITICAL",
  "impact_g_force": 9.2,
  "latitude": 21.1458,
  "longitude": 79.0882,
  "timestamp": "2026-09-13T14:45:05Z"
}
```

### 3.3 Command Payload (`sos/device/{device_id}/commands`)
```json
{
  "device_id": "SOS-NH44-001",
  "command": "RESTORE_DEVICE",
  "payload": {}
}
```

---

## 4. Reconnection & Fallback Behavior

If the MQTT Broker is temporarily unreachable or offline:
- The **FastAPI Backend** continues operating via REST HTTP APIs.
- The **Digital Twin Simulator** automatically falls back to posting telemetry via HTTP to `http://localhost:8000/api/devices/{device_id}/telemetry`.
