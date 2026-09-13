import React, { useState } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle2, MapPin, Volume2, ShieldAlert, X } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { createAlert } from '../services/api';

export default function UserSosPage() {
  const [selectedDevice, setSelectedDevice] = useState('SOS-NH44-001');
  const [confirmationModal, setConfirmationModal] = useState(null); // { type: 'VOICE'|'MANUAL', keyword?: string }
  const [successAlert, setSuccessAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeywordMatch = (keyword, fullTranscript, conf) => {
    // Show confirmation modal instead of immediate dispatch
    setConfirmationModal({
      type: 'VOICE',
      keyword: keyword,
      transcript: fullTranscript,
      confidence: conf
    });
  };

  const {
    isListening,
    transcript,
    detectedKeyword,
    error,
    startListening,
    stopListening,
    resetSpeech
  } = useSpeechRecognition(handleKeywordMatch);

  const handleManualSosClick = () => {
    setConfirmationModal({
      type: 'MANUAL',
      keyword: 'MANUAL_BUTTON'
    });
  };

  const handleConfirmSos = async () => {
    if (!confirmationModal) return;
    setIsSubmitting(true);

    try {
      let lat = 21.1458;
      let lon = 79.0882;

      // Try browser geolocation if available
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } catch (e) {
          // fallback to default SOS device location
        }
      }

      const isVoice = confirmationModal.type === 'VOICE';
      const triggerSource = isVoice ? 'VOICE_EMERGENCY' : 'SOS_BUTTON';

      const payload = {
        device_id: selectedDevice,
        type: isVoice ? (confirmationModal.keyword === 'ACCIDENT' ? 'ACCIDENT' : 'GENERAL_EMERGENCY') : 'GENERAL_EMERGENCY',
        severity: 'HIGH',
        trigger_source: triggerSource,
        voice_keyword: isVoice ? confirmationModal.keyword : null,
        confirmed_by_user: true,
        latitude: lat,
        longitude: lon
      };

      const res = await createAlert(payload);
      setSuccessAlert(res.data);
      setConfirmationModal(null);
      resetSpeech();
      stopListening();
    } catch (err) {
      console.error('Error creating SOS alert:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-red-600/20 text-red-500 rounded-full border border-red-500/30 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-mono">
          ROADSIDE EMERGENCY SOS TRIGGER
        </h1>
        <p className="text-sm text-slate-400 font-mono">
          Voice-Activated & Manual Emergency Response Dispatch Terminal
        </p>
      </div>

      {/* Device Selector */}
      <div className="bg-dark-800 border border-dark-700 p-4 rounded-xl flex items-center justify-between font-mono text-xs">
        <span className="text-slate-400">Nearest Associated SOS Unit:</span>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="bg-dark-900 border border-dark-600 text-white rounded px-3 py-1.5 focus:outline-none focus:border-red-500"
        >
          <option value="SOS-NH44-001">SOS-NH44-001 (NH44 / KM 512)</option>
          <option value="SOS-NH44-002">SOS-NH44-002 (NH44 / KM 528)</option>
          <option value="SOS-NH47-105">SOS-NH47-105 (NH47 / KM 105)</option>
          <option value="SOS-NH65-042">SOS-NH65-042 (NH65 / KM 42)</option>
        </select>
      </div>

      {/* Success State Alert Banner */}
      {successAlert && (
        <div className="bg-emerald-950/80 border-2 border-emerald-500 p-6 rounded-2xl space-y-3 shadow-2xl text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-extrabold text-white font-mono uppercase tracking-wider">
            🚨 EMERGENCY SOS SENT SUCCESSFULLY
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono py-3 bg-dark-900/80 rounded-xl border border-emerald-500/30">
            <div>
              <span className="text-slate-400 block">Alert ID:</span>
              <span className="font-bold text-emerald-300">{successAlert.alert_id}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Location:</span>
              <span className="font-bold text-slate-200">{successAlert.highway} / KM {successAlert.kilometer_marker}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Status:</span>
              <span className="font-bold text-amber-400">{successAlert.status}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Priority Score:</span>
              <span className="font-bold text-red-400">{successAlert.priority_score}/10</span>
            </div>
          </div>
          <p className="text-xs text-emerald-300 font-mono">
            Emergency responders have been dispatched. Emergency operators are monitoring your location live.
          </p>
          <button
            onClick={() => setSuccessAlert(null)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition"
          >
            DISMISS / NEW REQUEST
          </button>
        </div>
      )}

      {/* Main Trigger Grid: Voice vs Manual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* VOICE SOS CARD */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 flex flex-col justify-between items-center text-center space-y-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white font-mono">VOICE SOS DISPATCH</h3>
            <p className="text-xs text-slate-400">Say keywords: "HELP", "ACCIDENT", "EMERGENCY"</p>
          </div>

          <div className="relative">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                isListening
                  ? 'bg-red-600 text-white shadow-red-600/50 animate-pulse border-4 border-red-400'
                  : 'bg-dark-700 hover:bg-dark-600 text-red-400 border-2 border-red-500/40'
              }`}
            >
              {isListening ? <Mic className="w-14 h-14" /> : <MicOff className="w-14 h-14" />}
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs w-full">
            <div className="bg-dark-900 p-3 rounded-xl border border-dark-700 min-h-[50px] flex items-center justify-center text-slate-300">
              {isListening ? (
                <span className="text-red-400 flex items-center gap-2 animate-pulse">
                  <Volume2 className="w-4 h-4" /> Listening... Speak emergency keyword
                </span>
              ) : (
                <span className="text-slate-500">Tap microphone to start voice recognition</span>
              )}
            </div>

            {transcript && (
              <p className="text-[11px] text-slate-400 italic">
                Transcript: "{transcript}"
              </p>
            )}
            {error && (
              <p className="text-[11px] text-rose-400">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* MANUAL SOS CARD */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 flex flex-col justify-between items-center text-center space-y-6 shadow-xl">
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white font-mono">MANUAL SOS BUTTON</h3>
            <p className="text-xs text-slate-400">Press large red button for immediate emergency alert</p>
          </div>

          <button
            onClick={handleManualSosClick}
            className="w-36 h-36 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 hover:from-red-600 hover:to-red-500 text-white font-extrabold font-mono text-xl shadow-2xl shadow-red-600/40 border-4 border-red-400 flex flex-col items-center justify-center gap-1 active:scale-95 transition"
          >
            <ShieldAlert className="w-10 h-10 animate-bounce" />
            <span>🚨 SEND SOS</span>
          </button>

          <p className="text-xs text-slate-500 font-mono">
            Captures current GPS coordinates & alerts nearest Highway Patrol & Ambulance.
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmationModal && (
        <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border-2 border-red-500/80 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dark-700 pb-3">
              <div className="flex items-center gap-2 text-red-500 font-bold font-mono text-base">
                <AlertCircle className="w-6 h-6 animate-pulse" />
                CONFIRM EMERGENCY SOS
              </div>
              <button onClick={() => setConfirmationModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <p className="text-slate-200 text-sm">
                Emergency keyword detected: <strong className="text-red-400 font-bold uppercase">{confirmationModal.keyword}</strong>
              </p>
              <p className="text-slate-400">
                Are you sure you want to dispatch emergency response units to roadside unit <span className="text-white font-bold">{selectedDevice}</span>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmSos}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? 'DISPATCHING...' : '[ CONFIRM SOS ]'}
              </button>
              <button
                onClick={() => setConfirmationModal(null)}
                className="flex-1 py-3 bg-dark-700 hover:bg-dark-600 text-slate-300 font-mono text-sm rounded-xl transition"
              >
                [ CANCEL ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
