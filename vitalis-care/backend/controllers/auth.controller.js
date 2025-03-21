const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { isBusinessEmail } = require('../middleware/auth.middleware');

// Login de usuário
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Validar entrada
    if (!email || !senha) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        message: 'Email e senha são obrigatórios' 
      });
    }
    
    // Buscar usuário
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas', 
        message: 'Email ou senha incorretos' 
      });
    }
    
    // Verificar senha
    const isMatch = await User.comparePassword(senha, user.senha);
    
    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Credenciais inválidas', 
        message: 'Email ou senha incorretos' 
      });
    }
    
    // Criar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        nome: user.nome,
        empresa_id: user.empresa_id,
        is_admin: user.is_admin,
        is_premium: user.is_premium
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Remover a senha do objeto de usuário
    delete user.senha;
    
    // Retornar usuário e token
    return res.status(200).json({
      message: 'Login realizado com sucesso',
      user,
      token
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao processar login' 
    });
  }
};

// Registro de usuário
const register = async (req, res) => {
  try {
    const { nome, email, senha, cargo, empresa_id } = req.body;
    
    // Validar entrada
    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        message: 'Nome, email e senha são obrigatórios' 
      });
    }
    
    // Validar email corporativo
    if (!isBusinessEmail(email)) {
      return res.status(400).json({ 
        error: 'Email inválido', 
        message: 'Apenas emails corporativos são permitidos' 
      });
    }
    
    // Validar formato de senha
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!senhaRegex.test(senha)) {
      return res.status(400).json({ 
        error: 'Senha inválida', 
        message: 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos' 
      });
    }
    
    // Verificar se usuário já existe
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Usuário já existe', 
        message: 'Este email já está em uso' 
      });
    }
    
    // Criar usuário
    const newUser = await User.createUser({
      nome,
      email,
      senha,
      cargo,
      empresa_id,
      is_admin: false,
      is_premium: false
    });
    
    // Criar token JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        nome: newUser.nome,
        empresa_id: newUser.empresa_id,
        is_admin: newUser.is_admin,
        is_premium: newUser.is_premium
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Retornar usuário e token
    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao registrar usuário' 
    });
  }
};

// Obter perfil do usuário atual
const profile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar usuário
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado', 
        message: 'Usuário não existe ou foi removido' 
      });
    }
    
    // Remover a senha do objeto de usuário
    delete user.senha;
    
    // Retornar dados do usuário
    return res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao buscar perfil do usuário' 
    });
  }
};

module.exports = {
  login,
  register,
  profile
};
