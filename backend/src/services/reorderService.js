const { Material, Location, ReorderAlert } = require('../models');
const inventoryService = require('./inventoryService');
const { Op } = require('sequelize');

class ReorderService {
  /**
   * Cálculo matemático del Stock de Seguridad
   * SS = (Demanda máxima diaria - Demanda promedio diaria) * Tiempo de entrega
   */
  calculateSafetyStock(avgDemand, maxDemand, leadTime) {
    const avg = parseFloat(avgDemand) || 0;
    const max = parseFloat(maxDemand) || avg;
    const lead = parseInt(leadTime) || 1;
    return Math.max(0, (max - avg) * lead);
  }

  /**
   * Cálculo matemático del Punto de Reorden
   * ROP = (Demanda promedio diaria * Tiempo de entrega) + Stock de seguridad
   */
  calculateReorderPoint(avgDemand, maxDemand, leadTime) {
    const avg = parseFloat(avgDemand) || 0;
    const lead = parseInt(leadTime) || 1;
    const safetyStock = this.calculateSafetyStock(avg, maxDemand, lead);
    return (avg * lead) + safetyStock;
  }

  /**
   * Evalúa el estado de stock de un material respecto a su punto de reorden
   * y genera o resuelve alertas automáticamente sin duplicados.
   */
  async evaluateMaterialAlert(materialId, locationId = null) {
    const material = await Material.findByPk(materialId);
    if (!material || material.status !== 'activo') return null;

    // Calcular el stock total o por ubicación
    const currentStock = await inventoryService.getCurrentStock(materialId, locationId);
    const reorderPoint = parseFloat(material.reorder_point);
    const safetyStock = parseFloat(material.safety_stock);

    const whereClause = {
      material_id: materialId,
      status: { [Op.in]: ['activa', 'en_revision'] }
    };
    if (locationId) {
      whereClause.location_id = locationId;
    }

    const existingAlert = await ReorderAlert.findOne({ where: whereClause });

    // Condición de alerta: stock_actual <= punto_de_reorden
    if (currentStock <= reorderPoint) {
      const avgDemand = parseFloat(material.avg_daily_demand) || 1;
      const coverageDays = avgDemand > 0 ? (currentStock / avgDemand).toFixed(2) : 'N/A';

      if (!existingAlert) {
        // Crear nueva alerta
        const newAlert = await ReorderAlert.create({
          material_id: materialId,
          location_id: locationId,
          current_stock: currentStock,
          reorder_point: reorderPoint,
          safety_stock: safetyStock,
          alert_date: new Date(),
          status: 'activa',
          notes: `Alerta generada automáticamente. Stock actual (${currentStock} ${material.unit}) menor o igual al Punto de Reorden (${reorderPoint}). Cobertura estimada: ${coverageDays} días.`
        });
        return { alertCreated: true, alert: newAlert };
      } else {
        // Actualizar datos del stock actual en la alerta existente sin duplicar
        await existingAlert.update({
          current_stock: currentStock,
          notes: `Alerta actualizada. Stock actual: ${currentStock} ${material.unit}. Punto de reorden: ${reorderPoint}. Cobertura estimada: ${coverageDays} días.`
        });
        return { alertUpdated: true, alert: existingAlert };
      }
    } else {
      // Si el stock ya superó el punto de reorden y había alerta activa, marcar como resuelta
      if (existingAlert) {
        await existingAlert.update({
          status: 'resuelta',
          notes: `${existingAlert.notes} -> Resuelta automáticamente: stock reabastecido a ${currentStock} ${material.unit}.`
        });
        return { alertResolved: true, alert: existingAlert };
      }
    }

    return { normal: true, currentStock, reorderPoint };
  }

  /**
   * Evalúa todos los materiales activos en el sistema y retorna el estado global
   */
  async evaluateAllMaterials() {
    const materials = await Material.findAll({ where: { status: 'activo' } });
    const results = [];

    for (const mat of materials) {
      const stock = await inventoryService.getCurrentStock(mat.id);
      const evalRes = await this.evaluateMaterialAlert(mat.id);
      
      const avgDemand = parseFloat(mat.avg_daily_demand) || 1;
      const coverageDays = avgDemand > 0 ? parseFloat((stock / avgDemand).toFixed(2)) : 0;

      results.push({
        material_id: mat.id,
        code: mat.internal_code,
        name: mat.name,
        unit: mat.unit,
        current_stock: stock,
        safety_stock: parseFloat(mat.safety_stock),
        reorder_point: parseFloat(mat.reorder_point),
        coverage_days: coverageDays,
        is_under_reorder_point: stock <= parseFloat(mat.reorder_point),
        status: stock <= parseFloat(mat.reorder_point) ? 'REPONER' : 'NORMAL'
      });
    }

    // Ordenar con prioridad los de menor cobertura (urgencia de reposición)
    results.sort((a, b) => {
      if (a.is_under_reorder_point && !b.is_under_reorder_point) return -1;
      if (!a.is_under_reorder_point && b.is_under_reorder_point) return 1;
      return a.coverage_days - b.coverage_days;
    });

    return results;
  }
}

module.exports = new ReorderService();
