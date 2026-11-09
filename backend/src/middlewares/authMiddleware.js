const { User, Role } = require('../models');

const authenticateUser = async (req, res, next) => {
  try {
    // Si viene encabezado de usuario o token de simulación
    const userId = req.headers['x-user-id'] || 1; // Default a Carlos Monge (Admin) si no se especifica
    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || user.status !== 'activo') {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado o usuario inactivo en el sistema.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ success: false, message: 'Error interno de autenticación' });
  }
};

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const roleName = req.user.role?.name;
    if (allowedRoles.length > 0 && !allowedRoles.includes(roleName) && roleName !== 'Administrador del Sistema') {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')} (Rol actual: ${roleName}).`
      });
    }

    next();
  };
};

module.exports = {
  authenticateUser,
  requireRole
};
