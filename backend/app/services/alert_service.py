import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.models import Alert, Device, Responder, AlertAssignment, AlertHistory
from app.services.emergency_engine import emergency_engine
from app.services.location_service import sort_responders_by_distance
from app.websocket.manager import ws_manager

def generate_alert_id(db: Session) -> str:
    year = datetime.now(timezone.utc).year
    count = db.query(Alert).count() + 1
    return f"SOS-{year}-{count:06d}"

def process_and_create_alert(
    db: Session,
    device_id: str,
    trigger_source: str,
    payload: Optional[Dict[str, Any]] = None,
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
    override_type: Optional[str] = None
) -> Alert:
    payload = payload or {}
    device = db.query(Device).filter(Device.device_id == device_id).first()
    
    if not device:
        # Fallback device if missing
        device_id_str = device_id
        highway = "NH44"
        km = 512.0
        lat = user_lat or 21.1458
        lon = user_lon or 79.0882
    else:
        device_id_str = device.device_id
        highway = device.highway
        km = device.kilometer_marker
        lat = user_lat or device.latitude
        lon = user_lon or device.longitude
        device.status = "EMERGENCY"

    # Duplicate alert protection: return existing active alert if created recently
    cutoff = datetime.now(timezone.utc)
    recent_active_alert = db.query(Alert).filter(
        Alert.device_id == device_id_str,
        Alert.trigger_source == trigger_source,
        Alert.status.in_(["ACTIVE", "RESPONDER_ASSIGNED", "EN_ROUTE", "ARRIVED"])
    ).order_by(Alert.created_at.desc()).first()

    if recent_active_alert:
        # If created within last 30 seconds, return existing alert to prevent duplicate flood
        time_diff = (cutoff - recent_active_alert.created_at.replace(tzinfo=timezone.utc)).total_seconds()
        if time_diff < 30:
            return recent_active_alert

    # Engine evaluation
    eval_type, severity, _ = emergency_engine.evaluate_trigger(trigger_source, payload)
    final_type = override_type or eval_type
    priority_score = emergency_engine.calculate_priority_score(
        emergency_type=final_type,
        severity=severity,
        trigger_source=trigger_source
    )

    alert_id_str = generate_alert_id(db)
    
    alert = Alert(
        alert_id=alert_id_str,
        device_id=device_id_str,
        type=final_type,
        severity=severity,
        trigger_source=trigger_source,
        latitude=lat,
        longitude=lon,
        highway=highway,
        kilometer_marker=km,
        status="ACTIVE",
        priority_score=priority_score,
        created_at=datetime.now(timezone.utc)
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Record initial history
    h1 = AlertHistory(
        alert_id=alert.alert_id,
        status="ACTIVE",
        description=f"Emergency alert triggered via {trigger_source}. Severity: {severity}. Type: {final_type}.",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(h1)
    db.commit()

    # Automatically find & assign nearest available responders
    assign_nearest_responders(db, alert)

    # Broadcast real-time WS update
    broadcast_alert_event(alert, "ALERT_CREATED")
    return alert

def assign_nearest_responders(db: Session, alert: Alert):
    """
    Finds nearest available Ambulance, Police unit, and Hospital.
    Assigns them to the emergency alert and updates their status.
    """
    available_responders = db.query(Responder).filter(Responder.availability == "AVAILABLE").all()
    if not available_responders:
        return

    sorted_resps = sort_responders_by_distance(alert.latitude, alert.longitude, available_responders)

    assigned_types = set()
    new_assignments = []

    for resp, dist in sorted_resps:
        if resp.type not in assigned_types:
            assigned_types.add(resp.type)
            
            # Create assignment record
            assignment = AlertAssignment(
                alert_id=alert.alert_id,
                responder_id=resp.responder_id,
                status="ASSIGNED",
                assigned_at=datetime.now(timezone.utc)
            )
            db.add(assignment)

            # Update responder state
            resp.availability = "ASSIGNED"
            resp.status = "ASSIGNED"

            new_assignments.append((resp, dist))

    if new_assignments:
        alert.status = "RESPONDER_ASSIGNED"
        db.commit()
        db.refresh(alert)

        resp_names = ", ".join([f"{r.name} ({r.type}, {d}km)" for r, d in new_assignments])
        h2 = AlertHistory(
            alert_id=alert.alert_id,
            status="RESPONDER_ASSIGNED",
            description=f"Dispatched nearest responders: {resp_names}.",
            timestamp=datetime.now(timezone.utc)
        )
        db.add(h2)
        db.commit()

def update_alert_status(db: Session, alert_id: str, new_status: str, description: Optional[str] = None) -> Optional[Alert]:
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        return None

    alert.status = new_status
    if new_status == "RESOLVED":
        alert.resolved_at = datetime.now(timezone.utc)
        # Restore associated device status
        device = db.query(Device).filter(Device.device_id == alert.device_id).first()
        if device and device.status == "EMERGENCY":
            device.status = "ONLINE"

        # Release assigned responders
        for assignment in alert.assignments:
            assignment.status = "COMPLETED"
            resp = db.query(Responder).filter(Responder.responder_id == assignment.responder_id).first()
            if resp:
                resp.availability = "AVAILABLE"
                resp.status = "AVAILABLE"

    db.commit()
    db.refresh(alert)

    # Record History
    h = AlertHistory(
        alert_id=alert.alert_id,
        status=new_status,
        description=description or f"Alert status updated to {new_status}.",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(h)
    db.commit()

    broadcast_alert_event(alert, "ALERT_UPDATED")
    return alert

def broadcast_alert_event(alert: Alert, event_type: str):
    ws_event = {
        "type": event_type,
        "data": {
            "alert_id": alert.alert_id,
            "device_id": alert.device_id,
            "type": alert.type,
            "severity": alert.severity,
            "trigger_source": alert.trigger_source,
            "status": alert.status,
            "latitude": alert.latitude,
            "longitude": alert.longitude,
            "highway": alert.highway,
            "kilometer_marker": alert.kilometer_marker,
            "priority_score": alert.priority_score,
            "created_at": alert.created_at.isoformat()
        }
    }
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.run_coroutine_threadsafe(ws_manager.broadcast(ws_event), loop)
    except Exception:
        pass
