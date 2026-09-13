import re
from typing import Dict, Any, Tuple

class EmergencyEngine:
    """
    Core Emergency Processing Engine.
    Handles trigger validation, severity determination, false alert checks,
    and priority scoring. Designed to be easily upgraded with ML models later.
    """

    VOICE_KEYWORDS = {
        "HELP": {"type": "GENERAL_EMERGENCY", "severity": "HIGH"},
        "ACCIDENT": {"type": "ACCIDENT", "severity": "CRITICAL"},
        "CRASH": {"type": "ACCIDENT", "severity": "CRITICAL"},
        "EMERGENCY": {"type": "GENERAL_EMERGENCY", "severity": "HIGH"},
        "AMBULANCE": {"type": "MEDICAL", "severity": "HIGH"},
        "DOCTOR": {"type": "MEDICAL", "severity": "HIGH"},
        "BLOOD": {"type": "MEDICAL", "severity": "HIGH"},
        "FIRE": {"type": "FIRE", "severity": "HIGH"},
        "POLICE": {"type": "SECURITY", "severity": "HIGH"},
        "ATTACK": {"type": "SECURITY", "severity": "HIGH"},
        "ROBBERY": {"type": "SECURITY", "severity": "HIGH"},
    }

    @classmethod
    def normalize_voice_text(cls, text: str) -> str:
        """Clean and normalize transcript text for keyword matching."""
        if not text:
            return ""
        cleaned = re.sub(r'[^\w\s]', '', text.upper())
        return cleaned.strip()

    @classmethod
    def parse_voice_trigger(cls, text: str, confidence: float = 1.0) -> Tuple[str, str, float]:
        """
        Parses voice transcript text.
        Returns tuple: (emergency_type, severity, match_confidence)
        """
        norm = cls.normalize_voice_text(text)
        matched_keyword = None
        
        for keyword in cls.VOICE_KEYWORDS:
            if keyword in norm.split() or keyword in norm:
                matched_keyword = keyword
                break

        if matched_keyword:
            info = cls.VOICE_KEYWORDS[matched_keyword]
            return info["type"], info["severity"], confidence
        
        return "GENERAL_EMERGENCY", "MEDIUM", confidence

    @classmethod
    def evaluate_trigger(
        cls, 
        trigger_source: str, 
        payload: Dict[str, Any] = None
    ) -> Tuple[str, str, float]:
        """
        Evaluates event trigger source and optional payload to determine:
        (emergency_type, severity, priority_score)
        """
        payload = payload or {}
        
        if trigger_source == "IMPACT_DETECTED":
            g_force = payload.get("impact_g_force", 8.0)
            if g_force >= 10.0:
                return "ACCIDENT", "CRITICAL", 9.8
            elif g_force >= 5.0:
                return "ACCIDENT", "HIGH", 8.5
            else:
                return "ACCIDENT", "MEDIUM", 6.5

        elif trigger_source == "VOICE_EMERGENCY":
            text = payload.get("voice_keyword", "") or payload.get("transcript", "")
            conf = payload.get("voice_confidence", 0.9)
            e_type, severity, _ = cls.parse_voice_trigger(text, conf)
            
            # Base priority on severity
            base_score = 8.5 if severity in ["HIGH", "CRITICAL"] else 6.0
            return e_type, severity, base_score

        elif trigger_source == "SOS_BUTTON":
            return "GENERAL_EMERGENCY", "HIGH", 8.0

        return "GENERAL_EMERGENCY", "MEDIUM", 5.0

    @classmethod
    def calculate_priority_score(
        cls,
        emergency_type: str,
        severity: str,
        trigger_source: str,
        device_health_ok: bool = True,
        user_confirmed: bool = True
    ) -> float:
        """
        Calculates a priority score from 1.0 to 10.0 based on rule-based parameters.
        """
        score = 5.0
        
        # Severity weights
        if severity == "CRITICAL":
            score += 3.5
        elif severity == "HIGH":
            score += 2.5
        elif severity == "MEDIUM":
            score += 1.0

        # Trigger source weight
        if trigger_source == "IMPACT_DETECTED":
            score += 1.0 # Automated impact is urgent
        elif trigger_source == "SOS_BUTTON":
            score += 0.5

        # Confirmation weight
        if user_confirmed:
            score += 0.5

        return min(10.0, round(score, 1))

emergency_engine = EmergencyEngine()
