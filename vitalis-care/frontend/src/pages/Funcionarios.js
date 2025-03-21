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
  TablePagination,
  CircularProgress,
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import api from '../services/api';
import { formatDate } from '../utils/format';

function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sincronizando, setSincronizando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const fetchFuncionarios = async () => {
    setLoading(true);
    try {
      const res = await api.get('/funcionarios');
      setFuncionarios(res.data.funcionarios || []);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      setError('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFuncionarios();
  }, []);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSincronizar = async () => {
    setSincronizando(true);
    try {
      const res = await api.post('/funcionarios/sync');
      
      setSnackbar({
        open: true,
        message: `Sincronização concluída: ${res.data.registrosAtualizados} registros atualizados`,
        severity: 'success'
      });
      
      // Recarregar funcionários
      fetchFuncionarios();
    } catch (err) {
      console.error('Erro ao sincronizar funcionários:', err);
      
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erro ao sincronizar funcionários',
        severity: 'error'
      });
    } finally {
      setSincronizando(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Funcionários
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleSincronizar}
          disabled={sincronizando}
        >
          {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
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
            <Table stickyHeader aria-label="tabela de funcionários">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Matrícula</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Setor</TableCell>
                  <TableCell>Unidade</TableCell>
                  <TableCell>Admissão</TableCell>
                  <TableCell>Situação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {funcionarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nenhum funcionário encontrado. Clique em Sincronizar para importar da API SOC.
                    </TableCell>
                  </TableRow>
                ) : (
                  funcionarios
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((funcionario) => (
                      <TableRow hover key={funcionario.id}>
                        <TableCell>{funcionario.nome}</TableCell>
                        <TableCell>{funcionario.matriculafuncionario}</TableCell>
                        <TableCell>{funcionario.nomecargo}</TableCell>
                        <TableCell>{funcionario.nomesetor}</TableCell>
                        <TableCell>{funcionario.nomeunidade}</TableCell>
                        <TableCell>{formatDate(funcionario.data_admissao)}</TableCell>
                        <TableCell>{funcionario.situacao}</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={funcionarios.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>
      )}
      
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

export default Funcionarios;
