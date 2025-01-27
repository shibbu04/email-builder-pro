import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (name: string, email: string, password: string) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/uploadImage', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const saveTemplate = async (templateData: any) => {
  const response = await api.post('/templates', templateData);
  return response.data;
};

export const getTemplates = async (includePublic = false) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    const response = await api.get(`/templates${includePublic ? '?public=true' : ''}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return [];
  }
};

export const getTemplate = async (id: string) => {
  const response = await api.get(`/templates/${id}`);
  return response.data;
};

export const updateTemplate = async (id: string, templateData: any) => {
  const response = await api.put(`/templates/${id}`, templateData);
  return response.data;
};

export const deleteTemplate = async (id: string) => {
  const response = await api.delete(`/templates/${id}`);
  return response.data;
};

export const renderTemplate = async (templateId: string) => {
  const response = await api.post('/renderAndDownloadTemplate', { templateId }, {
    responseType: 'blob',
  });
  return response.data;
};

export default api;