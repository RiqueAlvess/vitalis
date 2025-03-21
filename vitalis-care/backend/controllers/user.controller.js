const User = require('../models/user.model');
const { isBusinessEmail } = require('../middleware/auth.middleware');

// Atualizar perfil do usuário
const atualizarPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nome, email, senha, cargo } = req.body;
    
    // Validar email se estiver sendo atualizado
    if (email && !isBusinessEmail(email)) {
      return res.status(400).json({ 
        error: 'Email inválido', 
        message: 'Apenas emails corporativos são permitidos' 
      });
    }
    
    // Validar formato de senha se estiver sendo atualizada
    if (senha) {
      const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!senhaRegex.test(senha)) {
        return res.status(400).json({ 
          error: 'Senha inválida', 
          message: 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos' 
        });
      }
    }
    
    // Atualizar usuário
    const updatedUser = await User.updateUser(userId, {
      nome,
      email,
      senha,
      cargo
    });
    
    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado', 
        message: 'Usuário não existe ou foi removido' 
      });
    }
    
    // Remover a senha do objeto de usuário
    delete updatedUser.senha;
    
    // Retornar dados atualizados
    return res.status(200).json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao atualizar perfil do usuário' 
    });
  }
};

// Atualizar assinatura para premium
const atualizarAssinatura = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_premium } = req.body;
    
    // Validar entrada
    if (is_premium === undefined) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        message: 'Status premium não informado' 
      });
    }
    
    // Atualizar usuário
    const updatedUser = await User.updateUser(userId, {
      is_premium: Boolean(is_premium)
    });
    
    if (!updatedUser) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado', 
        message: 'Usuário não existe ou foi removido' 
      });
    }
    
    // Remover a senha do objeto de usuário
    delete updatedUser.senha;
    
    // Retornar dados atualizados
    return res.status(200).json({
      message: is_premium ? 'Assinatura premium ativada com sucesso!' : 'Assinatura alterada para versão gratuita',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erro ao atualizar assinatura do usuário:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao atualizar assinatura do usuário' 
    });
  }
};

module.exports = {
  atualizarPerfil,
  atualizarAssinatura
};
