// src/utils/validators.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateUFOPEmail = (email) => {
  return validateEmail(email) && email.endsWith('@ufop.edu.br');
};

export const validatePassword = (password) => {
  return password.length >= 6;
};