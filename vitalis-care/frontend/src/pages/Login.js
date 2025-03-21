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
import axios from 'axios';

function Login({ setIsAuthenticated, setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { email, senha } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar campos
    if (!email || !senha) {
      setError('Preencha todos os campos');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use a URL absoluta para evitar problemas de redirecionamento HTML
      const res = await axios.post('/api/auth/login', { email, senha });
      
      if (res.data && res.data.token) {
        // Salvar token
        localStorage.setItem('token', res.data.token);
        
        // Configurar cabeçalho para requisições futuras
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Atualizar estado
        setUser(res.data.user);
        setIsAuthenticated(true);
        
        // Redirecionar
        navigate('/');
      } else {
        setError('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(
        err.response?.data?.message || 
        'Erro ao fazer login. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
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
              onChange={onChange}
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
              onChange={onChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, position: 'relative' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }} 
                  />
                  Entrando...
                </>
              ) : 'Entrar'}
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
