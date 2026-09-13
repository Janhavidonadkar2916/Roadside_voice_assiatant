from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.simulation import SimulationTriggerInput, DemoScenarioInput
from app.services import device_service, alert_service
from app.mqtt.client import mqtt_manager

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.post("/trigger")
def trigger_simulation(body: SimulationTriggerInput, db: Session = Depends(get_db)):
    """
    Triggers state changes or events on the Digital Twin.
    Generates real MQTT events and/or DB alert state updates.
    """
    device = device_service.get_device_by_id(db, body.device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {body.device_id} not found")

    event_type = body.event_type.upper()
    
    if event_type == "IMPACT_DETECTED":
        device.impact_sensor_status = "IMPACT_DETECTED"
        device.status = "EMERGENCY"
        db.commit()
        alert = alert_service.process_and_create_alert(
            db=db,
            device_id=device.device_id,
            trigger_source="IMPACT_DETECTED",
            payload={"impact_g_force": body.impact_g_force or 8.5}
        )
        return {"status": "success", "event": "IMPACT_DETECTED", "alert_id": alert.alert_id}

    elif event_type == "VOICE_EMERGENCY":
        device.microphone_status = "ACTIVE"
        device.status = "EMERGENCY"
        db.commit()
        alert = alert_service.process_and_create_alert(
            db=db,
            device_id=device.device_id,
            trigger_source="VOICE_EMERGENCY",
            payload={"voice_keyword": body.voice_keyword or "HELP", "voice_confidence": body.voice_confidence or 0.95}
        )
        return {"status": "success", "event": "VOICE_EMERGENCY", "alert_id": alert.alert_id}

    elif event_type in ["MANUAL_SOS", "SOS_BUTTON"]:
        device.button_status = "PRESSED"
        device.status = "EMERGENCY"
        db.commit()
        alert = alert_service.process_and_create_alert(
            db=db,
            device_id=device.device_id,
            trigger_source="SOS_BUTTON",
            payload={}
        )
        return {"status": "success", "event": "MANUAL_SOS", "alert_id": alert.alert_id}

    elif event_type == "LOW_BATTERY":
        device.battery = 8
        device.status = "DEGRADED"
        db.commit()
        return {"status": "success", "event": "LOW_BATTERY", "device_battery": 8}

    elif event_type == "NETWORK_FAILURE":
        device.network_status = "DISCONNECTED"
        device.status = "OFFLINE"
        db.commit()
        return {"status": "success", "event": "NETWORK_FAILURE", "device_status": "OFFLINE"}

    elif event_type == "SENSOR_FAILURE":
        device.microphone_status = "FAULT"
        device.impact_sensor_status = "FAULT"
        device.status = "DEGRADED"
        db.commit()
        return {"status": "success", "event": "SENSOR_FAILURE", "device_status": "DEGRADED"}

    elif event_type == "RESTORE_DEVICE":
        device.status = "ONLINE"
        device.battery = 87
        device.network_status = "CONNECTED"
        device.microphone_status = "ACTIVE"
        device.button_status = "NORMAL"
        device.impact_sensor_status = "NORMAL"
        db.commit()
        return {"status": "success", "event": "RESTORE_DEVICE", "device_status": "ONLINE"}

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported event type {event_type}")


@router.post("/demo-scenario")
def run_demo_scenario(body: DemoScenarioInput, db: Session = Depends(get_db)):
    """
    1-Click Demo Mode scenario execution for portfolio presentations.
    Executes complete end-to-end chain:
    Twin -> Event -> Emergency Engine -> Haversine Responder Dispatch -> WS Broadcast -> Real-time UI update
    """
    device = device_service.get_device_by_id(db, body.device_id)
    if not device:
        raise HTTPException(status_code=404, detail=f"Device {body.device_id} not found")

    device.impact_sensor_status = "IMPACT_DETECTED"
    device.status = "EMERGENCY"
    db.commit()

    alert = alert_service.process_and_create_alert(
        db=db,
        device_id=device.device_id,
        trigger_source="IMPACT_DETECTED",
        payload={"impact_g_force": 9.2, "demo_scenario": body.scenario}
    )

    return {
        "status": "scenario_executed",
        "scenario": body.scenario,
        "device_id": device.device_id,
        "alert_id": alert.alert_id,
        "severity": alert.severity,
        "priority_score": alert.priority_score,
        "assigned_responders_count": len(alert.assignments)
    }
