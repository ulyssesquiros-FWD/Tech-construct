const { Material, Location, PurchaseOrder, InventoryMovement, ReorderAlert, DuplicatePurchaseAlert, SplitPurchaseAlert, Category, User, sequelize } = require('../models');
const inventoryService = require('../services/inventoryService');
const reorderService = require('../services/reorderService');

class DashboardController {
  // GET /api/dashboard/resumen
  async getSummary(req, res) {
    try {
      const [
        totalMaterials,
        totalLocations,
        totalPurchaseOrders,
        pendingApprovalsCount,
        openDuplicatesCount,
        openSplitCount,
        activeReorderAlertsCount,
        recentMovements
      ] = await Promise.all([
        Material.count({ where: { status: 'activo' } }),
        Location.count({ where: { status: 'activo' } }),
        PurchaseOrder.count(),
        PurchaseOrder.count({ where: { status: 'pendiente_aprobacion' } }),
        DuplicatePurchaseAlert.count({ where: { status: 'pendiente_revision' } }),
        SplitPurchaseAlert.count({ where: { status: 'pendiente_revision' } }),
        ReorderAlert.count({ where: { status: 'activa' } }),
        InventoryMovement.findAll({
          limit: 8,
          order: [['movement_date', 'DESC'], ['id', 'DESC']],
          include: [
            { model: Material, as: 'material', attributes: ['id', 'name', 'unit', 'internal_code'] },
            { model: Location, as: 'location', attributes: ['id', 'name', 'type'] },
            { model: User, as: 'user', attributes: ['id', 'full_name'] }
          ]
        })
      ]);

      // Calcular unidades totales y materiales bajo ROP mediante la vista o query del ledger
      const [stockRows] = await sequelize.query(`
        SELECT 
          m.id,
          m.name,
          m.reorder_point,
          COALESCE(SUM(
            CASE 
              WHEN im.movement_type IN ('entrada', 'ajuste_positivo') THEN im.quantity
              WHEN im.movement_type IN ('salida', 'ajuste_negativo') THEN -im.quantity
              ELSE 0
            END
          ), 0) AS current_stock
        FROM materials m
        LEFT JOIN inventory_movements im ON m.id = im.material_id
        WHERE m.status = 'activo'
        GROUP BY m.id, m.name, m.reorder_point;
      `);

      let totalUnitsInStock = 0;
      let materialsUnderRop = 0;
      let materialsNormal = 0;

      for (const row of stockRows) {
        const stock = parseFloat(row.current_stock);
        totalUnitsInStock += Math.max(0, stock);
        if (stock <= parseFloat(row.reorder_point)) {
          materialsUnderRop++;
        } else {
          materialsNormal++;
        }
      }

      return res.json({
        success: true,
        data: {
          kpis: {
            total_materials: totalMaterials,
            total_units_in_stock: totalUnitsInStock,
            total_locations: totalLocations,
            materials_under_rop: materialsUnderRop,
            materials_normal: materialsNormal,
            total_purchase_orders: totalPurchaseOrders,
            pending_approvals: pendingApprovalsCount,
            potential_duplicate_alerts: openDuplicatesCount,
            split_purchase_alerts: openSplitCount,
            total_pending_alerts: openDuplicatesCount + openSplitCount + activeReorderAlertsCount
          },
          recent_movements: recentMovements
        }
      });
    } catch (error) {
      console.error('Error en dashboard summary:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/dashboard/estadisticas
  async getStatistics(req, res) {
    try {
      // 1. Distribución de inventario por categoría
      const [categoryDistribution] = await sequelize.query(`
        SELECT 
          c.name AS category_name,
          c.code AS category_code,
          COUNT(DISTINCT m.id) AS material_count,
          COALESCE(SUM(
            CASE 
              WHEN im.movement_type IN ('entrada', 'ajuste_positivo') THEN im.quantity
              WHEN im.movement_type IN ('salida', 'ajuste_negativo') THEN -im.quantity
              ELSE 0
            END
          ), 0) AS total_units
        FROM categories c
        LEFT JOIN materials m ON c.id = m.category_id AND m.status = 'activo'
        LEFT JOIN inventory_movements im ON m.id = im.material_id
        WHERE c.parent_id IS NULL
        GROUP BY c.id, c.name, c.code
        ORDER BY total_units DESC;
      `);

      // 2. Materiales con mayor movimiento
      const [topMovements] = await sequelize.query(`
        SELECT 
          m.name AS material_name,
          m.internal_code,
          m.unit,
          COUNT(im.id) AS total_movement_count,
          SUM(im.quantity) AS total_volume_moved
        FROM materials m
        JOIN inventory_movements im ON m.id = im.material_id
        GROUP BY m.id, m.name, m.internal_code, m.unit
        ORDER BY total_volume_moved DESC
        LIMIT 6;
      `);

      // 3. Stock actual frente al punto de reorden (para gráfico de barras comparativo)
      const [stockVsRop] = await sequelize.query(`
        SELECT 
          m.name AS material_name,
          m.internal_code,
          m.reorder_point,
          m.safety_stock,
          COALESCE(SUM(
            CASE 
              WHEN im.movement_type IN ('entrada', 'ajuste_positivo') THEN im.quantity
              WHEN im.movement_type IN ('salida', 'ajuste_negativo') THEN -im.quantity
              ELSE 0
            END
          ), 0) AS current_stock
        FROM materials m
        LEFT JOIN inventory_movements im ON m.id = im.material_id
        WHERE m.status = 'activo'
        GROUP BY m.id, m.name, m.internal_code, m.reorder_point, m.safety_stock
        LIMIT 8;
      `);

      // 4. Evolución de entradas y salidas por fecha
      const [movementEvolution] = await sequelize.query(`
        SELECT 
          DATE(movement_date) AS date,
          COALESCE(SUM(CASE WHEN movement_type = 'entrada' THEN quantity ELSE 0 END), 0) AS entradas,
          COALESCE(SUM(CASE WHEN movement_type = 'salida' THEN quantity ELSE 0 END), 0) AS salidas,
          COALESCE(SUM(CASE WHEN movement_type = 'traslado' THEN quantity ELSE 0 END), 0) AS traslados
        FROM inventory_movements
        GROUP BY DATE(movement_date)
        ORDER BY DATE(movement_date) ASC
        LIMIT 14;
      `);

      return res.json({
        success: true,
        data: {
          category_distribution: categoryDistribution.map(c => ({
            name: c.category_name,
            code: c.category_code,
            material_count: parseInt(c.material_count),
            total_units: Math.max(0, parseFloat(c.total_units))
          })),
          top_movement_materials: topMovements.map(t => ({
            name: t.material_name,
            code: t.internal_code,
            unit: t.unit,
            count: parseInt(t.total_movement_count),
            volume: parseFloat(t.total_volume_moved)
          })),
          stock_vs_reorder: stockVsRop.map(s => ({
            name: s.material_name.length > 20 ? s.material_name.substring(0, 18) + '...' : s.material_name,
            fullName: s.material_name,
            code: s.internal_code,
            current_stock: parseFloat(s.current_stock),
            reorder_point: parseFloat(s.reorder_point),
            safety_stock: parseFloat(s.safety_stock)
          })),
          movement_evolution: movementEvolution.map(m => ({
            date: m.date,
            entradas: parseFloat(m.entradas),
            salidas: parseFloat(m.salidas),
            traslados: parseFloat(m.traslados)
          }))
        }
      });
    } catch (error) {
      console.error('Error en dashboard statistics:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DashboardController();

