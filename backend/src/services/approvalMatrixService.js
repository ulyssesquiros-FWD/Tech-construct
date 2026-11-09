const { Approval, PurchaseOrder, User, Role } = require('../models');

class ApprovalMatrixService {
  /**
   * Determina los requerimientos de aprobación según el monto total en colones (₡)
   * según la Matriz de Aprobación del Ejercicio A1
   */
  getApprovalRequirements(amount) {
    const total = parseFloat(amount) || 0;

    if (total <= 250000) {
      return {
        levelCode: 'JEFATURA_SOLICITANTE',
        levelName: 'Jefatura del área solicitante',
        requiredQuotations: 1,
        requiresCommittee: false,
        description: 'Compras de hasta ₡250 000: Aprobación directa por jefatura del área solicitante con 1 cotización formal.'
      };
    } else if (total <= 2000000) {
      return {
        levelCode: 'JEFATURA_COMPRAS',
        levelName: 'Jefatura de Compras',
        requiredQuotations: 2,
        requiresCommittee: false,
        description: 'Compras de ₡250 001 a ₡2 000 000: Aprobación por Jefatura de Compras requiriendo al menos 2 cotizaciones comparativas.'
      };
    } else if (total <= 10000000) {
      return {
        levelCode: 'GERENCIA_FINANCIERA',
        levelName: 'Gerencia Financiera',
        requiredQuotations: 3,
        requiresCommittee: false,
        description: 'Compras de ₡2 000 001 a ₡10 000 000: Aprobación por Gerencia Financiera requiriendo cuadro comparativo con al menos 3 cotizaciones.'
      };
    } else {
      return {
        levelCode: 'GERENCIA_GENERAL',
        levelName: 'Gerencia General',
        requiredQuotations: 3,
        requiresCommittee: true,
        description: 'Compras superiores a ₡10 000 000: Aprobación por Gerencia General requiriendo al menos 3 cotizaciones y dictamen de Comité de Compras.'
      };
    }
  }

  /**
   * Genera el registro inicial de aprobación pendiente para una orden de compra
   */
  async createInitialApproval(purchaseOrder, userId, transaction = null) {
    const reqs = this.getApprovalRequirements(purchaseOrder.total);

    const approval = await Approval.create({
      purchase_order_id: purchaseOrder.id,
      user_id: userId,
      approval_level: reqs.levelName,
      required_quotations: reqs.requiredQuotations,
      attached_quotations_count: purchaseOrder.attached_quotations_count || 1,
      status: 'pendiente',
      comments: `Revisión requerida por ${reqs.levelName} (${reqs.requiredQuotations} cotizaciones mínimas). ${reqs.requiresCommittee ? 'Requiere sesión de comité.' : ''}`
    }, { transaction });

    return approval;
  }

  /**
   * Valida y procesa la aprobación de una orden de compra
   */
  async processApproval(approvalId, approverUser, { approved, comments = '', attachedQuotationsCount = null }) {
    const approval = await Approval.findByPk(approvalId, {
      include: [{ model: PurchaseOrder, as: 'purchaseOrder' }]
    });

    if (!approval) {
      throw new Error(`Registro de aprobación ID ${approvalId} no encontrado.`);
    }

    if (approval.status !== 'pendiente') {
      throw new Error(`Esta aprobación ya fue procesada previamente con estado: ${approval.status}.`);
    }

    const po = approval.purchaseOrder;
    if (!po) {
      throw new Error('Orden de compra asociada no encontrada.');
    }

    // Validar cantidad de cotizaciones adjuntas
    const quotations = attachedQuotationsCount !== null 
      ? parseInt(attachedQuotationsCount) 
      : (approval.attached_quotations_count || po.attached_quotations_count || 1);

    if (approved && quotations < approval.required_quotations) {
      throw new Error(
        `No se puede aprobar la orden. Requiere un mínimo de ${approval.required_quotations} cotizaciones según la matriz de aprobación (adjuntas: ${quotations}).`
      );
    }

    const decisionDate = new Date();
    const newStatus = approved ? 'aprobada' : 'rechazada';

    await approval.update({
      status: newStatus,
      user_id: approverUser.id,
      attached_quotations_count: quotations,
      comments: comments || (approved ? 'Aprobación concedida conforme a la matriz' : 'Rechazada por la autoridad competente'),
      decision_date: decisionDate
    });

    // Actualizar estado de la Orden de Compra
    if (approved) {
      await po.update({
        status: 'aprobada',
        attached_quotations_count: quotations
      });
    } else {
      await po.update({
        status: 'cancelada',
        notes: po.notes ? `${po.notes} [RECHAZADA: ${comments}]` : `Rechazada en aprobación: ${comments}`
      });
    }

    return {
      success: true,
      approval_status: newStatus,
      po_number: po.po_number,
      po_status: po.status
    };
  }
}

module.exports = new ApprovalMatrixService();
