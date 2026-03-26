import axios from 'axios';

const api = axios.create({
  baseURL: 'https://musicularai.onrender.com',
});

api.interceptors.request.use(
  (config) => {
    // Get the token from storage
    const token = localStorage.getItem('musicular_token');
    
    // If token exists attach it to the header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;