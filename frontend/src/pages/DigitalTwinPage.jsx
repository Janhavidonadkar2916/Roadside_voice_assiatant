import React, { useState, useEffect, useCallback } from 'react';
import { Cpu, RefreshCw, Layers } from 'lucide-react';
import DeviceCard from '../components/DeviceCard';
import { getDevices } from '../services/api';

export default function DigitalTwinPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await getDevices();
      setDevices(res.data);
    } catch (err) {
      console.error('Error fetching twin devices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 4000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-700 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-mono flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-blue-400" />
            DIGITAL TWIN CONTROL CENTER
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Stateful virtual representation of physical roadside SOS units. Synchronized via MQTT telemetry.
          </p>
        </div>

        <button
          onClick={fetchDevices}
          className="px-3.5 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Telemetry
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-950/40 border border-blue-600/30 rounded-xl p-4 text-xs font-mono text-blue-300 flex items-start gap-3">
        <Layers className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-200 block mb-0.5">HARDWARE-READY ARCHITECTURE</span>
          Each card below represents a stateful Digital Twin running on the MQTT broker (`sos/device/{'{'}device_id{'}'}/telemetry`). You can trigger simulated impacts, battery drain, or network drops directly below. Physical ESP32 / Raspberry Pi units can publish to the identical MQTT schema seamlessly.
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} onStateChanged={fetchDevices} />
        ))}
      </div>
    </div>
  );
}
