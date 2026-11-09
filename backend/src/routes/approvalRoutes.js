const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');

router.get('/pendientes', (req, res) => approvalController.getPending(req, res));
router.post('/:id/aprobar', (req, res) => approvalController.approve(req, res));
router.post('/:id/rechazar', (req, res) => approvalController.reject(req, res));

module.exports = router;
