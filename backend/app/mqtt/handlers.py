import json
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.models import Device, DeviceEvent, Alert, AlertHistory
from app.services.emergency_engine import emergency_engine
from app.websocket.manager import ws_manager

logger = logging.getLogger("mqtt_handlers")

def handle_telemetry_message(topic: str, payload_str: str):
    """Processes incoming device telemetry from MQTT topic: sos/device/{device_id}/telemetry"""
    db: Session = SessionLocal()
    try:
        data = json.loads(payload_str)
        device_id = data.get("device_id")
        if not device_id:
            return

        device = db.query(Device).filter(Device.device_id == device_id).first()
        if not device:
            logger.warning(f"MQTT telemetry from unknown device: {device_id}")
            return

        device.battery = int(data.get("battery", device.battery))
        device.temperature = float(data.get("temperature", device.temperature))
        device.network_status = data.get("network", device.network_status)
        device.microphone_status = data.get("microphone", device.microphone_status)
        device.button_status = data.get("button", device.button_status)
        device.impact_sensor_status = data.get("impact_sensor", device.impact_sensor_status)
        device.last_heartbeat = datetime.now(timezone.utc)
        
        # Check low battery status
        if device.battery < 10:
            if device.status != "EMERGENCY":
                device.status = "DEGRADED"
        elif device.status == "OFFLINE":
            device.status = "ONLINE"

        db.commit()
        db.refresh(device)

        # Broadcast via WebSocket
        ws_event = {
            "type": "TELEMETRY_UPDATE",
            "data": {
                "device_id": device.device_id,
                "status": device.status,
                "battery": device.battery,
                "temperature": device.temperature,
                "network_status": device.network_status,
                "microphone_status": device.microphone_status,
                "button_status": device.button_status,
                "impact_sensor_status": device.impact_sensor_status,
                "last_heartbeat": device.last_heartbeat.isoformat()
            }
        }
        # Schedule or sync broadcast
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.run_coroutine_threadsafe(ws_manager.broadcast(ws_event), loop)
        except Exception:
            pass

    except Exception as e:
        logger.error(f"Error handling telemetry message: {e}")
        db.rollback()
    finally:
        db.close()


def handle_event_message(topic: str, payload_str: str):
    """Processes incoming device emergency event from MQTT topic: sos/device/{device_id}/events"""
    db: Session = SessionLocal()
    try:
        data = json.loads(payload_str)
        device_id = data.get("device_id")
        event_type = data.get("event_type", "UNKNOWN")

        if not device_id:
            return

        device = db.query(Device).filter(Device.device_id == device_id).first()
        if not device:
            logger.warning(f"MQTT event from unknown device: {device_id}")
            return

        # Store Device Event
        event_rec = DeviceEvent(
            device_id=device_id,
            event_type=event_type,
            payload=payload_str,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(event_rec)
        db.commit()

        # Check if emergency trigger event
        if event_type in ["IMPACT_DETECTED", "VOICE_EMERGENCY", "MANUAL_SOS"]:
            from app.services.alert_service import process_and_create_alert
            alert = process_and_create_alert(
                db=db,
                device_id=device_id,
                trigger_source=event_type,
                payload=data
            )
            logger.info(f"Created emergency alert {alert.alert_id} for device {device_id} via MQTT event {event_type}")

    except Exception as e:
        logger.error(f"Error handling MQTT event message: {e}")
        db.rollback()
    finally:
        db.close()
