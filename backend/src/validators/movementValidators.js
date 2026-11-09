const { body } = require('express-validator');
const validateResult = require('./validateResult');

const recordMovementValidation = [
  body('material_id')
    .isInt({ min: 1 })
    .withMessage('El ID de material es obligatorio y debe ser un número entero válido.'),
  body('location_id')
    .isInt({ min: 1 })
    .withMessage('El ID de ubicación origen es obligatorio y debe ser válido.'),
  body('movement_type')
    .isIn(['entrada', 'salida', 'traslado', 'ajuste_positivo', 'ajuste_negativo'])
    .withMessage('El tipo de movimiento debe ser entrada, salida, traslado, ajuste_positivo o ajuste_negativo.'),
  body('quantity')
    .isFloat({ min: 0.0001 })
    .withMessage('La cantidad debe ser un número estrictamente mayor a 0.'),
  body('destination_location_id')
    .if(body('movement_type').equals('traslado'))
    .notEmpty()
    .withMessage('La ubicación destino es obligatoria para movimientos de traslado.')
    .custom((value, { req }) => {
      if (parseInt(value) === parseInt(req.body.location_id)) {
        throw new Error('La ubicación destino no puede ser la misma que la ubicación origen.');
      }
      return true;
    }),
  validateResult
];

module.exports = {
  recordMovementValidation
};
