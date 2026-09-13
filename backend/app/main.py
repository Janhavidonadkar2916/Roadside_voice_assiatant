import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import engine, Base, SessionLocal
from app.websocket.manager import ws_manager
from app.mqtt.client import mqtt_manager

from app.api.routes import health, devices, alerts, responders, analytics, simulation
from app.models.models import Device, Responder

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

def init_seed_data(db: Session):
    """Seed initial roadside SOS Digital Twin devices and emergency responders if database is empty."""
    if db.query(Device).count() == 0:
        logger.info("Seeding initial Digital Twin SOS devices...")
        initial_devices = [
            Device(
                device_id="SOS-NH44-001",
                name="NH44 KM 512 SOS Unit",
                highway="NH44",
                kilometer_marker=512.0,
                latitude=21.1458,
                longitude=79.0882,
                status="ONLINE",
                battery=87,
                network_status="CONNECTED",
                microphone_status="ACTIVE",
                button_status="NORMAL",
                impact_sensor_status="NORMAL",
                temperature=31.2,
                firmware_version="v1.2.0"
            ),
            Device(
                device_id="SOS-NH44-002",
                name="NH44 KM 528 SOS Unit",
                highway="NH44",
                kilometer_marker=528.5,
                latitude=21.2300,
                longitude=79.1500,
                status="ONLINE",
                battery=94,
                network_status="CONNECTED",
                microphone_status="ACTIVE",
                button_status="NORMAL",
                impact_sensor_status="NORMAL",
                temperature=29.8,
                firmware_version="v1.2.0"
            ),
            Device(
                device_id="SOS-NH47-105",
                name="NH47 KM 105 SOS Unit",
                highway="NH47",
                kilometer_marker=105.0,
                latitude=21.0500,
                longitude=79.0200,
                status="ONLINE",
                battery=76,
                network_status="CONNECTED",
                microphone_status="ACTIVE",
                button_status="NORMAL",
                impact_sensor_status="NORMAL",
                temperature=33.0,
                firmware_version="v1.2.0"
            ),
            Device(
                device_id="SOS-NH65-042",
                name="NH65 KM 42 SOS Unit",
                highway="NH65",
                kilometer_marker=42.3,
                latitude=21.1800,
                longitude=78.9800,
                status="ONLINE",
                battery=65,
                network_status="CONNECTED",
                microphone_status="ACTIVE",
                button_status="NORMAL",
                impact_sensor_status="NORMAL",
                temperature=30.5,
                firmware_version="v1.1.9"
            )
        ]
        db.add_all(initial_devices)
        db.commit()

    if db.query(Responder).count() == 0:
        logger.info("Seeding emergency response units (Ambulances, Police, Hospitals)...")
        initial_responders = [
            Responder(
                responder_id="AMB-001",
                name="Metro Emergency Medical Unit 01",
                type="AMBULANCE",
                latitude=21.1400,
                longitude=79.0800,
                availability="AVAILABLE",
                status="AVAILABLE",
                contact="+1-800-555-0199"
            ),
            Responder(
                responder_id="AMB-002",
                name="Highway Trauma Response Ambulance 02",
                type="AMBULANCE",
                latitude=21.2100,
                longitude=79.1200,
                availability="AVAILABLE",
                status="AVAILABLE",
                contact="+1-800-555-0198"
            ),
            Responder(
                responder_id="POL-001",
                name="Highway Patrol Sector 4",
                type="POLICE",
                latitude=21.1500,
                longitude=79.0900,
                availability="AVAILABLE",
                status="AVAILABLE",
                contact="+1-800-555-0911"
            ),
            Responder(
                responder_id="POL-002",
                name="State Police Highway Rapid Response",
                type="POLICE",
                latitude=21.1000,
                longitude=79.0500,
                availability="AVAILABLE",
                status="AVAILABLE",
                contact="+1-800-555-0912"
            ),
            Responder(
                responder_id="HOS-001",
                name="Central Highway Trauma Center Hospital",
                type="HOSPITAL",
                latitude=21.1600,
                longitude=79.1000,
                availability="AVAILABLE",
                status="AVAILABLE",
                contact="+1-800-555-4321"
            ),
            Responder(
                responder_id="HOS-002",
                name="Apex Specialty Emergency Care",
                type="HOSPITAL",
                latitude=21.0800,
                longitude=79.0300,
                availability="AVAILABLE",
                status="AVAILABLE",
                contact="+1-800-555-4322"
            )
        ]
        db.add_all(initial_responders)
        db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        init_seed_data(db)
    finally:
        db.close()

    # Start MQTT manager
    mqtt_manager.start()

    yield

    # Shutdown tasks
    mqtt_manager.stop()
    logger.info("Shutdown complete.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(devices.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(responders.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(simulation.router, prefix=settings.API_V1_STR)

# Real-time WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection open and receive optional ping messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
