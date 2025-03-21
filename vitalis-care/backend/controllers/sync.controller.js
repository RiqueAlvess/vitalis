const SyncLog = require('../models/sync.model');

// Listar logs de sincronização
const listarLogs = async (req, res) => {
  try {
    const { empresa_id } = req.user;
    const { limit } = req.query;
    
    // Buscar logs
    const logs = await SyncLog.findByEmpresa(empresa_id, limit || 10);
    
    return res.status(200).json({
      logs
    });
  } catch (error) {
    console.error('Erro ao listar logs de sincronização:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao listar logs de sincronização' 
    });
  }
};

// Obter detalhes de um log específico
const obterLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresa_id } = req.user;
    
    // Buscar log
    const log = await SyncLog.findById(id);
    
    if (!log) {
      return res.status(404).json({ 
        error: 'Log não encontrado', 
        message: 'Log de sincronização não encontrado' 
      });
    }
    
    // Verificar se o log pertence à empresa do usuário
    if (log.empresa_id !== empresa_id) {
      return res.status(403).json({ 
        error: 'Acesso negado', 
        message: 'Você não tem permissão para acessar este log' 
      });
    }
    
    return res.status(200).json({
      log
    });
  } catch (error) {
    console.error('Erro ao obter log de sincronização:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao obter log de sincronização' 
    });
  }
};

module.exports = {
  listarLogs,
  obterLog
};
