const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SplitPurchaseAlert = sequelize.define('split_purchase_alerts', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  requesting_department: {
    type: DataTypes.STRING(80),
    allowNull: false
  },
  project_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  detected_orders: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  total_accumulated_amount: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  threshold_exceeded: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false
  },
  alert_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('pendiente_revision', 'justificada', 'irregularidad_confirmada'),
    allowNull: false,
    defaultValue: 'pendiente_revision'
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = SplitPurchaseAlert;
