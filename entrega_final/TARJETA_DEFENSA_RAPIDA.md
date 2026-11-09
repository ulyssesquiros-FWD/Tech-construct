# TARJETA DE REFERENCIA RÁPIDA PARA LA DEFENSA TÉCNICA
## QUIZ #2: GESTIÓN DE INVENTARIOS — CONSTRUCTORA DEL VALLE S.A.
*Material de apoyo de bolsillo para el estudiante / expositor durante la presentación de 10 min y demo de 5 min.*

---

### 1. COMANDOS CLAVE DE TERMINAL (Cheatsheet)

```bash
# A. Reiniciar base de datos al estado prístino de 190 sacos (antes de la demo):
cd backend && npm run db:init

# B. Ejecutar las 12 pruebas automatizadas en Jest:
cd backend && npm test

# C. Levantar el Backend (Puerto 5000):
cd backend && npm run dev

# D. Levantar el Frontend (Puerto 3000):
cd frontend && npm run dev

# E. Verificar el escenario de demostración por consola (10 pasos):
cd backend && node src/utils/verifyDemoScenario.js
```

---

### 2. CIFRAS Y DATOS DE MEMORIA INMEDIATA (Cheat Sheet de Cifras)

| Métrica / Parámetro | Valor Exacto | Justificación / Fórmula |
|---|:---:|---|
| **Ahorro Directo (A2)** | **₡89 000** | Cemento (₡62 000) + Acero (₡27 000 condicionado a ASTM A615 Grado 40). |
| **Diferencia Prov. A (A3)** | **₡60 000** | OC-1041 y OC-1042: +₡150 por 400 sacos (condicionado a revisión Three-Way Match). |
| **Desviaciones Terceros (A3)**| **₡163 000** | Compras fuera de contrato a Prov. B, C y D. |
| **Fuga Mensual Total (A3)** | **₡223 000** | $\text{₡}60\,000 + \text{₡}163\,000 = \text{₡}223\,000$. |
| **Proyección Anual de Fuga** | **₡2 676 000** | $\text{₡}223\,000 \times 12\text{ meses}$. |
| **Exposición por Duplicidad**| **₡1 290 000** | 200 sacos $\times$ ₡6 450 (Aislado como riesgo de liquidez, **no** pérdida confirmada). |
| **Proveedor Principal (A4)** | **Construplaza (70%)** | Calificación: **4.280** / 5.0 (Líder en calidad y cumplimiento de entrega). |
| **Proveedor Secundario (A4)**| **EPA S.A. (30%)** | Calificación: **4.065** / 5.0 (Mejor precio y capilaridad de sucursales). |
| **Prioridad N° 1 de Reposición**| **Arena fina (m³)** | **2.33 días de cobertura** ($Stock = 14 \le ROP = 20$). Riesgo crítico de paro. |
| **Prioridad N° 2 de Reposición**| **Block 12×20×40** | **4.67 días de cobertura** ($Stock = 2800 \le ROP = 3600$). |
| **Fórmula Stock Seguridad** | $SS = (D_{\text{máx}} - D_{\text{prom}}) \times L$ | Cemento: $(55 - 40) \times 3 = \mathbf{45\text{ sacos}}$. |
| **Fórmula Punto de Reorden** | $ROP = (D_{\text{prom}} \times L) + SS$ | Cemento: $(40 \times 3) + 45 = \mathbf{165\text{ sacos}}$. |
| **Fórmula Días Cobertura** | $DC = \text{Stock Actual} / D_{\text{prom}}$ | Arena: $14 / 6 = \mathbf{2.33\text{ días}}$. |

---

### 3. GUÍA RELÁMPAGO PARA LA DEMO DE 5 MINUTOS (Paso a Paso)

