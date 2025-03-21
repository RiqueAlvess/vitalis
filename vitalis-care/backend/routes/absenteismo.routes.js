const express = require('express');
const router = express.Router();
const { 
  listarAbsenteismo, 
  estatisticasAbsenteismo, 
  sincronizarAbsenteismo 
} = require('../controllers/absenteismo.controller');
const { verifyToken, isPremium } = require('../middleware/auth.middleware');

// Todas as rotas requerem autenticação
router.use(verifyToken);

// Listar registros de absenteísmo
router.get('/', listarAbsenteismo);

// Estatísticas de absenteísmo (algumas partes bloqueadas para não premium)
router.get('/stats', estatisticasAbsenteismo);

// Sincronizar registros de absenteísmo com a API SOC
router.post('/sync', sincronizarAbsenteismo);

module.exports = router;
