# Digital Twin Concept & Simulation Architecture

## 1. Concept

A **Digital Twin** is a stateful software replica of a physical roadside emergency call box unit. In this system, each Digital Twin maintains virtual device health, battery drain, temperature fluctuations, microphone state, accelerometer impact status, and network connectivity.

---

## 2. State Machine

```
   +------------------+
   |      ONLINE      | <------+
   +--------+---------+        |
            |                  |
            | Impact / Voice   | Restore Device
            v                  |
   +------------------+        |
   |    EMERGENCY     | -------+
   +--------+---------+        |
            |                  |
            | Low Battery/     |
            | Sensor Fault     |
            v                  |
   +------------------+        |
   |     DEGRADED     | -------+
   +--------+---------+        |
            |                  |
            | Network Timeout  |
            v                  |
   +------------------+        |
   |     OFFLINE      | -------+
   +------------------+
```

---

## 3. Supported Simulation Triggers

- `SIMULATE_ACCIDENT` / `IMPACT_DETECTED`: Simulates a high-g vehicular impact (>8.0g).
- `VOICE_EMERGENCY`: Simulates microphone keyword extraction ("HELP", "ACCIDENT").
- `MANUAL_SOS`: Simulates button press on roadside unit.
- `SIMULATE_LOW_BATTERY`: Drops battery to 8% (`DEGRADED` state).
- `SIMULATE_NETWORK_FAILURE`: Disconnects network (`OFFLINE` state).
- `RESTORE_DEVICE`: Re-initializes device to `ONLINE` status with 90%+ battery.

---

## 4. Hardware Integration Readiness

Physical roadside units built with microcontrollers (ESP32, STM32, Raspberry Pi) can replace the Python Digital Twin by connecting to the Mosquitto MQTT broker and using the exact same JSON schema structure.
