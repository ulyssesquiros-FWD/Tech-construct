const { PurchaseOrder, PurchaseOrderDetail, DuplicatePurchaseAlert, Supplier, Material, User } = require('../models');
const { Op } = require('sequelize');

class DuplicateDetectionService {
  constructor() {
    this.timeWindowDays = parseInt(process.env.DUPLICATE_TIME_WINDOW_DAYS) || 3;
    this.qtyTolerancePct = parseFloat(process.env.DUPLICATE_QTY_TOLERANCE_PCT) || 10.0;
  }

  /**
   * Escanea las órdenes de compra para detectar posibles duplicados
   * según las reglas de negocio configurables.
   */
  async scanForDuplicates() {
    const orders = await PurchaseOrder.findAll({
      where: {
        status: { [Op.ne]: 'cancelada' }
      },
      include: [
        { model: PurchaseOrderDetail, as: 'details' },
        { model: Supplier, as: 'supplier' }
      ],
      order: [['order_date', 'ASC']]
    });

    const detected = [];

    // Comparación cruzada de pares de órdenes (O(N^2) sobre órdenes no canceladas)
    for (let i = 0; i < orders.length; i++) {
      const orderA = orders[i];

      for (let j = i + 1; j < orders.length; j++) {
        const orderB = orders[j];

        // 1. Mismo proveedor
        if (orderA.supplier_id !== orderB.supplier_id) continue;

        // 2. Separación máxima de días
        const dateA = new Date(orderA.order_date);
        const dateB = new Date(orderB.order_date);
        const diffDays = Math.abs(Math.round((dateB - dateA) / (1000 * 60 * 60 * 24)));

        if (diffDays > this.timeWindowDays) continue;

        // 3. Revisión de detalles de artículos coincidentes
        for (const detailA of orderA.details) {
          for (const detailB of orderB.details) {
            if (detailA.material_id === detailB.material_id) {
              const qtyA = parseFloat(detailA.quantity);
              const qtyB = parseFloat(detailB.quantity);

              const maxQty = Math.max(qtyA, qtyB);
              const diffPct = maxQty > 0 ? (Math.abs(qtyA - qtyB) / maxQty) * 100 : 0;

              if (diffPct <= this.qtyTolerancePct) {
                // Determinar nivel de riesgo
                let riskLevel = 'medio';
                if (diffDays === 0 && diffPct === 0) {
                  riskLevel = 'critico';
                } else if (diffDays <= 1 || diffPct <= 5) {
                  riskLevel = 'alto';
                }

                const material = await Material.findByPk(detailA.material_id);
                const matchReason = diffDays === 0 && diffPct === 0
                  ? `Misma fecha (${orderA.order_date}), mismo proveedor (${orderA.supplier?.commercial_name}), mismo artículo (${material?.name}) y cantidad idéntica (${qtyA} ${material?.unit}). Exposición económica: ₡${(qtyA * parseFloat(detailA.unit_price)).toLocaleString('es-CR')}.`
                  : `Coincidencia sospechosa: mismo proveedor, mismo artículo, diferencia de cantidad de ${diffPct.toFixed(1)}% y separación de ${diffDays} días entre ${orderA.po_number} y ${orderB.po_number}.`;

                // Verificar si ya existe esta alerta registrada
                let existingAlert = await DuplicatePurchaseAlert.findOne({
                  where: {
                    [Op.or]: [
                      { purchase_order_id_1: orderA.id, purchase_order_id_2: orderB.id, material_id: detailA.material_id },
                      { purchase_order_id_1: orderB.id, purchase_order_id_2: orderA.id, material_id: detailA.material_id }
                    ]
                  }
                });

                if (!existingAlert) {
                  existingAlert = await DuplicatePurchaseAlert.create({
                    purchase_order_id_1: orderA.id,
                    purchase_order_id_2: orderB.id,
                    supplier_id: orderA.supplier_id,
                    material_id: detailA.material_id,
                    qty_1: qtyA,
                    qty_2: qtyB,
                    date_1: orderA.order_date,
                    date_2: orderB.order_date,
                    risk_level: riskLevel,
                    match_reason: matchReason,
                    status: 'pendiente_revision'
                  });
                }

                detected.push(existingAlert);
              }
            }
          }
        }
      }
    }

    return detected;
  }

  /**
   * Permite a un usuario de compras auditar y marcar una coincidencia
   */
  async reviewAlert(alertId, reviewerUserId, { status, notes }) {
    const alert = await DuplicatePurchaseAlert.findByPk(alertId);
    if (!alert) throw new Error(`Alerta de duplicado ID ${alertId} no encontrada.`);

    const validStatuses = ['pendiente_revision', 'confirmada', 'no_duplicada'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}.`);
    }

    await alert.update({
      status,
      reviewed_by: reviewerUserId,
      review_notes: notes,
      reviewed_at: new Date()
    });

    return alert;
  }
}

module.exports = new DuplicateDetectionService();
