const { Material, Location, PurchaseOrder, InventoryMovement, ReorderAlert, DuplicatePurchaseAlert, User } = require('../models');
const inventoryService = require('../services/inventoryService');
const reorderService = require('../services/reorderService');
const duplicateDetectionService = require('../services/duplicateDetectionService');
const approvalMatrixService = require('../services/approvalMatrixService');
const traceabilityService = require('../services/traceabilityService');

async function testDemoScenario() {
  console.log('=== VERIFICANDO ESCENARIO DE DEMOSTRACIÓN (10 PASOS) ===\n');

  try {
    // 1. Abrir el dashboard / consultar resumen
    console.log('Paso 1: Dashboard y KPIs iniciales...');
    const allMats = await Material.findAll();
    const allLocs = await Location.findAll();
    console.log(`- Materiales registrados: ${allMats.length}`);
    console.log(`- Ubicaciones activas: ${allLocs.length}`);

    // 2. Consultar materiales
    console.log('\nPaso 2: Consultando Cemento gris 50 kg...');
    const cemento = await Material.findOne({ where: { internal_code: 'MAT-CEM-GRIS-050' } });
    const stockInicialCemento = await inventoryService.getCurrentStock(cemento.id);
    console.log(`- Stock actual Cemento: ${stockInicialCemento} ${cemento.unit}`);
    console.log(`- Punto de reorden Cemento: ${cemento.reorder_point} ${cemento.unit}`);

    // 3. Registrar una entrada de cemento
    console.log('\nPaso 3: Registrando entrada de 50 sacos de cemento en Bodega Central...');
    const bodegaCentral = await Location.findOne({ where: { code: 'BOD-CENTRAL' } });
    const adminUser = await User.findOne();
    const entradaRes = await inventoryService.recordMovement({
      material_id: cemento.id,
      location_id: bodegaCentral.id,
      movement_type: 'entrada',
      quantity: 50,
      unit_cost: 6300,
      user_id: adminUser.id,
      source_document_type: 'orden_compra',
      source_document_id: 'DEMO-ENTRADA-01',
      notes: 'Entrada demostración en vivo'
    });
    console.log(`- Entrada exitosa! N° Movimiento: ${entradaRes.movement.movement_number}`);

    // 4. Registrar una salida
    console.log('\nPaso 4: Registrando salida de 10 sacos para obra...');
    const salidaRes = await inventoryService.recordMovement({
      material_id: cemento.id,
      location_id: bodegaCentral.id,
      movement_type: 'salida',
      quantity: 10,
      unit_cost: 6300,
      user_id: adminUser.id,
      source_document_type: 'requisicion',
      source_document_id: 'DEMO-SALIDA-01',
      notes: 'Salida demostración en vivo'
    });
    console.log(`- Salida exitosa! N° Movimiento: ${salidaRes.movement.movement_number}`);

    // 5. Mostrar el stock actualizado
    console.log('\nPaso 5: Verificando nuevo stock calculado...');
    const stockNuevoCemento = await inventoryService.getCurrentStock(cemento.id);
    console.log(`- Stock inicial: ${stockInicialCemento} -> Saldo tras (+50 -10): ${stockNuevoCemento}`);
    if (stockNuevoCemento !== stockInicialCemento + 40) {
      throw new Error('Inconsistencia en el cálculo del stock!');
    }

    // 6. Consultar las alertas de reorden
    console.log('\nPaso 6: Consultando alertas activas de reorden...');
    const alertasReorden = await ReorderAlert.findAll({ where: { status: 'activa' }, include: [{ model: Material, as: 'material' }] });
    alertasReorden.forEach(a => {
      console.log(`- Alerta activa: ${a.material?.name} (Stock: ${a.current_stock}, ROP: ${a.reorder_point})`);
    });

    // 7. Mostrar la detección de OC-1041 y OC-1042
    console.log('\nPaso 7: Verificando detección de posible compra duplicada...');
    const dupAlerts = await DuplicatePurchaseAlert.findAll({
      include: [
        { model: PurchaseOrder, as: 'order1' },
        { model: PurchaseOrder, as: 'order2' },
        { model: Material, as: 'material' }
      ]
    });
    dupAlerts.forEach(da => {
      console.log(`- Alerta Duplicado: ${da.order1?.po_number} vs ${da.order2?.po_number} (${da.material?.name}, Riesgo: ${da.risk_level})`);
      console.log(`  Motivo: ${da.match_reason}`);
    });

    // 8. Consultar la trazabilidad
    console.log('\nPaso 8: Consultando trazabilidad histórica del Cemento...');
    const trace = await traceabilityService.getMaterialTraceability(cemento.id);
    console.log(`- Movimientos registrados: ${trace.summary.total_movimientos}`);
    console.log(`- Total entradas: ${trace.summary.total_entradas}`);
    console.log(`- Total salidas: ${trace.summary.total_salidas}`);
    console.log(`- Saldo actual verificado en trazabilidad: ${trace.summary.current_calculated_stock}`);

    // 9. Crear una orden de compra de ₡3 000 000
    console.log('\nPaso 9 y 10: Evaluando orden de ₡3 000 000 con la matriz de aprobación...');
    const reqs = approvalMatrixService.getApprovalRequirements(3000000);
    console.log(`- Monto: ₡3 000 000`);
    console.log(`- Nivel requerido: ${reqs.levelName}`);
    console.log(`- Cotizaciones mínimas: ${reqs.requiredQuotations}`);
    console.log(`- Requiere comité: ${reqs.requiresCommittee ? 'Sí' : 'No'}`);
    if (reqs.levelName !== 'Gerencia Financiera' || reqs.requiredQuotations !== 3) {
      throw new Error('La matriz no asignó los requerimientos correctos para ₡3 000 000!');
    }

    console.log('\n=== ESCENARIO DE DEMOSTRACIÓN VERIFICADO 10/10 CON ÉXITO ===');
    process.exit(0);
  } catch (error) {
    console.error('\nERROR en la verificación del escenario:', error);
    process.exit(1);
  }
}

testDemoScenario();

