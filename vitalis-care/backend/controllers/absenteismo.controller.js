const Absenteismo = require('../models/absenteismo.model');
const Funcionario = require('../models/funcionario.model');
const ConfigAPI = require('../models/config.model');
const SyncLog = require('../models/sync.model');
const axios = require('axios');

// Listar registros de absenteísmo
const listarAbsenteismo = async (req, res) => {
  try {
    const { empresa_id } = req.user;
    const { dataInicio, dataFim, setor, cid, limit, offset } = req.query;
    
    // Filtros opcionais
    const options = {
      dataInicio,
      dataFim,
      setor,
      cid,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0
    };
    
    // Buscar registros
    const registros = await Absenteismo.findByEmpresa(empresa_id, options);
    
    return res.status(200).json({
      registros
    });
  } catch (error) {
    console.error('Erro ao listar registros de absenteísmo:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao listar registros de absenteísmo' 
    });
  }
};

// Buscar estatísticas de absenteísmo
const estatisticasAbsenteismo = async (req, res) => {
  try {
    const { empresa_id, is_premium } = req.user;
    const { dataInicio, dataFim } = req.query;
    
    // Filtros opcionais
    const options = {
      dataInicio,
      dataFim
    };
    
    // Buscar estatísticas
    const stats = await Absenteismo.getAbsenteismoStats(empresa_id, options);
    
    // Se não for premium, limitar algumas informações
    if (!is_premium) {
      // Remover informações premium (disponíveis na resposta, mas com blur no frontend)
      // Mantemos os dados mas com uma flag para o frontend
      return res.status(200).json({
        isPremium: false,
        taxaAbsenteismo: stats.taxaAbsenteismo,
        totalRegistros: stats.totalRegistros,
        totalDiasAfastados: stats.totalDiasAfastados,
        totalFuncionariosAfastados: stats.totalFuncionariosAfastados,
        topCids: stats.topCids.slice(0, 5), // Limitar a 5 na versão gratuita
        topSetores: stats.topSetores.slice(0, 5), // Limitar a 5 na versão gratuita
        evolucaoMensal: stats.evolucaoMensal
        // Nota: prejuizoFinanceiro disponível apenas no premium
      });
    }
    
    // Retornar estatísticas completas para usuários premium
    return res.status(200).json({
      isPremium: true,
      ...stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de absenteísmo:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao buscar estatísticas de absenteísmo' 
    });
  }
};

