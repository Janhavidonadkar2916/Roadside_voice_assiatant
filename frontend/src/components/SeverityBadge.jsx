import React from 'react';

export function SeverityBadge({ severity }) {
  const styles = {
    CRITICAL: 'bg-rose-950/80 text-rose-300 border-rose-600/50 animate-pulse',
    HIGH: 'bg-orange-950/80 text-orange-300 border-orange-600/50',
    MEDIUM: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
    LOW: 'bg-slate-800 text-slate-300 border-slate-600/50',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-bold font-mono border rounded ${styles[severity] || styles.LOW}`}>
      {severity}
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    ACTIVE: 'bg-red-500/20 text-red-400 border-red-500/40',
    RESPONDER_ASSIGNED: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    EN_ROUTE: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    ARRIVED: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    RESOLVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    ONLINE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    OFFLINE: 'bg-slate-700/50 text-slate-400 border-slate-600/40',
    EMERGENCY: 'bg-red-600/30 text-red-300 border-red-500/60 animate-pulse',
    DEGRADED: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold font-mono border rounded-full inline-flex items-center gap-1 ${styles[status] || styles.ONLINE}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status}
    </span>
  );
}
