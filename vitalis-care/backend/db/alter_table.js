require('dotenv').config();
const { pool } = require('./config');

async function alterTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Adicionar novos campos à tabela de configurações
    await client.query(`
      ALTER TABLE vitalis.configuracoes_api 
      ADD COLUMN IF NOT EXISTS codigo_empresa_funcionario VARCHAR(100) DEFAULT '',
      ADD COLUMN IF NOT EXISTS codigo_empresa_absenteismo VARCHAR(100) DEFAULT '',
      ADD COLUMN IF NOT EXISTS codigo_empresa_principal VARCHAR(100) DEFAULT '';
    `);
    
    await client.query('COMMIT');
    console.log('Alteração na tabela concluída com sucesso');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro durante a alteração da tabela:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Executar alterações
alterTables().catch(err => {
  console.error('Erro ao executar alterações na tabela:', err);
  process.exit(1);
});