// Sincronizar registros de absenteísmo com a API SOC
const sincronizarAbsenteismo = async (req, res) => {
  try {
    const { empresa_id, id: usuario_id } = req.user;
    const { dataInicio, dataFim } = req.body;
    
    // Validar datas
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        message: 'Data inicial e final são obrigatórias' 
      });
    }
    
    // Validar intervalo de datas (máximo de 30 dias)
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffDays = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) {
      return res.status(400).json({ 
        error: 'Intervalo inválido', 
        message: 'O intervalo máximo entre as datas é de 30 dias' 
      });
    }
    
    // Buscar configurações da API
    const configAPI = await ConfigAPI.findByEmpresa(empresa_id);
    
    if (!configAPI || !configAPI.chave_absenteismo || !configAPI.codigo_absenteismo) {
      return res.status(400).json({ 
        error: 'Configuração inválida', 
        message: 'Configure os parâmetros da API de absenteísmo' 
      });
    }
    
    // Criar log de sincronização
    const syncLog = await SyncLog.create({
      tipo: 'absenteismo',
      empresa_id,
      status: 'em_andamento',
      detalhes: `Iniciando sincronização de absenteísmo para o período de ${dataInicio} a ${dataFim}`,
      usuario_id
    });
    
    // Formatar datas para o formato dd/mm/aaaa
    const formatarData = (data) => {
      const d = new Date(data);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };
    
    // Parâmetros para a API
    const params = {
      empresa: configAPI.codigo_absenteismo.trim(), // Empresa principal
      codigo: configAPI.codigo_absenteismo.trim(),
      chave: configAPI.chave_absenteismo.trim(),
      tipoSaida: 'json',
      empresaTrabalho: '', // Pode ser a mesma ou outra
      dataInicio: formatarData(dataInicio),
      dataFim: formatarData(dataFim)
    };
    
    // URL da API
    const url = 'https://ws1.soc.com.br/WebSoc/exportadados?parametro=';
    
    try {
      // Realizar a chamada à API
      const response = await axios.get(`${url}${JSON.stringify(params)}`);
      
      // Decodificar resposta
      const responseData = JSON.parse(response.data);
      
      if (!responseData || !Array.isArray(responseData)) {
        await SyncLog.update(syncLog.id, {
          status: 'erro',
          detalhes: 'Resposta da API inválida ou vazia',
          mensagem_erro: JSON.stringify(responseData),
          registros_afetados: 0
        });
        
        return res.status(400).json({ 
          error: 'Resposta inválida', 
          message: 'A API retornou uma resposta inválida ou vazia' 
        });
      }
      
      // Processar registros de absenteísmo
      let registrosAtualizados = 0;
      
      for (const reg of responseData) {
        try {
          // Buscar funcionário por matrícula
          let funcionarioId = null;
          
          if (reg.MATRICULA_FUNC) {
            const funcionario = await Funcionario.findByMatricula(reg.MATRICULA_FUNC, empresa_id);
            if (funcionario) {
              funcionarioId = funcionario.id;
            }
          }
          
          // Converter datas
          const dtNascimento = reg.DT_NASCIMENTO ? new Date(reg.DT_NASCIMENTO) : null;
          const dtInicioAtestado = reg.DT_INICIO_ATESTADO ? new Date(reg.DT_INICIO_ATESTADO) : null;
          const dtFimAtestado = reg.DT_FIM_ATESTADO ? new Date(reg.DT_FIM_ATESTADO) : null;
          
          // Criar registro de absenteísmo
          await Absenteismo.create({
            unidade: reg.UNIDADE,
            setor: reg.SETOR,
            matricula_func: reg.MATRICULA_FUNC,
            dt_nascimento: dtNascimento,
            sexo: reg.SEXO,
            tipo_atestado: reg.TIPO_ATESTADO,
            dt_inicio_atestado: dtInicioAtestado,
            dt_fim_atestado: dtFimAtestado,
            hora_inicio_atestado: reg.HORA_INICIO_ATESTADO,
            hora_fim_atestado: reg.HORA_FIM_ATESTADO,
            dias_afastados: reg.DIAS_AFASTADOS,
            horas_afastado: reg.HORAS_AFASTADO,
            cid_principal: reg.CID_PRINCIPAL,
            descricao_cid: reg.DESCRICAO_CID,
            grupo_patologico: reg.GRUPO_PATOLOGICO,
            tipo_licenca: reg.TIPO_LICENCA,
            empresa_id,
            funcionario_id: funcionarioId
          });
          
          registrosAtualizados++;
        } catch (err) {
          console.error(`Erro ao processar registro de absenteísmo:`, err);
        }
      }
      
      // Atualizar log de sincronização
      await SyncLog.update(syncLog.id, {
        status: 'concluido',
        detalhes: `Sincronização concluída. Processados ${responseData.length} registros de absenteísmo.`,
        registros_afetados: registrosAtualizados
      });
      
      // Retornar resposta com dados da sincronização
      return res.status(200).json({
        message: 'Sincronização de absenteísmo realizada com sucesso',
        totalRegistros: responseData.length,
        registrosAtualizados,
        logId: syncLog.id
      });
    } catch (apiError) {
      console.error('Erro na chamada à API SOC:', apiError);
      
      // Atualizar log de sincronização com erro
      await SyncLog.update(syncLog.id, {
        status: 'erro',
        detalhes: 'Erro na chamada à API SOC',
        mensagem_erro: apiError.message,
        registros_afetados: 0
      });
      
      return res.status(500).json({ 
        error: 'Erro na API', 
        message: 'Erro ao chamar a API SOC', 
        details: apiError.message 
      });
    }
  } catch (error) {
    console.error('Erro ao sincronizar absenteísmo:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao sincronizar absenteísmo' 
    });
  }
};

module.exports = {
  listarAbsenteismo,
  estatisticasAbsenteismo,
  sincronizarAbsenteismo
};
