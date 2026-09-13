import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.services.emergency_engine import emergency_engine

def test_voice_text_normalization():
    assert emergency_engine.normalize_voice_text("please help me!!!") == "PLEASE HELP ME"
    assert emergency_engine.normalize_voice_text("there has been an ACCIDENT") == "THERE HAS BEEN AN ACCIDENT"

def test_parse_voice_trigger():
    e_type, severity, _ = emergency_engine.parse_voice_trigger("I need urgent help")
    assert e_type == "GENERAL_EMERGENCY"
    assert severity == "HIGH"

    e_type2, severity2, _ = emergency_engine.parse_voice_trigger("Vehicle crash on highway")
    assert e_type2 == "ACCIDENT"
    assert severity2 == "CRITICAL"

def test_evaluate_impact_trigger():
    e_type, severity, score = emergency_engine.evaluate_trigger("IMPACT_DETECTED", {"impact_g_force": 10.5})
    assert e_type == "ACCIDENT"
    assert severity == "CRITICAL"
    assert score >= 9.0
