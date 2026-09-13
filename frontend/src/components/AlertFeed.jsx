import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, MapPin, ChevronRight, ShieldAlert } from 'lucide-react';
import { SeverityBadge, StatusBadge } from './SeverityBadge';

export default function AlertFeed({ alerts = [] }) {
  const navigate = useNavigate();

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const dt = new Date(dateStr);
    const diffSec = Math.floor((new Date() - dt) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    return `${Math.floor(diffSec / 3600)}h ago`;
  };

  return (
    <div className="bg-dark-800 border border-dark-700/80 rounded-xl p-4 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-dark-700">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">LIVE EMERGENCY FEED</h3>
        </div>
        <span className="px-2 py-0.5 text-xs font-mono bg-red-500/20 text-red-400 rounded-full">
          {alerts.filter(a => a.status !== 'RESOLVED').length} Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1 max-h-[500px]">
        {alerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            No emergency alerts active. System operational.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => navigate(`/alerts/${alert.alert_id}`)}
              className="bg-dark-900/80 hover:bg-dark-900 border border-dark-700 hover:border-red-500/50 p-3 rounded-lg cursor-pointer transition flex items-start justify-between group"
            >
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs text-red-400">{alert.alert_id}</span>
                  <SeverityBadge severity={alert.severity} />
                  <StatusBadge status={alert.status} />
                </div>

                <div className="font-bold text-sm text-white group-hover:text-red-400 transition">
                  {alert.type.replace('_', ' ')}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {alert.highway} / KM {alert.kilometer_marker}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatTimeAgo(alert.created_at)}
                  </span>
                  <span className="text-amber-400 font-semibold">
                    Score: {alert.priority_score}
                  </span>
                </div>
              </div>

              <div className="text-slate-600 group-hover:text-red-400 transition self-center">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
