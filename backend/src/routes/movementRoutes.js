const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');

router.get('/', (req, res) => movementController.getAll(req, res));
router.post('/', (req, res) => movementController.create(req, res));
router.get('/:id', (req, res) => movementController.getById(req, res));

module.exports = router;
