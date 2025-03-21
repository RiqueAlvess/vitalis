const { pool } = require('../db/config');

class Absenteismo {
  static async findByEmpresa(empresaId, options = {}, schema = 'vitalis') {
    try {
      let query = `SELECT a.*, f.nome as nome_funcionario 
                   FROM ${schema}.absenteismo a
                   LEFT JOIN ${schema}.funcionarios f ON a.funcionario_id = f.id
                   WHERE a.empresa_id = $1`;
      
      const queryParams = [empresaId];
      let paramCount = 2;
      
      // Filtrar por data inicial
      if (options.dataInicio) {
        query += ` AND a.dt_inicio_atestado >= $${paramCount}`;
        queryParams.push(options.dataInicio);
        paramCount++;
      }
      
      // Filtrar por data final
      if (options.dataFim) {
        query += ` AND a.dt_fim_atestado <= $${paramCount}`;
        queryParams.push(options.dataFim);
        paramCount++;
      }
      
      // Filtrar por CID
      if (options.cid) {
        query += ` AND a.cid_principal = $${paramCount}`;
        queryParams.push(options.cid);
        paramCount++;
      }
      
      // Filtrar por setor
      if (options.setor) {
        query += ` AND a.setor = $${paramCount}`;
        queryParams.push(options.setor);
        paramCount++;
      }
      
      // Ordenação
      query += ` ORDER BY a.dt_inicio_atestado DESC`;
      
      // Paginação (se fornecida)
      if (options.limit) {
        query += ` LIMIT $${paramCount}`;
        queryParams.push(options.limit);
        paramCount++;
        
        if (options.offset) {
          query += ` OFFSET $${paramCount}`;
          queryParams.push(options.offset);
        }
      }
      
      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (err) {
      console.error('Erro ao buscar registros de absenteísmo:', err);
      throw err;
    }
  }

  static async findById(id, schema = 'vitalis') {
    try {
      const result = await pool.query(
        `SELECT a.*, f.nome as nome_funcionario 
         FROM ${schema}.absenteismo a
         LEFT JOIN ${schema}.funcionarios f ON a.funcionario_id = f.id
         WHERE a.id = $1 LIMIT 1`,
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao buscar registro de absenteísmo por id:', err);
      throw err;
    }
  }

  static async create(absenteismoData, schema = 'vitalis') {
    try {
      const {
        unidade,
        setor,
        matricula_func,
        dt_nascimento,
        sexo,
        tipo_atestado,
        dt_inicio_atestado,
        dt_fim_atestado,
        hora_inicio_atestado,
        hora_fim_atestado,
        dias_afastados,
        horas_afastado,
        cid_principal,
        descricao_cid,
        grupo_patologico,
        tipo_licenca,
        empresa_id
      } = absenteismoData;
      
      // Verificar se existe um funcionário com a matrícula
      let funcionarioId = null;
      if (matricula_func) {
        const funcionarioResult = await pool.query(
          `SELECT id FROM ${schema}.funcionarios 
           WHERE matriculafuncionario = $1 AND empresa_id = $2 LIMIT 1`,
          [matricula_func, empresa_id]
        );
        
        if (funcionarioResult.rows.length > 0) {
          funcionarioId = funcionarioResult.rows[0].id;
        }
      }
      
      // Inserir registro de absenteísmo
      const result = await pool.query(
        `INSERT INTO ${schema}.absenteismo (
          unidade, setor, matricula_func, dt_nascimento, sexo,
          tipo_atestado, dt_inicio_atestado, dt_fim_atestado,
          hora_inicio_atestado, hora_fim_atestado,
          dias_afastados, horas_afastado, cid_principal,
          descricao_cid, grupo_patologico, tipo_licenca,
          empresa_id, funcionario_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [
          unidade, setor, matricula_func, dt_nascimento, sexo,
          tipo_atestado, dt_inicio_atestado, dt_fim_atestado,
          hora_inicio_atestado, hora_fim_atestado,
          dias_afastados, horas_afastado, cid_principal,
          descricao_cid, grupo_patologico, tipo_licenca,
          empresa_id, funcionarioId
        ]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Erro ao criar registro de absenteísmo:', err);
      throw err;
    }
  }

  static async getAbsenteismoStats(empresaId, options = {}, schema = 'vitalis') {
    try {
      // Construir a cláusula WHERE para os filtros
      let whereClause = 'WHERE a.empresa_id = $1';
      const queryParams = [empresaId];
      let paramCount = 2;
      
      // Filtrar por data inicial
      if (options.dataInicio) {
        whereClause += ` AND a.dt_inicio_atestado >= $${paramCount}`;
        queryParams.push(options.dataInicio);
        paramCount++;
      }
      
      // Filtrar por data final
      if (options.dataFim) {
        whereClause += ` AND a.dt_fim_atestado <= $${paramCount}`;
        queryParams.push(options.dataFim);
        paramCount++;
      }
      
      // Contagem total de registros
      const countQuery = `
        SELECT COUNT(*) as total_registros
        FROM ${schema}.absenteismo a
        ${whereClause}
      `;
      
      // Total de dias e horas afastados
      const totalsQuery = `
        SELECT 
          SUM(a.dias_afastados) as total_dias_afastados,
          COUNT(DISTINCT a.matricula_func) as total_funcionarios_afastados
        FROM ${schema}.absenteismo a
        ${whereClause}
      `;
      
      // Top CIDs
      const cidQuery = `
        SELECT 
          a.cid_principal, 
          a.descricao_cid,
          COUNT(*) as total
        FROM ${schema}.absenteismo a
        ${whereClause}
        GROUP BY a.cid_principal, a.descricao_cid
        ORDER BY total DESC
        LIMIT 10
      `;
      
      // Top setores
      const setorQuery = `
        SELECT 
          a.setor, 
          COUNT(*) as total_registros,
          SUM(a.dias_afastados) as total_dias
        FROM ${schema}.absenteismo a
        ${whereClause}
        GROUP BY a.setor
        ORDER BY total_dias DESC
        LIMIT 10
      `;
      
      // Evolução mensal
      const evolucaoQuery = `
        SELECT 
          DATE_TRUNC('month', a.dt_inicio_atestado) as mes,
          COUNT(*) as total_registros,
          SUM(a.dias_afastados) as total_dias
        FROM ${schema}.absenteismo a
        ${whereClause}
        GROUP BY mes
        ORDER BY mes
      `;
      
      // Executar todas as queries em paralelo
      const [countResult, totalsResult, cidResult, setorResult, evolucaoResult] = await Promise.all([
        pool.query(countQuery, queryParams),
        pool.query(totalsQuery, queryParams),
        pool.query(cidQuery, queryParams),
        pool.query(setorQuery, queryParams),
        pool.query(evolucaoQuery, queryParams)
      ]);
      
      // Calcular taxa de absenteísmo (considerando 220h mensais por funcionário)
      // Buscar contagem de funcionários ativos
      const funcionariosQuery = `
        SELECT COUNT(*) as total_funcionarios
        FROM ${schema}.funcionarios
        WHERE empresa_id = $1 AND (data_demissao IS NULL OR data_demissao > CURRENT_DATE)
      `;
      
      const funcionariosResult = await pool.query(funcionariosQuery, [empresaId]);
      const totalFuncionarios = funcionariosResult.rows[0]?.total_funcionarios || 0;
      
      // Total de horas trabalhadas = total de funcionários * 220h
      const totalHorasTrabalhadas = totalFuncionarios * 220;
      
      // Calcular a taxa de absenteísmo
      const totalHorasAfastadas = totalsResult.rows[0]?.total_dias_afastados * 8 || 0;
      const taxaAbsenteismo = totalHorasTrabalhadas > 0 
        ? (totalHorasAfastadas / totalHorasTrabalhadas) * 100 
        : 0;
      
      // Calcular prejuízo financeiro (baseado no salário mínimo)
      const salarioMinimo = 1412; // Atualizar conforme necessário
      const valorHora = salarioMinimo / 220;
      const prejuizoFinanceiro = totalHorasAfastadas * valorHora;
      
      return {
        taxaAbsenteismo: parseFloat(taxaAbsenteismo.toFixed(2)),
        prejuizoFinanceiro: parseFloat(prejuizoFinanceiro.toFixed(2)),
        totalRegistros: parseInt(countResult.rows[0]?.total_registros || 0),
        totalDiasAfastados: parseInt(totalsResult.rows[0]?.total_dias_afastados || 0),
        totalFuncionariosAfastados: parseInt(totalsResult.rows[0]?.total_funcionarios_afastados || 0),
        totalFuncionarios: totalFuncionarios,
        topCids: cidResult.rows,
        topSetores: setorResult.rows,
        evolucaoMensal: evolucaoResult.rows.map(row => ({
          ...row,
          mes: row.mes ? new Date(row.mes).toISOString().substring(0, 7) : null
        }))
      };
    } catch (err) {
      console.error('Erro ao obter estatísticas de absenteísmo:', err);
      throw err;
    }
  }
}

module.exports = Absenteismo;
