import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adicionar token ao inicializar se estiver disponível
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Verificar se é erro de autenticação
    if (error.response && error.response.status === 401) {
      // Redirecionar para login se não estiver na página de login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
