import logging
import json
import paho.mqtt.client as mqtt
from app.core.config import settings
from app.mqtt.handlers import handle_telemetry_message, handle_event_message

logger = logging.getLogger("mqtt_client")

class MQTTManager:
    def __init__(self):
        try:
            from paho.mqtt.enums import CallbackAPIVersion
            self.client = mqtt.Client(CallbackAPIVersion.VERSION1)
        except Exception:
            self.client = mqtt.Client()
        self.is_connected = False
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.on_disconnect = self.on_disconnect

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self.is_connected = True
            logger.info("Connected successfully to MQTT Broker.")
            # Subscribe to device topics
            client.subscribe("sos/device/+/telemetry")
            client.subscribe("sos/device/+/events")
            client.subscribe("sos/device/+/state")
        else:
            logger.warning(f"MQTT connection failed with code {rc}")

    def on_disconnect(self, client, userdata, rc):
        self.is_connected = False
        logger.info(f"MQTT disconnected with result code {rc}")

    def on_message(self, client, userdata, msg):
        topic = msg.topic
        payload = msg.payload.decode("utf-8")
        logger.debug(f"Received MQTT msg on {topic}: {payload}")

        if "/telemetry" in topic:
            handle_telemetry_message(topic, payload)
        elif "/events" in topic:
            handle_event_message(topic, payload)

    def start(self):
        """Attempts connection to MQTT broker without blocking startup."""
        try:
            if settings.MQTT_USERNAME and settings.MQTT_PASSWORD:
                self.client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD)
            
            self.client.connect_async(
                settings.MQTT_BROKER_HOST,
                settings.MQTT_BROKER_PORT,
                settings.MQTT_KEEPALIVE
            )
            self.client.loop_start()
            logger.info(f"MQTT client background loop started targeting {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}")
        except Exception as e:
            logger.warning(f"Could not connect to MQTT broker ({e}). Digital Twin will fall back to HTTP/Direct dispatch mode.")

    def publish_command(self, device_id: str, command: str, payload: dict = None):
        """Sends command back to Digital Twin device over MQTT topic sos/device/{device_id}/commands"""
        if not self.is_connected:
            logger.warning(f"MQTT client not connected. Command '{command}' to {device_id} not published over MQTT.")
            return False

        topic = f"sos/device/{device_id}/commands"
        msg = {
            "device_id": device_id,
            "command": command,
            "payload": payload or {}
        }
        self.client.publish(topic, json.dumps(msg))
        return True

    def stop(self):
        try:
            self.client.loop_stop()
            self.client.disconnect()
        except Exception:
            pass

mqtt_manager = MQTTManager()
