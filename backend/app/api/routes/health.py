import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.models import Device
from app.mqtt.client import mqtt_manager

logger = logging.getLogger("health_route")
router = APIRouter(prefix="/health", tags=["Health"])

@router.api_route("", methods=["GET", "HEAD"])
def health_check(db: Session = Depends(get_db)):
    db_ok = True
    try:
        db.query(Device).first()
    except Exception as e:
        logger.error(f"Health DB error: {e}")
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "error",
        "mqtt": "connected" if mqtt_manager.is_connected else "disconnected",
        "version": "1.0.0"
    }
