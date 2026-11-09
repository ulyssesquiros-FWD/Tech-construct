const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReorderAlert = sequelize.define('reorder_alerts', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  material_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  current_stock: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  reorder_point: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  safety_stock: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  alert_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('activa', 'en_revision', 'resuelta'),
    allowNull: false,
    defaultValue: 'activa'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = ReorderAlert;

