const { InventoryMovement, Material, Location, User, PurchaseOrderDetail, PurchaseOrder } = require('../models');
const inventoryService = require('../services/inventoryService');
const { Op } = require('sequelize');

class MovementController {
  // GET /api/movimientos
  async getAll(req, res) {
    try {
      const { material_id, location_id, movement_type, limit = 100 } = req.query;
      const where = {};

      if (material_id) where.material_id = material_id;
      if (location_id) where.location_id = location_id;
      if (movement_type) where.movement_type = movement_type;

      const movements = await InventoryMovement.findAll({
        where,
        include: [
          { model: Material, as: 'material', attributes: ['id', 'internal_code', 'name', 'unit'] },
          { model: Location, as: 'location', attributes: ['id', 'code', 'name', 'type'] },
          { model: Location, as: 'destinationLocation', attributes: ['id', 'code', 'name', 'type'] },
          { model: User, as: 'user', attributes: ['id', 'full_name', 'department'] }
        ],
        order: [['movement_date', 'DESC'], ['id', 'DESC']],
        limit: parseInt(limit)
      });

      return res.json({ success: true, count: movements.length, data: movements });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/movimientos/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const movement = await InventoryMovement.findByPk(id, {
        include: [
          { model: Material, as: 'material' },
          { model: Location, as: 'location' },
          { model: Location, as: 'destinationLocation' },
          { model: User, as: 'user' },
          {
            model: PurchaseOrderDetail,
            as: 'purchaseOrderDetail',
            include: [{ model: PurchaseOrder, as: 'purchaseOrder' }]
          }
        ]
      });

      if (!movement) {
        return res.status(404).json({ success: false, message: 'Movimiento no encontrado' });
      }

      return res.json({ success: true, data: movement });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/movimientos
  async create(req, res) {
    try {
      const {
        material_id,
        location_id,
        movement_type,
        quantity,
        unit_cost,
        user_id = 1, // Default al usuario de sesión o admin
        source_document_type,
        source_document_id,
        destination_location_id,
        purchase_order_detail_id,
        notes
      } = req.body;

      if (!material_id || !location_id || !movement_type || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'material_id, location_id, movement_type y quantity son requeridos.'
        });
      }

      const result = await inventoryService.recordMovement({
        material_id: parseInt(material_id),
        location_id: parseInt(location_id),
        movement_type,
        quantity: parseFloat(quantity),
        unit_cost: unit_cost ? parseFloat(unit_cost) : undefined,
        user_id: parseInt(user_id),
        source_document_type: source_document_type || 'ajuste_inventario',
        source_document_id,
        destination_location_id: destination_location_id ? parseInt(destination_location_id) : undefined,
        purchase_order_detail_id: purchase_order_detail_id ? parseInt(purchase_order_detail_id) : undefined,
        notes
      });

      return res.status(201).json({
        success: true,
        message: 'Movimiento registrado con éxito en el libro mayor de inventario.',
        data: result
      });
    } catch (error) {
      console.error('Error registrando movimiento:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new MovementController();

