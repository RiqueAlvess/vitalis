require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { pool } = require('./db/config');
const rateLimit = require('express-rate-limit');

// Rotas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const funcionarioRoutes = require('./routes/funcionario.routes');
const absenteismoRoutes = require('./routes/absenteismo.routes');
const syncRoutes = require('./routes/sync.routes');
const configRoutes = require('./routes/config.routes');

// Inicializar aplicação
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições, tente novamente mais tarde.' }
});

// Aplicar rate limiting
app.use('/api/', limiter);

// Definir rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/absenteismo', absenteismoRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/config', configRoutes);

// Rota de saúde para verificar status do servidor
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Servir o frontend em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Erro no servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Entre em contato com o administrador'
  });
});

// Iniciar o servidor
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  
  // Testar conexão com o banco
  try {
    const client = await pool.connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso');
    client.release();
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  }
});

// Gerenciamento de encerramento
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Conexão com o banco encerrada');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao fechar conexão com o banco:', err);
    process.exit(1);
  }
});
