const { PurchaseOrder, PurchaseOrderDetail, Supplier, Location, User, Approval, Material, DuplicatePurchaseAlert, SplitPurchaseAlert, sequelize } = require('../models');
const approvalMatrixService = require('../services/approvalMatrixService');
const duplicateDetectionService = require('../services/duplicateDetectionService');
const splitPurchaseService = require('../services/splitPurchaseService');
const { Op } = require('sequelize');

class PurchaseOrderController {
  // GET /api/ordenes
  async getAll(req, res) {
    try {
      const { status, supplier_id, search } = req.query;
      const where = {};

      if (status) where.status = status;
      if (supplier_id) where.supplier_id = supplier_id;
      if (search) {
        where[Op.or] = [
          { po_number: { [Op.like]: `%${search}%` } },
          { requesting_department: { [Op.like]: `%${search}%` } },
          { project_name: { [Op.like]: `%${search}%` } }
        ];
      }

      const orders = await PurchaseOrder.findAll({
        where,
        include: [
          { model: Supplier, as: 'supplier', attributes: ['id', 'code', 'commercial_name', 'tax_id'] },
          { model: Location, as: 'location', attributes: ['id', 'code', 'name'] },
          { model: User, as: 'creator', attributes: ['id', 'full_name', 'department'] },
          {
            model: PurchaseOrderDetail,
            as: 'details',
            include: [{ model: Material, as: 'material', attributes: ['id', 'internal_code', 'name', 'unit'] }]
          },
          { model: Approval, as: 'approvals' }
        ],
        order: [['order_date', 'DESC'], ['id', 'DESC']]
      });

      return res.json({ success: true, count: orders.length, data: orders });
    } catch (error) {
      console.error('Error al obtener órdenes:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/ordenes/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const order = await PurchaseOrder.findByPk(id, {
        include: [
          { model: Supplier, as: 'supplier' },
          { model: Location, as: 'location' },
          { model: User, as: 'creator' },
          {
            model: PurchaseOrderDetail,
            as: 'details',
            include: [{ model: Material, as: 'material' }]
          },
          {
            model: Approval,
            as: 'approvals',
            include: [{ model: User, as: 'approver' }]
          }
        ]
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden de compra no encontrada' });
      }

      return res.json({ success: true, data: order });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/ordenes
  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const {
        supplier_id,
        location_id,
        requesting_department,
        project_name,
        order_date = new Date().toISOString().split('T')[0],
        expected_date,
        items, // [{ material_id, quantity, unit_price }]
        attached_quotations_count = 1,
        created_by = 1,
        notes
      } = req.body;

      if (!supplier_id || !requesting_department || !items || !items.length) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'supplier_id, requesting_department y al menos un ítem son obligatorios.'
        });
      }

      // 1. Calcular subtotal y total
      let subtotal = 0;
      for (const item of items) {
        const itemQty = parseFloat(item.quantity) || 0;
        const itemPrice = parseFloat(item.unit_price) || 0;
        subtotal += (itemQty * itemPrice);
      }
      const total = subtotal; // en este flujo no aplicamos impuesto adicional salvo que se especifique

      // 2. Determinar requerimientos según la matriz de aprobación (Ejercicio A1)
      const approvalReqs = approvalMatrixService.getApprovalRequirements(total);

      // 3. Generar número correlativo de OC
      const count = await PurchaseOrder.count({ transaction: t });
      const poNumber = `OC-${(1000 + count + 1)}`;

      // 4. Crear Orden de Compra
      const po = await PurchaseOrder.create({
        po_number: poNumber,
        supplier_id: parseInt(supplier_id),
        location_id: location_id ? parseInt(location_id) : null,
        requesting_department,
        project_name: project_name || 'General',
        order_date,
        expected_date: expected_date || null,
        subtotal,
        tax: 0.00,
        total,
        required_approval_level: approvalReqs.levelName,
        required_quotations: approvalReqs.requiredQuotations,
        attached_quotations_count: parseInt(attached_quotations_count) || 1,
        status: 'pendiente_aprobacion',
        created_by: parseInt(created_by),
        notes
      }, { transaction: t });

      // 5. Crear detalles
      for (const item of items) {
        const qty = parseFloat(item.quantity);
        const price = parseFloat(item.unit_price);
        await PurchaseOrderDetail.create({
          purchase_order_id: po.id,
          material_id: parseInt(item.material_id),
          quantity: qty,
          unit_price: price,
          subtotal: qty * price
        }, { transaction: t });
      }

      // 6. Generar registro de Aprobación inicial
      await approvalMatrixService.createInitialApproval(po, created_by, t);

      await t.commit();

      // 7. Ejecutar en segundo plano análisis de posibles duplicados y fraccionamiento
      duplicateDetectionService.scanForDuplicates().catch(err => console.error('Error scan duplicados:', err));
      splitPurchaseService.scanForSplitPurchases().catch(err => console.error('Error scan fraccionamiento:', err));

      return res.status(201).json({
        success: true,
        message: 'Orden de compra creada exitosamente y remitida a aprobación.',
        data: po,
        approval_requirements: approvalReqs
      });
    } catch (error) {
      await t.rollback();
      console.error('Error al crear orden de compra:', error);
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/ordenes/posibles-duplicados
  async getPotentialDuplicates(req, res) {
    try {
      const alerts = await DuplicatePurchaseAlert.findAll({
        include: [
          {
            model: PurchaseOrder,
            as: 'order1',
            include: [{ model: Supplier, as: 'supplier' }]
          },
          {
            model: PurchaseOrder,
            as: 'order2',
            include: [{ model: Supplier, as: 'supplier' }]
          },
          { model: Material, as: 'material' },
          { model: Supplier, as: 'supplier' },
          { model: User, as: 'reviewer', attributes: ['id', 'full_name'] }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/ordenes/escanear-duplicados
  async scanDuplicates(req, res) {
    try {
      const detected = await duplicateDetectionService.scanForDuplicates();
      return res.json({
        success: true,
        message: `Escaneo completado. Se procesaron ${detected.length} posibles coincidencias de compra duplicada.`,
        data: detected
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/ordenes/fraccionamiento
  async getSplitPurchaseAlerts(req, res) {
    try {
      const alerts = await SplitPurchaseAlert.findAll({
        include: [{ model: Supplier, as: 'supplier' }],
        order: [['created_at', 'DESC']]
      });

      return res.json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/ordenes/escanear-fraccionamiento
  async scanSplitPurchases(req, res) {
    try {
      const alerts = await splitPurchaseService.scanForSplitPurchases();
      return res.json({
        success: true,
        message: `Escaneo de fraccionamiento completado. Detectadas: ${alerts.length} alertas.`,
        data: alerts
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PurchaseOrderController();
