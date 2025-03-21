const express = require('express');
const router = express.Router();
const { atualizarPerfil, atualizarAssinatura } = require('../controllers/user.controller');
const { verifyToken, validateBusinessEmail } = require('../middleware/auth.middleware');

// Atualizar perfil (requer autenticação)
router.put('/profile', verifyToken, atualizarPerfil);

// Atualizar assinatura (requer autenticação)
router.put('/subscription', verifyToken, atualizarAssinatura);

module.exports = router;
