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
  
  // Validação de senha com suporte a pontos
  const isValidPassword = (password) => {
    // Pelo menos 8 caracteres, 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial (incluindo .)
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
    return regex.test(password);
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
    
    // Validar formato de senha
    if (!isValidPassword(senha)) {
      setError('A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e ao menos um caractere especial');
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
      console.error('Erro ao registrar:', err);
      setError(err.response?.data?.message || 'Erro ao registrar. Tente novamente.');
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
              helperText="Apenas emails corporativos são aceitos (não use @gmail, @hotmail, etc.)"
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
              helperText="Mínimo 8 caracteres com letras maiúsculas, minúsculas, números e caracteres especiais"
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
                  Registrando...
                </>
              ) : 'Cadastrar'}
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
