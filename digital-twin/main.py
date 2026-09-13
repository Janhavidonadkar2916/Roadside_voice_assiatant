import time
import json
import logging
import os
import requests
import paho.mqtt.client as mqtt
from simulator.device_twin import RoadsideDeviceTwin

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("digital_twin_daemon")

MQTT_HOST = os.getenv("MQTT_BROKER_HOST", "localhost")
MQTT_PORT = int(os.getenv("MQTT_BROKER_PORT", "1883"))
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000/api")

devices = [
    RoadsideDeviceTwin("SOS-NH44-001", "NH44 KM 512 SOS Unit", "NH44", 512.0, 21.1458, 79.0882),
    RoadsideDeviceTwin("SOS-NH44-002", "NH44 KM 528 SOS Unit", "NH44", 528.5, 21.2300, 79.1500),
    RoadsideDeviceTwin("SOS-NH47-105", "NH47 KM 105 SOS Unit", "NH47", 105.0, 21.0500, 79.0200),
    RoadsideDeviceTwin("SOS-NH65-042", "NH65 KM 42 SOS Unit", "NH65", 42.3, 21.1800, 78.9800),
]

try:
    from paho.mqtt.enums import CallbackAPIVersion
    mqtt_client = mqtt.Client(CallbackAPIVersion.VERSION1)
except Exception:
    mqtt_client = mqtt.Client()
is_mqtt_connected = False

def on_connect(client, userdata, flags, rc):
    global is_mqtt_connected
    if rc == 0:
        is_mqtt_connected = True
        logger.info("Digital Twin connected to MQTT broker.")
        client.subscribe("sos/device/+/commands")
    else:
        logger.warning(f"Digital Twin MQTT connect returned code {rc}")

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = json.loads(msg.payload.decode())
        device_id = payload.get("device_id")
        command = payload.get("command")
        
        for dev in devices:
            if dev.device_id == device_id:
                dev.handle_command(command, payload.get("payload"))
                break
    except Exception as e:
        logger.error(f"Error handling MQTT command: {e}")

def main():
    logger.info("Starting Digital Twin IoT Simulator Daemon...")
    mqtt_client.on_connect = on_connect
    mqtt_client.on_message = on_message

    try:
        mqtt_client.connect_async(MQTT_HOST, MQTT_PORT, 60)
        mqtt_client.loop_start()
    except Exception as e:
        logger.warning(f"Could not connect Digital Twin to MQTT ({e}). Will send HTTP telemetry fallback.")

    interval_seconds = 5
    while True:
        try:
            for dev in devices:
                if dev.status == "OFFLINE":
                    continue
                    
                telemetry = dev.generate_telemetry()
                topic = f"sos/device/{dev.device_id}/telemetry"
                
                if is_mqtt_connected:
                    mqtt_client.publish(topic, json.dumps(telemetry))
                else:
                    # HTTP fallback
                    try:
                        requests.post(f"{BACKEND_URL}/devices/{dev.device_id}/telemetry", json=telemetry, timeout=2)
                    except Exception:
                        pass
                        
            time.sleep(interval_seconds)
        except KeyboardInterrupt:
            logger.info("Stopping Digital Twin Simulator Daemon...")
            break
        except Exception as e:
            logger.error(f"Loop exception: {e}")
            time.sleep(interval_seconds)

if __name__ == "__main__":
    main()
