require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
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

// Configuração CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN === '*' 
    ? '*' 
    : process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middlewares
app.use(cors(corsOptions));
app.use(helmet({
  contentSecurityPolicy: false // Desativar para permitir carregamento de recursos
}));
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
  // Possíveis caminhos para build
  const possiblePaths = [
    path.join(__dirname, '../frontend/build'),
    path.join(__dirname, 'frontend/build'),
    path.join(__dirname, '../../frontend/build'),
    path.join(__dirname, '../../../frontend/build'),
    path.join(__dirname, '../../vitalis-care/frontend/build'),
    '/opt/render/project/src/vitalis-care/frontend/build',
    '/opt/render/project/src/frontend/build',
    path.join(__dirname, 'public')
  ];
  
  let buildPath = null;
  
  // Encontrar o primeiro caminho válido
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
      buildPath = p;
      console.log(`Caminho de build encontrado: ${buildPath}`);
      break;
    }
  }
  
  if (buildPath) {
    // Servir arquivos estáticos
    app.use(express.static(buildPath));
    
    // Rota de fallback para SPA
    app.get('*', (req, res) => {
      if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint não encontrado' });
      }
      
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    console.error('ERRO: Não foi possível encontrar a pasta build do frontend');
    // Criar pasta public para fallback
    if (!fs.existsSync(path.join(__dirname, 'public'))) {
      fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
    }
    
    // Criar HTML básico para fallback
    fs.writeFileSync(
      path.join(__dirname, 'public', 'index.html'),
      '<html><head><title>Vitalis Care</title></head><body><h1>Erro ao carregar aplicação</h1><p>Não foi possível encontrar os arquivos do frontend.</p></body></html>'
    );
    
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (req, res) => {
      if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint não encontrado' });
      }
      
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err.stack);
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
