require('dotenv').config();
const { pool } = require('./config');

async function createSchema(client, schemaName) {
  try {
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    console.log(`Schema ${schemaName} criado ou já existente`);
  } catch (err) {
    console.error(`Erro ao criar schema ${schemaName}:`, err);
    throw err;
  }
}

async function createTables(client, schemaName) {
  try {
    // Tabela de empresas
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.empresas (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL UNIQUE,
        nome VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(100) NOT NULL,
        cargo VARCHAR(100),
        empresa_id INTEGER REFERENCES ${schemaName}.empresas(id),
        is_admin BOOLEAN DEFAULT FALSE,
        is_premium BOOLEAN DEFAULT FALSE,
        reset_token VARCHAR(100),
        reset_expiracao TIMESTAMP,
        ultimo_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de configurações de API
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.configuracoes_api (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER REFERENCES ${schemaName}.empresas(id),
        chave_funcionario VARCHAR(100),
        codigo_funcionario VARCHAR(100),
        flag_ativo BOOLEAN DEFAULT TRUE,
        flag_inativo BOOLEAN DEFAULT FALSE,
        flag_pendente BOOLEAN DEFAULT FALSE,
        flag_ferias BOOLEAN DEFAULT FALSE,
        flag_afastado BOOLEAN DEFAULT FALSE,
        chave_absenteismo VARCHAR(100),
        codigo_absenteismo VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de funcionários
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.funcionarios (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) NOT NULL,
        nome VARCHAR(120) NOT NULL,
        empresa_id INTEGER REFERENCES ${schemaName}.empresas(id),
        codigoempresa VARCHAR(20),
        nomeempresa VARCHAR(200),
        codigounidade VARCHAR(20),
        nomeunidade VARCHAR(130),
        codigosetor VARCHAR(12),
        nomesetor VARCHAR(130),
        codigocargo VARCHAR(10),
        nomecargo VARCHAR(130),
        cbocargo VARCHAR(10),
        ccusto VARCHAR(50),
        nomecentrocusto VARCHAR(130),
        matriculafuncionario VARCHAR(30),
        cpf VARCHAR(19),
        rg VARCHAR(19),
        ufrg VARCHAR(10),
        orgaoemissorrg VARCHAR(20),
        situacao VARCHAR(12),
        sexo INTEGER,
        pis VARCHAR(20),
        ctps VARCHAR(30),
        seriectps VARCHAR(25),
        estadocivil INTEGER,
        tipocontatacao INTEGER,
        data_nascimento DATE,
        data_admissao DATE,
        data_demissao DATE,
        endereco VARCHAR(110),
        numero_endereco VARCHAR(20),
        bairro VARCHAR(80),
        cidade VARCHAR(50),
        uf VARCHAR(20),
        cep VARCHAR(10),
        telefoneresidencial VARCHAR(20),
        telefonecelular VARCHAR(20),
        email VARCHAR(400),
        deficiente INTEGER,
        deficiencia VARCHAR(861),
        nm_mae_funcionario VARCHAR(120),
        dataultalteracao DATE,
        matricularh VARCHAR(30),
        cor INTEGER,
        escolaridade INTEGER,
        naturalidade VARCHAR(50),
        ramal VARCHAR(10),
        regimerevezamento INTEGER,
        regimetrabalho VARCHAR(500),
        telcomercial VARCHAR(20),
        turnotrabalho INTEGER,
        rhunidade VARCHAR(80),
        rhsetor VARCHAR(80),
        rhcargo VARCHAR(80),
        rhcentrocustounidade VARCHAR(80),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(codigo, empresa_id)
      )
    `);
    
    // Tabela de absenteísmo
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.absenteismo (
        id SERIAL PRIMARY KEY,
        unidade VARCHAR(130),
        setor VARCHAR(130),
        matricula_func VARCHAR(30),
        dt_nascimento DATE,
        sexo INTEGER,
        tipo_atestado INTEGER,
        dt_inicio_atestado DATE,
        dt_fim_atestado DATE,
        hora_inicio_atestado VARCHAR(5),
        hora_fim_atestado VARCHAR(5),
        dias_afastados INTEGER,
        horas_afastado VARCHAR(5),
        cid_principal VARCHAR(10),
        descricao_cid VARCHAR(264),
        grupo_patologico VARCHAR(80),
        tipo_licenca VARCHAR(100),
        empresa_id INTEGER REFERENCES ${schemaName}.empresas(id),
        funcionario_id INTEGER REFERENCES ${schemaName}.funcionarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de logs de sincronização
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.logs_sincronizacao (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(20) NOT NULL,
        empresa_id INTEGER REFERENCES ${schemaName}.empresas(id),
        status VARCHAR(20) NOT NULL,
        detalhes TEXT,
        data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_fim TIMESTAMP,
        registros_afetados INTEGER DEFAULT 0,
        mensagem_erro TEXT,
        usuario_id INTEGER REFERENCES ${schemaName}.usuarios(id)
      )
    `);
    
    console.log(`Tabelas criadas ou atualizadas no schema ${schemaName}`);
  } catch (err) {
    console.error(`Erro ao criar tabelas no schema ${schemaName}:`, err);
    throw err;
  }
}

