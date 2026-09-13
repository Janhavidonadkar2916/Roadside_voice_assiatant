from sqlalchemy.orm import Session
from app.models.models import Responder
from app.services.location_service import sort_responders_by_distance

def get_all_responders(db: Session, responder_type: str = None, availability: str = None):
    query = db.query(Responder)
    if responder_type:
        query = query.filter(Responder.type == responder_type)
    if availability:
        query = query.filter(Responder.availability == availability)
    return query.all()

def find_nearby_responders(db: Session, latitude: float, longitude: float, responder_type: str = None, limit: int = 10):
    query = db.query(Responder)
    if responder_type:
        query = query.filter(Responder.type == responder_type)
    responders = query.all()
    
    sorted_pairs = sort_responders_by_distance(latitude, longitude, responders)
    
    results = []
    for resp, dist_km in sorted_pairs[:limit]:
        resp_dict = {
            "id": resp.id,
            "responder_id": resp.responder_id,
            "name": resp.name,
            "type": resp.type,
            "latitude": resp.latitude,
            "longitude": resp.longitude,
            "availability": resp.availability,
            "status": resp.status,
            "contact": resp.contact,
            "distance_km": dist_km
        }
        results.append(resp_dict)
    return results

def update_responder_status(db: Session, responder_id: str, status: str, availability: str = None):
    resp = db.query(Responder).filter(Responder.responder_id == responder_id).first()
    if not resp:
        return None
    resp.status = status
    if availability:
        resp.availability = availability
    db.commit()
    db.refresh(resp)
    return resp
