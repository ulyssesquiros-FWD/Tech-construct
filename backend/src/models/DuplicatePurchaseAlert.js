const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DuplicatePurchaseAlert = sequelize.define('duplicate_purchase_alerts', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  purchase_order_id_1: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  purchase_order_id_2: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  qty_1: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  qty_2: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  date_1: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  date_2: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  risk_level: {
    type: DataTypes.ENUM('medio', 'alto', 'critico'),
    allowNull: false,
    defaultValue: 'alto'
  },
  match_reason: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendiente_revision', 'confirmada', 'no_duplicada'),
    allowNull: false,
    defaultValue: 'pendiente_revision'
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = DuplicatePurchaseAlert;

