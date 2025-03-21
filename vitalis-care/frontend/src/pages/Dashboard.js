import React from 'react';
import { 
  Box, 
  Typography, 
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Container,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import axios from 'axios';

function Dashboard({ user, setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpar token
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    // Atualizar estado
    setIsAuthenticated(false);
    
    // Redirecionar
    navigate('/login');
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Vitalis Care
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          
          <Typography variant="body1">
            Bem-vindo, {user?.nome || 'Usuário'}!
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Este é um dashboard simplificado. Aqui você verá suas estatísticas e dados de absenteísmo.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Dashboard;
