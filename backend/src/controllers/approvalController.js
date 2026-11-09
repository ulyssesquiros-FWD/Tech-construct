const { Approval, PurchaseOrder, Supplier, User, PurchaseOrderDetail, Material } = require('../models');
const approvalMatrixService = require('../services/approvalMatrixService');

class ApprovalController {
  // GET /api/aprobaciones/pendientes
  async getPending(req, res) {
    try {
      const approvals = await Approval.findAll({
        where: { status: 'pendiente' },
        include: [
          {
            model: PurchaseOrder,
            as: 'purchaseOrder',
            include: [
              { model: Supplier, as: 'supplier', attributes: ['id', 'commercial_name', 'tax_id'] },
              { model: User, as: 'creator', attributes: ['id', 'full_name', 'department'] },
              {
                model: PurchaseOrderDetail,
                as: 'details',
                include: [{ model: Material, as: 'material', attributes: ['name', 'unit'] }]
              }
            ]
          },
          { model: User, as: 'approver', attributes: ['id', 'full_name'] }
        ],
        order: [['created_at', 'ASC']]
      });

      return res.json({ success: true, count: approvals.length, data: approvals });
    } catch (error) {
      console.error('Error al listar aprobaciones pendientes:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/aprobaciones/:id/aprobar
  async approve(req, res) {
    try {
      const { id } = req.params;
      const { user_id = 4, comments, attached_quotations_count } = req.body;

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario aprobador no encontrado' });
      }

      const result = await approvalMatrixService.processApproval(id, user, {
        approved: true,
        comments,
        attachedQuotationsCount: attached_quotations_count
      });

      return res.json({
        success: true,
        message: 'Orden aprobada exitosamente según la matriz de autorización.',
        data: result
      });
    } catch (error) {
      console.error('Error al aprobar orden:', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST /api/aprobaciones/:id/rechazar
  async reject(req, res) {
    try {
      const { id } = req.params;
      const { user_id = 4, comments } = req.body;

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario aprobador no encontrado' });
      }

      const result = await approvalMatrixService.processApproval(id, user, {
        approved: false,
        comments
      });

      return res.json({
        success: true,
        message: 'Orden rechazada correctamente.',
        data: result
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ApprovalController();
