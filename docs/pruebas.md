# Informe de Pruebas Automatizadas del Sistema

**Empresa:** Constructora Del Valle S.A.  
**Framework de Pruebas:** Jest v29.7.0  
**Entorno de Ejecución:** Node.js v22.18.0 + MySQL 9.6 + Sequelize ORM  
**Ubicación del Archivo de Pruebas:** `backend/tests/businessRules.test.js`  
**Resultado Global:** **12 de 12 pruebas PASADAS (100 % de éxito)**  
**Tiempo de Ejecución:** ~2.38 segundos  

---

## Resumen Ejecutivo de Ejecución

Todas las pruebas se ejecutaron directamente contra la base de datos empresarial `gestion_inventarios` en MySQL y los servicios de backend. No se utilizaron mocks de memoria ni arreglos estáticos para simular las reglas de negocio.

```bash
> jest --runInBand --detectOpenHandles --forceExit

PASS tests/businessRules.test.js
  PRUEBAS EMPRESARIALES OBLIGATORIAS - QUIZ #2
    √ Prueba 1: Cálculo de stock de seguridad para Cemento gris 50 kg (Resultado esperado: 45) (2 ms)
    √ Prueba 2: Cálculo de punto de reorden para Cemento gris 50 kg (Resultado esperado: 165) (1 ms)
    √ Prueba 3: Material bajo punto de reorden genera alerta (Block: 2800 <= 3600) (72 ms)
    √ Prueba 4: Material en estado normal no genera alerta de reposición (Varilla #3: 850 > 800) (18 ms)
    √ Prueba 5: Detección de posible compra duplicada (OC-1041 y OC-1042) (75 ms)
    √ Prueba 6: Movimiento de entrada aumenta existencias en ubicación seleccionada (61 ms)
    √ Prueba 7: Movimiento de salida disminuye existencias en 20 unidades (47 ms)
    √ Prueba 8: Traslado mantiene invariable el stock global y actualiza ambas ubicaciones (74 ms)
    √ Prueba 9: Validación de stock negativo rechaza la transacción con error explícito (36 ms)
    √ Prueba 10: Orden por ₡3 000 000 requiere Gerencia Financiera y 3 cotizaciones (1 ms)
    √ Prueba 11: Detección de posible compra fraccionada (split purchase) (26 ms)
    √ Prueba 12: Trazabilidad completa reconstruye el historial y saldo del material (16 ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        2.376 s
```

---

## Detalle Técnico de los 12 Casos de Prueba

### Prueba 1 — Cálculo de Stock de Seguridad
- **Objetivo:** Verificar la implementación en el backend de la fórmula del stock de seguridad ($SS$).
- **Fórmula:** $$SS = (D_{\text{máx}} - D_{\text{prom}}) \times L$$
- **Entradas:**
  - Material: Cemento gris 50 kg
  - Demanda promedio diaria ($D_{\text{prom}}$): 40 sacos
  - Demanda máxima diaria ($D_{\text{máx}}$): 55 sacos
  - Tiempo de entrega ($L$): 3 días
- **Cálculo:** $(55 - 40) \times 3 = 15 \times 3 = 45$.
- **Resultado Esperado:** 45 sacos.
- **Resultado Obtenido:** 45 sacos.
- **Estado:**  **PASADO**.

---

### Prueba 2 — Cálculo de Punto de Reorden
- **Objetivo:** Comprobar la fórmula del punto de reorden ($ROP$) calculada por el backend.
- **Fórmula:** $$ROP = (D_{\text{prom}} \times L) + SS$$
- **Entradas:**
  - Demanda promedio: 40 sacos
  - Tiempo de entrega: 3 días
  - Stock de seguridad calculado: 45 sacos
- **Cálculo:** $(40 \times 3) + 45 = 120 + 45 = 165$.
- **Resultado Esperado:** 165 sacos.
- **Resultado Obtenido:** 165 sacos.
- **Estado:**  **PASADO**.

---

### Prueba 3 — Material Bajo Punto de Reorden (Generación de Alerta)
- **Objetivo:** Verificar que cuando las existencias actuales caen por debajo del $ROP$, el sistema genera una alerta persistente en MySQL.
- **Entradas:**
  - Material: Block de concreto 12 × 20 × 40 cm (ID 9, código `MAT-BLO-122040`)
  - Stock actual en libro mayor: 2 800 unidades
  - Punto de reorden ($ROP$): 3 600 unidades
- **Condición Evaluada:** $2\,800 \le 3\,600 \implies$ Alerta activa requerida.
- **Resultado Esperado:** Registro en tabla `reorder_alerts` con `status: 'activa'`, identificando material, existencias y punto de reorden.
- **Resultado Obtenido:** Alerta generada y verificada exitosamente en MySQL.
- **Estado:**  **PASADO**.

---

### Prueba 4 — Material en Nivel Normal (Sin Alerta)
- **Objetivo:** Garantizar que los materiales con existencias por encima de su $ROP$ se clasifiquen como normales y no disparen alertas falsas.
- **Entradas:**
  - Material: Varilla #3 grado 40 (código `MAT-ACE-VAR-003`)
  - Stock actual en libro mayor: 850 varillas
  - Punto de reorden ($ROP$): 800 varillas
- **Condición Evaluada:** $850 > 800 \implies$ No generar alerta.
- **Resultado Esperado:** Estado 'NORMAL', bandera `is_under_reorder_point = false`.
- **Resultado Obtenido:** Estado verificado como Normal.
- **Estado:**  **PASADO**.

---

