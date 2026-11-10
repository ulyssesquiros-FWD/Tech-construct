/**
 * Middlewares Centralizados — Tech-Construct S.A.
 * Exporta el catálogo completo de middlewares empresariales de la solución.
 */

const { authenticateUser, requireRole } = require('./authMiddleware');
const securityHeaders = require('./securityHeadersMiddleware');
const requestLogger = require('./requestLoggerMiddleware');
const rateLimiter = require('./rateLimiterMiddleware');
const sanitizeInput = require('./sanitizerMiddleware');
const auditLogMiddleware = require('./auditLogMiddleware');
const errorHandler = require('./errorHandlerMiddleware');

module.exports = {
  authenticateUser,
  requireRole,
  securityHeaders,
  requestLogger,
  rateLimiter,
  sanitizeInput,
  auditLogMiddleware,
  errorHandler
};
