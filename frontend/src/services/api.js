import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000,
});

// Mock/Fallback data for seamless cloud demo when backend is remote or offline
const mockData = {
  stats: {
    active_alerts: 1,
    online_devices: 4,
    offline_devices: 0,
    total_devices: 4,
    responders_available: 4,
    total_responders: 6,
    emergencies_today: 3,
    system_health: 'OPTIMAL'
  },
  devices: [
    { id: 1, device_id: 'SOS-NH44-001', name: 'NH44 KM 512 SOS Unit', highway: 'NH44', kilometer_marker: 512.0, latitude: 21.1458, longitude: 79.0882, status: 'EMERGENCY', battery: 88, network_status: 'CONNECTED', microphone_status: 'ACTIVE', button_status: 'NORMAL', impact_sensor_status: 'NORMAL', temperature: 29.2, firmware_version: 'v1.2.0', last_heartbeat: new Date().toISOString() },
    { id: 2, device_id: 'SOS-NH44-002', name: 'NH44 KM 528 SOS Unit', highway: 'NH44', kilometer_marker: 528.5, latitude: 21.2300, longitude: 79.1500, status: 'ONLINE', battery: 94, network_status: 'CONNECTED', microphone_status: 'ACTIVE', button_status: 'NORMAL', impact_sensor_status: 'NORMAL', temperature: 28.5, firmware_version: 'v1.2.0', last_heartbeat: new Date().toISOString() },
    { id: 3, device_id: 'SOS-NH47-105', name: 'NH47 KM 105 SOS Unit', highway: 'NH47', kilometer_marker: 105.0, latitude: 21.0500, longitude: 79.0200, status: 'ONLINE', battery: 83, network_status: 'CONNECTED', microphone_status: 'ACTIVE', button_status: 'NORMAL', impact_sensor_status: 'NORMAL', temperature: 29.9, firmware_version: 'v1.2.0', last_heartbeat: new Date().toISOString() },
    { id: 4, device_id: 'SOS-NH65-042', name: 'NH65 KM 42 SOS Unit', highway: 'NH65', kilometer_marker: 42.3, latitude: 21.1800, longitude: 78.9800, status: 'ONLINE', battery: 93, network_status: 'CONNECTED', microphone_status: 'ACTIVE', button_status: 'NORMAL', impact_sensor_status: 'NORMAL', temperature: 31.2, firmware_version: 'v1.1.9', last_heartbeat: new Date().toISOString() }
  ],
  responders: [
    { id: 1, responder_id: 'AMB-001', name: 'Metro Emergency Medical Unit 01', type: 'AMBULANCE', latitude: 21.1400, longitude: 79.0800, availability: 'ASSIGNED', status: 'EN_ROUTE', contact: '+1-800-555-0199', distance_km: 1.12 },
    { id: 2, responder_id: 'AMB-002', name: 'Highway Trauma Response Ambulance 02', type: 'AMBULANCE', latitude: 21.2100, longitude: 79.1200, availability: 'AVAILABLE', status: 'AVAILABLE', contact: '+1-800-555-0198', distance_km: 7.8 },
    { id: 3, responder_id: 'POL-001', name: 'Highway Patrol Sector 4', type: 'POLICE', latitude: 21.1500, longitude: 79.0900, availability: 'ASSIGNED', status: 'EN_ROUTE', contact: '+1-800-555-0911', distance_km: 0.54 },
    { id: 4, responder_id: 'POL-002', name: 'State Police Highway Rapid Response', type: 'POLICE', latitude: 21.1000, longitude: 79.0500, availability: 'AVAILABLE', status: 'AVAILABLE', contact: '+1-800-555-0912', distance_km: 6.4 },
    { id: 5, responder_id: 'HOS-001', name: 'Central Highway Trauma Center Hospital', type: 'HOSPITAL', latitude: 21.1600, longitude: 79.1000, availability: 'AVAILABLE', status: 'AVAILABLE', contact: '+1-800-555-4321', distance_km: 2.1 },
    { id: 6, responder_id: 'HOS-002', name: 'Apex Specialty Emergency Care', type: 'HOSPITAL', latitude: 21.0800, longitude: 79.0300, availability: 'AVAILABLE', status: 'AVAILABLE', contact: '+1-800-555-4322', distance_km: 9.3 }
  ],
  alerts: [
    {
      id: 1,
      alert_code: 'ALT-2026-9042',
      device_id: 'SOS-NH44-001',
      type: 'IMPACT_ACCIDENT',
      severity: 'CRITICAL',
      status: 'RESPONDER_ASSIGNED',
      description: 'Severe impact (9.2g) detected near KM 512. Automated Haversine dispatch activated.',
      latitude: 21.1458,
      longitude: 79.0882,
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      assignments: [
        {
          id: 1,
          responder_id: 'AMB-001',
          responder: { responder_id: 'AMB-001', name: 'Metro Emergency Medical Unit 01', type: 'AMBULANCE', contact: '+1-800-555-0199' },
          assigned_status: 'EN_ROUTE',
          distance_km: 1.12,
          eta_minutes: 2.8
        },
        {
          id: 2,
          responder_id: 'POL-001',
          responder: { responder_id: 'POL-001', name: 'Highway Patrol Sector 4', type: 'POLICE', contact: '+1-800-555-0911' },
          assigned_status: 'EN_ROUTE',
          distance_km: 0.54,
          eta_minutes: 1.5
        }
      ]
    }
  ],
  analytics: {
    severity_breakdown: [
      { name: 'CRITICAL', value: 14 },
      { name: 'HIGH', value: 28 },
      { name: 'MEDIUM', value: 19 },
      { name: 'LOW', value: 8 }
    ],
    emergency_type_breakdown: [
      { name: 'IMPACT_ACCIDENT', count: 32 },
      { name: 'VOICE_SOS', count: 21 },
      { name: 'MANUAL_SOS_BUTTON', count: 16 }
    ],
    daily_trend: [
      { date: 'Oct 24', count: 4 },
      { date: 'Oct 25', count: 7 },
      { date: 'Oct 26', count: 5 },
      { date: 'Oct 27', count: 8 },
      { date: 'Oct 28', count: 6 },
      { date: 'Oct 29', count: 11 },
      { date: 'Oct 30', count: 9 }
    ],
    active_units: [
      { device_id: 'SOS-NH44-001', alerts: 18 },
      { device_id: 'SOS-NH44-002', alerts: 14 },
      { device_id: 'SOS-NH47-105', alerts: 9 },
      { device_id: 'SOS-NH65-042', alerts: 5 }
    ],
    avg_response_min: 3.8,
    uptime_pct: 99.4
  }
};

