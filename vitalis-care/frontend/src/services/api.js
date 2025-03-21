import axios from 'axios';

// Criar instância do axios com configuração básica
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

// Interceptor para tratamento de erros
api.interceptors.response.use(
  response => response,
  error => {
    // Se for erro de autenticação e não estiver na tela de login
    if (error.response && error.response.status === 401 && window.location.pathname !== '/login') {
      // Limpar token e redirecionar
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funções de autenticação
export const authService = {
  login: async (email, senha) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, user } = response.data;
      
      // Salvar token
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    } catch (error) {
      console.error('Erro de login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Salvar token
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, user };
    } catch (error) {
      console.error('Erro de registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao registrar'
      };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  },
  
  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { isAuthenticated: false };
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/profile');
      
      return { isAuthenticated: true, user: response.data.user };
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return { isAuthenticated: false };
    }
  }
};

export default api;
