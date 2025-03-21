const express = require('express');
const router = express.Router();
const { 
  listarFuncionarios, 
  buscarFuncionarioPorId, 
  sincronizarFuncionarios 
} = require('../controllers/funcionario.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Listar funcionários
router.get('/', listarFuncionarios);

// Buscar funcionário por ID
router.get('/:id', buscarFuncionarioPorId);

// Sincronizar funcionários com a API SOC
router.post('/sync', sincronizarFuncionarios);

module.exports = router;
