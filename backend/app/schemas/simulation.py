from pydantic import BaseModel, Field
from typing import Optional

class SimulationTriggerInput(BaseModel):
    device_id: str = Field("SOS-NH44-001", json_schema_extra={"example": "SOS-NH44-001"})
    event_type: str = Field(..., json_schema_extra={"example": "IMPACT_DETECTED"}) 
    # Supported: MANUAL_SOS, IMPACT_DETECTED, VOICE_EMERGENCY, LOW_BATTERY, NETWORK_FAILURE, SENSOR_FAILURE, RESTORE_DEVICE
    impact_g_force: Optional[float] = 8.5
    voice_keyword: Optional[str] = "HELP"
    voice_confidence: Optional[float] = 0.95

class DemoScenarioInput(BaseModel):
    device_id: str = Field("SOS-NH44-001", json_schema_extra={"example": "SOS-NH44-001"})
    scenario: str = Field("ACCIDENT_AUTO_DISPATCH", json_schema_extra={"example": "ACCIDENT_AUTO_DISPATCH"})
