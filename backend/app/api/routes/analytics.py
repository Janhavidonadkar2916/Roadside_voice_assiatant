from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services import analytics_service

router = APIRouter(tags=["Analytics"])

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Retrieve top metric card statistics for command center header."""
    return analytics_service.get_dashboard_stats(db)

@router.get("/analytics")
def get_analytics_report(db: Session = Depends(get_db)):
    """Retrieve aggregated charts & analytics dataset."""
    return analytics_service.get_analytics_report(db)
