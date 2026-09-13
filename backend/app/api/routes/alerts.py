from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db
from app.schemas.alert import AlertCreate, AlertOut, AlertDetailOut, AlertStatusUpdate
from app.models.models import Alert
from app.services import alert_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[AlertOut])
def list_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """List emergency alerts filtered by status or severity."""
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    return query.order_by(Alert.created_at.desc()).limit(limit).all()

@router.post("", response_model=AlertOut, status_code=201)
def create_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    """Creates a new emergency alert (from User Voice/Manual button or simulation)."""
    alert = alert_service.process_and_create_alert(
        db=db,
        device_id=payload.device_id,
        trigger_source=payload.trigger_source,
        payload={
            "voice_keyword": payload.voice_keyword,
            "voice_confidence": payload.voice_confidence,
            "confirmed_by_user": payload.confirmed_by_user
        },
        user_lat=payload.latitude,
        user_lon=payload.longitude,
        override_type=payload.type
    )
    return alert

@router.get("/{alert_id}", response_model=AlertDetailOut)
def get_alert_detail(alert_id: str, db: Session = Depends(get_db)):
    """Retrieve comprehensive emergency alert details including responder assignments and event history timeline."""
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return alert

@router.patch("/{alert_id}/status", response_model=AlertOut)
def update_alert_status(alert_id: str, body: AlertStatusUpdate, db: Session = Depends(get_db)):
    """Update emergency alert status (e.g. EN_ROUTE -> ARRIVED -> RESOLVED)."""
    alert = alert_service.update_alert_status(
        db=db,
        alert_id=alert_id,
        new_status=body.status,
        description=body.description
    )
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return alert
