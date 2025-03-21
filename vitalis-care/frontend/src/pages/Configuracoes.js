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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import api from '../services/api';

function Configuracoes() {
  const [config, setConfig] = useState({
    chave_funcionario: '',
    codigo_funcionario: '',
    codigo_empresa_funcionario: '',
    flag_ativo: true,
    flag_inativo: false,
    flag_pendente: false,
    flag_ferias: false,
    flag_afastado: false,
    chave_absenteismo: '',
    codigo_absenteismo: '',
    codigo_empresa_absenteismo: '',
    codigo_empresa_principal: ''
  });
  
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dataError, setDataError] = useState('');
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
  
  const validateDateRange = () => {
    if (!dataInicio || !dataFim) {
      setDataError('As datas inicial e final são obrigatórias');
      return false;
    }
    
    if (dataInicio > dataFim) {
      setDataError('A data inicial não pode ser posterior à data final');
      return false;
    }
    
    // Calcular diferença em dias
    const diffTime = Math.abs(dataFim - dataInicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      setDataError('O intervalo máximo entre as datas é de 30 dias');
      return false;
    }
    
    setDataError('');
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await api.post('/config', config);
      
      setConfig(response.data.config);
      
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
  
  const handleSyncFuncionarios = async () => {
    setSaving(true);
    
    try {
      const response = await api.post('/funcionarios/sync');
      
      setSnackbar({
        open: true,
        message: `Sincronização concluída: ${response.data.registrosAtualizados} funcionários atualizados`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao sincronizar funcionários:', err);
      
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao sincronizar funcionários',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleSyncAbsenteismo = async () => {
    if (!validateDateRange()) {
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await api.post('/absenteismo/sync', {
        dataInicio: dataInicio.toISOString(),
        dataFim: dataFim.toISOString()
      });
      
      setSnackbar({
        open: true,
        message: `Sincronização concluída: ${response.data.registrosAtualizados} registros de absenteísmo atualizados`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Erro ao sincronizar absenteísmo:', err);
      
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao sincronizar absenteísmo',
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Código da API"
                name="codigo_funcionario"
                value={config.codigo_funcionario || ''}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Chave da API"
                name="chave_funcionario"
                value={config.chave_funcionario || ''}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Código da Empresa"
                name="codigo_empresa_funcionario"
                value={config.codigo_empresa_funcionario || ''}
                onChange={handleChange}
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
                        checked={config.flag_ativo || false}
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
                        checked={config.flag_inativo || false}
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
                        checked={config.flag_pendente || false}
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
                        checked={config.flag_ferias || false}
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
                        checked={config.flag_afastado || false}
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
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleSyncFuncionarios}
              disabled={saving}
              sx={{ mr: 2 }}
            >
              Sincronizar Funcionários
            </Button>
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            API de Absenteísmo
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Código da API"
                name="codigo_absenteismo"
                value={config.codigo_absenteismo || ''}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Chave da API"
                name="chave_absenteismo"
                value={config.chave_absenteismo || ''}
                onChange={handleChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Código da Empresa"
                name="codigo_empresa_absenteismo"
                value={config.codigo_empresa_absenteismo || ''}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Código da Empresa Principal"
                name="codigo_empresa_principal"
                value={config.codigo_empresa_principal || ''}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
          </Grid>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Período para Sincronização
          </Typography>
          
          {dataError && (
            <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
              {dataError}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data Inicial"
                value={dataInicio}
                onChange={setDataInicio}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                format="dd/MM/yyyy"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Data Final"
                value={dataFim}
                onChange={setDataFim}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                format="dd/MM/yyyy"
              />
              <Typography variant="caption" color="text.secondary">
                Máximo de 30 dias entre as datas
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleSyncAbsenteismo}
              disabled={saving}
            >
              Sincronizar Absenteísmo
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Configurações'}
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
