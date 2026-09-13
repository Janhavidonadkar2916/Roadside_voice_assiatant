from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class ResponderBase(BaseModel):
    responder_id: str
    name: str
    type: str # AMBULANCE, POLICE, HOSPITAL
    latitude: float
    longitude: float
    availability: str = "AVAILABLE" # AVAILABLE, ASSIGNED, UNAVAILABLE
    status: str = "AVAILABLE"
    contact: str

class ResponderOut(ResponderBase):
    id: int
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class ResponderStatusUpdate(BaseModel):
    status: str
    availability: Optional[str] = None
