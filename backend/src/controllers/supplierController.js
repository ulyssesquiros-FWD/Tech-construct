const { Supplier, PurchaseOrder } = require('../models');
const { Op } = require('sequelize');

class SupplierController {
  // GET /api/proveedores
  async getAll(req, res) {
    try {
      const { search, status } = req.query;
      const where = {};

      if (search) {
        where[Op.or] = [
          { commercial_name: { [Op.like]: `%${search}%` } },
          { legal_name: { [Op.like]: `%${search}%` } },
          { tax_id: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) where.status = status;

      const suppliers = await Supplier.findAll({
        where,
        order: [['commercial_name', 'ASC']]
      });

      return res.json({ success: true, count: suppliers.length, data: suppliers });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/proveedores/:id
  async getById(req, res) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByPk(id, {
        include: [{ model: PurchaseOrder, as: 'purchaseOrders' }]
      });
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
      }
      return res.json({ success: true, data: supplier });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/proveedores
  async create(req, res) {
    try {
      const { code, commercial_name, legal_name, tax_id, phone, email, address, contact_person } = req.body;
      if (!code || !commercial_name || !tax_id) {
        return res.status(400).json({ success: false, message: 'code, commercial_name y tax_id son obligatorios.' });
      }

      const existing = await Supplier.findOne({ where: { [Op.or]: [{ code }, { tax_id }] } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Ya existe un proveedor con ese código o cédula jurídica.' });
      }

      const supplier = await Supplier.create({
        code,
        commercial_name,
        legal_name: legal_name || commercial_name,
        tax_id,
        phone,
        email,
        address,
        contact_person,
        status: 'activo'
      });

      return res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // PUT /api/proveedores/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
      }
      await supplier.update(req.body);
      return res.json({ success: true, data: supplier });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/proveedores/:id (desactivación lógica)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findByPk(id);
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Proveedor no encontrado' });
      }
      await supplier.update({ status: 'inactivo' });
      return res.json({ success: true, message: 'Proveedor desactivado correctamente' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SupplierController();
