import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { setAuthToken, removeAuthToken } from '../utils/auth';
import jwt_decode from 'jwt-decode';

// Criação do contexto
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Make sure token is a string before decoding
        if (typeof token !== 'string') {
          logout();
          return;
        }
        
        // Verify token format before decoding
        if (!token.includes('.')) {
          logout();
          return;
        }
        
        const decoded = jwt_decode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          logout();
        } else {
          setAuthToken(token);
          
          try {
            const res = await api.get('/auth/profile');
            setUser(res.data.user);
            setIsAuthenticated(true);
          } catch (err) {
            console.error('Error fetching profile:', err);
            logout();
          }
        }
      } catch (err) {
        console.error('Token decode error:', err);
        logout();
      }
    }
    
    setLoading(false);
  };
  
  checkAuth();
}, []);
  
  // Login
  const login = async (email, senha) => {
    try {
      const res = await api.post('/auth/login', { email, senha });
      const { token, user } = res.data;
      
      // Armazenar token
      localStorage.setItem('token', token);
      setAuthToken(token);
      
      // Atualizar estado
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      
      return { 
        success: false, 
        message: err.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };
  
  // Registro
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const { token, user } = res.data;
      
      // Armazenar token
      localStorage.setItem('token', token);
      setAuthToken(token);
      
      // Atualizar estado
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      console.error('Erro ao registrar:', err);
      
      return { 
        success: false, 
        message: err.response?.data?.message || 'Erro ao registrar' 
      };
    }
  };
  
  // Logout
  const logout = () => {
    // Remover token
    localStorage.removeItem('token');
    removeAuthToken();
    
    // Atualizar estado
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Atualizar perfil do usuário
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };
  
  // Valores do contexto
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
