const validator = require('validator');

const sanitizeString = (value) => {
  return validator.stripLow(value.trim()).replace(/[<>]/g, '');
};

const sanitizeValue = (value) => {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeValue(item)])
    );
  }
  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

module.exports = sanitizeInput;
