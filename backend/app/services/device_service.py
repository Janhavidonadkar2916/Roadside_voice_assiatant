from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import Device, DeviceEvent
from app.websocket.manager import ws_manager

def get_all_devices(db: Session):
    return db.query(Device).order_by(Device.device_id.asc()).all()

def get_device_by_id(db: Session, device_id: str):
    return db.query(Device).filter(Device.device_id == device_id).first()

def get_device_events(db: Session, device_id: str, limit: int = 50):
    return db.query(DeviceEvent).filter(DeviceEvent.device_id == device_id).order_by(DeviceEvent.timestamp.desc()).limit(limit).all()

def update_device_status(db: Session, device_id: str, status: str, battery: int = None, temperature: float = None):
    device = get_device_by_id(db, device_id)
    if not device:
        return None
    
    device.status = status
    if battery is not None:
        device.battery = battery
    if temperature is not None:
        device.temperature = temperature
    device.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(device)
def update_device_telemetry(db: Session, device_id: str, telemetry_data: dict):
    device = get_device_by_id(db, device_id)
    if not device:
        return None
    
    device.battery = telemetry_data.get("battery", device.battery)
    device.temperature = telemetry_data.get("temperature", device.temperature)
    device.network_status = telemetry_data.get("network", device.network_status)
    device.microphone_status = telemetry_data.get("microphone", device.microphone_status)
    device.button_status = telemetry_data.get("button", device.button_status)
    device.impact_sensor_status = telemetry_data.get("impact_sensor", device.impact_sensor_status)
    device.last_heartbeat = datetime.now(timezone.utc)
    if device.status == "OFFLINE":
        device.status = "ONLINE"

    db.commit()
    db.refresh(device)
    return device

def check_device_heartbeats(db: Session, timeout_seconds: int = 30):
    """
    Heartbeat watchdog logic.
    Identifies devices that haven't sent a heartbeat within timeout_seconds
    and marks them as OFFLINE.
    """
    now = datetime.now(timezone.utc)
    devices = db.query(Device).filter(Device.status != "OFFLINE").all()
    offline_count = 0
    for device in devices:
        if device.last_heartbeat:
            # Ensure timezone awareness
            last_hb = device.last_heartbeat
            if last_hb.tzinfo is None:
                last_hb = last_hb.replace(tzinfo=timezone.utc)
            delta = (now - last_hb).total_seconds()
            if delta > timeout_seconds:
                device.status = "OFFLINE"
                device.network_status = "DISCONNECTED"
                offline_count += 1
    
    if offline_count > 0:
        db.commit()
    return offline_count
