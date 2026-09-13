import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Cpu, AlertCircle, BarChart3, Radio } from 'lucide-react';

export default function Navbar({ wsConnected }) {
  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 border border-red-500/40 rounded-lg text-red-500 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wide text-white font-mono">SMART-SOS</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                  DIGITAL TWIN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Highway Emergency Command Center</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-dark-700 text-white border-b-2 border-red-500'
                    : 'text-slate-300 hover:bg-dark-700/50 hover:text-white'
                }`
              }
            >
              <Radio className="w-4 h-4 text-red-400" />
              Command Center
            </NavLink>

            <NavLink
              to="/digital-twin"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-dark-700 text-white border-b-2 border-red-500'
                    : 'text-slate-300 hover:bg-dark-700/50 hover:text-white'
                }`
              }
            >
              <Cpu className="w-4 h-4 text-blue-400" />
              Digital Twin Hub
            </NavLink>

            <NavLink
              to="/user-sos"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-dark-700 text-white border-b-2 border-red-500'
                    : 'text-slate-300 hover:bg-dark-700/50 hover:text-white'
                }`
              }
            >
              <AlertCircle className="w-4 h-4 text-orange-400" />
              User SOS Trigger
            </NavLink>

            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-dark-700 text-white border-b-2 border-red-500'
                    : 'text-slate-300 hover:bg-dark-700/50 hover:text-white'
                }`
              }
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Analytics
            </NavLink>
          </nav>

          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-2 bg-dark-900/80 px-3 py-1.5 rounded-full border border-dark-700 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className={wsConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {wsConnected ? 'REAL-TIME LIVE' : 'CONNECTING...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
