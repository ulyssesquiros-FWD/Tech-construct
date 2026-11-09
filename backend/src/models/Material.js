const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Material = sequelize.define('materials', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  internal_code: {
    type: DataTypes.STRING(40),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(25),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  min_stock: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  max_stock: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  avg_daily_demand: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  max_daily_demand: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  lead_time_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  safety_stock: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  reorder_point: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  standard_price: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    allowNull: false,
    defaultValue: 'activo'
  }
}, {
  hooks: {
    beforeValidate: (material) => {
      const avg = parseFloat(material.avg_daily_demand) || 0;
      const max = parseFloat(material.max_daily_demand) || avg;
      const lead = parseInt(material.lead_time_days) || 1;
      
      // Stock de seguridad = (Demanda máxima diaria - Demanda promedio diaria) * Tiempo de entrega
      const safetyStock = Math.max(0, (max - avg) * lead);
      
      // Punto de reorden = (Demanda promedio diaria * Tiempo de entrega) + Stock de seguridad
      const reorderPoint = (avg * lead) + safetyStock;
      
      material.safety_stock = parseFloat(safetyStock.toFixed(2));
      material.reorder_point = parseFloat(reorderPoint.toFixed(2));
    }
  }
});

module.exports = Material;
