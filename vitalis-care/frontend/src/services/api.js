import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Verificar se é erro de autenticação
    if (error.response?.status === 401) {
      // Redirecionar para login se não estiver na página de login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
