import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4000/api' });

export const getPolls = () => api.get('/polls');
export const getPoll = (id) => api.get(`/polls/${id}`);
export const createPoll = (data) => api.post('/polls', data);
export const votePoll = (id, optionIndex) => api.post(`/polls/${id}/vote`, { optionIndex });
export const deletePoll = (id) => api.delete(`/polls/${id}`);
