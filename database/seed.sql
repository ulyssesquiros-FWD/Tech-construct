-- =============================================================================
-- DATOS SEMILLA: gestion_inventarios
-- Empresa: Tech-Construct S.A.
-- Cumplimiento de Casos de Prueba y Ejercicios A2, A3 y A5 (Quiz #2)
-- =============================================================================

USE `gestion_inventarios`;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `split_purchase_alerts`;
TRUNCATE TABLE `duplicate_purchase_alerts`;
TRUNCATE TABLE `reorder_alerts`;
TRUNCATE TABLE `inventory_movements`;
TRUNCATE TABLE `approvals`;
TRUNCATE TABLE `purchase_order_details`;
TRUNCATE TABLE `purchase_orders`;
TRUNCATE TABLE `materials`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `locations`;
TRUNCATE TABLE `suppliers`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. ROLES
-- -----------------------------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Administrador del Sistema', 'Acceso global a todos los módulos y configuraciones'),
(2, 'Jefatura de Área Solicitante', 'Autorizado para aprobar compras de hasta ₡250 000 (1 cotización)'),
(3, 'Jefatura de Compras', 'Gestión de compras, cotizaciones y aprobación de ₡250 001 a ₡2 000 000'),
(4, 'Gerencia Financiera', 'Aprobación de compras de ₡2 000 001 a ₡10 000 000 (3 cotizaciones)'),
(5, 'Gerencia General', 'Aprobación de compras de más de ₡10 000 000 (3 cotizaciones + comité)'),
(6, 'Encargado de Bodega', 'Registro de movimientos de inventario, recepciones y transferencias');

-- -----------------------------------------------------------------------------
-- 2. USUARIOS
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `role_id`, `full_name`, `email`, `password_hash`, `department`, `status`) VALUES
(1, 1, 'Ulysses', 'ulysses@techconstruct.cr', '$2b$10$abcdefghijklmnopqrstuv', 'Dirección General / Tecnología', 'activo'),
(2, 2, 'Ing. Roberto Méndez', 'obras@techconstruct.cr', '$2b$10$abcdefghijklmnopqrstuv', 'Obras Civiles', 'activo'),
(3, 2, 'Ing. Lucía Valverde', 'mantenimiento@techconstruct.cr', '$2b$10$abcdefghijklmnopqrstuv', 'Mantenimiento', 'activo'),
(4, 3, 'Lic. Esteban Solís', 'compras@techconstruct.cr', '$2b$10$abcdefghijklmnopqrstuv', 'Adquisiciones', 'activo'),
(5, 4, 'Licda. Mariana Cordero', 'financiera@techconstruct.cr', '$2b$10$abcdefghijklmnopqrstuv', 'Gerencia Financiera', 'activo'),
(6, 5, 'Ing. Fernando Del Valle', 'gerencia@techconstruct.cr', '$2b$10$abcdefghijklmnopqrstuv', 'Gerencia General', 'activo'),
(7, 6, 'Jorge Ramírez Soto', 'bodega@techconstruct.cr', '$2b$10$abcdefghijklmnopqrstuv', 'Logística y Bodega', 'activo');

-- -----------------------------------------------------------------------------
-- 3. CATEGORÍAS (Taxonomía Estandarizada de 2 Niveles: Categoría -> Subcategoría)
-- -----------------------------------------------------------------------------
INSERT INTO `categories` (`id`, `code`, `name`, `description`, `parent_id`) VALUES
(1, 'MAT', 'Materiales de Construcción', 'Categoría principal para agregados, conglomerantes y aceros estructurales', NULL),
(2, 'SEG', 'Seguridad y Protección Ocupacional', 'Equipos de protección personal (EPP) y seguridad en obras', NULL),
(3, 'TUB', 'Tuberías y Fontanería', 'Tuberías hidráulicas, sanitarias, accesorios y canalizaciones', NULL),
(4, 'HER', 'Herramientas y Equipos Menores', 'Herramientas de mano, eléctricas e insumos de corte', NULL),

-- Subcategorías de MAT (Nivel 2)
(5, 'MAT-CEM', 'Cementos y Conglomerantes', 'Cementos grises, blancos y aglomerantes hidráulicos', 1),
(6, 'MAT-ACE', 'Aceros y Perfiles Estructurales', 'Varillas corrugadas, alambrón, mallas y hierro laminado', 1),
(7, 'MAT-BLO', 'Mampostería y Bloques', 'Bloques de concreto, ladrillos y adoquines', 1),
(8, 'MAT-AGR', 'Agregados y Arenas', 'Arena fina, arena de río, piedra cuarta y gravas', 1),

