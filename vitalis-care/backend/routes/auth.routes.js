const express = require('express');
const router = express.Router();
const { login, register, profile } = require('../controllers/auth.controller');
const { verifyToken, validateBusinessEmail } = require('../middleware/auth.middleware');

// Login
router.post('/login', login);

// Registro (com validação de email corporativo)
router.post('/register', validateBusinessEmail, register);

// Perfil (requer autenticação)
router.get('/profile', verifyToken, profile);

module.exports = router;
