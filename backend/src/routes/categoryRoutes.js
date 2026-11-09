const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', (req, res) => categoryController.getAll(req, res));
router.post('/', (req, res) => categoryController.create(req, res));

module.exports = router;
