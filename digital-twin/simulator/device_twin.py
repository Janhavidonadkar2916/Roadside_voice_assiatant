import time
import json
import random
import logging
from datetime import datetime, timezone
from typing import Dict, Any

logger = logging.getLogger("device_twin")

class RoadsideDeviceTwin:
    def __init__(self, device_id: str, name: str, highway: str, kilometer_marker: float, lat: float, lon: float):
        self.device_id = device_id
        self.name = name
        self.highway = highway
        self.kilometer_marker = kilometer_marker
        self.latitude = lat
        self.longitude = lon
        
        # State
        self.status = "ONLINE" # ONLINE, OFFLINE, EMERGENCY, DEGRADED
        self.battery = random.randint(80, 98)
        self.network_status = "CONNECTED"
        self.microphone_status = "ACTIVE"
        self.button_status = "NORMAL"
        self.impact_sensor_status = "NORMAL"
        self.temperature = round(random.uniform(28.0, 32.5), 1)
        self.firmware_version = "v1.2.0"
        self.last_heartbeat = datetime.now(timezone.utc)

    def generate_telemetry(self) -> Dict[str, Any]:
        """Generates realistic telemetry payload."""
        # Gradual battery consumption
        if random.random() < 0.05 and self.battery > 5:
            self.battery -= 1

        # Temperature fluctuation
        self.temperature = round(self.temperature + random.uniform(-0.3, 0.3), 1)
        self.last_heartbeat = datetime.now(timezone.utc)

        return {
            "device_id": self.device_id,
            "name": self.name,
            "highway": self.highway,
            "kilometer_marker": self.kilometer_marker,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "status": self.status,
            "battery": self.battery,
            "network": self.network_status,
            "microphone": self.microphone_status,
            "button": self.button_status,
            "impact_sensor": self.impact_sensor_status,
            "temperature": self.temperature,
            "firmware_version": self.firmware_version,
            "timestamp": self.last_heartbeat.isoformat()
        }

    def generate_event(self, event_type: str, severity: str = "HIGH", payload_extra: dict = None) -> Dict[str, Any]:
        """Creates emergency event payload."""
        base_event = {
            "device_id": self.device_id,
            "event_type": event_type,
            "severity": severity,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "highway": self.highway,
            "kilometer_marker": self.kilometer_marker,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        if payload_extra:
            base_event.update(payload_extra)
        return base_event

    def handle_command(self, command: str, payload: dict = None):
        """Receives bidirectional commands from backend."""
        logger.info(f"[{self.device_id}] Executing command: {command}")
        if command == "RESTORE_DEVICE":
            self.status = "ONLINE"
            self.battery = 90
            self.network_status = "CONNECTED"
            self.microphone_status = "ACTIVE"
            self.button_status = "NORMAL"
            self.impact_sensor_status = "NORMAL"
        elif command == "SIMULATE_LOW_BATTERY":
            self.battery = 8
            self.status = "DEGRADED"
        elif command == "SIMULATE_NETWORK_FAILURE":
            self.network_status = "DISCONNECTED"
            self.status = "OFFLINE"
        elif command == "RESET_SENSOR":
            self.impact_sensor_status = "NORMAL"
            self.button_status = "NORMAL"
