import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

export const ingestImage = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ingest/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const ingestText = (text) => api.post('/ingest/text', { text });
export const ingestForm = (data) => api.post('/ingest/form', data);
export const getNeeds = (params) => api.get('/needs', { params });
export const matchNeed = (needId) => api.post('/match', { need_id: needId });
export const getAnalytics = () => api.get('/analytics/overview');
export const getTrends = () => api.get('/analytics/trends');
export const registerVolunteer = (data) => api.post('/volunteers', data);
export const updateVolunteerAvailability = (id, availability) => api.patch(`/volunteers/${id}/availability`, { availability });

export default api;
