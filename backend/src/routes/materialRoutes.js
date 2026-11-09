const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { createMaterialValidation } = require('../validators/materialValidators');
const { authenticateUser, requireRole } = require('../middlewares/authMiddleware');

router.get('/', (req, res) => materialController.getAll(req, res));
router.post('/', authenticateUser, createMaterialValidation, (req, res) => materialController.create(req, res));
router.get('/:id', (req, res) => materialController.getById(req, res));
router.put('/:id', authenticateUser, (req, res) => materialController.update(req, res));
router.delete('/:id', authenticateUser, requireRole(['Administrador del Sistema', 'Jefatura de Compras']), (req, res) => materialController.delete(req, res));
router.get('/:id/stock', (req, res) => materialController.getStock(req, res));
router.get('/:id/trazabilidad', (req, res) => materialController.getTraceability(req, res));

module.exports = router;
