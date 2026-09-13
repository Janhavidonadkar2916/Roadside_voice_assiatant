from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class DeviceBase(BaseModel):
    device_id: str = Field(..., json_schema_extra={"example": "SOS-NH44-001"})
    name: str = Field(..., json_schema_extra={"example": "NH44 KM 512 SOS Unit"})
    highway: str = Field(..., json_schema_extra={"example": "NH44"})
    kilometer_marker: float = Field(..., json_schema_extra={"example": 512.0})
    latitude: float = Field(..., json_schema_extra={"example": 21.1458})
    longitude: float = Field(..., json_schema_extra={"example": 79.0882})

class DeviceCreate(DeviceBase):
    firmware_version: Optional[str] = "v1.2.0"

class DeviceUpdate(BaseModel):
    status: Optional[str] = None
    battery: Optional[int] = None
    network_status: Optional[str] = None
    microphone_status: Optional[str] = None
    button_status: Optional[str] = None
    impact_sensor_status: Optional[str] = None
    temperature: Optional[float] = None
    firmware_version: Optional[str] = None

class DeviceTelemetryInput(BaseModel):
    device_id: str
    battery: int
    temperature: float
    network: str = "CONNECTED"
    microphone: str = "ACTIVE"
    button: str = "NORMAL"
    impact_sensor: str = "NORMAL"
    timestamp: Optional[str] = None

class DeviceOut(DeviceBase):
    id: int
    status: str
    battery: int
    network_status: str
    microphone_status: str
    button_status: str
    impact_sensor_status: str
    temperature: float
    firmware_version: str
    last_heartbeat: datetime
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
