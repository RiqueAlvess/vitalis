const express = require('express');
const router = express.Router();
const { listarLogs, obterLog } = require('../controllers/sync.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Listar logs de sincronização
router.get('/', listarLogs);

// Obter detalhes de um log específico
router.get('/:id', obterLog);

module.exports = router;