### Prueba 5 — Posible Compra Duplicada (OC-1041 y OC-1042)
- **Objetivo:** Identificar compras potencialmente duplicadas que representen riesgo de sobreabastecimiento o doble facturación.
- **Entradas:**
  - Orden 1: OC-1041 (Fecha: 02/10, Proveedor A, Cemento gris 50 kg, 200 sacos)
  - Orden 2: OC-1042 (Fecha: 02/10, Proveedor A, Cemento gris 50 kg, 200 sacos)
- **Regla Heurística:** Mismo proveedor + mismo artículo + fecha $\le 3$ días + cantidad con diferencia $\le 10\%$.
- **Resultado Esperado:** Detección de coincidencia, generación de alerta en `duplicate_purchase_alerts` con nivel de riesgo `critico` y exposición económica de ₡1 290 000.
- **Resultado Obtenido:** Coincidencia detectada y catalogada con riesgo crítico.
- **Estado:**  **PASADO**.

---

### Prueba 6 — Movimiento de Entrada en Inventario
- **Objetivo:** Comprobar que el registro de una entrada aumenta atómicamente el saldo del material en la ubicación seleccionada.
- **Entradas:**
  - Ubicación: Bodega Central (Alajuela)
  - Material: Cemento gris 50 kg
  - Tipo: `entrada`
  - Cantidad: 100 sacos
- **Resultado Esperado:** Saldo final = Saldo inicial + 100.
- **Resultado Obtenido:** Incremento exacto verificado contra el libro mayor.
- **Estado:**  **PASADO**.

---

### Prueba 7 — Movimiento de Salida en Inventario
- **Objetivo:** Validar que una salida disminuye el stock local del material.
- **Entradas:**
  - Ubicación: Bodega Central
  - Material: Cemento gris 50 kg
  - Tipo: `salida`
  - Cantidad: 20 sacos
- **Resultado Esperado:** Saldo final = Saldo inicial - 20.
- **Resultado Obtenido:** Decremento exacto registrado en el libro mayor.
- **Estado:**  **PASADO**.

---

### Prueba 8 — Traslado Inter-Ubicaciones (Operación Atómica)
- **Objetivo:** Verificar que un traslado entre centros logísticos reduce el stock de origen y aumenta el de destino en una transacción atómica, manteniendo el balance consolidado global invariable.
- **Entradas:**
  - Ubicación Origen: Bodega Central
  - Ubicación Destino: Obra Norte (Las Terrazas)
  - Material: Cemento gris 50 kg
  - Cantidad: 15 sacos
- **Resultado Esperado:**
  - Stock Origen final = Stock Origen inicial - 15.
  - Stock Destino final = Stock Destino inicial + 15.
  - Stock Global = Invariable ($Global_{\text{después}} = Global_{\text{antes}}$).
  - Ambos registros enlazados mediante un `transfer_group_id`.
- **Resultado Obtenido:** Transacción atómica ejecutada y balance global verificado sin desvíos.
- **Estado:**  **PASADO**.

---

### Prueba 9 — Validación de Stock Negativo
- **Objetivo:** Demostrar que el sistema bloquea cualquier solicitud de despacho que supere la existencia física real en la ubicación.
- **Entradas:**
  - Ubicación: Obra Sur
  - Material: Cemento gris 50 kg
  - Existencia actual: $E$
  - Cantidad solicitada: $E + 5\,000$ unidades
- **Resultado Esperado:** Rechazo inmediato de la transacción mediante excepción y rollback con mensaje: `"Stock insuficiente"`.
- **Resultado Obtenido:** Excepción arrojada y transacción rechazada.
- **Estado:**  **PASADO**.

---

### Prueba 10 — Aplicación de la Matriz de Aprobación
- **Objetivo:** Verificar que las órdenes de compra asignan automáticamente la autoridad correspondiente y el número de cotizaciones requeridas según su monto en colones.
- **Entradas:**
  - Monto de orden: ₡3 000 000
- **Rango de la Matriz:** ₡2 000 001 a ₡10 000 000.
- **Resultado Esperado:**
  - Nivel asignado: "Gerencia Financiera"
  - Cotizaciones mínimas: 3 cotizaciones
  - Requiere comité: false
- **Resultado Obtenido:** Requisitos asignados con total exactitud.
- **Estado:**  **PASADO**.

---

### Prueba 11 — Detección de Compra Fraccionada (Split Purchase)
- **Objetivo:** Detectar intentos de evasión de umbrales mediante la subdivisión de órdenes.
- **Entradas:**
  - Órdenes OC-1050 (₡1 075 000) y OC-1053 (₡1 032 000) emitidas en un lapso de 24 horas para el mismo proveedor (Proveedor C) y proyecto (Obra Norte).
  - Individualmente: menores a ₡2 000 000 (Jefatura de Compras).
  - Sumadas: ₡2 107 000 (superan el umbral de Gerencia Financiera).
- **Resultado Esperado:** Generación de alerta preventiva en `split_purchase_alerts` para auditoría de adquisiciones.
- **Resultado Obtenido:** Alerta registrada con monto acumulado y detalle de órdenes.
- **Estado:**  **PASADO**.

---

### Prueba 12 — Trazabilidad Integral del Material
- **Objetivo:** Reconstruir cronológicamente el historial físico y documental de un material a partir del libro mayor.
- **Entradas:**
  - Material: Cemento gris 50 kg (`MAT-CEM-GRIS-050`)
- **Resultado Esperado:**
  - Listado ordenado cronológicamente de todas las entradas, salidas y traslados.
  - Cada evento debe indicar: fecha, usuario responsable, ubicación, cantidad, documento de origen y saldo resultante.
- **Resultado Obtenido:** Historial completo reconstruido con éxito vinculando usuarios, bodegas y documentos de soporte.
- **Estado:**  **PASADO**.

