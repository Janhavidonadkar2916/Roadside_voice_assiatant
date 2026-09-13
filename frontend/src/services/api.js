import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const getHealth = () => api.get('/health');

// Devices & Digital Twin API
export const getDevices = () => api.get('/devices');
export const getDeviceById = (id) => api.get(`/devices/${id}`);
export const getDeviceEvents = (id) => api.get(`/devices/${id}/events`);
export const sendDeviceCommand = (id, command) => api.post(`/devices/${id}/command?command=${command}`);

// Alerts API
export const getAlerts = (params) => api.get('/alerts', { params });
export const getAlertById = (id) => api.get(`/alerts/${id}`);
export const createAlert = (payload) => api.post('/alerts', payload);
export const updateAlertStatus = (id, status, description) => 
  api.patch(`/alerts/${id}/status`, { status, description });

// Responders API
export const getResponders = (params) => api.get('/responders', { params });
export const getNearbyResponders = (lat, lon, type) => 
  api.get('/responders/nearby', { params: { lat, lon, type } });
export const updateResponderStatus = (id, status) => 
  api.post(`/responders/${id}/status`, { status });

// Analytics & Stats
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getAnalytics = () => api.get('/analytics');

// Simulation & Portfolio Demo Mode
export const triggerSimulation = (payload) => api.post('/simulation/trigger', payload);
export const runDemoScenario = (payload) => api.post('/simulation/demo-scenario', payload);

export default api;
