import React, { useState } from 'react';
import { Cpu, Battery, Wifi, Mic, AlertCircle, Thermometer, MapPin, Activity, Zap, RefreshCw, AlertTriangle, Radio } from 'lucide-react';
import { StatusBadge } from './SeverityBadge';
import { triggerSimulation, sendDeviceCommand } from '../services/api';

export default function DeviceCard({ device, onStateChanged }) {
  const [loadingAction, setLoadingAction] = useState(null);

  const handleSimulate = async (eventType) => {
    setLoadingAction(eventType);
    try {
      await triggerSimulation({
        device_id: device.device_id,
        event_type: eventType
      });
      if (onStateChanged) onStateChanged();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCommand = async (cmd) => {
    setLoadingAction(cmd);
    try {
      await sendDeviceCommand(device.device_id, cmd);
      if (onStateChanged) onStateChanged();
    } catch (err) {
      console.error('Device command error:', err);
    } finally {
      setLoadingAction(null);
    }
  };

  const getBatteryColor = (battery) => {
    if (battery < 10) return 'text-red-500 fill-red-500';
    if (battery < 20) return 'text-amber-500';
    return 'text-emerald-400';
  };

  return (
    <div className="bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-xl p-5 shadow-xl flex flex-col justify-between transition">
      {/* Device Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-dark-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white font-mono">{device.device_id}</h3>
              <p className="text-xs text-slate-400">{device.name}</p>
            </div>
          </div>
          <StatusBadge status={device.status} />
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 text-xs font-mono">
          <div className="bg-dark-900/60 p-2.5 rounded-lg border border-dark-700/60 space-y-1">
            <div className="text-slate-500 flex items-center gap-1.5">
              <Battery className={`w-3.5 h-3.5 ${getBatteryColor(device.battery)}`} />
              Battery
            </div>
            <div className={`font-bold text-sm ${device.battery < 20 ? 'text-amber-400' : 'text-slate-100'}`}>
              {device.battery}% {device.battery < 10 && '🚨 CRITICAL'}
            </div>
          </div>

          <div className="bg-dark-900/60 p-2.5 rounded-lg border border-dark-700/60 space-y-1">
            <div className="text-slate-500 flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-blue-400" />
              Network
            </div>
            <div className="font-bold text-sm text-slate-100">{device.network_status}</div>
          </div>

          <div className="bg-dark-900/60 p-2.5 rounded-lg border border-dark-700/60 space-y-1">
            <div className="text-slate-500 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              Microphone
            </div>
            <div className="font-bold text-sm text-slate-100">{device.microphone_status}</div>
          </div>

          <div className="bg-dark-900/60 p-2.5 rounded-lg border border-dark-700/60 space-y-1">
            <div className="text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Impact Sensor
            </div>
            <div className="font-bold text-sm text-slate-100">{device.impact_sensor_status}</div>
          </div>

          <div className="bg-dark-900/60 p-2.5 rounded-lg border border-dark-700/60 space-y-1">
            <div className="text-slate-500 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              Temperature
            </div>
            <div className="font-bold text-sm text-slate-100">{device.temperature}°C</div>
          </div>

          <div className="bg-dark-900/60 p-2.5 rounded-lg border border-dark-700/60 space-y-1">
            <div className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Location
            </div>
            <div className="font-bold text-xs text-slate-300 truncate">
              {device.highway} KM {device.kilometer_marker}
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="text-[11px] font-mono text-slate-500 space-y-0.5 border-t border-dark-700/50 pt-2.5">
          <div className="flex justify-between">
            <span>Coordinates:</span>
            <span className="text-slate-400">{device.latitude}, {device.longitude}</span>
          </div>
          <div className="flex justify-between">
            <span>Firmware:</span>
            <span className="text-slate-400">{device.firmware_version}</span>
          </div>
        </div>
      </div>

      {/* Simulation Controls Panel */}
      <div className="mt-4 pt-3 border-t border-dark-700 space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
          DIGITAL TWIN HARDWARE SIMULATION CONTROLS
        </span>
        <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
          <button
            onClick={() => handleSimulate('MANUAL_SOS')}
            disabled={loadingAction !== null}
            className="py-1.5 px-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded flex items-center justify-center gap-1 transition"
          >
            <Zap className="w-3 h-3" /> SOS Button
          </button>

          <button
            onClick={() => handleSimulate('IMPACT_DETECTED')}
            disabled={loadingAction !== null}
            className="py-1.5 px-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded flex items-center justify-center gap-1 transition"
          >
            <AlertTriangle className="w-3 h-3" /> Impact Crash
          </button>

          <button
            onClick={() => handleSimulate('VOICE_EMERGENCY')}
            disabled={loadingAction !== null}
            className="py-1.5 px-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded flex items-center justify-center gap-1 transition"
          >
            <Mic className="w-3 h-3" /> Voice Event
          </button>

          <button
            onClick={() => handleSimulate('LOW_BATTERY')}
            disabled={loadingAction !== null}
            className="py-1.5 px-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded flex items-center justify-center gap-1 transition"
          >
            <Battery className="w-3 h-3" /> Low Battery
          </button>

          <button
            onClick={() => handleSimulate('NETWORK_FAILURE')}
            disabled={loadingAction !== null}
            className="py-1.5 px-2 bg-slate-700/40 hover:bg-slate-700/60 text-slate-300 border border-slate-600/40 rounded flex items-center justify-center gap-1 transition"
          >
            <Wifi className="w-3 h-3" /> Net Failure
          </button>

          <button
            onClick={() => handleCommand('RESTORE_DEVICE')}
            disabled={loadingAction !== null}
            className="py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded flex items-center justify-center gap-1 transition col-span-2"
          >
            <RefreshCw className="w-3 h-3" /> Restore Healthy Twin State
          </button>
        </div>
      </div>
    </div>
  );
}
