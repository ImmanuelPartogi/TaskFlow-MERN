import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor untuk menambahkan token ke header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk menangani error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    if (response) {
      console.log('Response error:', response.status);
      console.log(response.data);
      
      // Jika token tidak valid atau kedaluwarsa, logout
      if (response.status === 401 && 
          response.data.msg && 
          (response.data.msg === 'Token tidak valid' || 
           response.data.msg === 'Tidak ada token, otorisasi ditolak')) {
        console.log('Token tidak valid atau kedaluwarsa, redirect ke login');
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    } else {
      console.log('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;