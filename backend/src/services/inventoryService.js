const { sequelize, InventoryMovement, Material, Location, PurchaseOrderDetail } = require('../models');
const { Op } = require('sequelize');

class InventoryService {
  /**
   * Obtiene el stock actual de un material calculándolo estrictamente
   * a partir del libro mayor de movimientos (ledger).
   * @param {number} materialId
   * @param {number|null} locationId - Opcional: filtrar por ubicación específica
   */
  async getCurrentStock(materialId, locationId = null) {
    const whereClause = { material_id: materialId };
    if (locationId) {
      whereClause.location_id = locationId;
    }

    const movements = await InventoryMovement.findAll({
      where: whereClause,
      attributes: ['movement_type', 'quantity']
    });

    let currentStock = 0;
    for (const mov of movements) {
      const qty = parseFloat(mov.quantity);
      if (['entrada', 'ajuste_positivo'].includes(mov.movement_type)) {
        currentStock += qty;
      } else if (['salida', 'ajuste_negativo'].includes(mov.movement_type)) {
        currentStock -= qty;
      } else if (mov.movement_type === 'traslado') {
        // En traslados, si consultamos por ubicación, debemos saber si fue origen o destino
        // Por diseño: un movimiento de traslado registrado en location_id con cantidad positiva representa la salida o entrada
        // Sin embargo, para mayor claridad técnica en el ledger:
        // Los registros de traslado se guardan como salida en origen y entrada en destino
      }
    }

    // Utilizando agregación SQL directa para máxima consistencia y rendimiento:
    const sqlQuery = `
      SELECT COALESCE(SUM(
        CASE 
          WHEN movement_type IN ('entrada', 'ajuste_positivo') THEN quantity
          WHEN movement_type IN ('salida', 'ajuste_negativo') THEN -quantity
          -- Si es un registro de traslado, evaluamos según la bandera o signo
          ELSE 0
        END
      ), 0) AS total_stock
      FROM inventory_movements
      WHERE material_id = :materialId
      ${locationId ? 'AND location_id = :locationId' : ''}
    `;

    const [results] = await sequelize.query(sqlQuery, {
      replacements: { materialId, locationId }
    });

    return parseFloat(results[0]?.total_stock || 0);
  }

  /**
   * Obtiene el desglose de existencias por cada bodega u obra
   */
  async getStockByLocation(materialId) {
    const sqlQuery = `
      SELECT 
        l.id AS location_id,
        l.code AS location_code,
        l.name AS location_name,
        l.type AS location_type,
        COALESCE(SUM(
          CASE 
            WHEN im.movement_type IN ('entrada', 'ajuste_positivo') THEN im.quantity
            WHEN im.movement_type IN ('salida', 'ajuste_negativo') THEN -im.quantity
            ELSE 0
          END
        ), 0) AS current_stock
      FROM locations l
      LEFT JOIN inventory_movements im 
        ON l.id = im.location_id AND im.material_id = :materialId
      WHERE l.status = 'activo'
      GROUP BY l.id, l.code, l.name, l.type
      ORDER BY l.type DESC, l.name ASC
    `;

    const [results] = await sequelize.query(sqlQuery, {
      replacements: { materialId }
    });

    return results.map(row => ({
      ...row,
      current_stock: parseFloat(row.current_stock)
    }));
  }

