import api from '../services/api';

// Definir token no cabeçalho de autorização
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Remover token do cabeçalho
export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

// Validar email corporativo
export const isBusinessEmail = (email) => {
  const freeEmailDomains = [
    'gmail.com', 'hotmail.com', 'outlook.com', 
    'yahoo.com', 'icloud.com', 'aol.com', 
    'live.com', 'mail.com', 'protonmail.com',
    'gmx.com', 'zoho.com', 'yandex.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? !freeEmailDomains.includes(domain) : false;
};

// Validar formato de senha
export const isValidPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};