-- Subcategorías de SEG (Nivel 2)
(9, 'SEG-GUA', 'Guantes de Protección', 'Guantes de nitrilo, cuero, carnaza y protección mecánica', 2),

-- Subcategorías de TUB (Nivel 2)
(10, 'TUB-PVC', 'Tuberías PVC y Conexiones', 'Tubería cédula 40, SDR y accesorios para conducción de fluidos', 3);

-- -----------------------------------------------------------------------------
-- 4. MATERIALES (Ejercicios A2 y A5 del Quiz #2)
-- -----------------------------------------------------------------------------
INSERT INTO `materials` (`id`, `internal_code`, `name`, `category_id`, `subcategory_id`, `unit`, `description`, `min_stock`, `max_stock`, `avg_daily_demand`, `max_daily_demand`, `lead_time_days`, `safety_stock`, `reorder_point`, `standard_price`, `status`) VALUES
-- Ejercicio A2 #1 y A5 (Cemento gris 50 kg)
(1, 'MAT-CEM-GRIS-050', 'Cemento gris 50 kg', 1, 5, 'saco', 'Saco de cemento Portland gris 50 kg para uso estructural en obras', 50.00, 500.00, 40.00, 55.00, 3, 45.00, 165.00, 6300.00, 'activo'),

-- Ejercicio A2 #2 (Saco cemento uso general)
(2, 'MAT-CEM-USO-GEN', 'Saco cemento uso general 50 kg', 1, 5, 'saco', 'Cemento hidráulico para uso general y mantenimiento', 20.00, 150.00, 10.00, 15.00, 3, 15.00, 45.00, 6300.00, 'activo'),

-- Ejercicio A2 #3 (CEM-GRIS-50 - equivalencia de código)
(3, 'MAT-CEM-GRIS-50B', 'CEM-GRIS-50 (Lote Bodega)', 1, 5, 'saco', 'Lote de cemento gris 50 kg registrado bajo nomenclatura abreviada', 50.00, 600.00, 40.00, 55.00, 3, 45.00, 165.00, 6300.00, 'activo'),

-- Ejercicio A2 #4 y A5 (Varilla #3 grado 40)
(4, 'MAT-ACE-VAR-003', 'Varilla #3 grado 40 (3/8)', 1, 6, 'varilla', 'Varilla corrugada de acero grado 40 diámetro 3/8 pulgada longitud estándar 6m', 200.00, 2000.00, 120.00, 160.00, 5, 200.00, 800.00, 2050.00, 'activo'),

-- Ejercicio A2 #5 (Hierro 3/8 x 6 m)
(5, 'MAT-ACE-HIE-386', 'Hierro 3/8 x 6 m comercial', 1, 6, 'varilla', 'Barra lisa/corrugada de hierro 3/8 x 6 m para mantenimiento', 30.00, 300.00, 15.00, 25.00, 4, 40.00, 100.00, 2050.00, 'activo'),

-- Ejercicio A2 #6 (Guantes de nitrilo talla L)
(6, 'SEG-GUA-NIT-L', 'Guantes de nitrilo talla L', 2, 9, 'par', 'Guantes de nitrilo color verde resistente a químicos y solventes talla L', 30.00, 300.00, 10.00, 20.00, 2, 20.00, 40.00, 850.00, 'activo'),

-- Ejercicio A2 #7 (Guantes trabajo L)
(7, 'SEG-GUA-TRA-L', 'Guantes de trabajo carnaza talla L', 2, 9, 'par', 'Guantes reforzados de cuero/carnaza para obra pesada talla L', 20.00, 250.00, 8.00, 15.00, 3, 21.00, 45.00, 1200.00, 'activo'),

-- Ejercicio A2 #8 (Tubo PVC 1/2 SDR 13.5)
(8, 'TUB-PVC-012-SDR135', 'Tubo PVC 1/2 SDR 13.5 x 6m', 3, 10, 'tubo', 'Tubería de PVC rígido para agua potable presión 1/2 pulgada SDR 13.5 tramo 6m', 10.00, 100.00, 5.00, 10.00, 3, 15.00, 30.00, 2900.00, 'activo'),

-- Ejercicio A5 (Block 12 x 20 x 40)
(9, 'MAT-BLO-122040', 'Block de concreto 12 × 20 × 40 cm', 1, 7, 'unidad', 'Bloque de concreto vibrado estructural clase A de 12x20x40 cm', 500.00, 8000.00, 600.00, 900.00, 4, 1200.00, 3600.00, 650.00, 'activo'),

-- Ejercicio A5 (Arena m³)
(10, 'MAT-AGR-ARE-M3', 'Arena fina de río lavada (m³)', 1, 8, 'm3', 'Metro cúbico de arena fina para confección de morteros y concretos', 5.00, 50.00, 6.00, 10.00, 2, 8.00, 20.00, 18500.00, 'activo');

-- -----------------------------------------------------------------------------
-- 5. UBICACIONES (Bodegas y Obras de la Empresa)
-- -----------------------------------------------------------------------------
INSERT INTO `locations` (`id`, `code`, `name`, `type`, `address`, `status`) VALUES
(1, 'BOD-CENTRAL', 'Bodega Central - Alajuela', 'bodega', 'Parque Logístico Coyol, Bodega 14, Alajuela', 'activo'),
(2, 'BOD-OBRAS', 'Bodega de Obras - San José', 'bodega', 'Calle Blancos, 200m Este de la Pozuelo, San José', 'activo'),
(3, 'OBR-NORTE', 'Obra Norte - Condominio Las Terrazas', 'obra', 'San Isidro de Heredia, Sector El Castillo', 'activo'),
(4, 'OBR-SUR', 'Obra Sur - Puente Interurbano Paso Ancho', 'obra', 'Rotonda de Paso Ancho, San José', 'activo'),
(5, 'OBR-ESTE', 'Obra Este - Centro Comercial Escazú', 'obra', 'Guachipelín de Escazú, Carretera a Multiplaza', 'activo');

-- -----------------------------------------------------------------------------
-- 6. PROVEEDORES (Proveedores A a F del Quiz + Evaluados A4)
-- -----------------------------------------------------------------------------
INSERT INTO `suppliers` (`id`, `code`, `commercial_name`, `legal_name`, `tax_id`, `phone`, `email`, `address`, `contact_person`, `status`) VALUES
(1, 'PROV-A', 'Proveedor A (Distribuidora El Roble)', 'Distribuidora de Materiales El Roble S.A.', '3-101-445892', '+506 2440-1122', 'ventas@elroble.cr', 'La Uruca, frente a RECOPE, San José', 'Mariano Rojas (Ejecutivo Clave)', 'activo'),
(2, 'PROV-B', 'Proveedor B (Materiales & Acabados)', 'Suministros y Materiales del Centro Ltda.', '3-102-887123', '+506 2221-8899', 'contacto@materialesdelcentro.cr', 'Barrio México, 300m Norte de la iglesia', 'Silvia Chanto', 'activo'),
(3, 'PROV-C', 'Proveedor C (Aceros del Valle)', 'Aceros Industriales del Valle S.A.', '3-101-998811', '+506 2573-4000', 'ventas@acerosdelvalle.cr', 'Cartago, Zona Industrial Zeta', 'Ing. Gabriel Mora', 'activo'),
(4, 'PROV-D', 'Proveedor D (Ferretería & Suministros)', 'Ferretería y Servicios Industriales D&S', '3-103-665544', '+506 2261-0011', 'ordenes@ferreteriasuministros.cr', 'Heredia Centro, Costado Sur del estadio', 'Alonso Durán', 'activo'),
(5, 'PROV-E', 'Proveedor E (Equipos y Seguridad)', 'Equipos y Seguridad Industrial del Istmo S.A.', '3-101-332211', '+506 2290-7766', 'seguridad@equiposindustriales.cr', 'Pavas, Zona Industrial Oeste', 'Karla Brenes', 'activo'),
(6, 'PROV-F', 'Proveedor F (Protección Laboral)', 'Soluciones de Protección Laboral S.A.', '3-101-554433', '+506 2289-5500', 'info@proteccionlaboral.cr', 'Santa Ana, Centro Comercial Plaza Antigua', 'Rodrigo Salazar', 'activo'),
(7, 'PROV-NOVEX', 'Novex S.A.', 'Ferretería Novex de Costa Rica S.A.', '3-101-119988', '+506 2506-4400', 'corporativo@novex.cr', 'Curridabat y Escazú', 'Javier Campos', 'activo'),
(8, 'PROV-CONSTRU', 'Construplaza S.A.', 'Materiales Construplaza S.A.', '3-101-778844', '+506 2288-2000', 'proyectos@construplaza.cr', 'Guachipelín de Escazú', 'Elena Carvajal', 'activo'),
(9, 'PROV-EPA', 'EPA S.A.', 'Ferreterías EPA S.A.', '3-101-667799', '+506 2539-7000', 'ventasinstitucionales@cr.epa.biz', 'Curridabat, Escazú, Belén y Desamparados', 'Felipe Quirós', 'activo');

-- -----------------------------------------------------------------------------
-- 7. ÓRDENES DE COMPRA (Ejercicio A3 del Quiz #2 + Casos de Matriz y Fraccionamiento)
-- -----------------------------------------------------------------------------
-- OC-1041: 02/10, Obras, Proveedor A, Cemento gris 50 kg, 200 cant, ₡6 450 = ₡1 290 000
INSERT INTO `purchase_orders` (`id`, `po_number`, `supplier_id`, `location_id`, `requesting_department`, `project_name`, `order_date`, `expected_date`, `subtotal`, `tax`, `total`, `required_approval_level`, `required_quotations`, `attached_quotations_count`, `status`, `created_by`, `notes`) VALUES
(1, 'OC-1041', 1, 3, 'Obras', 'Obra Norte - Las Terrazas', '2026-10-02', '2026-10-05', 1290000.00, 0.00, 1290000.00, 'Jefatura de Compras', 2, 2, 'emitida', 2, 'Requisición inicial para colado losa nivel 2'),

-- OC-1042: 02/10, Obras, Proveedor A, Cemento gris 50 kg, 200 cant, ₡6 450 = ₡1 290 000 (¡ALERTA DUPLICADA!)
(2, 'OC-1042', 1, 3, 'Obras', 'Obra Norte - Las Terrazas', '2026-10-02', '2026-10-05', 1290000.00, 0.00, 1290000.00, 'Jefatura de Compras', 2, 2, 'emitida', 2, 'Requisición registrada el mismo día por capataz auxiliar - Sospecha de duplicidad con OC-1041'),

-- OC-1047: 06/10, Mantenimiento, Proveedor B, Cemento gris 50 kg, 40 cant, ₡7 100 = ₡284 000
(3, 'OC-1047', 2, 1, 'Mantenimiento', 'Mantenimiento General Campamento', '2026-10-06', '2026-10-09', 284000.00, 0.00, 284000.00, 'Jefatura de Compras', 2, 2, 'recibida', 3, 'Compra urgente por reparación de pisos en bodega'),

-- OC-1050: 08/10, Obras, Proveedor C, Varilla #3, 500 cant, ₡2 150 = ₡1 075 000
(4, 'OC-1050', 3, 3, 'Obras', 'Obra Norte - Las Terrazas', '2026-10-08', '2026-10-13', 1075000.00, 0.00, 1075000.00, 'Jefatura de Compras', 2, 2, 'recibida', 2, 'Refuerzo columnas eje central'),

-- OC-1053: 09/10, Obras, Proveedor C, Varilla #3, 480 cant, ₡2 150 = ₡1 032 000
(5, 'OC-1053', 3, 3, 'Obras', 'Obra Norte - Las Terrazas', '2026-10-09', '2026-10-14', 1032000.00, 0.00, 1032000.00, 'Jefatura de Compras', 2, 2, 'recibida', 2, 'Refuerzo vigas corona y amarre'),

-- OC-1058: 13/10, Mantenimiento, Proveedor D, Varilla #3, 60 cant, ₡2 600 = ₡156 000
(6, 'OC-1058', 4, 1, 'Mantenimiento', 'Taller Central de Encofrados', '2026-10-13', '2026-10-16', 156000.00, 0.00, 156000.00, 'Jefatura del área solicitante', 1, 1, 'recibida', 3, 'Estructura soporte para techos temporales'),

-- OC-1061: 15/10, Bodega, Proveedor A, Cemento gris 50 kg, 300 cant, ₡6 300 = ₡1 890 000
(7, 'OC-1061', 1, 1, 'Bodega', 'Reabastecimiento General', '2026-10-15', '2026-10-18', 1890000.00, 0.00, 1890000.00, 'Jefatura de Compras', 2, 2, 'recibida', 4, 'Compra bajo contrato marco con precio vigente ₡6 300'),

-- Caso adicional para Demostración de Matriz: Nivel Gerencia Financiera (₡3 000 000 - 3 cotizaciones)
(8, 'OC-2026-001', 3, 1, 'Obras', 'Obra Sur - Paso Ancho', '2026-10-20', '2026-10-28', 3000000.00, 0.00, 3000000.00, 'Gerencia Financiera', 3, 3, 'pendiente_aprobacion', 2, 'Lote masivo de acero estructural para pilotes'),

-- Caso adicional para Demostración de Matriz: Nivel Gerencia General (> ₡10 000 000 - 3 cotizaciones + comité)
(9, 'OC-2026-002', 1, 1, 'Obras', 'Obra Este - Escazú', '2026-10-22', '2026-11-05', 12500000.00, 0.00, 12500000.00, 'Gerencia General', 3, 3, 'pendiente_aprobacion', 2, 'Suministro integral de cemento y agregados primera etapa');

-- -----------------------------------------------------------------------------
-- 8. DETALLES DE ÓRDENES DE COMPRA
-- -----------------------------------------------------------------------------
INSERT INTO `purchase_order_details` (`id`, `purchase_order_id`, `material_id`, `quantity`, `unit_price`, `subtotal`, `received_quantity`) VALUES
(1, 1, 1, 200.00, 6450.00, 1290000.00, 0.00),
(2, 2, 1, 200.00, 6450.00, 1290000.00, 0.00),
(3, 3, 1, 40.00, 7100.00, 284000.00, 40.00),
(4, 4, 4, 500.00, 2150.00, 1075000.00, 500.00),
(5, 5, 4, 480.00, 2150.00, 1032000.00, 480.00),
(6, 6, 4, 60.00, 2600.00, 156000.00, 60.00),
(7, 7, 1, 300.00, 6300.00, 1890000.00, 300.00),
(8, 8, 4, 1463.41, 2050.00, 3000000.00, 0.00),
(9, 9, 1, 1984.12, 6300.00, 12500000.00, 0.00);

-- -----------------------------------------------------------------------------
-- 9. APROBACIONES DE COMPRA
-- -----------------------------------------------------------------------------
INSERT INTO `approvals` (`id`, `purchase_order_id`, `user_id`, `approval_level`, `required_quotations`, `attached_quotations_count`, `status`, `comments`, `decision_date`) VALUES
(1, 1, 4, 'Jefatura de Compras', 2, 2, 'aprobada', 'Aprobada según disponibilidad presupuestaria', '2026-10-02 14:30:00'),
(2, 2, 4, 'Jefatura de Compras', 2, 2, 'aprobada', 'Aprobada preliminarmente sin percatarse de similitud con OC-1041', '2026-10-02 16:15:00'),
(3, 3, 4, 'Jefatura de Compras', 2, 2, 'aprobada', 'Aprobación por reparación urgente', '2026-10-06 10:00:00'),
(4, 4, 4, 'Jefatura de Compras', 2, 2, 'aprobada', 'Validado proveedor C con despacho inmediato', '2026-10-08 11:20:00'),
(5, 5, 4, 'Jefatura de Compras', 2, 2, 'aprobada', 'Segundo lote para misma obra', '2026-10-09 09:45:00'),
(6, 6, 3, 'Jefatura del área solicitante', 1, 1, 'aprobada', 'Aprobado directamente por montos menores a ₡250 000', '2026-10-13 08:30:00'),
(7, 7, 4, 'Jefatura de Compras', 2, 2, 'aprobada', 'Reabastecimiento regular bajo precio de contrato', '2026-10-15 15:00:00'),
(8, 8, 5, 'Gerencia Financiera', 3, 3, 'pendiente', 'En revisión de flujo de caja para autorizar ₡3 000 000', NULL),
(9, 9, 6, 'Gerencia General', 3, 3, 'pendiente', 'Pendiente sesión de comité de adquisiciones para monto superior a ₡10 000 000', NULL);

-- -----------------------------------------------------------------------------
-- 10. MOVIMIENTOS DE INVENTARIO (Demostración de Existencias del Ejercicio A5)
-- Cemento gris 50 kg: 190 unidades (Normal, ROP: 165)
-- Varilla #3: 850 unidades (Normal, ROP: 800)
-- Block 12x20x40: 2 800 unidades (REPONER, ROP: 3 600)
-- Arena m³: 14 m³ (REPONER, ROP: 20)
-- -----------------------------------------------------------------------------
INSERT INTO `inventory_movements` (`id`, `movement_number`, `material_id`, `location_id`, `movement_type`, `quantity`, `unit_cost`, `balance_after`, `movement_date`, `user_id`, `source_document_type`, `source_document_id`, `destination_location_id`, `transfer_group_id`, `purchase_order_detail_id`, `notes`) VALUES
-- Cemento gris: Entrada inicial de 250 sacos en Bodega Central
(1, 'MOV-2026-0001', 1, 1, 'entrada', 250.00, 6300.00, 250.00, '2026-10-10 08:00:00', 7, 'demostracion_inicial', 'DEMO-INI-001', NULL, NULL, NULL, 'Recepción de lote inicial en Bodega Central'),

-- Cemento gris: Salida de 60 sacos para fundaciones auxiliares
(2, 'MOV-2026-0002', 1, 1, 'salida', 60.00, 6300.00, 190.00, '2026-10-12 11:30:00', 7, 'requisicion', 'REQ-OBR-101', NULL, NULL, NULL, 'Despacho a cuadrilla de obras menores (Saldo resultante: 190 sacos)'),

-- Varilla #3: Entrada inicial de 1000 varillas en Bodega Central
(3, 'MOV-2026-0003', 4, 1, 'entrada', 1000.00, 2050.00, 1000.00, '2026-10-08 09:00:00', 7, 'demostracion_inicial', 'DEMO-INI-002', NULL, NULL, NULL, 'Ingreso de atados de varilla #3 en patio de aceros'),

-- Varilla #3: Salida de 150 varillas para armaduría de canastas
(4, 'MOV-2026-0004', 4, 1, 'salida', 150.00, 2050.00, 850.00, '2026-10-11 14:00:00', 7, 'requisicion', 'REQ-OBR-102', NULL, NULL, NULL, 'Salida hacia taller de encofrados (Saldo resultante: 850 varillas)'),

-- Block 12x20x40: Entrada inicial de 4000 unidades en Bodega de Obras
(5, 'MOV-2026-0005', 9, 2, 'entrada', 4000.00, 650.00, 4000.00, '2026-10-05 07:30:00', 7, 'demostracion_inicial', 'DEMO-INI-003', NULL, NULL, NULL, 'Descarga directa de tarimas de bloques'),

-- Block 12x20x40: Salida de 1200 unidades para levantamiento de muros
(6, 'MOV-2026-0006', 9, 2, 'salida', 1200.00, 650.00, 2800.00, '2026-10-14 16:00:00', 7, 'requisicion', 'REQ-OBR-103', NULL, NULL, NULL, 'Salida para mampostería piso 1 (Saldo resultante: 2 800 blocks -> Bajo ROP 3 600)'),

-- Arena m³: Entrada de 30 m³ en Bodega Central
(7, 'MOV-2026-0007', 10, 1, 'entrada', 30.00, 18500.00, 30.00, '2026-10-07 10:00:00', 7, 'demostracion_inicial', 'DEMO-INI-004', NULL, NULL, NULL, 'Descarga de vagonetas de arena fina'),

-- Arena m³: Salida de 16 m³ para mortero y repellos
(8, 'MOV-2026-0008', 10, 1, 'salida', 16.00, 18500.00, 14.00, '2026-10-15 13:45:00', 7, 'requisicion', 'REQ-OBR-104', NULL, NULL, NULL, 'Consumo en mezcla de pega y repello (Saldo resultante: 14 m³ -> Bajo ROP 20)'),

-- Demostración de Traslado Inter-Bodegas: 50 sacos de cemento uso general
(9, 'MOV-2026-0009', 2, 1, 'entrada', 90.00, 6300.00, 90.00, '2026-10-01 08:00:00', 7, 'demostracion_inicial', 'DEMO-INI-005', NULL, NULL, NULL, 'Stock inicial cemento uso general en Bodega Central'),

-- Traslado Salida de Bodega Central a Obra Norte
(10, 'MOV-2026-0010', 2, 1, 'traslado', 50.00, 6300.00, 40.00, '2026-10-14 09:00:00', 7, 'traslado', 'TRF-2026-001', 3, 'TRF-GRP-001', NULL, 'Despacho traslado hacia Obra Norte'),

-- Traslado Entrada en Obra Norte
(11, 'MOV-2026-0011', 2, 3, 'traslado', 50.00, 6300.00, 50.00, '2026-10-14 11:30:00', 7, 'traslado', 'TRF-2026-001', 1, 'TRF-GRP-001', NULL, 'Recepción traslado procedente de Bodega Central');

-- -----------------------------------------------------------------------------
-- 11. ALERTAS DE REORDEN (Punto de Reorden según Ejercicio A5)
-- -----------------------------------------------------------------------------
INSERT INTO `reorder_alerts` (`id`, `material_id`, `location_id`, `current_stock`, `reorder_point`, `safety_stock`, `alert_date`, `status`, `notes`) VALUES
(1, 9, 2, 2800.00, 3600.00, 1200.00, '2026-10-14 16:05:00', 'activa', 'Alerta: Stock actual (2 800) inferior al Punto de Reorden (3 600). Cobertura estimada: 4.67 días.'),
(2, 10, 1, 14.00, 20.00, 8.00, '2026-10-15 13:50:00', 'activa', 'Alerta Crítica: Stock actual (14 m³) inferior al Punto de Reorden (20 m³). Cobertura estimada: 2.33 días (Máxima Urgencia).');

-- -----------------------------------------------------------------------------
-- 12. ALERTAS DE ÓRDENES DUPLICADAS (Ejercicio A3: OC-1041 y OC-1042)
-- -----------------------------------------------------------------------------
INSERT INTO `duplicate_purchase_alerts` (`id`, `purchase_order_id_1`, `purchase_order_id_2`, `supplier_id`, `material_id`, `qty_1`, `qty_2`, `date_1`, `date_2`, `risk_level`, `match_reason`, `status`, `reviewed_by`, `review_notes`, `reviewed_at`) VALUES
(1, 1, 2, 1, 1, 200.00, 200.00, '2026-10-02', '2026-10-02', 'critico', 'Misma fecha (02/10), mismo proveedor (Distribuidora El Roble), mismo artículo (Cemento gris 50 kg) y cantidad idéntica (200 sacos). Exposición económica: ₡1 290 000.', 'pendiente_revision', NULL, NULL, NULL);

-- -----------------------------------------------------------------------------
-- 13. ALERTAS DE FRACCIONAMIENTO DE COMPRAS (Ejercicio A1 y Reglas de Negocio)
-- -----------------------------------------------------------------------------
INSERT INTO `split_purchase_alerts` (`id`, `supplier_id`, `requesting_department`, `project_name`, `category_id`, `detected_orders`, `total_accumulated_amount`, `threshold_exceeded`, `alert_date`, `status`, `review_notes`) VALUES
(1, 3, 'Obras', 'Obra Norte - Las Terrazas', 1, '["OC-1050", "OC-1053"]', 2107000.00, 2000000.00, '2026-10-09 10:00:00', 'pendiente_revision', 'Detección de 2 órdenes consecutivas para el mismo proyecto y proveedor en 24h (₡1 075 000 y ₡1 032 000) que individualmente aplican a Jefatura de Compras pero sumadas (₡2 107 000) superan el umbral de Gerencia Financiera.');

-- -----------------------------------------------------------------------------
-- 14. BITÁCORA DE AUDITORÍA
-- -----------------------------------------------------------------------------
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES
(1, 1, 'SISTEMA_INICIALIZADO', 'system', 1, NULL, '{"event": "Carga inicial de datos maestros y parámetros del Quiz #2"}', '127.0.0.1', '2026-10-01 00:00:00'),
(2, 4, 'ORDEN_COMPRA_CREADA', 'purchase_orders', 1, NULL, '{"po_number": "OC-1041", "total": 1290000}', '192.168.1.15', '2026-10-02 14:10:00'),
(3, 4, 'ORDEN_COMPRA_CREADA', 'purchase_orders', 2, NULL, '{"po_number": "OC-1042", "total": 1290000}', '192.168.1.15', '2026-10-02 16:00:00'),
(4, 7, 'MOVIMIENTO_REGISTRADO', 'inventory_movements', 1, NULL, '{"movement": "MOV-2026-0001", "qty": 250, "material": "MAT-CEM-GRIS-050"}', '192.168.1.40', '2026-10-10 08:05:00');

