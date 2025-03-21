const ConfigAPI = require('../models/config.model');

// Obter configurações da API
const obterConfiguracoes = async (req, res) => {
  try {
    const { empresa_id } = req.user;
    
    // Buscar configurações
    const config = await ConfigAPI.findByEmpresa(empresa_id);
    
    // Se não existir, retornar objeto vazio
    if (!config) {
      return res.status(200).json({
        config: {
          empresa_id,
          chave_funcionario: '',
          codigo_funcionario: '',
          flag_ativo: true,
          flag_inativo: false,
          flag_pendente: false,
          flag_ferias: false,
          flag_afastado: false,
          chave_absenteismo: '',
          codigo_absenteismo: ''
        }
      });
    }
    
    return res.status(200).json({
      config
    });
  } catch (error) {
    console.error('Erro ao obter configurações da API:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao obter configurações da API' 
    });
  }
};

// Salvar configurações da API
const salvarConfiguracoes = async (req, res) => {
  try {
    const { empresa_id } = req.user;
    const {
      chave_funcionario,
      codigo_funcionario,
      flag_ativo,
      flag_inativo,
      flag_pendente,
      flag_ferias,
      flag_afastado,
      chave_absenteismo,
      codigo_absenteismo
    } = req.body;
    
    // Validar campos obrigatórios
    if (!chave_funcionario || !codigo_funcionario || !chave_absenteismo || !codigo_absenteismo) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        message: 'Todos os campos de chave e código são obrigatórios' 
      });
    }
    
    // Salvar configurações
    const config = await ConfigAPI.saveConfig({
      empresa_id,
      chave_funcionario,
      codigo_funcionario,
      flag_ativo: flag_ativo || false,
      flag_inativo: flag_inativo || false,
      flag_pendente: flag_pendente || false,
      flag_ferias: flag_ferias || false,
      flag_afastado: flag_afastado || false,
      chave_absenteismo,
      codigo_absenteismo
    });
    
    return res.status(200).json({
      message: 'Configurações salvas com sucesso',
      config
    });
  } catch (error) {
    console.error('Erro ao salvar configurações da API:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao salvar configurações da API' 
    });
  }
};

module.exports = {
  obterConfiguracoes,
  salvarConfiguracoes
};
