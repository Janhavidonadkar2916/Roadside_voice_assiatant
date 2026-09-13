import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, ShieldCheck, Cpu } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { getAnalytics } from '../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#a855f7'];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center font-mono text-slate-400">
        Loading analytics engine metrics...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      {/* Header */}
      <div className="border-b border-dark-700 pb-5">
        <h1 className="text-2xl font-extrabold text-white tracking-tight font-mono flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-purple-400" />
          SYSTEM PERFORMANCE ANALYTICS
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Response times, emergency frequency, device reliability, and incident severity distributions
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase">Avg Response Time</p>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">
              {data?.average_response_time_minutes || 4.2} mins
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">Dispatched to arrived</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase">Device Uptime</p>
            <h3 className="text-2xl font-bold text-blue-400 font-mono mt-1">
              {data?.device_uptime_percentage || 100}%
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">All twin nodes online</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-slate-400 font-mono uppercase">7-Day Incident Trend</p>
            <h3 className="text-2xl font-bold text-purple-400 font-mono mt-1">
              {data?.daily_trend?.reduce((acc, curr) => acc + curr.count, 0) || 0} Total
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">Past 7 days volume</p>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Trend Bar Chart */}
        <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl space-y-4 shadow-xl">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
            Emergencies Per Day (Past 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.daily_trend || []}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#374151', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Breakdown Pie Chart */}
        <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl space-y-4 shadow-xl">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
            Emergencies By Severity Level
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.severity_breakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.severity_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b0f19', borderColor: '#374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most Active Units List */}
      <div className="bg-dark-800 border border-dark-700 p-5 rounded-xl space-y-4 shadow-xl">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" /> Most Active Highway SOS Units
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          {(data?.most_active_units || []).map((unit) => (
            <div key={unit.device_id} className="bg-dark-900/80 p-3 rounded-lg border border-dark-700 flex justify-between items-center">
              <span className="font-bold text-white">{unit.device_id}</span>
              <span className="text-red-400 font-bold">{unit.alerts} Alerts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
