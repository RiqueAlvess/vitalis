const express = require('express');
const router = express.Router();
const { obterConfiguracoes, salvarConfiguracoes } = require('../controllers/config.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Obter configurações da API
router.get('/', obterConfiguracoes);

// Salvar configurações da API
router.post('/', salvarConfiguracoes);

module.exports = router;
