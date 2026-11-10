/**
 * Automated Audit Log Middleware — Tech-Construct S.A.
 * Registra automáticamente eventos mutables (POST, PUT, DELETE) en la tabla
 * `audit_logs` de MySQL para garantizar la trazabilidad forense inmutable.
 */

const { AuditLog } = require('../models');

const auditLogMiddleware = (req, res, next) => {
  // Solo auditar métodos de modificación de datos
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }

  // Interceptar la respuesta
  const originalJson = res.json;
  let responseData = null;

  res.json = function(data) {
    responseData = data;
    return originalJson.apply(this, arguments);
  };

  res.on('finish', () => {
    // Solo auditar si la respuesta fue exitosa (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      setImmediate(async () => {
        try {
          const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
          const userId = req.user ? req.user.id : (parseInt(req.headers['x-user-id'], 10) || 1);

          // Extraer entidad base de la URL (ej. /api/movimientos -> movimientos)
          const urlSegments = req.originalUrl.split('?')[0].split('/').filter(Boolean);
          const entity = urlSegments[1] || 'sistema';

          // Determinar acción
          let actionType = 'CREAR';
          if (req.method === 'PUT' || req.method === 'PATCH') actionType = 'ACTUALIZAR';
          if (req.method === 'DELETE') actionType = 'ELIMINAR';
          if (req.originalUrl.includes('/approve') || req.originalUrl.includes('/aprobaciones')) actionType = 'APROBAR';
          if (req.originalUrl.includes('/reject')) actionType = 'RECHAZAR';

          const action = `${actionType}_${entity.toUpperCase()}`;

          // Extraer ID de la entidad
          let entityId = null;
          if (req.params && req.params.id) {
            entityId = parseInt(req.params.id, 10) || null;
          } else if (responseData && (responseData.id || responseData.data?.id)) {
            entityId = responseData.id || responseData.data?.id;
          }

          // Filtrar datos sensibles antes de persistir
          const sanitizedBody = { ...req.body };
          delete sanitizedBody.password;
          delete sanitizedBody.password_hash;

          await AuditLog.create({
            user_id: userId,
            action,
            entity,
            entity_id: entityId,
            old_values: null,
            new_values: Object.keys(sanitizedBody).length > 0 ? sanitizedBody : null,
            ip_address: clientIp.toString().substring(0, 45)
          });
        } catch (auditErr) {
          // El fallo de auditoría no interrumpe el flujo principal, pero se registra en logs
          if (process.env.NODE_ENV !== 'test') {
            console.error('Aviso: Error registrando bitácora de auditoría:', auditErr.message);
          }
        }
      });
    }
  });

  next();
};

module.exports = auditLogMiddleware;
