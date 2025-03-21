const axios = require('axios');

/**
 * Função para chamar a API SOC
 * @param {Object} params - Parâmetros da requisição
 * @returns {Promise<Object>} - Resposta da API
 */
const callSocAPI = async (params) => {
  try {
    const url = 'https://ws1.soc.com.br/WebSoc/exportadados?parametro=';
    const response = await axios.get(`${url}${JSON.stringify(params)}`);
    
    // Decodificar resposta
    const responseData = JSON.parse(response.data);
    
    return responseData;
  } catch (error) {
    console.error('Erro ao chamar API SOC:', error);
    throw new Error(`Erro ao chamar API SOC: ${error.message}`);
  }
};

/**
 * Formatar data para dd/mm/aaaa
 * @param {Date|string} data - Data para formatar
 * @returns {string} - Data formatada
 */
const formatarData = (data) => {
  const d = new Date(data);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * Calcular diferença em dias entre duas datas
 * @param {Date|string} dataInicio - Data inicial
 * @param {Date|string} dataFim - Data final
 * @returns {number} - Diferença em dias
 */
const calcularDiferencaDias = (dataInicio, dataFim) => {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  return Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));
};

module.exports = {
  callSocAPI,
  formatarData,
  calcularDiferencaDias
};
