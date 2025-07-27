import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: false, // Correct for token-based auth
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
