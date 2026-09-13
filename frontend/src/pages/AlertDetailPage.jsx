import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, ShieldAlert, Truck, Building2, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../components/SeverityBadge';
import { getAlertById, updateAlertStatus } from '../services/api';
import EmergencyMap from '../components/EmergencyMap';

export default function AlertDetailPage() {
  const { alertId } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await getAlertById(alertId);
      setAlert(res.data);
    } catch (err) {
      console.error('Error fetching alert detail:', err);
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(fetchDetail, 5000);
    return () => clearInterval(interval);
  }, [fetchDetail]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await updateAlertStatus(alertId, newStatus, `Operator updated alert status to ${newStatus}`);
      await fetchDetail();
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center font-mono text-slate-400">
        Loading emergency alert details...
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center font-mono text-rose-400">
        Alert {alertId} not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Command Dashboard
        </button>

        {/* Operator Controls */}
        <div className="flex items-center gap-2">
          {alert.status !== 'EN_ROUTE' && alert.status !== 'RESOLVED' && (
            <button
              onClick={() => handleStatusChange('EN_ROUTE')}
              disabled={updating}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded text-xs font-mono font-bold transition"
            >
              Mark En Route
            </button>
          )}
          {alert.status !== 'ARRIVED' && alert.status !== 'RESOLVED' && (
            <button
              onClick={() => handleStatusChange('ARRIVED')}
              disabled={updating}
              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded text-xs font-mono font-bold transition"
            >
              Mark Arrived
            </button>
          )}
          {alert.status !== 'RESOLVED' && (
            <button
              onClick={() => handleStatusChange('RESOLVED')}
              disabled={updating}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono font-bold transition"
            >
              Resolve Emergency
            </button>
          )}
        </div>
      </div>

      {/* Main Alert Info Bar */}
      <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white font-mono">{alert.alert_id}</h1>
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>
          <p className="text-sm text-slate-300 font-mono">
            {alert.type.replace('_', ' ')} • Triggered via <strong className="text-red-400">{alert.trigger_source}</strong>
          </p>
        </div>

        <div className="text-right font-mono text-xs text-slate-400">
          <div>Priority Score: <strong className="text-red-400 text-base">{alert.priority_score}/10</strong></div>
          <div>Created: {new Date(alert.created_at).toLocaleString()}</div>
        </div>
      </div>

      {/* Grid: Details + Map + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Assigned Responders */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 space-y-3 shadow-lg">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Incident Location
            </h3>
            <div className="text-xs font-mono space-y-1.5 text-slate-300">
              <div className="flex justify-between border-b border-dark-700 pb-1">
                <span className="text-slate-500">SOS Unit:</span>
                <span className="font-bold text-white">{alert.device_id}</span>
              </div>
              <div className="flex justify-between border-b border-dark-700 pb-1">
                <span className="text-slate-500">Highway / Marker:</span>
                <span>{alert.highway} / KM {alert.kilometer_marker}</span>
              </div>
              <div className="flex justify-between border-b border-dark-700 pb-1">
                <span className="text-slate-500">Coordinates:</span>
                <span>{alert.latitude}, {alert.longitude}</span>
              </div>
            </div>
          </div>

          {/* Assigned Responders */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 space-y-3 shadow-lg">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" /> Assigned Emergency Services
            </h3>

            {alert.assignments.length === 0 ? (
              <p className="text-xs font-mono text-slate-500">Searching nearest available responders...</p>
            ) : (
              <div className="space-y-2.5">
                {alert.assignments.map((asgn) => (
                  <div key={asgn.id} className="bg-dark-900/80 p-3 rounded-lg border border-dark-700 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span className="text-blue-400">{asgn.responder?.name || asgn.responder_id}</span>
                      <StatusBadge status={asgn.status} />
                    </div>
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Type: {asgn.responder?.type}</span>
                      <span>Contact: {asgn.responder?.contact}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center & Right: Map + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Preview */}
          <div className="h-[320px]">
            <EmergencyMap
              center={[alert.latitude, alert.longitude]}
              zoom={13}
              alerts={[alert]}
            />
          </div>

          {/* Responder Timeline */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 space-y-4 shadow-lg">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Incident Timeline & Audit Log
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-dark-600">
              {alert.history.map((hist) => (
                <div key={hist.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-dark-800"></div>
                  <div className="text-xs font-mono text-slate-400">
                    <span className="text-slate-500 mr-2">{new Date(hist.timestamp).toLocaleTimeString()}</span>
                    <strong className="text-slate-200">{hist.status}</strong>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">{hist.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
