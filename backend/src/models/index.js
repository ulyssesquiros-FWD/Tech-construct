const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Category = require('./Category');
const Material = require('./Material');
const Location = require('./Location');
const Supplier = require('./Supplier');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderDetail = require('./PurchaseOrderDetail');
const Approval = require('./Approval');
const InventoryMovement = require('./InventoryMovement');
const ReorderAlert = require('./ReorderAlert');
const DuplicatePurchaseAlert = require('./DuplicatePurchaseAlert');
const SplitPurchaseAlert = require('./SplitPurchaseAlert');
const AuditLog = require('./AuditLog');

// 1. Roles & Users
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// 2. Categories (Taxonomía jerárquica)
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parentCategory' });

Category.hasMany(Material, { foreignKey: 'category_id', as: 'materials' });
Material.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Category.hasMany(Material, { foreignKey: 'subcategory_id', as: 'subcategoryMaterials' });
Material.belongsTo(Category, { foreignKey: 'subcategory_id', as: 'subcategory' });

// 3. Purchase Orders
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplier_id', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

Location.hasMany(PurchaseOrder, { foreignKey: 'location_id', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

User.hasMany(PurchaseOrder, { foreignKey: 'created_by', as: 'createdPurchaseOrders' });
PurchaseOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// 4. Purchase Order Details
PurchaseOrder.hasMany(PurchaseOrderDetail, { foreignKey: 'purchase_order_id', as: 'details' });
PurchaseOrderDetail.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });

Material.hasMany(PurchaseOrderDetail, { foreignKey: 'material_id', as: 'orderDetails' });
PurchaseOrderDetail.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

// 5. Approvals
PurchaseOrder.hasMany(Approval, { foreignKey: 'purchase_order_id', as: 'approvals' });
Approval.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });

User.hasMany(Approval, { foreignKey: 'user_id', as: 'approvals' });
Approval.belongsTo(User, { foreignKey: 'user_id', as: 'approver' });

// 6. Inventory Movements
Material.hasMany(InventoryMovement, { foreignKey: 'material_id', as: 'movements' });
InventoryMovement.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

Location.hasMany(InventoryMovement, { foreignKey: 'location_id', as: 'movements' });
InventoryMovement.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

Location.hasMany(InventoryMovement, { foreignKey: 'destination_location_id', as: 'destinationMovements' });
InventoryMovement.belongsTo(Location, { foreignKey: 'destination_location_id', as: 'destinationLocation' });

User.hasMany(InventoryMovement, { foreignKey: 'user_id', as: 'movements' });
InventoryMovement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

PurchaseOrderDetail.hasMany(InventoryMovement, { foreignKey: 'purchase_order_detail_id', as: 'movements' });
InventoryMovement.belongsTo(PurchaseOrderDetail, { foreignKey: 'purchase_order_detail_id', as: 'purchaseOrderDetail' });

// 7. Reorder Alerts
Material.hasMany(ReorderAlert, { foreignKey: 'material_id', as: 'reorderAlerts' });
ReorderAlert.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

Location.hasMany(ReorderAlert, { foreignKey: 'location_id', as: 'reorderAlerts' });
ReorderAlert.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

// 8. Duplicate Purchase Alerts
PurchaseOrder.hasMany(DuplicatePurchaseAlert, { foreignKey: 'purchase_order_id_1', as: 'duplicateAlertsAsOrder1' });
DuplicatePurchaseAlert.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id_1', as: 'order1' });

PurchaseOrder.hasMany(DuplicatePurchaseAlert, { foreignKey: 'purchase_order_id_2', as: 'duplicateAlertsAsOrder2' });
DuplicatePurchaseAlert.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id_2', as: 'order2' });

Supplier.hasMany(DuplicatePurchaseAlert, { foreignKey: 'supplier_id', as: 'duplicateAlerts' });
DuplicatePurchaseAlert.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

Material.hasMany(DuplicatePurchaseAlert, { foreignKey: 'material_id', as: 'duplicateAlerts' });
DuplicatePurchaseAlert.belongsTo(Material, { foreignKey: 'material_id', as: 'material' });

User.hasMany(DuplicatePurchaseAlert, { foreignKey: 'reviewed_by', as: 'reviewedDuplicates' });
DuplicatePurchaseAlert.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

// 9. Split Purchase Alerts
Supplier.hasMany(SplitPurchaseAlert, { foreignKey: 'supplier_id', as: 'splitAlerts' });
SplitPurchaseAlert.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });

Category.hasMany(SplitPurchaseAlert, { foreignKey: 'category_id', as: 'splitAlerts' });
SplitPurchaseAlert.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 10. Audit Logs
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Role,
  User,
  Category,
  Material,
  Location,
  Supplier,
  PurchaseOrder,
  PurchaseOrderDetail,
  Approval,
  InventoryMovement,
  ReorderAlert,
  DuplicatePurchaseAlert,
  SplitPurchaseAlert,
  AuditLog
};

