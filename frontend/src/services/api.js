import axios from 'axios';
import { auth } from './firebase';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080',
});

// Automatically attach Firebase JWT token to every request
api.interceptors.request.use(async (config) => {
  try {
    const user = auth?.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('[API] Could not attach auth token:', error);
  }
  return config;
}, (error) => Promise.reject(error));

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!axios.isCancel(error)) {
      let message = error.response?.data?.detail || error.message || 'API request failed';
      
      // Handle Pydantic validation errors (often an array of objects)
      if (Array.isArray(message)) {
        message = message.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else if (typeof message === 'object') {
        message = JSON.stringify(message);
      }

      toast.error(message);
    }
    return Promise.reject(error);
  }
);

/* --- API Endpoints --- */

// Ingestion
export const ingestText = (text) => api.post('/api/ingest/text', { text });

export const ingestImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/ingest/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const ingestForm = (data) => api.post('/api/ingest/form', data);

// Needs
export const getNeeds = (limit = 50) => api.get('/api/needs/', { params: { limit } });
export const getNeedById = (id) => api.get(`/api/needs/${id}`);
export const getNeedsSummary = () => api.get('/api/needs/summary');
export const updateNeedStatus = (id, status, volunteerId = null) =>
  api.patch(`/api/needs/${id}/status`, null, { 
    params: { status, volunteer_id: volunteerId } 
  });

// Volunteers
export const createVolunteer = (data) => api.post('/api/volunteers/', data);
export const getVolunteers = () => api.get('/api/volunteers/');
export const updateVolunteerAvailability = (id, available) => 
  api.patch(`/api/volunteers/${id}/availability`, { availability: available });

// Matching & Logic
export const triggerMatch = (needId) => api.post('/api/match/', { need_id: needId });

// Analytics
export const getAnalyticsOverview = () => api.get('/api/analytics/overview');
export const getAnalyticsTrends = () => api.get('/api/analytics/trends');

export default api;
