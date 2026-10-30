import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'blue' }) {
  const colorMap = {
    red: 'bg-red-500/10 border-red-500/30 text-red-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  };

  return (
    <div className="bg-dark-800 border border-dark-700/80 rounded-xl p-4 flex items-center justify-between shadow-lg hover:border-dark-600 transition">
      <div>
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">{title}</h2>
        <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{value}</p>
        {subtext && <p className="text-xs text-slate-300 mt-1 font-medium">{subtext}</p>}
      </div>

      {Icon && (
        <div className={`p-3 rounded-lg border ${colorMap[color] || colorMap.blue}`} aria-hidden="true">
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
