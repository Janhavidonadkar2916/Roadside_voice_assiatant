import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../digital-twin')))

from simulator.device_twin import RoadsideDeviceTwin

def test_device_twin_initialization_and_telemetry():
    twin = RoadsideDeviceTwin("SOS-NH44-001", "NH44 Unit 1", "NH44", 512.0, 21.1458, 79.0882)
    assert twin.status == "ONLINE"
    assert twin.battery >= 80

    telemetry = twin.generate_telemetry()
    assert telemetry["device_id"] == "SOS-NH44-001"
    assert "battery" in telemetry
    assert "temperature" in telemetry

def test_device_twin_commands():
    twin = RoadsideDeviceTwin("SOS-NH44-001", "NH44 Unit 1", "NH44", 512.0, 21.1458, 79.0882)
    
    twin.handle_command("SIMULATE_LOW_BATTERY")
    assert twin.battery == 8
    assert twin.status == "DEGRADED"

    twin.handle_command("RESTORE_DEVICE")
    assert twin.status == "ONLINE"
    assert twin.battery == 90
