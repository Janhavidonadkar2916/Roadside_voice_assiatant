import React, { useState, useEffect, useCallback } from 'react';
import { Radio, AlertTriangle, CheckCircle2, Shield, Users, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import EmergencyMap from '../components/EmergencyMap';
import AlertFeed from '../components/AlertFeed';
import DemoModeControlBar from '../components/DemoModeControlBar';
import { getDashboardStats, getDevices, getAlerts, getResponders } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    active_alerts: 0,
    online_devices: 0,
    offline_devices: 0,
    responders_available: 0,
    emergencies_today: 0
  });
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, devRes, altRes, respRes] = await Promise.all([
        getDashboardStats(),
        getDevices(),
        getAlerts(),
        getResponders()
      ]);
      setStats(statsRes.data);
      setDevices(devRes.data);
      setAlerts(altRes.data);
      setResponders(respRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle incoming real-time WebSocket updates
  const handleWsMessage = useCallback((msg) => {
    if (msg.type === 'TELEMETRY_UPDATE' || msg.type === 'ALERT_CREATED' || msg.type === 'ALERT_UPDATED') {
      fetchData();
    }
  }, [fetchData]);

  const { isConnected } = useWebSocket(handleWsMessage);

  return (
    <div className="space-y-6">
      {/* Portfolio Presentation Demo Mode Bar */}
      <DemoModeControlBar onScenarioExecuted={fetchData} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-12">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight font-mono flex items-center gap-2">
              <Radio className="w-6 h-6 text-red-500 animate-pulse" />
              EMERGENCY COMMAND DASHBOARD
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Real-time monitoring of roadside SOS units, automated emergency dispatch, and digital twin telemetry
            </p>
          </div>
        </div>

        {/* Top Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Active Alerts"
            value={stats.active_alerts}
            subtext="Require operator attention"
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Online Units"
            value={`${stats.online_devices}/${stats.total_devices || 4}`}
            subtext="Roadside twins active"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Offline Devices"
            value={stats.offline_devices}
            subtext="Maintenance required"
            icon={Activity}
            color="amber"
          />
          <StatCard
            title="Responders"
            value={`${stats.responders_available}/${stats.total_responders || 6}`}
            subtext="Ambulance/Police ready"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Emergencies Today"
            value={stats.emergencies_today}
            subtext="Past 24 hours"
            icon={Shield}
            color="purple"
          />
        </div>

        {/* Main Grid: Interactive Map + Live Alert Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
          {/* Map Column (2/3 width) */}
          <div className="lg:col-span-2 h-full">
            <EmergencyMap devices={devices} alerts={alerts} responders={responders} />
          </div>

          {/* Alert Feed Column (1/3 width) */}
          <div className="lg:col-span-1 h-full">
            <AlertFeed alerts={alerts} />
          </div>
        </div>
      </div>
    </div>
  );
}
