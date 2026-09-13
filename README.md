# Smart SOS Roadside Emergency Response System with Digital Twin

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.11+-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-emerald.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![MQTT](https://img.shields.io/badge/MQTT-Mosquitto-purple.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-cyan.svg)

A Digital Twin-enabled IoT emergency response prototype and real-time command dashboard featuring hardware-ready architecture, automated Haversine geodesic responder dispatch, and live WebSockets monitoring.

---

## 1. Problem Statement

Highway vehicular emergencies and roadside accidents suffer from delayed emergency response dispatch times due to imprecise incident reporting, voice communication bottlenecks, and dispatcher situational unawareness.

---

## 2. Motivation

Modern highway safety requires automated crash impact detection, speech recognition keyword processing, and real-time Digital Twin telemetry to visualize device health and automatically dispatch the nearest emergency responders without delay.

---

## 3. Solution

**Smart SOS** virtualizes highway roadside units via stateful Python **Digital Twins** connected to an Eclipse Mosquitto MQTT broker. The system detects impact crashes via accelerometer thresholding (>8g), processes speech recognition keywords ("HELP", "ACCIDENT"), automatically calculates nearest available responders via the **Haversine geodesic formula**, and pushes live incident markers to a dark-mode command dashboard via WebSockets.

---

## 4. Architecture

```
                                  +-----------------------+
                                  |   Web User / Voice    |
                                  +-----------+-----------+
                                              |
                                              v
                                  +-----------------------+
                                  |   React + Vite UI     |
                                  +-----------+-----------+
                                              |
                     +------------------------+------------------------+
                     | REST API                                        | WebSocket
                     v                                                 v
        +-------------------------+                       +-------------------------+
        |   FastAPI Backend       | <--- WebSockets ----> |   Command Dashboard     |
        +------------+------------+                       +-------------------------+
                     |
                     +---> Emergency Engine ---> Haversine Distance Engine
                     |
        +------------+------------+
        |   PostgreSQL / SQLite   |
        +-------------------------+
                     ^
                     | MQTT Subscriptions
        +------------+------------+
        | Eclipse Mosquitto Broker|
        +------------+------------+
                     ^
                     | Telemetry / Events
        +------------+------------+
        | Digital Twin Simulator  |  (Hardware-Ready for ESP32 / Raspberry Pi)
        +-------------------------+
```

Detailed technical documentation is available under [`docs/architecture/system-architecture.md`](file:///Users/janhavidonadkar/Documents/Emergency_DT/docs/architecture/system-architecture.md).

---

## 5. Digital Twin Concept

Each roadside SOS unit is represented by a stateful software replica that maintains virtual battery levels, network connectivity status, temperature, impact sensor readings, and microphone state.

Read more in [`docs/architecture/digital-twin.md`](file:///Users/janhavidonadkar/Documents/Emergency_DT/docs/architecture/digital-twin.md).

---

## 6. System Workflow

Emergency Trigger → Digital Twin Event → MQTT Broker → FastAPI Backend → Emergency Engine → PostgreSQL Database → Haversine Responder Dispatch → WebSocket Broadcast → Live Command Dashboard Map Update.

---

## 7. Features

- 🚨 **Multi-Modal Emergency Triggers**: Voice keyword normalization, manual confirmation SOS buttons, and high-g impact crash detection.
- ⚙️ **Stateful Digital Twin**: Telemetry heartbeats every 5s, remote device control commands (`RESTORE_DEVICE`, `SIMULATE_LOW_BATTERY`, `SENSOR_RESET`).
- ⚡ **Real-Time WebSockets**: Live event streaming to the command dashboard without manual page refreshes.
- 🚑 **Haversine Geodesic Dispatch**: Ranks and assigns the nearest available Ambulance, Police Patrol, and Trauma Hospital.
- 🎬 **1-Click Portfolio Demo Mode**: Complete end-to-end accident simulation walkthrough.
- 📊 **Analytics & Metrics**: Response time statistics, 7-day incident distribution charts, and device health metrics.

---

## 8. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet / React-Leaflet, Recharts, Lucide Icons, Web Speech API.
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, Alembic, WebSockets, Paho-MQTT, Pytest.
- **Database**: PostgreSQL (or SQLite standalone fallback).
- **IoT & Twin**: Eclipse Mosquitto MQTT broker, Stateful Python Twin daemon.
- **DevOps**: Docker, Docker Compose.

---

## 9. MQTT Architecture

- `sos/device/{device_id}/telemetry`: Telemetry & heartbeat stream.
- `sos/device/{device_id}/events`: High-g impact & voice emergency events.
- `sos/device/{device_id}/commands`: Two-way backend commands to Digital Twin.

Detailed topic contract: [`docs/architecture/mqtt.md`](file:///Users/janhavidonadkar/Documents/Emergency_DT/docs/architecture/mqtt.md).

---

## 10. Database Schema

Managed via Alembic database migrations (`backend/alembic/`).
Tables: `devices`, `device_events`, `alerts`, `responders`, `alert_assignments`, `alert_history`.

---

## 11. API Reference

Complete API specification: [`docs/api/API.md`](file:///Users/janhavidonadkar/Documents/Emergency_DT/docs/api/API.md).

---

## 12. Installation & Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+
- Mosquitto MQTT Broker (or Docker)

### Option A: Local Execution (Without Docker)

```bash
# 1. Setup Virtual Environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
pip install -r digital-twin/requirements.txt

# 2. Database Migrations
cd backend
PYTHONPATH=. ../.venv/bin/alembic upgrade head
cd ..

# 3. Start Mosquitto MQTT Broker
brew services start mosquitto

# 4. Start FastAPI Backend (Terminal 1)
PYTHONPATH=backend .venv/bin/uvicorn app.main:app --reload --port 8000

# 5. Start Digital Twin Daemon (Terminal 2)
PYTHONPATH=digital-twin .venv/bin/python digital-twin/main.py

# 6. Start React Frontend (Terminal 3)
cd frontend
npm install
npm run dev
```

---

## 13. Environment Variables

See `.env.example` for details:
```ini
PROJECT_NAME="Smart SOS Roadside Emergency Response System"
DATABASE_URL=sqlite:///./sos_app.db
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
```

---

## 14. Docker Setup

Launch full stack via Docker Compose:
```bash
docker compose up --build
```
Access points:
- **Command Center**: `http://localhost:5173`
- **FastAPI OpenAPI Docs**: `http://localhost:8000/docs`
- **Mosquitto MQTT**: `localhost:1883`

---

## 15. Running the Digital Twin

The Digital Twin daemon runs continuously via `PYTHONPATH=digital-twin .venv/bin/python digital-twin/main.py`.

---

## 16. Demo Workflow

1. Open `http://localhost:5173`.
2. Click **"SIMULATE ACCIDENT"** in the top bar.
3. Observe live event pipeline (Digital Twin → MQTT → Backend -> Haversine Dispatch → WebSockets → Map Update).

---

## 17. Automated Testing Suite

Execute backend test suite:
```bash
.venv/bin/pytest tests/ -v
```

---

## 18. Limitations

- **Simulated Responders**: Emergency units and dispatch routing are simulated.
- **Hardware Simulation**: Runs without physical microcontrollers by default.
- **Speech Recognition**: Web Speech API is browser-dependent.

---

## 19. Future Hardware Integration

Physical roadside call boxes (e.g. ESP32 microcontroller with SIM800L GSM + Neo-6M GPS + MPU6050 accelerometer) can connect directly to the Mosquitto MQTT broker using the exact same JSON topics and schemas.

---

## 20. Project Structure

```
Smart-SOS-Digital-Twin/
├── backend/                  # FastAPI Application & Emergency Engine
│   ├── alembic/              # Database Migrations
│   └── app/                  # Routes, Services, Models, Schemas, MQTT, WebSockets
├── digital-twin/             # Stateful Digital Twin IoT Simulator
├── docs/                     # Technical Architecture & API Documentation
│   ├── api/
│   └── architecture/
├── frontend/                 # React 18 + Vite Command Dashboard
├── docker/                   # Mosquitto MQTT Configuration
├── tests/                    # Pytest Suite
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 21. License

Licensed under the MIT License.
