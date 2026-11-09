const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/resumen', (req, res) => dashboardController.getSummary(req, res));
router.get('/estadisticas', (req, res) => dashboardController.getStatistics(req, res));

module.exports = router;
