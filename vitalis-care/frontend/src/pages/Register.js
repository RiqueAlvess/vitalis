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
  Alert 
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register({ setIsAuthenticated, setUser }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    cargo: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { nome, email, senha, confirmSenha, cargo } = formData;
  
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar campos
    if (!nome || !email || !senha || !confirmSenha) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Verificar senhas
    if (senha !== confirmSenha) {
      setError('As senhas não conferem');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await axios.post('/api/auth/register', {
        nome,
        email,
        senha,
        cargo
      });
      
      if (res.data.token) {
        // Salvar token
        localStorage.setItem('token', res.data.token);
        
        // Configurar cabeçalho para requisições futuras
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Atualizar estado
        setUser(res.data.user);
        setIsAuthenticated(true);
        
        // Redirecionar
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao registrar. Tente novamente.');
      console.error('Erro ao registrar:', err);
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Cadastro
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
              id="nome"
              label="Nome completo"
              name="nome"
              autoComplete="name"
              autoFocus
              value={nome}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email corporativo"
              name="email"
              autoComplete="email"
              value={email}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="cargo"
              label="Cargo"
              name="cargo"
              autoComplete="organization-title"
              value={cargo}
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
              autoComplete="new-password"
              value={senha}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmSenha"
              label="Confirmar senha"
              type="password"
              id="confirmSenha"
              autoComplete="new-password"
              value={confirmSenha}
              onChange={onChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Cadastrar'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Já tem uma conta? Faça login
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;
