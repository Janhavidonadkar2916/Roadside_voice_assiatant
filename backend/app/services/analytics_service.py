from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Alert, Device, Responder, DeviceEvent

def get_dashboard_stats(db: Session) -> dict:
    now = datetime.now(timezone.utc)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

    active_alerts = db.query(Alert).filter(Alert.status.in_(["ACTIVE", "RESPONDER_ASSIGNED", "EN_ROUTE", "ARRIVED"])).count()
    online_devices = db.query(Device).filter(Device.status.in_(["ONLINE", "EMERGENCY"])).count()
    offline_devices = db.query(Device).filter(Device.status == "OFFLINE").count()
    total_devices = db.query(Device).count()
    responders_available = db.query(Responder).filter(Responder.availability == "AVAILABLE").count()
    total_responders = db.query(Responder).count()
    emergencies_today = db.query(Alert).filter(Alert.created_at >= today_start).count()

    return {
        "active_alerts": active_alerts,
        "online_devices": online_devices,
        "offline_devices": offline_devices,
        "total_devices": total_devices,
        "responders_available": responders_available,
        "total_responders": total_responders,
        "emergencies_today": emergencies_today,
        "system_health": "OPTIMAL" if offline_devices == 0 else "WARNING"
    }

def get_analytics_report(db: Session) -> dict:
    # Severity breakdown
    severity_counts = db.query(Alert.severity, func.count(Alert.id)).group_by(Alert.severity).all()
    severity_data = [{"name": s or "UNKNOWN", "value": count} for s, count in severity_counts]

    # Emergency type breakdown
    type_counts = db.query(Alert.type, func.count(Alert.id)).group_by(Alert.type).all()
    type_data = [{"name": t or "GENERAL", "count": count} for t, count in type_counts]

    # Emergencies last 7 days
    now = datetime.now(timezone.utc)
    daily_trend = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime(day_date.year, day_date.month, day_date.day, tzinfo=timezone.utc)
        day_end = day_start + timedelta(days=1)
        cnt = db.query(Alert).filter(Alert.created_at >= day_start, Alert.created_at < day_end).count()
        daily_trend.append({"date": day_date.strftime("%b %d"), "count": cnt})

    # Most active SOS units
    active_units_query = db.query(Alert.device_id, func.count(Alert.id).label("total")).group_by(Alert.device_id).order_by(func.count(Alert.id).desc()).limit(5).all()
    active_units = [{"device_id": d_id, "alerts": count} for d_id, count in active_units_query]

    # Average response time (mocked/calculated from history)
    avg_response_min = 4.2

    # Uptime %
    total = db.query(Device).count()
    online = db.query(Device).filter(Device.status.in_(["ONLINE", "EMERGENCY"])).count()
    uptime_pct = round((online / total * 100), 1) if total > 0 else 100.0

    return {
        "severity_breakdown": severity_data,
        "type_breakdown": type_data,
        "daily_trend": daily_trend,
        "most_active_units": active_units,
        "average_response_time_minutes": avg_response_min,
        "device_uptime_percentage": uptime_pct
    }
