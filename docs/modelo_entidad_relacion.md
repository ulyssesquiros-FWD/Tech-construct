# Modelo Entidad-Relación y Arquitectura de Datos

**Empresa:** Constructora Del Valle S.A.  
**Sistema:** Sistema Empresarial de Gestión de Inventarios y Abastecimiento  
**Base de Datos:** `gestion_inventarios` (MySQL 8.0+ / 9.0+)  
**ORM:** Sequelize (Node.js)  

---

## 1. Justificación de Normalización (Tercera Forma Normal - 3NF)

El modelo de datos fue diseñado siguiendo rigurosamente los principios de normalización relacional:

1. **Primera Forma Normal (1NF):** Todos los atributos son atómicos e indivisibles. No existen grupos repetitivos ni listas concatenadas dentro de una sola celda (por ejemplo, las líneas de una orden de compra se desagregan en la tabla `purchase_order_details`).
2. **Segunda Forma Normal (2NF):** La totalidad de los atributos no clave tienen dependencia funcional completa respecto a la clave primaria. En `purchase_order_details`, los atributos `quantity`, `unit_price` y `subtotal` dependen de la clave compuesta o sustituta de la línea y no de forma parcial de la cabecera.
3. **Tercera Forma Normal (3NF):** No existen dependencias transitivas. Los datos de proveedores, ubicaciones, usuarios y categorías residen en sus propias tablas maestras y se referencian exclusivamente mediante claves foráneas (`foreign keys`).

### Principio de Inmutabilidad del Stock (Libro Mayor / Ledger)
En sistemas empresariales de alto rigor (como ERPs tipo SAP o Oracle EBS), **el stock actual nunca se almacena como una columna editable de manera directa en la tabla de materiales**, debido a que cualquier fallo de concurrencia, fallo de red o manipulación manual desincronizaría el inventario del registro histórico.

En esta arquitectura:
- El stock actual se calcula dinámicamente o se consulta mediante la vista materializada `vw_current_inventory`, la cual consolida la suma algebraica de los movimientos:
  $$\text{Stock Actual} = \sum (\text{Entradas} + \text{Ajustes Positivos}) - \sum (\text{Salidas} + \text{Ajustes Negativos})$$
- Toda salida o traslado valida de manera previa el balance y se ejecuta dentro de una **transacción ACID**, garantizando que nunca se produzcan saldos negativos.

---

## 2. Diccionario de Tablas Principales

### 2.1. `roles`
Almacena los perfiles de acceso y facultades de autorización.
- `id` (INT, PK, Auto-increment)
- `name` (VARCHAR(50), UNIQUE, NOT NULL): Nombre del rol.
- `description` (VARCHAR(255)): Alcance y facultades de aprobación.

