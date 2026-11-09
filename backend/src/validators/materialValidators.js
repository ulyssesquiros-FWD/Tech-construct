const { body } = require('express-validator');
const validateResult = require('./validateResult');

const createMaterialValidation = [
  body('internal_code')
    .trim()
    .notEmpty()
    .withMessage('El código interno es obligatorio.')
    .isLength({ min: 3, max: 40 })
    .withMessage('El código debe tener entre 3 y 40 caracteres.'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre del material es obligatorio.')
    .isLength({ min: 3, max: 150 })
    .withMessage('El nombre debe tener entre 3 y 150 caracteres.'),
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('La unidad de medida es obligatoria.'),
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Debe seleccionar una categoría válida.'),
  body('avg_daily_demand')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La demanda promedio diaria debe ser mayor o igual a 0.'),
  body('max_daily_demand')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La demanda máxima diaria debe ser mayor o igual a 0.'),
  body('lead_time_days')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El tiempo de entrega debe ser de al menos 1 día.'),
  validateResult
];

module.exports = {
  createMaterialValidation
};
