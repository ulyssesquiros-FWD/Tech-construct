const { PurchaseOrder, SplitPurchaseAlert, Supplier, sequelize } = require('../models');
const { Op } = require('sequelize');

class SplitPurchaseService {
  constructor() {
    this.timeWindowDays = parseInt(process.env.SPLIT_PURCHASE_TIME_WINDOW_DAYS) || 30;
    // Umbrales de la matriz de aprobación
    this.thresholdTier1 = 250000;
    this.thresholdTier2 = 2000000;
  }

  /**
   * Analiza órdenes emitidas dentro de la ventana de tiempo para detectar
   * agrupaciones que evadan los umbrales de aprobación por fraccionamiento.
   */
  async scanForSplitPurchases() {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - this.timeWindowDays);

    const orders = await PurchaseOrder.findAll({
      where: {
        status: { [Op.ne]: 'cancelada' }
      },
      include: [{ model: Supplier, as: 'supplier' }],
      order: [['order_date', 'ASC']]
    });

    // Agrupar órdenes por clave: proveedor + departamento + proyecto
    const groups = {};

    for (const po of orders) {
      const key = `${po.supplier_id}__${po.requesting_department || 'GEN'}__${po.project_name || 'GEN'}`;
      if (!groups[key]) {
        groups[key] = {
          supplier_id: po.supplier_id,
          requesting_department: po.requesting_department,
          project_name: po.project_name,
          orders: [],
          totalAmount: 0
        };
      }
      groups[key].orders.push(po);
      groups[key].totalAmount += parseFloat(po.total);
    }

    const alerts = [];

    for (const key of Object.keys(groups)) {
      const group = groups[key];
      // Si hay 2 o más órdenes en el grupo
      if (group.orders.length >= 2) {
        // Verificar si las órdenes individuales están por debajo de un umbral (ej. ₡250k o ₡2M)
        // pero la suma acumulada excede dicho umbral
        const allBelowTier2 = group.orders.every(o => parseFloat(o.total) <= this.thresholdTier2);
        const exceedsTier2 = group.totalAmount > this.thresholdTier2;

        const allBelowTier1 = group.orders.every(o => parseFloat(o.total) <= this.thresholdTier1);
        const exceedsTier1 = group.totalAmount > this.thresholdTier1;

        if (allBelowTier2 && exceedsTier2) {
          const poNumbers = group.orders.map(o => o.po_number);
          const reviewMsg = `Posible fraccionamiento detectado: ${group.orders.length} órdenes para el proveedor ID ${group.supplier_id} en el proyecto "${group.project_name}". Individualmente no superan ₡2 000 000, pero acumuladas suman ₡${group.totalAmount.toLocaleString('es-CR')} (supera el umbral de Gerencia Financiera).`;

          let alert = await SplitPurchaseAlert.findOne({
            where: {
              supplier_id: group.supplier_id,
              requesting_department: group.requesting_department,
              project_name: group.project_name
            }
          });

          if (!alert) {
            alert = await SplitPurchaseAlert.create({
              supplier_id: group.supplier_id,
              requesting_department: group.requesting_department,
              project_name: group.project_name,
              detected_orders: JSON.stringify(poNumbers),
              total_accumulated_amount: group.totalAmount,
              threshold_exceeded: this.thresholdTier2,
              alert_date: new Date(),
              status: 'pendiente_revision',
              review_notes: reviewMsg
            });
          }

          alerts.push(alert);
        } else if (allBelowTier1 && exceedsTier1) {
          const poNumbers = group.orders.map(o => o.po_number);
          const reviewMsg = `Posible fraccionamiento menor: ${group.orders.length} órdenes individuales bajo ₡250 000 que sumadas (₡${group.totalAmount.toLocaleString('es-CR')}) superan el umbral de aprobación directa de Jefatura.`;

          let alert = await SplitPurchaseAlert.findOne({
            where: {
              supplier_id: group.supplier_id,
              requesting_department: group.requesting_department,
              project_name: group.project_name
            }
          });

          if (!alert) {
            alert = await SplitPurchaseAlert.create({
              supplier_id: group.supplier_id,
              requesting_department: group.requesting_department,
              project_name: group.project_name,
              detected_orders: JSON.stringify(poNumbers),
              total_accumulated_amount: group.totalAmount,
              threshold_exceeded: this.thresholdTier1,
              alert_date: new Date(),
              status: 'pendiente_revision',
              review_notes: reviewMsg
            });
          }

          alerts.push(alert);
        }
      }
    }

    return alerts;
  }
}

module.exports = new SplitPurchaseService();