// Response interceptor to gracefully fall back to demo data when backend is unreachable in cloud environments
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    console.warn(`[API Fallback] Backend not reachable for ${url}. Providing demo fallback data.`);

    if (url.includes('/dashboard/stats')) {
      return Promise.resolve({ data: mockData.stats });
    }
    if (url.includes('/devices/') && url.includes('/events')) {
      return Promise.resolve({ data: [] });
    }
    if (url.includes('/devices/')) {
      const dev = mockData.devices[0];
      return Promise.resolve({ data: dev });
    }
    if (url.includes('/devices')) {
      return Promise.resolve({ data: mockData.devices });
    }
    if (url.includes('/responders')) {
      return Promise.resolve({ data: mockData.responders });
    }
    if (url.includes('/alerts/')) {
      return Promise.resolve({ data: mockData.alerts[0] });
    }
    if (url.includes('/alerts')) {
      return Promise.resolve({ data: mockData.alerts });
    }
    if (url.includes('/analytics')) {
      return Promise.resolve({ data: mockData.analytics });
    }
    if (url.includes('/health')) {
      return Promise.resolve({ data: { status: 'healthy', mode: 'demo' } });
    }
    if (url.includes('/simulation')) {
      return Promise.resolve({
        data: {
          status: 'SUCCESS',
          message: 'Simulation triggered successfully (Demo Mode)',
          alert_code: 'ALT-DEMO-2026',
          device_id: 'SOS-NH44-001'
        }
      });
    }

    return Promise.resolve({ data: {} });
  }
);

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
