import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import DigitalTwinPage from './pages/DigitalTwinPage';
import UserSosPage from './pages/UserSosPage';
import AlertDetailPage from './pages/AlertDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { useWebSocket } from './hooks/useWebSocket';

export default function App() {
  const { isConnected } = useWebSocket();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-dark-900 text-slate-100 font-sans">
        <Navbar wsConnected={isConnected} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/digital-twin" element={<DigitalTwinPage />} />
            <Route path="/user-sos" element={<UserSosPage />} />
            <Route path="/alerts/:alertId" element={<AlertDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
