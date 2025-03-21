import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Funcionarios from './pages/Funcionarios';
import Configuracoes from './pages/Configuracoes';
import LogsSincronizacao from './pages/LogsSincronizacao';
import Perfil from './pages/Perfil';

// Componentes
import Layout from './components/Layout';
import axios from 'axios';

// Tema da aplicação
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verificar se o token é válido
      axios.get('/api/auth/profile')
        .then(res => {
          setUser(res.data.user);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  // Mostrar indicador de carregamento
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/" /> : 
                <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              } 
            />
            <Route 
              path="/register" 
              element={
                isAuthenticated ? 
                <Navigate to="/" /> : 
                <Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              } 
            />

            {/* Rotas protegidas */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                <Layout user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" />
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="funcionarios" element={<Funcionarios />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="logs" element={<LogsSincronizacao />} />
              <Route path="perfil" element={<Perfil user={user} setUser={setUser} />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
