const { body } = require('express-validator');
const validateResult = require('./validateResult');

const createPurchaseOrderValidation = [
  body('supplier_id')
    .isInt({ min: 1 })
    .withMessage('Debe seleccionar un proveedor válido.'),
  body('requesting_department')
    .trim()
    .notEmpty()
    .withMessage('El área solicitante es obligatoria.'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un artículo en la orden de compra.'),
  body('items.*.material_id')
    .isInt({ min: 1 })
    .withMessage('Cada ítem debe tener un ID de material válido.'),
  body('items.*.quantity')
    .isFloat({ min: 0.0001 })
    .withMessage('La cantidad solicitada de cada ítem debe ser mayor a 0.'),
  body('items.*.unit_price')
    .isFloat({ min: 0 })
    .withMessage('El precio unitario no puede ser negativo.'),
  validateResult
];

module.exports = {
  createPurchaseOrderValidation
};
