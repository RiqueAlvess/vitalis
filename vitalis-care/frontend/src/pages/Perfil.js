import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  Divider,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CardHeader,
  CardActions
} from '@mui/material';
import { Save as SaveIcon, Lock as LockIcon } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isBusinessEmail, isValidPassword } from '../utils/auth';

function Perfil() {
  const { user, updateUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    nome: '',
    email: '',
    cargo: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    senha: '',
    confirmSenha: ''
  });
  
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    if (user) {
      setProfileData({
        nome: user.nome || '',
        email: user.email || '',
        cargo: user.cargo || ''
      });
      
      setPremium(user.is_premium || false);
    }
  }, [user]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handlePremiumChange = (e) => {
    setPremium(e.target.checked);
  };
  
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const { nome, email, cargo } = profileData;
    
    // Validar email corporativo
    if (email !== user.email && !isBusinessEmail(email)) {
      setError('Apenas emails corporativos são permitidos');
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.put('/users/profile', {
        nome,
        email,
        cargo
      });
      
      // Atualizar usuário no contexto
      updateUser(res.data.user);
      
      setSnackbar({
        open: true,
        message: 'Perfil atualizado com sucesso',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordLoading(true);
    
    const { senha, confirmSenha } = passwordData;
    
    // Validar senha
    if (!senha || !confirmSenha) {
      setPasswordError('Preencha todos os campos');
      setPasswordLoading(false);
      return;
    }
    
    if (senha !== confirmSenha) {
      setPasswordError('As senhas não conferem');
      setPasswordLoading(false);
      return;
    }
    
    if (!isValidPassword(senha)) {
      setPasswordError('A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos');
      setPasswordLoading(false);
      return;
    }
    
    try {
      await api.put('/users/profile', {
        senha
      });
      
      // Limpar campos de senha
      setPasswordData({
        senha: '',
        confirmSenha: ''
      });
      
      setSnackbar({
        open: true,
        message: 'Senha atualizada com sucesso',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      
      setPasswordError(err.response?.data?.message || 'Erro ao atualizar senha');
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleTogglePremium = async () => {
    setPremiumLoading(true);
    
    try {
      const res = await api.put('/users/subscription', {
        is_premium: !user.is_premium
      });
      
      // Atualizar usuário no contexto
      updateUser(res.data.user);
      
      setPremium(res.data.user.is_premium);
      
      setSnackbar({
        open: true,
        message: res.data.message,
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao atualizar assinatura:', err);
      
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao atualizar assinatura',
        severity: 'error'
      });
      
      // Voltar ao estado anterior
      setPremium(user.is_premium);
    } finally {
      setPremiumLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Perfil
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informações Pessoais
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSaveProfile}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="nome"
                    value={profileData.nome}
                    onChange={handleProfileChange}
                    required
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Corporativo"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                    margin="normal"
                    helperText="Apenas emails corporativos são aceitos"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cargo"
                    name="cargo"
                    value={profileData.cargo}
                    onChange={handleProfileChange}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </Box>
            </form>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alterar Senha
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            
            <form onSubmit={handleSavePassword}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nova Senha"
                    name="senha"
                    type="password"
                    value={passwordData.senha}
                    onChange={handlePasswordChange}
                    required
                    margin="normal"
                    helperText="Mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirmar Senha"
                    name="confirmSenha"
                    type="password"
                    value={passwordData.confirmSenha}
                    onChange={handlePasswordChange}
                    required
                    margin="normal"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  startIcon={<LockIcon />}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Assinatura" />
            <Divider />
            <CardContent>
              <Typography variant="body1" gutterBottom>
                Status atual: <strong>{premium ? 'Premium' : 'Gratuito'}</strong>
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Com a versão Premium, você tem acesso a:
              </Typography>
              
              <ul>
                <li>Gráficos e análises avançadas</li>
                <li>Indicadores financeiros detalhados</li>
                <li>Análises segmentadas por sexo</li>
                <li>Dados por dia da semana</li>
                <li>Suporte prioritário</li>
              </ul>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={premium}
                    onChange={handlePremiumChange}
                    disabled={premiumLoading}
                  />
                }
                label={premium ? 'Ativo' : 'Inativo'}
                sx={{ mt: 2 }}
              />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
              <Button
                variant="contained"
                color={premium ? 'error' : 'primary'}
                onClick={handleTogglePremium}
                disabled={premiumLoading || premium === user?.is_premium}
              >
                {premiumLoading
                  ? 'Atualizando...'
                  : premium
                    ? 'Cancelar Premium'
                    : 'Ativar Premium'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Perfil;
