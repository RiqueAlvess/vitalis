// Formatar data para DD/MM/YYYY
export const formatDate = (date) => {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '-';
  }
};

// Formatar número como moeda (R$)
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatar número como percentual
export const formatPercent = (value) => {
  return `${value.toFixed(2).replace('.', ',')}%`;
};

// Formatar texto com primeira letra maiúscula
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
