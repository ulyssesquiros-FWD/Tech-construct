const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryMovement = sequelize.define('inventory_movements', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  movement_number: {
    type: DataTypes.STRING(35),
    allowNull: false,
    unique: true
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movement_type: {
    type: DataTypes.ENUM('entrada', 'salida', 'traslado', 'ajuste_positivo', 'ajuste_negativo'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  unit_cost: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  balance_after: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  movement_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  source_document_type: {
    type: DataTypes.ENUM('orden_compra', 'traslado', 'requisicion', 'ajuste_inventario', 'demostracion_inicial'),
    allowNull: false
  },
  source_document_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  destination_location_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  transfer_group_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  purchase_order_detail_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = InventoryMovement;
