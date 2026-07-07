import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ai-ebook-studio.onrender.com',
});

API.interceptors.request.use((config) => {
  const stored = localStorage.getItem('ebook_user');
  if (stored) {
    const { token } = JSON.parse(stored);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
