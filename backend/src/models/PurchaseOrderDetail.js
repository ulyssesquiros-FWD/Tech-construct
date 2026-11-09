const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PurchaseOrderDetail = sequelize.define('purchase_order_details', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  received_quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  }
});

module.exports = PurchaseOrderDetail;

