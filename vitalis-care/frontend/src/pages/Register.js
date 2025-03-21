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
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Register({ setIsAuthenticated, setUser }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmSenha: '',
    cargo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { nome, email, senha, confirmSenha, cargo } = formData;
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!nome || !email || !senha || !confirmSenha) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (senha !== confirmSenha) {
      setError('As senhas não conferem');
      return;
    }
    
    // Pelo menos 8 caracteres
    if (senha.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await authService.register({
      nome,
      email,
      senha,
      cargo
    });
    
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddIcon />
          </Avatar>
          
          <Typography component="h1" variant="h5">Cadastro</Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="nome"
              label="Nome completo"
              name="nome"
              autoComplete="name"
              value={nome}
              onChange={handleChange}
              autoFocus
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
              onChange={handleChange}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="cargo"
              label="Cargo"
              name="cargo"
              autoComplete="organization-title"
              value={cargo}
              onChange={handleChange}
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
              onChange={handleChange}
              helperText="Mínimo 8 caracteres"
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
              onChange={handleChange}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, height: 48 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
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