async function createTriggersAndFunctions(client, schemaName) {
  try {
    // Função para atualizar o updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION ${schemaName}.update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Triggers para tabelas
    const tables = ['empresas', 'usuarios', 'configuracoes_api', 'funcionarios', 'absenteismo'];
    
    for (const table of tables) {
      // Verificar se o trigger já existe
      const triggerCheckResult = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_trigger 
          JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
          JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
          WHERE pg_trigger.tgname = '${table}_update_timestamp' 
          AND pg_namespace.nspname = '${schemaName}'
          AND pg_class.relname = '${table}'
        ) AS trigger_exists;
      `);
      
      if (!triggerCheckResult.rows[0].trigger_exists) {
        await client.query(`
          CREATE TRIGGER ${table}_update_timestamp
          BEFORE UPDATE ON ${schemaName}.${table}
          FOR EACH ROW
          EXECUTE FUNCTION ${schemaName}.update_timestamp();
        `);
        
        console.log(`Trigger de atualização criado para ${schemaName}.${table}`);
      } else {
        console.log(`Trigger de atualização já existe para ${schemaName}.${table}`);
      }
    }
  } catch (err) {
    console.error(`Erro ao criar triggers e funções no schema ${schemaName}:`, err);
    throw err;
  }
}

async function createIndexes(client, schemaName) {
  try {
    // Índices para funcionários
    await client.query(`
      CREATE INDEX IF NOT EXISTS funcionarios_empresa_id_idx 
      ON ${schemaName}.funcionarios(empresa_id);
      
      CREATE INDEX IF NOT EXISTS funcionarios_matricula_idx 
      ON ${schemaName}.funcionarios(matriculafuncionario);
    `);
    
    // Índices para absenteísmo
    await client.query(`
      CREATE INDEX IF NOT EXISTS absenteismo_empresa_id_idx 
      ON ${schemaName}.absenteismo(empresa_id);
      
      CREATE INDEX IF NOT EXISTS absenteismo_matricula_func_idx 
      ON ${schemaName}.absenteismo(matricula_func);
      
      CREATE INDEX IF NOT EXISTS absenteismo_dt_inicio_idx 
      ON ${schemaName}.absenteismo(dt_inicio_atestado);
      
      CREATE INDEX IF NOT EXISTS absenteismo_dt_fim_idx 
      ON ${schemaName}.absenteismo(dt_fim_atestado);
      
      CREATE INDEX IF NOT EXISTS absenteismo_cid_principal_idx 
      ON ${schemaName}.absenteismo(cid_principal);
    `);
    
    console.log(`Índices criados ou atualizados no schema ${schemaName}`);
  } catch (err) {
    console.error(`Erro ao criar índices no schema ${schemaName}:`, err);
    throw err;
  }
}

async function createPublicSchema(client) {
  try {
    // Criar tabela de empresas_clientes no schema public
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.empresas_clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        schema_name VARCHAR(100) NOT NULL UNIQUE,
        email_admin VARCHAR(100) NOT NULL UNIQUE,
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Trigger para atualizar o updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION public.update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Verificar se o trigger já existe
    const triggerCheckResult = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'empresas_clientes_update_timestamp'
      ) AS trigger_exists;
    `);
    
    if (!triggerCheckResult.rows[0].trigger_exists) {
      await client.query(`
        CREATE TRIGGER empresas_clientes_update_timestamp
        BEFORE UPDATE ON public.empresas_clientes
        FOR EACH ROW
        EXECUTE FUNCTION public.update_timestamp();
      `);
      
      console.log('Trigger de atualização criado para public.empresas_clientes');
    } else {
      console.log('Trigger de atualização já existe para public.empresas_clientes');
    }
    
    console.log('Schema público configurado com sucesso');
  } catch (err) {
    console.error('Erro ao configurar schema público:', err);
    throw err;
  }
}

