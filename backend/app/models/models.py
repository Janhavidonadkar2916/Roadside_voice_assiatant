from datetime import datetime, timezone
import json
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    highway = Column(String(50), nullable=False)
    kilometer_marker = Column(Float, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(30), default="ONLINE") # ONLINE, OFFLINE, EMERGENCY, DEGRADED
    battery = Column(Integer, default=100) # 0-100
    network_status = Column(String(30), default="CONNECTED") # CONNECTED, DISCONNECTED
    microphone_status = Column(String(30), default="ACTIVE") # ACTIVE, INACTIVE, FAULT
    button_status = Column(String(30), default="NORMAL") # NORMAL, PRESSED
    impact_sensor_status = Column(String(30), default="NORMAL") # NORMAL, IMPACT_DETECTED
    temperature = Column(Float, default=28.5)
    firmware_version = Column(String(20), default="v1.2.0")
    last_heartbeat = Column(DateTime(timezone=True), default=utc_now)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    events = relationship("DeviceEvent", back_populates="device", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="device")


class DeviceEvent(Base):
    __tablename__ = "device_events"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), ForeignKey("devices.device_id"), index=True, nullable=False)
    event_type = Column(String(50), nullable=False) # IMPACT_DETECTED, VOICE_EMERGENCY, MANUAL_SOS, BATTERY_LOW, HEARTBEAT
    payload = Column(Text, default="{}") # Stored as JSON string
    timestamp = Column(DateTime(timezone=True), default=utc_now)

    device = relationship("Device", back_populates="events")

    def get_payload_json(self):
        try:
            return json.loads(self.payload) if self.payload else {}
        except Exception:
            return {}


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. SOS-2026-000001
    device_id = Column(String(50), ForeignKey("devices.device_id"), index=True, nullable=False)
    type = Column(String(50), nullable=False) # ACCIDENT, MEDICAL, FIRE, SECURITY, GENERAL_EMERGENCY
    severity = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    trigger_source = Column(String(50), nullable=False) # VOICE_EMERGENCY, SOS_BUTTON, IMPACT_DETECTED
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    highway = Column(String(50), nullable=False)
    kilometer_marker = Column(Float, nullable=False)
    status = Column(String(30), default="ACTIVE") # ACTIVE, RESPONDER_ASSIGNED, EN_ROUTE, ARRIVED, RESOLVED
    priority_score = Column(Float, default=7.5)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    device = relationship("Device", back_populates="alerts")
    assignments = relationship("AlertAssignment", back_populates="alert", cascade="all, delete-orphan")
    history = relationship("AlertHistory", back_populates="alert", cascade="all, delete-orphan")


class Responder(Base):
    __tablename__ = "responders"

    id = Column(Integer, primary_key=True, index=True)
    responder_id = Column(String(50), unique=True, index=True, nullable=False) # AMB-001, POL-002, HOS-003
    name = Column(String(100), nullable=False)
    type = Column(String(30), nullable=False) # AMBULANCE, POLICE, HOSPITAL
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    availability = Column(String(30), default="AVAILABLE") # AVAILABLE, ASSIGNED, UNAVAILABLE
    status = Column(String(30), default="AVAILABLE") # AVAILABLE, ASSIGNED, EN_ROUTE, ARRIVED, COMPLETED, OFFLINE
    contact = Column(String(50), nullable=False)

    assignments = relationship("AlertAssignment", back_populates="responder")


class AlertAssignment(Base):
    __tablename__ = "alert_assignments"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), ForeignKey("alerts.alert_id"), index=True, nullable=False)
    responder_id = Column(String(50), ForeignKey("responders.responder_id"), index=True, nullable=False)
    status = Column(String(30), default="ASSIGNED") # ASSIGNED, EN_ROUTE, ARRIVED, COMPLETED
    assigned_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    alert = relationship("Alert", back_populates="assignments")
    responder = relationship("Responder", back_populates="assignments")


class AlertHistory(Base):
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(50), ForeignKey("alerts.alert_id"), index=True, nullable=False)
    status = Column(String(30), nullable=False)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utc_now)

    alert = relationship("Alert", back_populates="history")
