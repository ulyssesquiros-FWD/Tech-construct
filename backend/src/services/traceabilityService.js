const { InventoryMovement, Material, Location, User, PurchaseOrderDetail, PurchaseOrder, Supplier } = require('../models');

class TraceabilityService {
  /**
   * Obtiene la trazabilidad integral e histórica de un material
   */
  async getMaterialTraceability(materialId) {
    const material = await Material.findByPk(materialId);
    if (!material) throw new Error(`Material con ID ${materialId} no encontrado.`);

    const movements = await InventoryMovement.findAll({
      where: { material_id: materialId },
      include: [
        { model: Location, as: 'location', attributes: ['id', 'code', 'name', 'type'] },
        { model: Location, as: 'destinationLocation', attributes: ['id', 'code', 'name', 'type'] },
        { model: User, as: 'user', attributes: ['id', 'full_name', 'department'] },
        {
          model: PurchaseOrderDetail,
          as: 'purchaseOrderDetail',
          include: [{
            model: PurchaseOrder,
            as: 'purchaseOrder',
            include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'commercial_name', 'tax_id'] }]
          }]
        }
      ],
      order: [['movement_date', 'DESC'], ['id', 'DESC']]
    });

    // Estadísticas acumuladas
    let totalEntradas = 0;
    let totalSalidas = 0;
    let totalAjustesPos = 0;
    let totalAjustesNeg = 0;
    let totalTraslados = 0;

    const formattedMovements = movements.map(mov => {
      const qty = parseFloat(mov.quantity);
      if (mov.movement_type === 'entrada') totalEntradas += qty;
      else if (mov.movement_type === 'salida') totalSalidas += qty;
      else if (mov.movement_type === 'ajuste_positivo') totalAjustesPos += qty;
      else if (mov.movement_type === 'ajuste_negativo') totalAjustesNeg += qty;
      else if (mov.movement_type === 'traslado') totalTraslados += qty;

      const relatedPO = mov.purchaseOrderDetail?.purchaseOrder;

      return {
        id: mov.id,
        movement_number: mov.movement_number,
        movement_date: mov.movement_date,
        movement_type: mov.movement_type,
        quantity: qty,
        unit: material.unit,
        unit_cost: parseFloat(mov.unit_cost),
        balance_after: parseFloat(mov.balance_after),
        location: mov.location ? {
          id: mov.location.id,
          code: mov.location.code,
          name: mov.location.name,
          type: mov.location.type
        } : null,
        destination_location: mov.destinationLocation ? {
          id: mov.destinationLocation.id,
          code: mov.destinationLocation.code,
          name: mov.destinationLocation.name,
          type: mov.destinationLocation.type
        } : null,
        user: mov.user ? {
          id: mov.user.id,
          name: mov.user.full_name,
          department: mov.user.department
        } : null,
        source_document_type: mov.source_document_type,
        source_document_id: mov.source_document_id,
        transfer_group_id: mov.transfer_group_id,
        related_purchase_order: relatedPO ? {
          id: relatedPO.id,
          po_number: relatedPO.po_number,
          order_date: relatedPO.order_date,
          supplier: relatedPO.supplier ? relatedPO.supplier.commercial_name : null,
          project: relatedPO.project_name
        } : null,
        notes: mov.notes
      };
    });

    const netStock = (totalEntradas + totalAjustesPos) - (totalSalidas + totalAjustesNeg);

    return {
      material: {
        id: material.id,
        code: material.internal_code,
        name: material.name,
        unit: material.unit,
        reorder_point: parseFloat(material.reorder_point),
        safety_stock: parseFloat(material.safety_stock)
      },
      summary: {
        total_entradas: totalEntradas,
        total_salidas: totalSalidas,
        total_traslados: totalTraslados,
        total_ajustes_positivos: totalAjustesPos,
        total_ajustes_negativos: totalAjustesNeg,
        current_calculated_stock: netStock,
        total_movimientos: formattedMovements.length
      },
      timeline: formattedMovements
    };
  }
}

module.exports = new TraceabilityService();
