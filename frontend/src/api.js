import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api' });

export const getPoll = (id) => api.get(`/polls/${id}`);
export const createPoll = (data) => api.post('/polls', data);
export const votePoll = (id, optionId) => api.post(`/polls/${id}/vote`, { optionId });
export const closePoll = (id) => api.post(`/polls/${id}/close`);
