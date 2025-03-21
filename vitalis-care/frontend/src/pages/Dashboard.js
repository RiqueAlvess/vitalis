import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Alert, 
  Stack,
  Button 
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../services/api';
import { formatPercent, formatCurrency } from '../utils/format';
import { useAuth } from '../context/AuthContext';

// Cores para os gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/absenteismo/stats');
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setError('Erro ao carregar os dados. Tente novamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Cabeçalho */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Dashboard de Absenteísmo
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>
        
        {/* Cartões de estatísticas */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Taxa de Absenteísmo
            </Typography>
            <Typography component="p" variant="h3">
              {formatPercent(stats.taxaAbsenteismo)}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Horas afastadas ÷ Horas trabalhadas
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total de Funcionários Afastados
            </Typography>
            <Typography component="p" variant="h3">
              {stats.totalFuncionariosAfastados}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              De um total de {stats.totalFuncionarios} funcionários
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {!stats.isPremium && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Recurso Premium
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Lógica para atualizar para premium
                  }}
                >
                  Assinar Premium
                </Button>
              </Box>
            )}
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Prejuízo Financeiro
            </Typography>
            <Typography component="p" variant="h3">
              {stats.isPremium ? formatCurrency(stats.prejuizoFinanceiro) : 'R$ --'}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Baseado no salário mínimo
            </Typography>
          </Paper>
        </Grid>
        
        {/* Gráficos */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Top 5 CIDs" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.topCids}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cid_principal" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => [value, 'Ocorrências']}
                    labelFormatter={(label) => `CID: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Ocorrências" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Top Setores" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.topSetores}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="setor" type="category" width={150} />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'total_registros' ? 'Ocorrências' : 'Dias Afastados']}
                  />
                  <Legend />
                  <Bar dataKey="total_dias" fill="#82ca9d" name="Dias Afastados" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Evolução Mensal" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={stats.evolucaoMensal}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="total_registros"
                    stroke="#8884d8"
                    name="Registros"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="total_dias"
                    stroke="#82ca9d"
                    name="Dias Afastados"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Outros gráficos premium (com blur) */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Análises Avançadas
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            {!stats.isPremium && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Recurso Premium
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Lógica para atualizar para premium
                  }}
                >
                  Assinar Premium
                </Button>
              </Box>
            )}
            <CardHeader title="Absenteísmo por Sexo" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Masculino', value: 60 },
                      { name: 'Feminino', value: 40 }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {[
                      { name: 'Masculino', value: 60 },
                      { name: 'Feminino', value: 40 }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            {!stats.isPremium && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(5px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Recurso Premium
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Lógica para atualizar para premium
                  }}
                >
                  Assinar Premium
                </Button>
              </Box>
            )}
            <CardHeader title="Dias da Semana" />
            <Divider />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { dia: 'Segunda', valor: 25 },
                    { dia: 'Terça', valor: 18 },
                    { dia: 'Quarta', valor: 15 },
                    { dia: 'Quinta', valor: 20 },
                    { dia: 'Sexta', valor: 30 },
                    { dia: 'Sábado', valor: 10 },
                    { dia: 'Domingo', valor: 5 }
                  ]}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="valor" fill="#8884d8" name="Ocorrências" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
