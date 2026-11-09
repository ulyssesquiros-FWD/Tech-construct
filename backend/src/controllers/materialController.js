const { Material, Category } = require('../models');
const inventoryService = require('../services/inventoryService');
const traceabilityService = require('../services/traceabilityService');
const reorderService = require('../services/reorderService');
const { Op } = require('sequelize');

class MaterialController {
  // GET /api/materiales
  async getAll(req, res) {
    try {
      const { search, category_id, status } = req.query;
      const where = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { internal_code: { [Op.like]: `%${search}%` } }
        ];
      }
      if (category_id) where.category_id = category_id;
      if (status) where.status = status;

      const materials = await Material.findAll({
        where,
        include: [
          { model: Category, as: 'category', attributes: ['id', 'code', 'name'] },
          { model: Category, as: 'subcategory', attributes: ['id', 'code', 'name'] }
        ],
        order: [['id', 'ASC']]
      });

      // Enriquecer cada material con su stock actual calculado del ledger
      const materialsWithStock = await Promise.all(materials.map(async (m) => {
        const currentStock = await inventoryService.getCurrentStock(m.id);
        const rPoint = parseFloat(m.reorder_point);
        const isUnderRop = currentStock <= rPoint;
        const avgDemand = parseFloat(m.avg_daily_demand) || 1;
        const coverageDays = avgDemand > 0 ? parseFloat((currentStock / avgDemand).toFixed(2)) : 0;

        return {
          ...m.toJSON(),
          current_stock: currentStock,
          is_under_reorder_point: isUnderRop,
          stock_status: isUnderRop ? 'REPONER' : 'NORMAL',
          coverage_days: coverageDays
        };
      }));

      return res.json({ success: true, count: materialsWithStock.length, data: materialsWithStock });
    } catch (error) {
      console.error('Error al listar materiales:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/materiales/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const material = await Material.findByPk(id, {
        include: [
          { model: Category, as: 'category', attributes: ['id', 'code', 'name'] },
          { model: Category, as: 'subcategory', attributes: ['id', 'code', 'name'] }
        ]
      });

      if (!material) {
        return res.status(404).json({ success: false, message: 'Material no encontrado' });
      }

      const currentStock = await inventoryService.getCurrentStock(material.id);
      const stockByLocation = await inventoryService.getStockByLocation(material.id);

      return res.json({
        success: true,
        data: {
          ...material.toJSON(),
          current_stock: currentStock,
          stock_by_location: stockByLocation
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/materiales
  async create(req, res) {
    try {
      const {
        internal_code,
        name,
        category_id,
        subcategory_id,
        unit,
        description,
        min_stock,
        max_stock,
        avg_daily_demand,
        max_daily_demand,
        lead_time_days,
        standard_price
      } = req.body;

      if (!internal_code || !name || !category_id || !unit) {
        return res.status(400).json({
          success: false,
          message: 'Los campos internal_code, name, category_id y unit son obligatorios.'
        });
      }

      const existing = await Material.findOne({ where: { internal_code } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `El código interno '${internal_code}' ya existe en el sistema.`
        });
      }

      // El modelo calcula automáticamente safety_stock y reorder_point en su hook beforeValidate
      const newMaterial = await Material.create({
        internal_code,
        name,
        category_id,
        subcategory_id: subcategory_id || null,
        unit,
        description,
        min_stock: min_stock || 0,
        max_stock: max_stock || 0,
        avg_daily_demand: avg_daily_demand || 0,
        max_daily_demand: max_daily_demand || avg_daily_demand || 0,
        lead_time_days: lead_time_days || 1,
        standard_price: standard_price || 0,
        status: 'activo'
      });

      return res.status(201).json({
        success: true,
        message: 'Material creado exitosamente.',
        data: newMaterial
      });
    } catch (error) {
      console.error('Error al crear material:', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // PUT /api/materiales/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const material = await Material.findByPk(id);
      if (!material) {
        return res.status(404).json({ success: false, message: 'Material no encontrado' });
      }

      await material.update(req.body);

      // Reevaluar alerta de reorden
      await reorderService.evaluateMaterialAlert(material.id);

      return res.json({
        success: true,
        message: 'Material actualizado correctamente',
        data: material
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/materiales/:id (Desactivación lógica)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const material = await Material.findByPk(id);
      if (!material) {
        return res.status(404).json({ success: false, message: 'Material no encontrado' });
      }

      await material.update({ status: 'inactivo' });

      return res.json({
        success: true,
        message: `Material '${material.name}' desactivado correctamente.`
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/materiales/:id/stock
  async getStock(req, res) {
    try {
      const { id } = req.params;
      const totalStock = await inventoryService.getCurrentStock(id);
      const byLocation = await inventoryService.getStockByLocation(id);

      return res.json({
        success: true,
        material_id: parseInt(id),
        total_stock: totalStock,
        by_location: byLocation
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/materiales/:id/trazabilidad
  async getTraceability(req, res) {
    try {
      const { id } = req.params;
      const traceData = await traceabilityService.getMaterialTraceability(id);
      return res.json({ success: true, data: traceData });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MaterialController();
