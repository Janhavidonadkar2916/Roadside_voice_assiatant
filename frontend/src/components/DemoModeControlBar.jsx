import React, { useState } from 'react';
import { Play, Sparkles, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { runDemoScenario, triggerSimulation } from '../services/api';

export default function DemoModeControlBar({ onScenarioExecuted }) {
  const [isRunning, setIsRunning] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const handleSimulateAccident = async () => {
    setIsRunning(true);
    setLastMessage("Executing end-to-end accident scenario...");
    try {
      const res = await runDemoScenario({
        device_id: 'SOS-NH44-001',
        scenario: 'ACCIDENT_AUTO_DISPATCH'
      });
      setLastMessage(`✅ Accident simulation complete! Alert ID: ${res.data.alert_id} created with ${res.data.assigned_responders_count} responders dispatched.`);
      if (onScenarioExecuted) onScenarioExecuted(res.data);
    } catch (err) {
      console.error(err);
      setLastMessage("❌ Simulation failed. Ensure backend is running.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSimulateLowBattery = async () => {
    try {
      await triggerSimulation({ device_id: 'SOS-NH44-001', event_type: 'LOW_BATTERY' });
      setLastMessage("⚠️ Low battery warning emitted for SOS-NH44-001.");
      if (onScenarioExecuted) onScenarioExecuted();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestoreDevices = async () => {
    try {
      await triggerSimulation({ device_id: 'SOS-NH44-001', event_type: 'RESTORE_DEVICE' });
      setLastMessage("🟢 All Digital Twin units restored to healthy ONLINE state.");
      if (onScenarioExecuted) onScenarioExecuted();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 border-b border-dark-600/60 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Banner Title */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300 tracking-wider uppercase font-mono">PORTFOLIO DEMO MODE</h4>
            <p className="text-xs text-slate-400">Trigger 1-click end-to-end hardware-less Digital Twin pipeline simulation</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateAccident}
            disabled={isRunning}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs font-semibold tracking-wide flex items-center gap-1.5 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
            SIMULATE ACCIDENT
          </button>

          <button
            onClick={handleSimulateLowBattery}
            className="px-3 py-1.5 bg-dark-900/80 hover:bg-dark-900 text-amber-400 border border-amber-500/30 rounded-md text-xs font-medium flex items-center gap-1.5 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Low Battery
          </button>

          <button
            onClick={handleRestoreDevices}
            className="px-3 py-1.5 bg-dark-900/80 hover:bg-dark-900 text-emerald-400 border border-emerald-500/30 rounded-md text-xs font-medium flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restore Twin
          </button>
        </div>
      </div>

      {lastMessage && (
        <div className="max-w-7xl mx-auto mt-2 text-xs font-mono text-slate-300 bg-dark-900/60 px-3 py-1 rounded border border-dark-600/50">
          {lastMessage}
        </div>
      )}
    </div>
  );
}
