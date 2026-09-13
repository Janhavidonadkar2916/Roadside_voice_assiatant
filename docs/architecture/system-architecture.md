# System Architecture — Smart SOS Digital Twin Emergency Response System

## 1. Executive Summary

The **Smart SOS Roadside Emergency Response System with Digital Twin** is an IoT emergency dispatch and telemetry platform designed for highway roadside safety. Roadside units (SOS Call Boxes) are virtualized via stateful **Digital Twins** that mirror physical device health, battery levels, sensor readings (G-force impact, temperature, microphone status), and network connectivity over MQTT.

---

## 2. End-to-End Event Pipeline Flow

```
+-----------------------------------------------------------------------------------+
|                              EMERGENCY TRIGGER SOURCES                             |
|  [Voice Command: HELP/ACCIDENT]  |  [Manual SOS Button]  |  [Impact Sensor: >8g]  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                               DIGITAL TWIN SIMULATOR                              |
|   State Machine Transition -> Publish Event to MQTT: sos/device/{id}/events       |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                            ECLIPSE MOSQUITTO MQTT BROKER                          |
|   Host: localhost:1883 | Subscriptions: sos/device/+/telemetry, sos/device/+/events |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                              FASTAPI BACKEND SERVICE                              |
|   1. MQTT Handler receives event -> Invokes Emergency Processing Engine           |
|   2. Classifies Emergency Type (ACCIDENT, MEDICAL, FIRE, SECURITY, GENERAL)       |
|   3. Calculates Priority Score (1.0 - 10.0) based on Severity & G-Force           |
|   4. Stores Alert record in PostgreSQL / SQLite database                          |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                           HAVERSINE GEODESIC DISPATCH ENGINE                      |
|   1. Fetches coordinates of emergency alert (SOS unit GPS / Browser GPS)           |
|   2. Filters AVAILABLE Responders (Ambulances, Police Patrols, Trauma Hospitals)  |
|   3. Computes Haversine geodesic distance in km                                   |
|   4. Ranks & assigns nearest units (AlertStatus: RESPONDER_ASSIGNED)              |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                              WEBSOCKET BROADCAST MANAGER                          |
|   Pushes real-time JSON alert payload & device state changes to connected clients  |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        REACT 18 + VITE COMMAND CENTER DASHBOARD                   |
|   Live Leaflet Map update + Incident Alert Feed + Real-time Device Health Cards   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Bidirectional Communication Architecture

### Digital Twin → Backend
- **Periodic Telemetry**: Heartbeat, battery %, temperature, microphone, button, impact sensor state (`sos/device/{device_id}/telemetry`).
- **Emergency Events**: Impact detection, voice emergency triggers (`sos/device/{device_id}/events`).

### Backend → Digital Twin
- **Device Control Commands**: Sent over `sos/device/{device_id}/commands` to trigger `RESTORE_DEVICE`, `SIMULATE_LOW_BATTERY`, `SIMULATE_NETWORK_FAILURE`, `SENSOR_RESET`.

---

## 4. Hardware-Ready Compatibility (ESP32 / Raspberry Pi)

Physical roadside hardware (e.g. ESP32 microcontroller with SIM800L GSM + Neo-6M GPS + MPU6050 accelerometer) can connect directly to the identical MQTT broker and topic endpoints without modifying backend code or database schemas.
