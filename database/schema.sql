-- =============================================================================
-- ESQUEMA DE BASE DE DATOS: gestion_inventarios
-- Empresa: Constructora Del Valle S.A.
-- Caso: Control de Inventario para Empresa de Construcción (Quiz #2)
-- Motor: MySQL 8.0+ / 9.0+
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `gestion_inventarios` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `gestion_inventarios`;

-- Desactivar temporalmente revisión de claves foráneas para recreación segura
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `split_purchase_alerts`;
DROP TABLE IF EXISTS `duplicate_purchase_alerts`;
DROP TABLE IF EXISTS `reorder_alerts`;
DROP TABLE IF EXISTS `inventory_movements`;
DROP TABLE IF EXISTS `approvals`;
DROP TABLE IF EXISTS `purchase_order_details`;
DROP TABLE IF EXISTS `purchase_orders`;
DROP TABLE IF EXISTS `materials`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `locations`;
DROP TABLE IF EXISTS `suppliers`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- 1. TABLA: roles
-- -----------------------------------------------------------------------------
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. TABLA: users
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `full_name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `department` VARCHAR(80) NOT NULL,
  `status` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. TABLA: categories (Taxonomía de 2 niveles: Categoría -> Subcategoría)
-- -----------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `parent_id` INT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. TABLA: materials (Artículos y materiales de construcción)
-- -----------------------------------------------------------------------------
CREATE TABLE `materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `internal_code` VARCHAR(40) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `category_id` INT NOT NULL,
  `subcategory_id` INT NULL,
  `unit` VARCHAR(25) NOT NULL,
  `description` TEXT NULL,
  `min_stock` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `max_stock` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `avg_daily_demand` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `max_daily_demand` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `lead_time_days` INT NOT NULL DEFAULT 1,
  `safety_stock` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `reorder_point` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `standard_price` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_materials_category` (`category_id`),
  INDEX `idx_materials_code` (`internal_code`),
  CONSTRAINT `fk_materials_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_materials_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. TABLA: locations (Bodegas y Obras de la Constructora)
-- -----------------------------------------------------------------------------
CREATE TABLE `locations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('bodega', 'obra') NOT NULL,
  `address` VARCHAR(255) NULL,
  `status` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. TABLA: suppliers (Proveedores comerciales)
-- -----------------------------------------------------------------------------
CREATE TABLE `suppliers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `commercial_name` VARCHAR(120) NOT NULL,
  `legal_name` VARCHAR(150) NOT NULL,
  `tax_id` VARCHAR(50) NOT NULL UNIQUE,
  `phone` VARCHAR(40) NULL,
  `email` VARCHAR(120) NULL,
  `address` VARCHAR(255) NULL,
  `contact_person` VARCHAR(100) NULL,
  `status` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. TABLA: purchase_orders (Órdenes de Compra con Matriz de Aprobación)
-- -----------------------------------------------------------------------------
CREATE TABLE `purchase_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `po_number` VARCHAR(30) NOT NULL UNIQUE,
  `supplier_id` INT NOT NULL,
  `location_id` INT NULL,
  `requesting_department` VARCHAR(80) NOT NULL,
  `project_name` VARCHAR(100) NULL,
  `order_date` DATE NOT NULL,
  `expected_date` DATE NULL,
  `subtotal` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `tax` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `required_approval_level` VARCHAR(80) NOT NULL,
  `required_quotations` INT NOT NULL DEFAULT 1,
  `attached_quotations_count` INT NOT NULL DEFAULT 1,
  `status` ENUM(
    'borrador',
    'pendiente_aprobacion',
    'aprobada',
    'emitida',
    'parcialmente_recibida',
    'recibida',
    'cancelada'
  ) NOT NULL DEFAULT 'borrador',
  `created_by` INT NOT NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_po_supplier` (`supplier_id`),
  INDEX `idx_po_date` (`order_date`),
  INDEX `idx_po_status` (`status`),
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_po_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_po_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. TABLA: purchase_order_details (Líneas de las Órdenes de Compra)
-- -----------------------------------------------------------------------------
CREATE TABLE `purchase_order_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `purchase_order_id` INT NOT NULL,
  `material_id` INT NOT NULL,
  `quantity` DECIMAL(12, 2) NOT NULL,
  `unit_price` DECIMAL(14, 2) NOT NULL,
  `subtotal` DECIMAL(14, 2) NOT NULL,
  `received_quantity` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pod_po` (`purchase_order_id`),
  INDEX `idx_pod_material` (`material_id`),
  CONSTRAINT `fk_pod_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_pod_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. TABLA: approvals (Historial de Aprobaciones del Flujo de Compras)
-- -----------------------------------------------------------------------------
CREATE TABLE `approvals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `purchase_order_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `approval_level` VARCHAR(80) NOT NULL,
  `required_quotations` INT NOT NULL DEFAULT 1,
  `attached_quotations_count` INT NOT NULL DEFAULT 1,
  `status` ENUM('pendiente', 'aprobada', 'rechazada') NOT NULL DEFAULT 'pendiente',
  `comments` TEXT NULL,
  `decision_date` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_approvals_po` (`purchase_order_id`),
  CONSTRAINT `fk_approvals_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `purchase_orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_approvals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. TABLA: inventory_movements (Libro Mayor de Movimientos de Inventario)
-- -----------------------------------------------------------------------------
CREATE TABLE `inventory_movements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `movement_number` VARCHAR(35) NOT NULL UNIQUE,
  `material_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `movement_type` ENUM('entrada', 'salida', 'traslado', 'ajuste_positivo', 'ajuste_negativo') NOT NULL,
  `quantity` DECIMAL(12, 2) NOT NULL,
  `unit_cost` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
  `balance_after` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `movement_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` INT NOT NULL,
  `source_document_type` ENUM(
    'orden_compra',
    'traslado',
    'requisicion',
    'ajuste_inventario',
    'demostracion_inicial'
  ) NOT NULL,
  `source_document_id` VARCHAR(50) NULL,
  `destination_location_id` INT NULL,
  `transfer_group_id` VARCHAR(50) NULL,
  `purchase_order_detail_id` INT NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_movements_material` (`material_id`),
  INDEX `idx_movements_location` (`location_id`),
  INDEX `idx_movements_date` (`movement_date`),
  INDEX `idx_movements_transfer` (`transfer_group_id`),
  CONSTRAINT `fk_mov_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_mov_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_mov_dest_location` FOREIGN KEY (`destination_location_id`) REFERENCES `locations` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_mov_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_mov_pod` FOREIGN KEY (`purchase_order_detail_id`) REFERENCES `purchase_order_details` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. TABLA: reorder_alerts (Alertas Automáticas de Reposición / Punto de Reorden)
-- -----------------------------------------------------------------------------
CREATE TABLE `reorder_alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `material_id` INT NOT NULL,
  `location_id` INT NULL,
  `current_stock` DECIMAL(12, 2) NOT NULL,
  `reorder_point` DECIMAL(12, 2) NOT NULL,
  `safety_stock` DECIMAL(12, 2) NOT NULL,
  `alert_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('activa', 'en_revision', 'resuelta') NOT NULL DEFAULT 'activa',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_reorder_status` (`status`),
  CONSTRAINT `fk_alert_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_alert_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 12. TABLA: duplicate_purchase_alerts (Detección de Órdenes Duplicadas)
-- -----------------------------------------------------------------------------
CREATE TABLE `duplicate_purchase_alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `purchase_order_id_1` INT NOT NULL,
  `purchase_order_id_2` INT NOT NULL,
  `supplier_id` INT NOT NULL,
  `material_id` INT NOT NULL,
  `qty_1` DECIMAL(12, 2) NOT NULL,
  `qty_2` DECIMAL(12, 2) NOT NULL,
  `date_1` DATE NOT NULL,
  `date_2` DATE NOT NULL,
  `risk_level` ENUM('medio', 'alto', 'critico') NOT NULL DEFAULT 'alto',
  `match_reason` VARCHAR(255) NOT NULL,
  `status` ENUM('pendiente_revision', 'confirmada', 'no_duplicada') NOT NULL DEFAULT 'pendiente_revision',
  `reviewed_by` INT NULL,
  `review_notes` TEXT NULL,
  `reviewed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dup_status` (`status`),
  CONSTRAINT `fk_dup_po1` FOREIGN KEY (`purchase_order_id_1`) REFERENCES `purchase_orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_dup_po2` FOREIGN KEY (`purchase_order_id_2`) REFERENCES `purchase_orders` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_dup_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_dup_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_dup_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 13. TABLA: split_purchase_alerts (Detección de Compras Fraccionadas)
-- -----------------------------------------------------------------------------
CREATE TABLE `split_purchase_alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `supplier_id` INT NOT NULL,
  `requesting_department` VARCHAR(80) NOT NULL,
  `project_name` VARCHAR(100) NULL,
  `category_id` INT NULL,
  `detected_orders` TEXT NOT NULL,
  `total_accumulated_amount` DECIMAL(14, 2) NOT NULL,
  `threshold_exceeded` DECIMAL(14, 2) NOT NULL,
  `alert_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pendiente_revision', 'justificada', 'irregularidad_confirmada') NOT NULL DEFAULT 'pendiente_revision',
  `review_notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_split_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_split_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 14. TABLA: audit_logs (Bitácora de Auditoría del Sistema)
-- -----------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `action` VARCHAR(60) NOT NULL,
  `entity` VARCHAR(60) NOT NULL,
  `entity_id` INT NULL,
  `old_values` JSON NULL,
  `new_values` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_entity` (`entity`, `entity_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- VISTA DE CONSULTA RÁPIDA: vw_current_inventory
-- Reconstruible en todo momento a partir del libro mayor de movimientos
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `vw_current_inventory` AS
SELECT 
  m.id AS material_id,
  m.internal_code,
  m.name AS material_name,
  m.unit,
  m.reorder_point,
  m.safety_stock,
  l.id AS location_id,
  l.name AS location_name,
  l.type AS location_type,
  COALESCE(SUM(
    CASE 
      WHEN im.movement_type IN ('entrada', 'ajuste_positivo') THEN im.quantity
      WHEN im.movement_type IN ('salida', 'ajuste_negativo') THEN -im.quantity
      ELSE 0
    END
  ), 0) AS stock_actual,
  CASE 
    WHEN COALESCE(SUM(
      CASE 
        WHEN im.movement_type IN ('entrada', 'ajuste_positivo') THEN im.quantity
        WHEN im.movement_type IN ('salida', 'ajuste_negativo') THEN -im.quantity
        ELSE 0
      END
    ), 0) <= m.reorder_point THEN 'REPONER'
    ELSE 'NORMAL'
  END AS estado_stock
FROM materials m
CROSS JOIN locations l
LEFT JOIN inventory_movements im 
  ON m.id = im.material_id AND l.id = im.location_id
WHERE m.status = 'activo' AND l.status = 'activo'
GROUP BY m.id, m.internal_code, m.name, m.unit, m.reorder_point, m.safety_stock, l.id, l.name, l.type;
