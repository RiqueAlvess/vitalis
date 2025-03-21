import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../services/api';

function LogsSincronizacao() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sync');
      setLogs(res.data.logs || []);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
      setError('Erro ao carregar logs de sincronização');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLogs();
  }, []);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'concluido':
        return 'success';
      case 'erro':
        return 'error';
      case 'em_andamento':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };
  
  const formatDuration = (start, end) => {
    if (!start || !end) return '-';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Logs de Sincronização
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchLogs}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="tabela de logs">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Início</TableCell>
                  <TableCell>Fim</TableCell>
                  <TableCell>Duração</TableCell>
                  <TableCell>Registros</TableCell>
                  <TableCell>Detalhes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhum log de sincronização encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow hover key={log.id}>
                      <TableCell>
                        {log.tipo === 'funcionarios' ? 'Funcionários' : 'Absenteísmo'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.status === 'concluido' ? 'Concluído' : log.status === 'em_andamento' ? 'Em andamento' : 'Erro'}
                          color={getStatusColor(log.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDateTime(log.data_inicio)}</TableCell>
                      <TableCell>{formatDateTime(log.data_fim)}</TableCell>
                      <TableCell>{formatDuration(log.data_inicio, log.data_fim)}</TableCell>
                      <TableCell>{log.registros_afetados || 0}</TableCell>
                      <TableCell>
                        {log.detalhes}
                        {log.mensagem_erro && (
                          <Typography color="error" variant="body2">
                            Erro: {log.mensagem_erro}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default LogsSincronizacao;
