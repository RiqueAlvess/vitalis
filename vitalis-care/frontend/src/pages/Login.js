import React, { useState } from 'react';
import { 
  Avatar, 
  Button, 
  TextField, 
  Link, 
  Grid, 
  Box, 
  Typography, 
  Container, 
  Paper,
  Alert,
  CircularProgress 
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Login({ setIsAuthenticated, setUser }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !senha) {
      setError('Preencha todos os campos');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await authService.login(email, senha);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
      navigate('/');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }} elevation={3}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          
          <Typography component="h1" variant="h5">Login</Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type="password"
              id="senha"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  Não tem uma conta? Cadastre-se
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Usuário teste: admin@admin.com / Senha: admin
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
