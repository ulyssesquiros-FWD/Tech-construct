/**
 * Request Logger & Performance Tracking Middleware — Tech-Construct S.A.
 * Asigna un UUID único a cada solicitud (X-Request-Id), mide el tiempo de
 * respuesta en milisegundos (X-Response-Time) y emite trazas estructuradas.
 */

const crypto = require('crypto');

const requestLogger = (req, res, next) => {
  const startTime = process.hrtime();
  
  // Asignar o propagar el ID de solicitud
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  // Inyectar tiempo de respuesta antes de enviar los encabezados
  const originalEnd = res.end;
  res.end = function(...args) {
    if (!res.headersSent) {
      const diff = process.hrtime(startTime);
      const durationMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
      res.setHeader('X-Response-Time', `${durationMs}ms`);
    }
    return originalEnd.apply(this, args);
  };

  // Escuchar la culminación de la respuesta HTTP para el log estructurado
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    // Log estructurado (silenciado en pruebas unitarias para no saturar consola)
    if (process.env.NODE_ENV !== 'test') {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const userBadge = req.user ? `[User:${req.user.id}-${req.user.full_name}]` : '[Anon]';
      const statusColor = res.statusCode >= 500 ? '\x1b[31m' : res.statusCode >= 400 ? '\x1b[33m' : '\x1b[32m';
      const resetColor = '\x1b[0m';

      console.log(
        `[REQ:${requestId.substring(0, 8)}] ${req.method} ${req.originalUrl} ` +
        `${statusColor}${res.statusCode}${resetColor} - ${durationMs}ms - IP:${clientIp} ${userBadge}`
      );
    }
  });

  next();
};

module.exports = requestLogger;
