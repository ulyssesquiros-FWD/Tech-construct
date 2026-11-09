const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('suppliers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  commercial_name: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  legal_name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  tax_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(40),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: true,
    validate: { isEmail: true }
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contact_person: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    allowNull: false,
    defaultValue: 'activo'
  }
});

module.exports = Supplier;
