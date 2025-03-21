const { pool } = require('../db/config');
const bcrypt = require('bcrypt');

class User {
  static async findByEmail(email, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT * FROM ${schema}.usuarios WHERE email = $1 LIMIT 1`,
        [email]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao buscar usuário por email:', err);
      throw err;
    }
  }

  static async createUser(userData, schema = 'vitalis') {
    try {
      const { nome, email, senha, cargo, empresa_id, is_admin, is_premium } = userData;
      const hashedPassword = await bcrypt.hash(senha, 10);
      
      const result = await pool.query(
        `INSERT INTO ${schema}.usuarios 
        (nome, email, senha, cargo, empresa_id, is_admin, is_premium) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, nome, email, cargo, empresa_id, is_admin, is_premium, created_at`,
        [nome, email, hashedPassword, cargo, empresa_id, is_admin || false, is_premium || false]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      throw err;
    }
  }

  static async updateUser(id, userData, schema = 'vitalis') {
    try {
      let query = `UPDATE ${schema}.usuarios SET `;
      let values = [];
      let paramCount = 1;
      
      // Construir dinamicamente a query com os campos que foram fornecidos
      for (const [key, value] of Object.entries(userData)) {
        if (key !== 'id' && key !== 'senha') {
          if (paramCount > 1) query += ', ';
          query += `${key} = $${paramCount}`;
          values.push(value);
          paramCount++;
        }
      }
      
      // Se tiver senha, fazer o hash
      if (userData.senha) {
        if (paramCount > 1) query += ', ';
        query += `senha = $${paramCount}`;
        const hashedPassword = await bcrypt.hash(userData.senha, 10);
        values.push(hashedPassword);
        paramCount++;
      }
      
      query += ` WHERE id = $${paramCount} RETURNING *`;
      values.push(id);
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      throw err;
    }
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = User;
