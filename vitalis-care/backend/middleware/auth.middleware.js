const jwt = require('jsonwebtoken');
const { pool } = require('../db/config');

// Verifica se o token JWT é válido
const verifyToken = (req, res, next) => {
  try {
    // Obter o token do header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acesso negado', 
        message: 'Token de autenticação não fornecido' 
      });
    }
    
    // Verificar o token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          error: 'Acesso negado', 
          message: 'Token inválido ou expirado' 
        });
      }
      
      // Adicionar os dados do usuário ao objeto de requisição
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao verificar autenticação' 
    });
  }
};

// Verifica se o usuário é administrador
const isAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ 
      error: 'Acesso negado', 
      message: 'Permissão de administrador necessária' 
    });
  }
  
  next();
};

// Verifica se o usuário tem plano premium
const isPremium = (req, res, next) => {
  if (!req.user.is_premium) {
    return res.status(403).json({ 
      error: 'Acesso negado', 
      message: 'Plano premium necessário para acessar este recurso' 
    });
  }
  
  next();
};

// Verifica se o email é corporativo (não gratuito)
const isBusinessEmail = (email) => {
  const freeEmailDomains = [
    'gmail.com', 'hotmail.com', 'outlook.com', 
    'yahoo.com', 'icloud.com', 'aol.com', 
    'live.com', 'mail.com', 'protonmail.com',
    'gmx.com', 'zoho.com', 'yandex.com'
  ];
  
  const domain = email.split('@')[1].toLowerCase();
  return !freeEmailDomains.includes(domain);
};

// Middleware para validar email corporativo
const validateBusinessEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      error: 'Dados inválidos', 
      message: 'Email não fornecido' 
    });
  }
  
  if (!isBusinessEmail(email)) {
    return res.status(400).json({ 
      error: 'Email inválido', 
      message: 'Apenas emails corporativos são permitidos' 
    });
  }
  
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isPremium,
  isBusinessEmail,
  validateBusinessEmail
};
