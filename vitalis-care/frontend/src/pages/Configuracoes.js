import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import api from '../services/api';

function Configuracoes() {
  const [config, setConfig] = useState({
    chave_funcionario: '',
    codigo_funcionario: '',
    flag_ativo: true,
    flag_inativo: false,
    flag_pendente: false,
    flag_ferias: false,
    flag_afastado: false,
    chave_absenteismo: '',
    codigo_absenteismo: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/config');
        if (res.data.config) {
          setConfig(res.data.config);
        }
        setError('');
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
        setError('Erro ao carregar configurações');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConfig();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await api.post('/config', config);
      
      setSnackbar({
        open: true,
        message: 'Configurações salvas com sucesso',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao salvar configurações',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            API de Funcionários
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código da API"
                name="codigo_funcionario"
                value={config.codigo_funcionario}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chave da API"
                name="chave_funcionario"
                value={config.chave_funcionario}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Flags de Situação
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={4} md={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.flag_ativo}
                        onChange={handleChange}
                        name="flag_ativo"
                      />
                    }
                    label="Ativo"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.flag_inativo}
                        onChange={handleChange}
                        name="flag_inativo"
                      />
                    }
                    label="Inativo"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.flag_pendente}
                        onChange={handleChange}
                        name="flag_pendente"
                      />
                    }
                    label="Pendente"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.flag_ferias}
                        onChange={handleChange}
                        name="flag_ferias"
                      />
                    }
                    label="Férias"
                  />
                </Grid>
                
                <Grid item xs={6} sm={4} md={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={config.flag_afastado}
                        onChange={handleChange}
                        name="flag_afastado"
                      />
                    }
                    label="Afastado"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            API de Absenteísmo
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código da API"
                name="codigo_absenteismo"
                value={config.codigo_absenteismo}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chave da API"
                name="chave_absenteismo"
                value={config.chave_absenteismo}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </form>
      </Paper>
      
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

export default Configuracoes;