1. **Dashboard (`/`):** Mostrar KPIs: stock global, valor en ₡, alertas activas y compras en curso.
2. **Materiales (`/materiales`):** Buscar `Cemento` $\implies$ Código `MAT-CEM-GRIS-050`, ROP: 165, Stock semilla: **190 sacos**.
3. **Movimientos (`/movimientos`):** Registrar **Entrada** de **50 sacos** de Cemento en Bodega Central (Doc: `REC-DEMO-01`).
4. **Movimientos (`/movimientos`):** Registrar **Salida** de **20 sacos** para Obra Norte (Doc: `VAL-OBRA-101`).
5. **Inventario por Ubicación (`/inventario-ubicacion`):** Seleccionar Bodega Central $\implies$ Saldo exacto: **220 sacos** ($190 + 50 - 20 = 220$). ¡Demuestra cálculo dinámico por Ledger!
6. **Alertas (`/alertas`):** Mostrar Alerta Crítica en Arena fina ($14 \le 20$) y Alerta Alta en Block ($2800 \le 3600$). Varilla sin alerta.
7. **Duplicados (`/duplicados`):** Mostrar detección automática de OC-1041 y OC-1042 (Similitud 95%, riesgo aislado ₡1 290 000).
8. **Trazabilidad (`/trazabilidad`):** Filtrar por Cemento gris $\implies$ Línea de tiempo inmutable con documentos y usuarios.
9. **Órdenes de Compra (`/ordenes-compra`):** Crear nueva OC por **₡3 000 000** para Construplaza S.A.
10. **Aprobaciones (`/aprobaciones`):** Comprobar que el software exige **Gerencia Financiera** y mínimo **3 cotizaciones**.

---

### 4. TOP 5 PREGUNTAS TÍPICAS DEL PROFESOR Y RESPUESTAS CONTUNDENTES

#### P1: "¿Por qué no guardan el stock como un número en la tabla de materiales y ya?"
> *"Porque viola el principio de integridad contable y el patrón **Ledger (Libro Mayor)**. Si almacenamos un número editable en `materials`, cualquier fallo o `UPDATE` concurrente corrompería el inventario sin dejar rastro. En nuestro sistema, el stock físico es el resultado inmutable de sumar entradas y restar salidas en `inventory_movements`, garantizando auditoría forense al 100%."*

#### P2: "¿Cómo evitan que dos bodegueros vendan el mismo material al mismo tiempo y quede stock negativo?"
> *"A través de **Transacciones Atómicas ACID de InnoDB** en Sequelize. Antes de procesar la salida, el servicio bloquea y totaliza el saldo disponible en esa ubicación específica. Si la cantidad solicitada excede la existencia real, lanzamos una excepción de negocio que aborta la petición con `HTTP 400` y ejecuta un `ROLLBACK` automático, impidiendo saldos negativos."*

#### P3: "¿Por qué afirman que los ₡1 290 000 de la compra duplicada no son una pérdida confirmada?"
> *"Porque contablemente representan una **exposición de riesgo de liquidez y sobreabastecimiento**, no una pérdida confirmada. Si el camión entregó los 200 sacos reales en obra y se usaron en colados, la empresa tiene el activo físico. La pérdida solo ocurriría si el proveedor cobró dos veces un solo viaje físico, lo cual se esclarece únicamente mediante el Three-Way Match en la auditoría de recepción."*

#### P4: "¿Qué pasa si un usuario intenta aprobar una orden de ₡3 000 000 teniendo solo 2 cotizaciones?"
> *"El backend rechaza la operación con código `403 Forbidden`. Nuestro servicio `approvalMatrixService` intercepta el payload y valida dos condiciones vinculantes: que el usuario tenga el rol autorizado (`gerente_financiero`) y que `attached_quotations >= 3`. No es una validación visual del frontend, sino una regla blindada en la API REST."*

#### P5: "¿Cómo demuestra que su base de datos está en Tercera Forma Normal (3NF)?"
> *"Porque cumple 1NF (valores atómicos, sin arreglos multivaluados), cumple 2NF (claves foráneas en tablas intermedias como `purchase_order_details`) y cumple 3NF al **eliminar dependencias transitivas**: los datos del proveedor, ubicación o categoría no se duplican en las órdenes o movimientos, sino que se referencian exclusivamente mediante llaves foráneas (`FK`), garantizando cero redundancias y cero anomalías de actualización."*
