/**
 * Rate Limiter Middleware (Anti-DoS / Brute Force) — Tech-Construct S.A.
 * Limita la tasa de peticiones concurrentes por dirección IP para proteger
 * los recursos del servidor y la base de datos MySQL de abusos o ataques DoS.
 */

const ipRequestsMap = new Map();

// Limpieza periódica del mapa de memoria cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestsMap.entries()) {
    if (now > data.resetTime) {
      ipRequestsMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Generador de middleware de limitación de tasa
 * @param {Object} options Opciones de configuración
 * @param {number} options.windowMs Ventana de tiempo en milisegundos (por defecto 1 minuto)
 * @param {number} options.maxRequests Límite máximo de solicitudes permitidas en la ventana
 */
const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // 1 minuto
  const maxRequests = options.maxRequests || 250; // 250 peticiones por minuto

  return (req, res, next) => {
    // Omitir en entorno de pruebas para permitir la ejecución continua de Jest
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let clientData = ipRequestsMap.get(clientIp);

    if (!clientData || now > clientData.resetTime) {
      clientData = {
        count: 1,
        resetTime: now + windowMs
      };
      ipRequestsMap.set(clientIp, clientData);
    } else {
      clientData.count++;
    }

    const remaining = Math.max(0, maxRequests - clientData.count);
    const resetSeconds = Math.ceil((clientData.resetTime - now) / 1000);

    // Cabeceras estándar IETF de limitación de tasa
    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (clientData.count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        success: false,
        error: 'TOO_MANY_REQUESTS',
        message: 'Demasiadas solicitudes emitidas desde esta IP. Por favor intente más tarde.',
        retryAfterSeconds: resetSeconds
      });
    }

    next();
  };
};

module.exports = rateLimiter;
