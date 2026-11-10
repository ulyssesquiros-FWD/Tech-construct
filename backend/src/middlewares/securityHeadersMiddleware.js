/**
 * Security Headers Middleware — Tech-Construct S.A.
 * Protege la API REST inyectando cabeceras HTTP de seguridad (Hardening)
 * y ocultando metadatos que expongan la tecnología del servidor.
 */

const securityHeaders = (req, res, next) => {
  // Ocultar firma de Express
  res.removeHeader('X-Powered-By');

  // Prevenir que el navegador infiera el tipo MIME (MIME Sniffing)
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevenir ataques de Clickjacking limitando la renderización en iframes
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Activar filtro contra Cross-Site Scripting (XSS) en clientes compatibles
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Forzar conexiones seguras HTTPS mediante HSTS (1 año)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Controlar información enviada en cabecera Referer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restringir permisos de APIs del navegador no requeridas por la API REST
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

module.exports = securityHeaders;
