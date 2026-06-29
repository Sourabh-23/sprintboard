const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on('finish', () => {
    logger.info('HTTP request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
    });
  });

  next();
};

module.exports = requestLogger;
