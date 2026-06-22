const validator = require('validator');

const isValidEmail = (email) => {
  return typeof email === 'string' && validator.isEmail(email);
};

const isStrongEnoughPassword = (password) => {
  return typeof password === 'string' && password.length >= 8;
};

module.exports = { isValidEmail, isStrongEnoughPassword };
