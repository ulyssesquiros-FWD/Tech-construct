const request = require('supertest');
const app = require('../src/app');
const { sequelize, Material, Location, PurchaseOrder, InventoryMovement, ReorderAlert, DuplicatePurchaseAlert, SplitPurchaseAlert, User } = require('../src/models');
const reorderService = require('../src/services/reorderService');
const approvalMatrixService = require('../src/services/approvalMatrixService');
const duplicateDetectionService = require('../src/services/duplicateDetectionService');
const splitPurchaseService = require('../src/services/splitPurchaseService');
const inventoryService = require('../src/services/inventoryService');
const traceabilityService = require('../src/services/traceabilityService');

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

describe('PRUEBAS EMPRESARIALES OBLIGATORIAS - QUIZ #2', () => {

  // ---------------------------------------------------------------------------
  // PRUEBA 1: Cálculo de stock de seguridad
  // Cemento: (Demanda máx 55 - Demanda prom 40) × Tiempo entrega 3 = 45
  // ---------------------------------------------------------------------------
  test('Prueba 1: Cálculo de stock de seguridad para Cemento gris 50 kg (Resultado esperado: 45)', () => {
    const avgDemand = 40;
    const maxDemand = 55;
    const leadTime = 3;

    const safetyStock = reorderService.calculateSafetyStock(avgDemand, maxDemand, leadTime);
    expect(safetyStock).toBe(45);
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 2: Cálculo de punto de reorden
  // Cemento: (Demanda prom 40 × Tiempo entrega 3) + Stock seguridad 45 = 165
  // ---------------------------------------------------------------------------
  test('Prueba 2: Cálculo de punto de reorden para Cemento gris 50 kg (Resultado esperado: 165)', () => {
    const avgDemand = 40;
    const maxDemand = 55;
    const leadTime = 3;

    const reorderPoint = reorderService.calculateReorderPoint(avgDemand, maxDemand, leadTime);
    expect(reorderPoint).toBe(165);
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 3: Material bajo punto de reorden
  // Block: Stock actual 2 800. Punto de reorden 3 600. Resultado: Generar alerta
  // ---------------------------------------------------------------------------
  test('Prueba 3: Material bajo punto de reorden genera alerta (Block: 2800 <= 3600)', async () => {
    // Buscamos el material Block (ID 9)
    const block = await Material.findOne({ where: { internal_code: 'MAT-BLO-122040' } });
    expect(block).not.toBeNull();

    const evaluation = await reorderService.evaluateMaterialAlert(block.id);
    expect(evaluation).not.toBeNull();

    // Verificamos en la base de datos que exista una alerta activa para este material
    const alert = await ReorderAlert.findOne({
      where: { material_id: block.id, status: 'activa' }
    });
    expect(alert).not.toBeNull();
    expect(parseFloat(alert.current_stock)).toBeLessThanOrEqual(parseFloat(alert.reorder_point));
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 4: Material normal (no bajo punto de reorden)
  // Varilla: Stock actual 850. Punto de reorden 800. Resultado: Estado normal
  // ---------------------------------------------------------------------------
  test('Prueba 4: Material en estado normal no genera alerta de reposición (Varilla #3: 850 > 800)', async () => {
    const varilla = await Material.findOne({ where: { internal_code: 'MAT-ACE-VAR-003' } });
    expect(varilla).not.toBeNull();

    const currentStock = await inventoryService.getCurrentStock(varilla.id);
    expect(currentStock).toBeGreaterThan(parseFloat(varilla.reorder_point));

    const evalResult = await reorderService.evaluateMaterialAlert(varilla.id);
    expect(evalResult.normal).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 5: Detección de posible compra duplicada
  // OC-1041 y OC-1042 comparten fecha, proveedor, artículo y cantidad.
  // ---------------------------------------------------------------------------
  test('Prueba 5: Detección de posible compra duplicada (OC-1041 y OC-1042)', async () => {
    const detected = await duplicateDetectionService.scanForDuplicates();
    expect(Array.isArray(detected)).toBe(true);

    const matchOC1041 = await DuplicatePurchaseAlert.findOne({
      include: [
        { model: PurchaseOrder, as: 'order1' },
        { model: PurchaseOrder, as: 'order2' }
      ]
    });

    expect(matchOC1041).not.toBeNull();
    const poNumbers = [matchOC1041.order1?.po_number, matchOC1041.order2?.po_number];
    expect(poNumbers).toContain('OC-1041');
    expect(poNumbers).toContain('OC-1042');
    expect(matchOC1041.risk_level).toBe('critico');
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 6: Movimiento de entrada
  // Registrar 100 sacos de cemento -> Stock aumenta en 100
  // ---------------------------------------------------------------------------
  test('Prueba 6: Movimiento de entrada aumenta existencias en ubicación seleccionada', async () => {
    const cemento = await Material.findOne({ where: { internal_code: 'MAT-CEM-GRIS-050' } });
    const location = await Location.findOne({ where: { code: 'BOD-CENTRAL' } });
    const user = await User.findOne();

    const initialStock = await inventoryService.getCurrentStock(cemento.id, location.id);

    const movementRes = await inventoryService.recordMovement({
      material_id: cemento.id,
      location_id: location.id,
      movement_type: 'entrada',
      quantity: 100,
      unit_cost: 6300,
      user_id: user.id,
      source_document_type: 'orden_compra',
      source_document_id: 'TEST-ENTRADA-100',
      notes: 'Prueba unitaria automatizada de entrada'
    });

    expect(movementRes.success).toBe(true);
    const finalStock = await inventoryService.getCurrentStock(cemento.id, location.id);
    expect(finalStock).toBe(initialStock + 100);
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 7: Movimiento de salida
  // Registrar 20 sacos de cemento -> Stock disminuye en 20
  // ---------------------------------------------------------------------------
  test('Prueba 7: Movimiento de salida disminuye existencias en 20 unidades', async () => {
    const cemento = await Material.findOne({ where: { internal_code: 'MAT-CEM-GRIS-050' } });
    const location = await Location.findOne({ where: { code: 'BOD-CENTRAL' } });
    const user = await User.findOne();

    const initialStock = await inventoryService.getCurrentStock(cemento.id, location.id);

    const movementRes = await inventoryService.recordMovement({
      material_id: cemento.id,
      location_id: location.id,
      movement_type: 'salida',
      quantity: 20,
      unit_cost: 6300,
      user_id: user.id,
      source_document_type: 'requisicion',
      source_document_id: 'TEST-SALIDA-20',
      notes: 'Prueba unitaria automatizada de salida'
    });

    expect(movementRes.success).toBe(true);
    const finalStock = await inventoryService.getCurrentStock(cemento.id, location.id);
    expect(finalStock).toBe(initialStock - 20);
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 8: Traslado entre ubicaciones
  // Trasladar materiales de Bodega Central a Obra Norte
  // Origen reduce, destino aumenta, stock global invariable
  // ---------------------------------------------------------------------------
  test('Prueba 8: Traslado mantiene invariable el stock global y actualiza ambas ubicaciones', async () => {
    const cemento = await Material.findOne({ where: { internal_code: 'MAT-CEM-GRIS-050' } });
    const origin = await Location.findOne({ where: { code: 'BOD-CENTRAL' } });
    const destination = await Location.findOne({ where: { code: 'OBR-NORTE' } });
    const user = await User.findOne();

    const globalStockBefore = await inventoryService.getCurrentStock(cemento.id);
    const originStockBefore = await inventoryService.getCurrentStock(cemento.id, origin.id);
    const destStockBefore = await inventoryService.getCurrentStock(cemento.id, destination.id);

    const transferQty = 15;

    const transferRes = await inventoryService.recordMovement({
      material_id: cemento.id,
      location_id: origin.id,
      movement_type: 'traslado',
      quantity: transferQty,
      destination_location_id: destination.id,
      user_id: user.id,
      notes: 'Prueba de traslado atómico'
    });

    expect(transferRes.success).toBe(true);
    expect(transferRes.transfer_group_id).toBeDefined();

    const globalStockAfter = await inventoryService.getCurrentStock(cemento.id);
    const originStockAfter = await inventoryService.getCurrentStock(cemento.id, origin.id);
    const destStockAfter = await inventoryService.getCurrentStock(cemento.id, destination.id);

    // Verificaciones:
    expect(originStockAfter).toBe(originStockBefore - transferQty);
    expect(destStockAfter).toBe(destStockBefore + transferQty);
    expect(globalStockAfter).toBe(globalStockBefore); // El stock global es idéntico
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 9: Validación de stock negativo
  // Intentar retirar más unidades de las disponibles debe ser rechazado
  // ---------------------------------------------------------------------------
  test('Prueba 9: Validación de stock negativo rechaza la transacción con error explícito', async () => {
    const cemento = await Material.findOne({ where: { internal_code: 'MAT-CEM-GRIS-050' } });
    const location = await Location.findOne({ where: { code: 'OBR-SUR' } });
    const user = await User.findOne();

    const currentStock = await inventoryService.getCurrentStock(cemento.id, location.id);
    const excessiveQty = currentStock + 5000;

    await expect(inventoryService.recordMovement({
      material_id: cemento.id,
      location_id: location.id,
      movement_type: 'salida',
      quantity: excessiveQty,
      user_id: user.id
    })).rejects.toThrow(/Stock insuficiente/);
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 10: Matriz de aprobación
  // Crear orden por ₡3 000 000 -> Gerencia Financiera y 3 cotizaciones
  // ---------------------------------------------------------------------------
  test('Prueba 10: Orden por ₡3 000 000 requiere Gerencia Financiera y 3 cotizaciones', () => {
    const amount = 3000000;
    const reqs = approvalMatrixService.getApprovalRequirements(amount);

    expect(reqs.levelName).toBe('Gerencia Financiera');
    expect(reqs.requiredQuotations).toBe(3);
    expect(reqs.requiresCommittee).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 11: Compra fraccionada
  // Órdenes que individualmente están bajo el umbral pero sumadas lo superan
  // ---------------------------------------------------------------------------
  test('Prueba 11: Detección de posible compra fraccionada (split purchase)', async () => {
    const alerts = await splitPurchaseService.scanForSplitPurchases();
    expect(Array.isArray(alerts)).toBe(true);

    const splitAlert = await SplitPurchaseAlert.findOne({
      where: { status: 'pendiente_revision' }
    });

    expect(splitAlert).not.toBeNull();
    expect(parseFloat(splitAlert.total_accumulated_amount)).toBeGreaterThan(parseFloat(splitAlert.threshold_exceeded));
  });

  // ---------------------------------------------------------------------------
  // PRUEBA 12: Trazabilidad integral de un material
  // Consultar historial cronológico con entradas, salidas y documentos origen
  // ---------------------------------------------------------------------------
  test('Prueba 12: Trazabilidad completa reconstruye el historial y saldo del material', async () => {
    const cemento = await Material.findOne({ where: { internal_code: 'MAT-CEM-GRIS-050' } });
    const trace = await traceabilityService.getMaterialTraceability(cemento.id);

    expect(trace).toBeDefined();
    expect(trace.material.code).toBe('MAT-CEM-GRIS-050');
    expect(trace.timeline.length).toBeGreaterThanOrEqual(4); // Contiene movimientos de seed y de pruebas
    expect(trace.summary.total_entradas).toBeGreaterThan(0);
    expect(trace.summary.current_calculated_stock).toBeGreaterThan(0);

    // Verificar que cada registro posea usuario y ubicación
    for (const mov of trace.timeline) {
      expect(mov.movement_type).toBeDefined();
      expect(mov.location).toBeDefined();
      expect(mov.quantity).toBeGreaterThan(0);
    }
  });
});

