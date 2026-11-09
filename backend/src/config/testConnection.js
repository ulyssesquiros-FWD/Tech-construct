const { sequelize, Material, Location, PurchaseOrder, InventoryMovement } = require('../models');

async function testConn() {
  try {
    await sequelize.authenticate();
    console.log('SUCCESS: Conexión a MySQL con Sequelize exitosa!');
    
    const matCount = await Material.count();
    const locCount = await Location.count();
    const poCount = await PurchaseOrder.count();
    const movCount = await InventoryMovement.count();
    
    console.log(`Modelos verificados:`);
    console.log(`- Materiales: ${matCount}`);
    console.log(`- Ubicaciones: ${locCount}`);
    console.log(`- Órdenes de Compra: ${poCount}`);
    console.log(`- Movimientos de Inventario: ${movCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('ERROR conectando a MySQL:', error);
    process.exit(1);
  }
}

testConn();
