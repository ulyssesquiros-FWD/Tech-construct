const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrder = sequelize.define('purchase_orders', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  po_number: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  requesting_department: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  project_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  expected_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  tax: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  total: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  required_approval_level: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  required_quotations: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  attached_quotations_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM(
      'borrador',
      'pendiente_aprobacion',
      'aprobada',
      'emitida',
      'parcialmente_recibida',
      'recibida',
      'cancelada'
    ),
    allowNull: false,
    defaultValue: 'borrador'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = PurchaseOrder;
