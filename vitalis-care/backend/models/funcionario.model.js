const { pool } = require('../db/config');

class Funcionario {
  static async findByEmpresa(empresaId, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.funcionarios WHERE empresa_id = $1 ORDER BY nome`,
        [empresaId]
      );
      return result.rows;
    } catch (err) {
      console.error('Erro ao buscar funcionários por empresa:', err);
      throw err;
    }
  }

  static async findByCodigo(codigo, empresaId, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.funcionarios WHERE codigo = $1 AND empresa_id = $2 LIMIT 1`,
        [codigo, empresaId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao buscar funcionário por código:', err);
      throw err;
    }
  }

  static async findByMatricula(matricula, empresaId, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.funcionarios WHERE matriculafuncionario = $1 AND empresa_id = $2 LIMIT 1`,
        [matricula, empresaId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao buscar funcionário por matrícula:', err);
      throw err;
    }
  }

  static async create(funcionarioData, schema = 'vitalis') {
    try {
      const {
        codigo, 
        nome, 
        empresa_id, 
        codigoempresa, 
        nomeempresa,
        codigounidade, 
        nomeunidade, 
        codigosetor, 
        nomesetor, 
        codigocargo, 
        nomecargo,
        matriculafuncionario,
        data_nascimento,
        data_admissao,
        sexo
      } = funcionarioData;
      
      // Verificar se já existe um funcionário com o mesmo código na mesma empresa
      const existingFunc = await this.findByCodigo(codigo, empresa_id, schema);
      
      if (existingFunc) {
        // Atualizar o funcionário existente
        return await this.update(existingFunc.id, funcionarioData, schema);
      }
      
      // Inserir novo funcionário
      const result = await pool.query(
        `INSERT INTO ${schema}.funcionarios (
          codigo, nome, empresa_id, codigoempresa, nomeempresa,
          codigounidade, nomeunidade, codigosetor, nomesetor,
          codigocargo, nomecargo, matriculafuncionario,
          data_nascimento, data_admissao, sexo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          codigo, nome, empresa_id, codigoempresa, nomeempresa,
          codigounidade, nomeunidade, codigosetor, nomesetor,
          codigocargo, nomecargo, matriculafuncionario,
          data_nascimento, data_admissao, sexo
        ]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao criar funcionário:', err);
      throw err;
    }
  }

  static async update(id, funcionarioData, schema = 'vitalis') {
    try {
      // Criar dinamicamente a query de atualização
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      // Adicionar apenas os campos que estão definidos
      for (const [key, value] of Object.entries(funcionarioData)) {
        if (key !== 'id' && value !== undefined && value !== null) {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }
      
      if (fields.length === 0) {
        return null; // Nada para atualizar
      }
      
      const query = `
        UPDATE ${schema}.funcionarios 
        SET ${fields.join(', ')} 
        WHERE id = $${paramCount} 
        RETURNING *
      `;
      
      values.push(id);
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao atualizar funcionário:', err);
      throw err;
    }
  }
}

module.exports = Funcionario;