  /**
   * Registra un movimiento de inventario garantizando ACID y evitando stocks negativos.
   */
  async recordMovement(movementData, externalTransaction = null) {
    const t = externalTransaction || await sequelize.transaction();

    try {
      const {
        material_id,
        location_id,
        movement_type,
        quantity,
        unit_cost = 0,
        user_id,
        source_document_type,
        source_document_id,
        destination_location_id,
        purchase_order_detail_id,
        notes
      } = movementData;

      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) {
        throw new Error('La cantidad debe ser un número positivo mayor a cero.');
      }

      // Validar existencia de material y ubicación
      const material = await Material.findByPk(material_id, { transaction: t });
      if (!material) throw new Error(`Material con ID ${material_id} no encontrado.`);

      const location = await Location.findByPk(location_id, { transaction: t });
      if (!location) throw new Error(`Ubicación origen con ID ${location_id} no encontrada.`);

      const movementTimestamp = new Date();
      const movementCodeBase = `MOV-${Date.now()}`;

      // -------------------------------------------------------------
      // CASO 1: TRASLADO ENTRE BODEGAS / OBRAS (Operación Atómica)
      // -------------------------------------------------------------
      if (movement_type === 'traslado') {
        if (!destination_location_id) {
          throw new Error('Debe especificar la ubicación de destino para un traslado.');
        }
        if (parseInt(location_id) === parseInt(destination_location_id)) {
          throw new Error('La ubicación de origen y destino no pueden ser la misma.');
        }

        const destLocation = await Location.findByPk(destination_location_id, { transaction: t });
        if (!destLocation) throw new Error(`Ubicación destino con ID ${destination_location_id} no encontrada.`);

        // Verificar stock en origen
        const originStock = await this.getCurrentStock(material_id, location_id);
        if (originStock < qty) {
          throw new Error(`Stock insuficiente para traslado en ${location.name}. Disponible: ${originStock}, Solicitado: ${qty}.`);
        }

        const destStock = await this.getCurrentStock(material_id, destination_location_id);
        const transferGroupId = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 1. Movimiento de Salida por traslado en origen
        const outMovement = await InventoryMovement.create({
          movement_number: `${movementCodeBase}-OUT`,
          material_id,
          location_id,
          movement_type: 'salida',
          quantity: qty,
          unit_cost: unit_cost || material.standard_price,
          balance_after: originStock - qty,
          movement_date: movementTimestamp,
          user_id,
          source_document_type: 'traslado',
          source_document_id: source_document_id || transferGroupId,
          destination_location_id,
          transfer_group_id: transferGroupId,
          notes: notes ? `[Traslado Salida hacia ${destLocation.name}] ${notes}` : `Traslado hacia ${destLocation.name}`
        }, { transaction: t });

        // 2. Movimiento de Entrada por traslado en destino
        const inMovement = await InventoryMovement.create({
          movement_number: `${movementCodeBase}-IN`,
          material_id,
          location_id: destination_location_id,
          movement_type: 'entrada',
          quantity: qty,
          unit_cost: unit_cost || material.standard_price,
          balance_after: destStock + qty,
          movement_date: movementTimestamp,
          user_id,
          source_document_type: 'traslado',
          source_document_id: source_document_id || transferGroupId,
          destination_location_id: location_id, // referencia al origen
          transfer_group_id: transferGroupId,
          notes: notes ? `[Traslado Entrada desde ${location.name}] ${notes}` : `Recepción de traslado desde ${location.name}`
        }, { transaction: t });

        if (!externalTransaction) await t.commit();

        // Evaluar alertas en ambas ubicaciones
        const reorderService = require('./reorderService');
        await reorderService.evaluateMaterialAlert(material_id, location_id);
        await reorderService.evaluateMaterialAlert(material_id, destination_location_id);

        return {
          success: true,
          type: 'traslado',
          transfer_group_id: transferGroupId,
          origin_movement: outMovement,
          destination_movement: inMovement
        };
      }

      // -------------------------------------------------------------
      // CASO 2: ENTRADA / SALIDA / AJUSTE REGULAR
      // -------------------------------------------------------------
      const currentStock = await this.getCurrentStock(material_id, location_id);
      let balanceAfter = currentStock;

      if (['salida', 'ajuste_negativo'].includes(movement_type)) {
        if (currentStock < qty) {
          throw new Error(`Stock insuficiente en ${location.name}. Existencias actuales: ${currentStock} ${material.unit}, Solicitado: ${qty} ${material.unit}.`);
        }
        balanceAfter = currentStock - qty;
      } else if (['entrada', 'ajuste_positivo'].includes(movement_type)) {
        balanceAfter = currentStock + qty;
      }

      // Si viene vinculado a una línea de orden de compra, actualizar received_quantity
      if (purchase_order_detail_id) {
        const pod = await PurchaseOrderDetail.findByPk(purchase_order_detail_id, { transaction: t });
        if (pod) {
          const newReceived = parseFloat(pod.received_quantity) + qty;
          await pod.update({ received_quantity: newReceived }, { transaction: t });
        }
      }

      const movement = await InventoryMovement.create({
        movement_number: movementCodeBase,
        material_id,
        location_id,
        movement_type,
        quantity: qty,
        unit_cost: unit_cost || material.standard_price,
        balance_after: balanceAfter,
        movement_date: movementTimestamp,
        user_id,
        source_document_type: source_document_type || 'ajuste_inventario',
        source_document_id: source_document_id || null,
        destination_location_id: destination_location_id || null,
        purchase_order_detail_id: purchase_order_detail_id || null,
        notes: notes || null
      }, { transaction: t });

      if (!externalTransaction) await t.commit();

      // Evaluar alertas de reorden de inmediato
      const reorderService = require('./reorderService');
      await reorderService.evaluateMaterialAlert(material_id, location_id);

      return {
        success: true,
        movement,
        new_balance: balanceAfter
      };
    } catch (error) {
      if (!externalTransaction && t) await t.rollback();
      throw error;
    }
  }
}

module.exports = new InventoryService();
