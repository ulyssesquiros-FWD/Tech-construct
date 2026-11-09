const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.get('/', (req, res) => locationController.getAll(req, res));
router.post('/', (req, res) => locationController.create(req, res));
router.get('/:id', (req, res) => locationController.getById(req, res));
router.get('/:id/inventario', (req, res) => locationController.getInventoryByLocation(req, res));

module.exports = router;
