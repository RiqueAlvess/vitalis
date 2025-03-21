const Funcionario = require('../models/funcionario.model');
const axios = require('axios');
const ConfigAPI = require('../models/config.model');
const Empresa = require('../models/empresa.model');
const SyncLog = require('../models/sync.model');

// Listar funcionários
const listarFuncionarios = async (req, res) => {
  try {
    const { empresa_id } = req.user;
    
    // Buscar funcionários da empresa
    const funcionarios = await Funcionario.findByEmpresa(empresa_id);
    
    return res.status(200).json({
      funcionarios
    });
  } catch (error) {
    console.error('Erro ao listar funcionários:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao listar funcionários' 
    });
  }
};

// Buscar funcionário pelo ID
const buscarFuncionarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { empresa_id } = req.user;
    
    const funcionario = await Funcionario.findById(id, empresa_id);
    
    if (!funcionario) {
      return res.status(404).json({ 
        error: 'Funcionário não encontrado', 
        message: 'Funcionário não existe ou não pertence a esta empresa' 
      });
    }
    
    return res.status(200).json({
      funcionario
    });
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao buscar funcionário' 
    });
  }
};

// Sincronizar funcionários com a API SOC
const sincronizarFuncionarios = async (req, res) => {
  try {
    const { empresa_id, id: usuario_id } = req.user;
    
    // Buscar configurações da API
    const configAPI = await ConfigAPI.findByEmpresa(empresa_id);
    
    if (!configAPI || !configAPI.chave_funcionario || !configAPI.codigo_funcionario) {
      return res.status(400).json({ 
        error: 'Configuração inválida', 
        message: 'Configure os parâmetros da API de funcionários' 
      });
    }
    
    // Criar log de sincronização
    const syncLog = await SyncLog.create({
      tipo: 'funcionarios',
      empresa_id,
      status: 'em_andamento',
      detalhes: 'Iniciando sincronização de funcionários',
      usuario_id
    });
    
    // Parâmetros para a API
    const params = {
      empresa: configAPI.codigo_funcionario.trim(),
      codigo: configAPI.codigo_funcionario.trim(),
      chave: configAPI.chave_funcionario.trim(),
      tipoSaida: 'json',
      ativo: configAPI.flag_ativo ? 'Sim' : '',
      inativo: configAPI.flag_inativo ? 'Sim' : '',
      afastado: configAPI.flag_afastado ? 'Sim' : '',
      pendente: configAPI.flag_pendente ? 'Sim' : '',
      ferias: configAPI.flag_ferias ? 'Sim' : ''
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
      
      // Registrar empresa se ainda não existir
      let empresa = await Empresa.findById(empresa_id);
      
      if (!empresa) {
        // Criar empresa padrão para este usuário
        empresa = await Empresa.create({
          codigo: params.empresa,
          nome: responseData[0]?.NOMEEMPRESA || 'Empresa não identificada'
        });
      }
      
      // Processar funcionários
      let registrosAtualizados = 0;
      
      for (const func of responseData) {
        try {
          // Converter datas
          const dataNascimento = func.DATA_NASCIMENTO ? new Date(func.DATA_NASCIMENTO) : null;
          const dataAdmissao = func.DATA_ADMISSAO ? new Date(func.DATA_ADMISSAO) : null;
          const dataDemissao = func.DATA_DEMISSAO ? new Date(func.DATA_DEMISSAO) : null;
          
          await Funcionario.create({
            codigo: func.CODIGO,
            nome: func.NOME,
            empresa_id,
            codigoempresa: func.CODIGOEMPRESA,
            nomeempresa: func.NOMEEMPRESA,
            codigounidade: func.CODIGOUNIDADE,
            nomeunidade: func.NOMEUNIDADE,
            codigosetor: func.CODIGOSETOR,
            nomesetor: func.NOMESETOR,
            codigocargo: func.CODIGOCARGO,
            nomecargo: func.NOMECARGO,
            cbocargo: func.CBOCARGO,
            ccusto: func.CCUSTO,
            nomecentrocusto: func.NOMECENTROCUSTO,
            matriculafuncionario: func.MATRICULAFUNCIONARIO,
            cpf: func.CPF,
            rg: func.RG,
            ufrg: func.UFRG,
            orgaoemissorrg: func.ORGAOEMISSORRG,
            situacao: func.SITUACAO,
            sexo: func.SEXO,
            pis: func.PIS,
            ctps: func.CTPS,
            seriectps: func.SERIECTPS,
            estadocivil: func.ESTADOCIVIL,
            tipocontatacao: func.TIPOCONTATACAO,
            data_nascimento: dataNascimento,
            data_admissao: dataAdmissao,
            data_demissao: dataDemissao,
            endereco: func.ENDERECO,
            numero_endereco: func.NUMERO_ENDERECO,
            bairro: func.BAIRRO,
            cidade: func.CIDADE,
            uf: func.UF,
            cep: func.CEP,
            telefoneresidencial: func.TELEFONERESIDENCIAL,
            telefonecelular: func.TELEFONECELULAR,
            email: func.EMAIL,
            deficiente: func.DEFICIENTE,
            deficiencia: func.DEFICIENCIA,
            nm_mae_funcionario: func.NM_MAE_FUNCIONARIO,
            dataultalteracao: func.DATAULTALTERACAO ? new Date(func.DATAULTALTERACAO) : null,
            matricularh: func.MATRICULARH,
            cor: func.COR,
            escolaridade: func.ESCOLARIDADE,
            naturalidade: func.NATURALIDADE,
            ramal: func.RAMAL,
            regimerevezamento: func.REGIMEREVEZAMENTO,
            regimetrabalho: func.REGIMETRABALHO,
            telcomercial: func.TELCOMERCIAL,
            turnotrabalho: func.TURNOTRABALHO,
            rhunidade: func.RHUNIDADE,
            rhsetor: func.RHSETOR,
            rhcargo: func.RHCARGO,
            rhcentrocustounidade: func.RHCENTROCUSTOUNIDADE
          });
          
          registrosAtualizados++;
        } catch (err) {
          console.error(`Erro ao processar funcionário ${func.CODIGO}:`, err);
        }
      }
      
      // Atualizar log de sincronização
      await SyncLog.update(syncLog.id, {
        status: 'concluido',
        detalhes: `Sincronização concluída. Processados ${responseData.length} funcionários.`,
        registros_afetados: registrosAtualizados
      });
      
      // Retornar resposta com dados da sincronização
      return res.status(200).json({
        message: 'Sincronização de funcionários realizada com sucesso',
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
    console.error('Erro ao sincronizar funcionários:', error);
    return res.status(500).json({ 
      error: 'Erro no servidor', 
      message: 'Erro ao sincronizar funcionários' 
    });
  }
};

module.exports = {
  listarFuncionarios,
  buscarFuncionarioPorId,
  sincronizarFuncionarios
};
