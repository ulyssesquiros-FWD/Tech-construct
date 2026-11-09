const fs = require('fs');
const path = require('path');
const { sequelize } = require('../models');

async function runSeeds() {
  try {
    console.log('Iniciando carga de datos semilla en MySQL gestion_inventarios...');
    const seedPath = path.join(__dirname, '../../../database/seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');

    // Dividir las sentencias por punto y coma ignorando líneas de comentarios
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toLowerCase().startsWith('use '));

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    for (const statement of statements) {
      if (statement.trim()) {
        await sequelize.query(statement);
      }
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('SUCCESS: Datos semilla cargados con éxito en la base de datos.');
    process.exit(0);
  } catch (error) {
    console.error('ERROR cargando datos semilla:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeeds();
}

module.exports = runSeeds;
