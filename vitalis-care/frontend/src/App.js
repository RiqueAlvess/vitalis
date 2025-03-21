import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';

// Contexto de autenticação
import { useAuth } from './context/AuthContext';

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

// Rota privada (requer autenticação)
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Se ainda estiver carregando, não faz nada
  if (loading) {
    return null;
  }
  
  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Se estiver autenticado, renderiza o componente
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="funcionarios" element={<Funcionarios />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="logs" element={<LogsSincronizacao />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
