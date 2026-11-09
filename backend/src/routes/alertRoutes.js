const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/reorden', (req, res) => alertController.getReorderAlerts(req, res));
router.post('/reorden/evaluar', (req, res) => alertController.evaluateReorderAlerts(req, res));
router.post('/:id/revisar', (req, res) => alertController.reviewReorderAlert(req, res));
router.post('/duplicados/:id/revisar', (req, res) => alertController.reviewDuplicateAlert(req, res));

module.exports = router;
