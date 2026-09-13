import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';

// Custom SVG Icons for Leaflet Markers
const createSvgIcon = (svgString, className = '') => {
  return L.divIcon({
    html: `<div class="p-1.5 rounded-full bg-dark-900/90 border border-dark-600 shadow-xl flex items-center justify-center ${className}">${svgString}</div>`,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const icons = {
  sosOnline: createSvgIcon(
    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  ),
  sosEmergency: createSvgIcon(
    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    'emergency-pulse-marker border-red-500'
  ),
  ambulance: createSvgIcon(
    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><rect x="1" y="6" width="16" height="11" rx="2"/><path d="M17 9h4l3 3v5h-7V9z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
  ),
  police: createSvgIcon(
    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>`
  ),
  hospital: createSvgIcon(
    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
  ),
};

export default function EmergencyMap({ devices = [], alerts = [], responders = [], center = [21.1458, 79.0882], zoom = 11 }) {
  return (
    <div className="w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-dark-700 shadow-2xl relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-tile-layer"
        />

        {/* SOS Devices */}
        {devices.map((dev) => (
          <Marker
            key={`device-${dev.id}`}
            position={[dev.latitude, dev.longitude]}
            icon={dev.status === 'EMERGENCY' ? icons.sosEmergency : icons.sosOnline}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 font-sans text-xs bg-dark-900 text-white rounded">
                <div className="font-bold font-mono text-emerald-400">{dev.device_id}</div>
                <div className="text-slate-300">{dev.name}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-slate-400">Battery: {dev.battery}%</span>
                  <span className="text-slate-400">Status: {dev.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active Emergency Alerts */}
        {alerts.filter(a => a.status !== 'RESOLVED').map((alt) => (
          <React.Fragment key={`alert-${alt.id}`}>
            <Marker
              position={[alt.latitude, alt.longitude]}
              icon={icons.sosEmergency}
            >
              <Popup>
                <div className="p-1 font-sans text-xs text-slate-100">
                  <div className="font-bold text-red-400 font-mono">🚨 {alt.alert_id}</div>
                  <div className="font-semibold text-white mt-0.5">{alt.type} - {alt.severity}</div>
                  <div className="text-slate-400 mt-1">Location: {alt.highway} / KM {alt.kilometer_marker}</div>
                  <div className="text-amber-400 mt-0.5 font-mono">Priority: {alt.priority_score}/10</div>
                </div>
              </Popup>
            </Marker>
            <CircleMarker
              center={[alt.latitude, alt.longitude]}
              radius={24}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.25, weight: 2 }}
            />
          </React.Fragment>
        ))}

        {/* Responders */}
        {responders.map((resp) => {
          let icon = icons.ambulance;
          if (resp.type === 'POLICE') icon = icons.police;
          if (resp.type === 'HOSPITAL') icon = icons.hospital;

          return (
            <Marker
              key={`responder-${resp.id}`}
              position={[resp.latitude, resp.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-1 font-sans text-xs text-slate-100">
                  <div className="font-bold text-blue-400">{resp.name}</div>
                  <div className="text-slate-300 font-mono">ID: {resp.responder_id} ({resp.type})</div>
                  <div className="text-emerald-400 mt-0.5 font-semibold">Status: {resp.status}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-dark-900/90 backdrop-blur border border-dark-700 p-2.5 rounded-lg text-xs z-10 font-mono space-y-1.5 shadow-xl">
        <div className="font-bold text-slate-300 text-[10px] uppercase tracking-wider mb-1">MAP LEGEND</div>
        <div className="flex items-center gap-2 text-red-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          Emergency Incident
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          SOS Twin Unit (Online)
        </div>
        <div className="flex items-center gap-2 text-blue-400">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          Ambulance / Medical Unit
        </div>
        <div className="flex items-center gap-2 text-purple-400">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          Police Patrol
        </div>
        <div className="flex items-center gap-2 text-teal-400">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
          Trauma Hospital
        </div>
      </div>
    </div>
  );
}
