/**
 * Input Sanitization Middleware — Tech-Construct S.A.
 * Recorre recursivamente los cuerpos de petición, query strings y parámetros
 * para recortar espacios sobrantes y neutralizar vectores de ataque comunes (XSS, Null Bytes).
 */

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value
      // Eliminar null bytes
      .replace(/\0/g, '')
      // Neutralizar etiquetas script sospechosas
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript\s*:/gi, '')
      // Recortar espacios al inicio y final
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    const sanitizedObj = {};
    for (const key of Object.keys(value)) {
      sanitizedObj[key] = sanitizeValue(value[key]);
    }
    return sanitizedObj;
  }

  return value;
}

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeValue(req.params);
  }
  next();
};

module.exports = sanitizeInput;
