from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class AlertBase(BaseModel):
    device_id: str = Field(..., json_schema_extra={"example": "SOS-NH44-001"})
    type: str = Field("GENERAL_EMERGENCY", json_schema_extra={"example": "ACCIDENT"}) # ACCIDENT, MEDICAL, FIRE, SECURITY, GENERAL_EMERGENCY
    severity: str = Field("HIGH", json_schema_extra={"example": "HIGH"}) # LOW, MEDIUM, HIGH, CRITICAL
    trigger_source: str = Field("SOS_BUTTON", json_schema_extra={"example": "IMPACT_DETECTED"}) # VOICE_EMERGENCY, SOS_BUTTON, IMPACT_DETECTED
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    highway: Optional[str] = None
    kilometer_marker: Optional[float] = None

class AlertCreate(AlertBase):
    voice_keyword: Optional[str] = None
    voice_confidence: Optional[float] = None
    confirmed_by_user: Optional[bool] = True

class AlertStatusUpdate(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "EN_ROUTE"}) # ACTIVE, RESPONDER_ASSIGNED, EN_ROUTE, ARRIVED, RESOLVED
    description: Optional[str] = None

class ResponderBrief(BaseModel):
    responder_id: str
    name: str
    type: str
    contact: str
    latitude: float
    longitude: float

    model_config = ConfigDict(from_attributes=True)

class AlertAssignmentOut(BaseModel):
    id: int
    alert_id: str
    responder_id: str
    status: str
    assigned_at: datetime
    responder: Optional[ResponderBrief] = None

    model_config = ConfigDict(from_attributes=True)

class AlertHistoryOut(BaseModel):
    id: int
    status: str
    description: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class AlertOut(AlertBase):
    id: int
    alert_id: str
    latitude: float
    longitude: float
    highway: str
    kilometer_marker: float
    status: str
    priority_score: float
    created_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AlertDetailOut(AlertOut):
    assignments: List[AlertAssignmentOut] = []
    history: List[AlertHistoryOut] = []

    model_config = ConfigDict(from_attributes=True)
