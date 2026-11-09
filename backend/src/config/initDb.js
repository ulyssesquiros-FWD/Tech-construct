const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { sequelize } = require('../models');

async function initDb() {
  try {
    console.log('Iniciando sincronización completa de Base de Datos MySQL...');

    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

    // Verificar si mysql CLI está disponible o ejecutar por conexión directa
    const mysqlPaths = [
      'C:\\Program Files\\MySQL\\MySQL Server 9.6\\bin\\mysql.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 9.3\\bin\\mysql.exe',
      'mysql'
    ];

    let mysqlBin = null;
    for (const p of mysqlPaths) {
      if (p === 'mysql') {
        try {
          execSync('mysql --version', { stdio: 'ignore' });
          mysqlBin = 'mysql';
          break;
        } catch (e) {}
      } else if (fs.existsSync(p)) {
        mysqlBin = `"${p}"`;
        break;
      }
    }

    if (mysqlBin) {
      console.log(`Utilizando cliente MySQL CLI: ${mysqlBin}`);
      const user = process.env.DB_USER || 'root';
      const pass = process.env.DB_PASSWORD ? `-p${process.env.DB_PASSWORD}` : '';
      const db = process.env.DB_NAME || 'gestion_inventarios';

      execSync(`${mysqlBin} -u ${user} ${pass} --default-character-set=utf8mb4 ${db} < "${schemaPath}"`, { stdio: 'inherit', shell: true });
      execSync(`${mysqlBin} -u ${user} ${pass} --default-character-set=utf8mb4 ${db} < "${seedPath}"`, { stdio: 'inherit', shell: true });
      console.log('SUCCESS: Esquema y datos semilla ejecutados exitosamente con MySQL CLI.');
    } else {
      // Método de respaldo por Sequelize
      console.log('Ejecutando sentencias directamente mediante Sequelize...');
      const runSqlFile = async (filePath) => {
        const raw = fs.readFileSync(filePath, 'utf8');
        // Eliminar comentarios de bloque y de línea
        const clean = raw
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/--.*$/gm, '');

        const statements = clean
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use ') && !s.toLowerCase().startsWith('create database'));

        for (const st of statements) {
          if (st) await sequelize.query(st);
        }
      };

      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
      await runSqlFile(schemaPath);
      await runSqlFile(seedPath);
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
      console.log('SUCCESS: Esquema y datos semilla ejecutados exitosamente con Sequelize.');
    }

    process.exit(0);
  } catch (error) {
    console.error('ERROR inicializando la base de datos:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initDb();
}

module.exports = initDb;
