const { pool } = require('../db/config');

class Empresa {
  static async findAll(schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.empresas ORDER BY nome`
      );
      return result.rows;
    } catch (err) {
      console.error('Erro ao buscar todas as empresas:', err);
      throw err;
    }
  }

  static async findById(id, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.empresas WHERE id = $1 LIMIT 1`,
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao buscar empresa por id:', err);
      throw err;
    }
  }

  static async findByCodigo(codigo, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.empresas WHERE codigo = $1 LIMIT 1`,
        [codigo]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao buscar empresa por código:', err);
      throw err;
    }
  }

  static async create(empresaData, schema = 'vitalis') {
    try {
      const { codigo, nome } = empresaData;
      
      // Verificar se já existe
      const existingEmpresa = await this.findByCodigo(codigo, schema);
      if (existingEmpresa) {
        return existingEmpresa;
      }
      
      const result = await pool.query(
        `INSERT INTO ${schema}.empresas (codigo, nome) 
         VALUES ($1, $2) 
         RETURNING *`,
        [codigo, nome]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao criar empresa:', err);
      throw err;
    }
  }

  static async update(id, empresaData, schema = 'vitalis') {
    try {
      const { nome } = empresaData;
      
      const result = await pool.query(
        `UPDATE ${schema}.empresas 
         SET nome = $1 
         WHERE id = $2 
         RETURNING *`,
        [nome, id]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao atualizar empresa:', err);
      throw err;
    }
  }
}

module.exports = Empresa;