async function seedAdminUser(client, schemaName) {
  try {
    // Verificar se já existe uma empresa padrão
    const empresaResult = await client.query(`
      SELECT id FROM ${schemaName}.empresas WHERE codigo = 'admin' LIMIT 1
    `);
    
    let empresaId;
    
    if (empresaResult.rowCount === 0) {
      // Criar empresa padrão
      const empresaInsert = await client.query(`
        INSERT INTO ${schemaName}.empresas (codigo, nome) 
        VALUES ('admin', 'Administração Vitalis') 
        RETURNING id
      `);
      
      empresaId = empresaInsert.rows[0].id;
      console.log(`Empresa de administração criada no schema ${schemaName}`);
    } else {
      empresaId = empresaResult.rows[0].id;
    }
    
    // Verificar se já existe um usuário admin
    const userResult = await client.query(`
      SELECT id FROM ${schemaName}.usuarios WHERE email = 'admin@admin.com' LIMIT 1
    `);
    
    if (userResult.rowCount === 0) {
      // Criar usuário admin (senha: admin)
      // Em ambiente real, usar bcrypt para hash, mas isso é apenas para primeiro acesso
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin', 10);
      
      await client.query(`
        INSERT INTO ${schemaName}.usuarios (nome, email, senha, cargo, empresa_id, is_admin, is_premium) 
        VALUES ('Administrador', 'admin@admin.com', $1, 'Administrador', $2, TRUE, TRUE)
      `, [hashedPassword, empresaId]);
      
      console.log(`Usuário administrador criado no schema ${schemaName}`);
    } else {
      console.log(`Usuário administrador já existe no schema ${schemaName}`);
    }
    
    // Verificar se já existe configuração de API
    const configResult = await client.query(`
      SELECT id FROM ${schemaName}.configuracoes_api WHERE empresa_id = $1 LIMIT 1
    `, [empresaId]);
    
    if (configResult.rowCount === 0) {
      // Criar configuração padrão
      await client.query(`
        INSERT INTO ${schemaName}.configuracoes_api (
          empresa_id, chave_funcionario, codigo_funcionario, 
          flag_ativo, flag_inativo, flag_pendente, flag_ferias, flag_afastado,
          chave_absenteismo, codigo_absenteismo
        ) VALUES (
          $1, '', '', 
          TRUE, FALSE, FALSE, FALSE, FALSE,
          '', ''
        )
      `, [empresaId]);
      
      console.log(`Configuração de API padrão criada no schema ${schemaName}`);
    } else {
      console.log(`Configuração de API já existe no schema ${schemaName}`);
    }
  } catch (err) {
    console.error(`Erro ao criar dados iniciais no schema ${schemaName}:`, err);
    throw err;
  }
}

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Criar schema público
    await createPublicSchema(client);
    
    // Criar schema principal (vitalis)
    const mainSchema = 'vitalis';
    await createSchema(client, mainSchema);
    await createTables(client, mainSchema);
    await createTriggersAndFunctions(client, mainSchema);
    await createIndexes(client, mainSchema);
    await seedAdminUser(client, mainSchema);
    
    await client.query('COMMIT');
    console.log('Migração concluída com sucesso');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro durante a migração:', err);
    throw err;
  } finally {
    client.release();
  }
}

runMigrations().catch(err => {
  console.error('Erro ao executar migrações:', err);
  process.exit(1);
});
