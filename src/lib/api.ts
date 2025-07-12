import axios from 'axios';
import { Question, Answer, User, Notification, Vote } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  getProfile: () => api.get('/auth/profile'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

// Questions API
export const questionsAPI = {
  getAll: (page = 1, limit = 10, tags?: string[], search?: string) =>
    api.get('/questions', { params: { page, limit, tags: tags?.join(','), search } }),
  getById: (id: string) => api.get(`/questions/${id}`),
  create: (data: { title: string; description: string; tags: string[] }) =>
    api.post('/questions', data),
  update: (id: string, data: Partial<Question>) =>
    api.put(`/questions/${id}`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
  vote: (id: string, type: 'upvote' | 'downvote') =>
    api.post(`/questions/${id}/vote`, { type }),
};

// Answers API
export const answersAPI = {
  create: (questionId: string, content: string) =>
    api.post(`/questions/${questionId}/answers`, { content }),
  update: (id: string, content: string) =>
    api.put(`/answers/${id}`, { content }),
  delete: (id: string) => api.delete(`/answers/${id}`),
  vote: (id: string, type: 'upvote' | 'downvote') =>
    api.post(`/answers/${id}/vote`, { type }),
  accept: (id: string) => api.post(`/answers/${id}/accept`),
};

// Comments API
export const commentsAPI = {
  create: (answerId: string, content: string) =>
    api.post(`/answers/${answerId}/comments`, { content }),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  getPopular: () => api.get('/tags/popular'),
};