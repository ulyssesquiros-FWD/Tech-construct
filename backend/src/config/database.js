const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbName = process.env.DB_NAME || 'gestion_inventarios';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '1234';
const dbDialect = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  logging: process.env.NODE_ENV === 'test' ? false : false,
  timezone: '-06:00', // Costa Rica Timezone
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

module.exports = sequelize;
