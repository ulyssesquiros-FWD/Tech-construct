/**
 * Centralized Error Handling Middleware — Tech-Construct S.A.
 * Captura y estandariza todas las excepciones de la aplicación,
 * mapeando errores de Sequelize, errores de sintaxis y excepciones de negocio.
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Error interno del servidor';
  let details = null;

  // Errores de Validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Error de validación en los datos enviados';
    details = err.errors.map(e => ({ field: e.path, message: e.message }));
  }

  // Errores de Clave Única Duplicada en MySQL / Sequelize
  else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Ya existe un registro con los datos únicos proporcionados';
    details = err.errors.map(e => ({ field: e.path, value: e.value }));
  }

  // Errores de Clave Foránea (Integridad Referencial)
  else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    errorCode = 'FOREIGN_KEY_VIOLATION';
    message = 'La entidad referenciada no existe o está vinculada a otros registros';
  }

  // Errores de Sintaxis JSON en el cuerpo de la petición
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'INVALID_JSON_BODY';
    message = 'El cuerpo de la solicitud no es un JSON válido';
  }

  // Errores de Límite de Tamaño de Petición
  else if (err.type === 'entity.too.large') {
    statusCode = 413;
    errorCode = 'PAYLOAD_TOO_LARGE';
    message = 'El tamaño de la petición excede el límite permitido';
  }

  // Log en consola para errores de servidor 500
  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR:${req.id || 'N/A'}] Falla no controlada:`, err);
  }

  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message,
    details: details || undefined,
    requestId: req.id || undefined,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
