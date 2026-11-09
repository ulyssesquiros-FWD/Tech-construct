const { ReorderAlert, Material, Location, DuplicatePurchaseAlert, User } = require('../models');
const reorderService = require('../services/reorderService');
const duplicateDetectionService = require('../services/duplicateDetectionService');

class AlertController {
  // GET /api/alertas/reorden
  async getReorderAlerts(req, res) {
    try {
      const { status = 'activa' } = req.query;
      const where = {};
      if (status && status !== 'todas') {
        where.status = status;
      }

      const alerts = await ReorderAlert.findAll({
        where,
        include: [
          { model: Material, as: 'material' },
          { model: Location, as: 'location' }
        ],
        order: [['alert_date', 'DESC']]
      });

      return res.json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/alertas/reorden/evaluar
  async evaluateReorderAlerts(req, res) {
    try {
      const results = await reorderService.evaluateAllMaterials();
      const underRop = results.filter(r => r.is_under_reorder_point);
      return res.json({
        success: true,
        message: `Evaluación de stock completada. ${underRop.length} materiales bajo punto de reorden.`,
        data: results
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/alertas/:id/revisar (para alertas de reorden)
  async reviewReorderAlert(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const alert = await ReorderAlert.findByPk(id);
      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alerta no encontrada' });
      }

      await alert.update({
        status: status || 'en_revision',
        notes: notes ? `${alert.notes} [REVISIÓN: ${notes}]` : alert.notes
      });

      return res.json({ success: true, message: 'Alerta actualizada', data: alert });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/alertas/duplicados/:id/revisar
  async reviewDuplicateAlert(req, res) {
    try {
      const { id } = req.params;
      const { status, notes, reviewed_by = 1 } = req.body;

      const updated = await duplicateDetectionService.reviewAlert(id, reviewed_by, {
        status,
        notes
      });

      return res.json({
        success: true,
        message: 'Revisión de duplicado registrada exitosamente.',
        data: updated
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AlertController();
