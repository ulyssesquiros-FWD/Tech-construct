const { Location, Material, InventoryMovement, sequelize } = require('../models');

class LocationController {
  // GET /api/ubicaciones
  async getAll(req, res) {
    try {
      const locations = await Location.findAll({
        order: [['type', 'DESC'], ['name', 'ASC']]
      });

      // Obtener resumen de existencias por ubicación
      const summaryQuery = `
        SELECT 
          l.id AS location_id,
          COUNT(DISTINCT im.material_id) AS distinct_materials,
          COALESCE(SUM(
            CASE 
              WHEN im.movement_type IN ('entrada', 'ajuste_positivo') THEN im.quantity
              WHEN im.movement_type IN ('salida', 'ajuste_negativo') THEN -im.quantity
              ELSE 0
            END
          ), 0) AS total_units
        FROM locations l
        LEFT JOIN inventory_movements im ON l.id = im.location_id
        WHERE l.status = 'activo'
        GROUP BY l.id;
      `;

      const [summaryResults] = await sequelize.query(summaryQuery);
      const summaryMap = {};
      summaryResults.forEach(r => {
        summaryMap[r.location_id] = {
          distinct_materials: parseInt(r.distinct_materials),
          total_units: parseFloat(r.total_units)
        };
      });

      const enriched = locations.map(l => ({
        ...l.toJSON(),
        stats: summaryMap[l.id] || { distinct_materials: 0, total_units: 0 }
      }));

      return res.json({ success: true, count: enriched.length, data: enriched });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/ubicaciones/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const location = await Location.findByPk(id);
      if (!location) {
        return res.status(404).json({ success: false, message: 'Ubicación no encontrada' });
      }
      return res.json({ success: true, data: location });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/ubicaciones/:id/inventario
  async getInventoryByLocation(req, res) {
    try {
      const { id } = req.params;
      const location = await Location.findByPk(id);
      if (!location) {
        return res.status(404).json({ success: false, message: 'Ubicación no encontrada' });
      }

      const sqlQuery = `
        SELECT 
          m.id AS material_id,
          m.internal_code,
          m.name AS material_name,
          m.unit,
          m.reorder_point,
          m.safety_stock,
          m.standard_price,
          COALESCE(SUM(
            CASE 
              WHEN im.movement_type IN ('entrada', 'ajuste_positivo') THEN im.quantity
              WHEN im.movement_type IN ('salida', 'ajuste_negativo') THEN -im.quantity
              ELSE 0
            END
          ), 0) AS stock_actual,
          (COALESCE(SUM(
            CASE 
              WHEN im.movement_type IN ('entrada', 'ajuste_positivo') THEN im.quantity
              WHEN im.movement_type IN ('salida', 'ajuste_negativo') THEN -im.quantity
              ELSE 0
            END
          ), 0) * m.standard_price) AS valor_total_estimado
        FROM materials m
        LEFT JOIN inventory_movements im 
          ON m.id = im.material_id AND im.location_id = :locationId
        WHERE m.status = 'activo'
        GROUP BY m.id, m.internal_code, m.name, m.unit, m.reorder_point, m.safety_stock, m.standard_price
        HAVING stock_actual > 0
        ORDER BY m.name ASC;
      `;

      const [items] = await sequelize.query(sqlQuery, {
        replacements: { locationId: id }
      });

      return res.json({
        success: true,
        location: {
          id: location.id,
          name: location.name,
          code: location.code,
          type: location.type
        },
        count: items.length,
        items: items.map(i => ({
          ...i,
          stock_actual: parseFloat(i.stock_actual),
          valor_total_estimado: parseFloat(i.valor_total_estimado)
        }))
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/ubicaciones
  async create(req, res) {
    try {
      const { code, name, type, address } = req.body;
      if (!code || !name || !type) {
        return res.status(400).json({ success: false, message: 'code, name y type son requeridos.' });
      }

      const newLoc = await Location.create({ code, name, type, address, status: 'activo' });
      return res.status(201).json({ success: true, data: newLoc });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new LocationController();

