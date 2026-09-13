from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db
from app.schemas.responder import ResponderOut, ResponderStatusUpdate
from app.services import responder_service

router = APIRouter(prefix="/responders", tags=["Responders"])

@router.get("", response_model=List[ResponderOut])
def list_responders(
    responder_type: Optional[str] = Query(None, alias="type"),
    availability: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve all emergency responders (Ambulance, Police, Hospitals)."""
    return responder_service.get_all_responders(
        db=db,
        responder_type=responder_type,
        availability=availability
    )

@router.get("/nearby", response_model=List[ResponderOut])
def get_nearby_responders(
    lat: float = Query(..., examples=[21.1458]),
    lon: float = Query(..., examples=[79.0882]),
    responder_type: Optional[str] = Query(None, alias="type"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Calculates and ranks nearby emergency responders using Haversine distance math."""
    return responder_service.find_nearby_responders(
        db=db,
        latitude=lat,
        longitude=lon,
        responder_type=responder_type,
        limit=limit
    )

@router.post("/{responder_id}/status", response_model=ResponderOut)
def update_responder_status(
    responder_id: str,
    body: ResponderStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update status of a specific responder (e.g. EN_ROUTE -> ARRIVED)."""
    resp = responder_service.update_responder_status(
        db=db,
        responder_id=responder_id,
        status=body.status,
        availability=body.availability
    )
    if not resp:
        raise HTTPException(status_code=404, detail=f"Responder {responder_id} not found")
    return resp
