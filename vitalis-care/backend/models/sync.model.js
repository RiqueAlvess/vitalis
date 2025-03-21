const { pool } = require('../db/config');

class SyncLog {
  static async create(logData, schema = 'vitalis') {
    try {
      const {
        tipo,
        empresa_id,
        status,
        detalhes,
        usuario_id
      } = logData;
      
      const result = await pool.query(
        `INSERT INTO ${schema}.logs_sincronizacao (
          tipo, empresa_id, status, detalhes, usuario_id, data_inicio
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *`,
        [tipo, empresa_id, status, detalhes, usuario_id]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao criar log de sincronização:', err);
      throw err;
    }
  }

  static async update(id, logData, schema = 'vitalis') {
    try {
      const {
        status,
        detalhes,
        mensagem_erro,
        registros_afetados
      } = logData;
      
      const result = await pool.query(
        `UPDATE ${schema}.logs_sincronizacao 
         SET 
           status = $1,
           detalhes = $2,
           mensagem_erro = $3,
           registros_afetados = $4,
           data_fim = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [status, detalhes, mensagem_erro, registros_afetados, id]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao atualizar log de sincronização:', err);
      throw err;
    }
  }

  static async findByEmpresa(empresaId, limit = 10, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.logs_sincronizacao 
         WHERE empresa_id = $1
         ORDER BY data_inicio DESC
         LIMIT $2`,
        [empresaId, limit]
      );
      
      return result.rows;
    } catch (err) {
      console.error('Erro ao buscar logs de sincronização por empresa:', err);
      throw err;
    }
  }

  static async findById(id, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.logs_sincronizacao WHERE id = $1`,
        [id]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao buscar log de sincronização por id:', err);
      throw err;
    }
  }
}

module.exports = SyncLog;
