const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { createPurchaseOrderValidation } = require('../validators/purchaseOrderValidators');
const { authenticateUser } = require('../middlewares/authMiddleware');

router.get('/', (req, res) => purchaseOrderController.getAll(req, res));
router.post('/', authenticateUser, createPurchaseOrderValidation, (req, res) => purchaseOrderController.create(req, res));
router.get('/posibles-duplicados', (req, res) => purchaseOrderController.getPotentialDuplicates(req, res));
router.post('/escanear-duplicados', (req, res) => purchaseOrderController.scanDuplicates(req, res));
router.get('/fraccionamiento', (req, res) => purchaseOrderController.getSplitPurchaseAlerts(req, res));
router.post('/escanear-fraccionamiento', (req, res) => purchaseOrderController.scanSplitPurchases(req, res));
router.get('/:id', (req, res) => purchaseOrderController.getById(req, res));

module.exports = router;
