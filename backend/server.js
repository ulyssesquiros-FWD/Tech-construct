const app = require('./src/app');
const { sequelize } = require('./src/models');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log(' Conexión establecida con éxito a MySQL (gestion_inventarios).');

    app.listen(PORT, () => {
      console.log(` Servidor de Constructora Del Valle S.A. escuchando en el puerto ${PORT}`);
      console.log(` Endpoint API Base: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(' Error crítico iniciando el servidor:', error);
    process.exit(1);
  }
}

startServer();