### 2.2. `users`
Usuarios corporativos de los departamentos de Obras, Mantenimiento, Compras, Finanzas y Bodega.
- `id` (INT, PK, Auto-increment)
- `role_id` (INT, FK -> roles.id, NOT NULL)
- `full_name` (VARCHAR(120), NOT NULL)
- `email` (VARCHAR(120), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `department` (VARCHAR(80), NOT NULL)
- `status` (ENUM('activo', 'inactivo'), DEFAULT 'activo')

### 2.3. `categories`
Taxonomía empresarial jerárquica de dos niveles (Categoría Padre -> Subcategoría).
- `id` (INT, PK, Auto-increment)
- `code` (VARCHAR(20), UNIQUE, NOT NULL): Prefijo estándar (ej. MAT, MAT-CEM, SEG-GUA).
- `name` (VARCHAR(100), NOT NULL)
- `description` (TEXT)
- `parent_id` (INT, FK -> categories.id, NULL para nivel 1)

### 2.4. `materials`
Catálogo maestro de artículos y materiales de construcción con parámetros de reabastecimiento.
- `id` (INT, PK, Auto-increment)
- `internal_code` (VARCHAR(40), UNIQUE, NOT NULL): Código estandarizado corporativo.
- `name` (VARCHAR(150), NOT NULL)
- `category_id` (INT, FK -> categories.id, NOT NULL)
- `subcategory_id` (INT, FK -> categories.id, NULL)
- `unit` (VARCHAR(25), NOT NULL): Unidad de medida (saco, varilla, unidad, m3, par, tubo).
- `avg_daily_demand` (DECIMAL(10,2)): Demanda diaria promedio ($D$).
- `max_daily_demand` (DECIMAL(10,2)): Demanda diaria máxima ($D_{\text{máx}}$).
- `lead_time_days` (INT): Tiempo de entrega en días del proveedor ($L$).
- `safety_stock` (DECIMAL(12,2)): Stock de seguridad calculado automáticamente en backend.
- `reorder_point` (DECIMAL(12,2)): Punto de reorden calculado automáticamente en backend.
- `standard_price` (DECIMAL(14,2)): Precio unitario de referencia contractual o de catálogo.
- `status` (ENUM('activo', 'inactivo'), DEFAULT 'activo')

### 2.5. `locations`
Bodegas centrales, bodegas periféricas y frentes de obra en construcción.
- `id` (INT, PK, Auto-increment)
- `code` (VARCHAR(30), UNIQUE, NOT NULL): Código de centro logístico.
- `name` (VARCHAR(100), NOT NULL)
- `type` (ENUM('bodega', 'obra'), NOT NULL)
- `address` (VARCHAR(255))
- `status` (ENUM('activo', 'inactivo'), DEFAULT 'activo')

### 2.6. `suppliers`
Proveedores homologados y evaluados comercialmente.
- `id` (INT, PK, Auto-increment)
- `code` (VARCHAR(30), UNIQUE, NOT NULL)
- `commercial_name` (VARCHAR(120), NOT NULL)
- `legal_name` (VARCHAR(150), NOT NULL)
- `tax_id` (VARCHAR(50), UNIQUE, NOT NULL): Cédula jurídica o NIF.
- `phone` (VARCHAR(40))
- `email` (VARCHAR(120))
- `contact_person` (VARCHAR(100))
- `status` (ENUM('activo', 'inactivo'), DEFAULT 'activo')

### 2.7. `purchase_orders`
Cabecera de las órdenes de compra con control de matriz de aprobación y fraccionamiento.
- `id` (INT, PK, Auto-increment)
- `po_number` (VARCHAR(30), UNIQUE, NOT NULL): Correlativo (ej. OC-1041).
- `supplier_id` (INT, FK -> suppliers.id, NOT NULL)
- `location_id` (INT, FK -> locations.id, NULL): Destino inicial previsto.
- `requesting_department` (VARCHAR(80), NOT NULL)
- `project_name` (VARCHAR(100))
- `order_date` (DATE, NOT NULL)
- `expected_date` (DATE)
- `subtotal` (DECIMAL(14,2), NOT NULL)
- `tax` (DECIMAL(14,2), NOT NULL)
- `total` (DECIMAL(14,2), NOT NULL)
- `required_approval_level` (VARCHAR(80), NOT NULL): Asignado según matriz.
- `required_quotations` (INT, DEFAULT 1): Mínimo requerido según matriz.
- `attached_quotations_count` (INT, DEFAULT 1): Cotizaciones adjuntadas.
- `status` (ENUM('borrador', 'pendiente_aprobacion', 'aprobada', 'emitida', 'parcialmente_recibida', 'recibida', 'cancelada'))
- `created_by` (INT, FK -> users.id, NOT NULL)
- `notes` (TEXT)

### 2.8. `purchase_order_details`
Detalle línea por línea de materiales solicitados en cada orden.
- `id` (INT, PK, Auto-increment)
- `purchase_order_id` (INT, FK -> purchase_orders.id ON DELETE CASCADE)
- `material_id` (INT, FK -> materials.id, NOT NULL)
- `quantity` (DECIMAL(12,2), NOT NULL)
- `unit_price` (DECIMAL(14,2), NOT NULL)
- `subtotal` (DECIMAL(14,2), NOT NULL)
- `received_quantity` (DECIMAL(12,2), DEFAULT 0.00)

### 2.9. `approvals`
Historial de aprobaciones de compras.
- `id` (INT, PK, Auto-increment)
- `purchase_order_id` (INT, FK -> purchase_orders.id, NOT NULL)
- `user_id` (INT, FK -> users.id, NOT NULL)
- `approval_level` (VARCHAR(80), NOT NULL)
- `required_quotations` (INT, NOT NULL)
- `attached_quotations_count` (INT, NOT NULL)
- `status` (ENUM('pendiente', 'aprobada', 'rechazada'), DEFAULT 'pendiente')
- `comments` (TEXT)
- `decision_date` (DATETIME)

### 2.10. `inventory_movements`
Libro mayor de inventarios. Toda alteración física del stock genera un registro inmutable aquí.
- `id` (INT, PK, Auto-increment)
- `movement_number` (VARCHAR(35), UNIQUE, NOT NULL)
- `material_id` (INT, FK -> materials.id, NOT NULL)
- `location_id` (INT, FK -> locations.id, NOT NULL)
- `movement_type` (ENUM('entrada', 'salida', 'traslado', 'ajuste_positivo', 'ajuste_negativo'), NOT NULL)
- `quantity` (DECIMAL(12,2), NOT NULL)
- `unit_cost` (DECIMAL(14,2), DEFAULT 0.00)
- `balance_after` (DECIMAL(12,2), NOT NULL)
- `movement_date` (DATETIME, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `user_id` (INT, FK -> users.id, NOT NULL)
- `source_document_type` (ENUM('orden_compra', 'traslado', 'requisicion', 'ajuste_inventario', 'demostracion_inicial'))
- `source_document_id` (VARCHAR(50))
- `destination_location_id` (INT, FK -> locations.id, NULL)
- `transfer_group_id` (VARCHAR(50), NULL): Vincula la salida del origen con la entrada del destino en traslados atómicos.
- `purchase_order_detail_id` (INT, FK -> purchase_order_details.id, NULL)
- `notes` (TEXT)

### 2.11. `reorder_alerts`
Registro persistente de alertas cuando el stock físico cae por debajo del punto de reorden.
- `id` (INT, PK, Auto-increment)
- `material_id` (INT, FK -> materials.id, NOT NULL)
- `location_id` (INT, FK -> locations.id, NULL)
- `current_stock` (DECIMAL(12,2), NOT NULL)
- `reorder_point` (DECIMAL(12,2), NOT NULL)
- `safety_stock` (DECIMAL(12,2), NOT NULL)
- `alert_date` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
- `status` (ENUM('activa', 'en_revision', 'resuelta'), DEFAULT 'activa')
- `notes` (TEXT)

### 2.12. `duplicate_purchase_alerts`
Detección de coincidencias entre órdenes según las reglas del ejercicio A3.
- `id` (INT, PK, Auto-increment)
- `purchase_order_id_1` (INT, FK -> purchase_orders.id)
- `purchase_order_id_2` (INT, FK -> purchase_orders.id)
- `supplier_id` (INT, FK -> suppliers.id)
- `material_id` (INT, FK -> materials.id)
- `qty_1` (DECIMAL(12,2))
- `qty_2` (DECIMAL(12,2))
- `date_1` (DATE)
- `date_2` (DATE)
- `risk_level` (ENUM('medio', 'alto', 'critico'))
- `match_reason` (VARCHAR(255))
- `status` (ENUM('pendiente_revision', 'confirmada', 'no_duplicada'))
- `reviewed_by` (INT, FK -> users.id, NULL)
- `review_notes` (TEXT)
- `reviewed_at` (DATETIME)

### 2.13. `split_purchase_alerts`
Detección preventiva de compras fraccionadas para evadir límites de autorización.
- `id` (INT, PK, Auto-increment)
- `supplier_id` (INT, FK -> suppliers.id)
- `requesting_department` (VARCHAR(80))
- `project_name` (VARCHAR(100))
- `detected_orders` (TEXT): Array JSON de números de orden agrupadas.
- `total_accumulated_amount` (DECIMAL(14,2))
- `threshold_exceeded` (DECIMAL(14,2))
- `status` (ENUM('pendiente_revision', 'justificada', 'irregularidad_confirmada'))

### 2.14. `audit_logs`
Trazabilidad de seguridad para acciones administrativas y modificaciones de datos.
- `id` (INT, PK, Auto-increment)
- `user_id` (INT, FK -> users.id, NULL)
- `action` (VARCHAR(60))
- `entity` (VARCHAR(60))
- `entity_id` (INT)
- `old_values` (JSON)
- `new_values` (JSON)
- `ip_address` (VARCHAR(45))
- `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

