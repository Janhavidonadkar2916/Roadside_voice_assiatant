from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db
from app.schemas.device import DeviceOut, DeviceUpdate
from app.schemas.simulation import SimulationTriggerInput
from app.services import device_service
from app.mqtt.client import mqtt_manager

router = APIRouter(prefix="/devices", tags=["Devices"])

@router.get("", response_model=List[DeviceOut])
def list_devices(db: Session = Depends(get_db)):
    """Retrieve all roadside SOS Digital Twin devices."""
    return device_service.get_all_devices(db)

@router.get("/{device_id}", response_model=DeviceOut)
def get_device(device_id: str, db: Session = Depends(get_db)):
    """Retrieve state and telemetry for a specific Digital Twin device."""
    device = device_service.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return device

@router.get("/{device_id}/events")
def get_device_events(device_id: str, limit: int = Query(50, ge=1, le=200), db: Session = Depends(get_db)):
    """Retrieve recorded telemetry and event log history for a device."""
    device = device_service.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    
    events = device_service.get_device_events(db, device_id, limit=limit)
    return [
        {
            "id": e.id,
            "device_id": e.device_id,
            "event_type": e.event_type,
            "payload": e.get_payload_json(),
            "timestamp": e.timestamp
        }
        for e in events
    ]

@router.post("/{device_id}/command")
def send_device_command(device_id: str, command: str = Query(...), db: Session = Depends(get_db)):
    """
    Sends a bidirectional command back to the Digital Twin 
    (e.g., RESTART, RESET_SENSOR, RESTORE_DEVICE).
    """
    device = device_service.get_device_by_id(db, device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")

    published = mqtt_manager.publish_command(device_id, command)
    
    # Also update DB directly as fallback
    if command == "RESTORE_DEVICE":
        device_service.update_device_status(db, device_id, status="ONLINE", battery=87)
    
    return {
        "status": "command_sent",
        "device_id": device_id,
        "command": command,
        "mqtt_published": published
    }

@router.post("/{device_id}/telemetry", response_model=DeviceOut)
def receive_device_telemetry(device_id: str, telemetry: dict, db: Session = Depends(get_db)):
    """Receives periodic telemetry and heartbeat updates from Digital Twin devices."""
    device = device_service.update_device_telemetry(db, device_id, telemetry)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return device
