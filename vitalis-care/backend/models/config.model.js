const { pool } = require('../db/config');

class ConfigAPI {
  static async findByEmpresa(empresaId, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.configuracoes_api WHERE empresa_id = $1 LIMIT 1`,
        [empresaId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao buscar configuração da API por empresa:', err);
      throw err;
    }
  }

  static async saveConfig(configData, schema = 'vitalis') {
    try {
      const {
        empresa_id,
        chave_funcionario,
        codigo_funcionario,
        codigo_empresa_funcionario,
        flag_ativo,
        flag_inativo,
        flag_pendente,
        flag_ferias,
        flag_afastado,
        chave_absenteismo,
        codigo_absenteismo,
        codigo_empresa_absenteismo,
        codigo_empresa_principal
      } = configData;
      
      // Verificar se já existe uma configuração para esta empresa
      const existingConfig = await this.findByEmpresa(empresa_id, schema);
      
      if (existingConfig) {
        // Atualizar configuração existente
        const result = await pool.query(
          `UPDATE ${schema}.configuracoes_api 
           SET 
             chave_funcionario = $1,
             codigo_funcionario = $2,
             codigo_empresa_funcionario = $3,
             flag_ativo = $4,
             flag_inativo = $5,
             flag_pendente = $6,
             flag_ferias = $7,
             flag_afastado = $8,
             chave_absenteismo = $9,
             codigo_absenteismo = $10,
             codigo_empresa_absenteismo = $11,
             codigo_empresa_principal = $12,
             updated_at = CURRENT_TIMESTAMP
           WHERE empresa_id = $13
           RETURNING *`,
          [
            chave_funcionario,
            codigo_funcionario,
            codigo_empresa_funcionario || '',
            flag_ativo || false,
            flag_inativo || false,
            flag_pendente || false,
            flag_ferias || false,
            flag_afastado || false,
            chave_absenteismo,
            codigo_absenteismo,
            codigo_empresa_absenteismo || '',
            codigo_empresa_principal || '',
            empresa_id
          ]
        );
        
        return result.rows[0];
      } else {
        // Criar nova configuração
        const result = await pool.query(
          `INSERT INTO ${schema}.configuracoes_api (
             empresa_id,
             chave_funcionario,
             codigo_funcionario,
             codigo_empresa_funcionario,
             flag_ativo,
             flag_inativo,
             flag_pendente,
             flag_ferias,
             flag_afastado,
             chave_absenteismo,
             codigo_absenteismo,
             codigo_empresa_absenteismo,
             codigo_empresa_principal
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           RETURNING *`,
          [
            empresa_id,
            chave_funcionario,
            codigo_funcionario,
            codigo_empresa_funcionario || '',
            flag_ativo || false,
            flag_inativo || false,
            flag_pendente || false,
            flag_ferias || false,
            flag_afastado || false,
            chave_absenteismo,
            codigo_absenteismo,
            codigo_empresa_absenteismo || '',
            codigo_empresa_principal || ''
          ]
        );
        
        return result.rows[0];
      }
    } catch (err) {
      console.error('Erro ao salvar configuração da API:', err);
      throw err;
    }
  }
}

module.exports = ConfigAPI;
