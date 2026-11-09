const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Approval = sequelize.define('approvals', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  approval_level: {
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
    type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  decision_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Approval;

