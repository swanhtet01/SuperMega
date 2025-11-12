import { mysqlEnum, mysqlTable, text, timestamp, varchar, int, boolean, date, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "manager", "viewer"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Production Records - Daily tire production tracking
 */
export const productionRecords = mysqlTable("production_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productionDate: date("productionDate").notNull(),
  tireSize: varchar("tireSize", { length: 50 }).notNull(),
  tireType: varchar("tireType", { length: 50 }).notNull(),
  quantityProduced: int("quantityProduced").notNull(),
  quantityApproved: int("quantityApproved").notNull(),
  quantityRejected: int("quantityRejected").notNull(),
  shift: varchar("shift", { length: 20 }),
  batchNumber: varchar("batchNumber", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  dateIdx: index("production_date_idx").on(table.productionDate),
  sizeIdx: index("tire_size_idx").on(table.tireSize),
}));

export type ProductionRecord = typeof productionRecords.$inferSelect;
export type InsertProductionRecord = typeof productionRecords.$inferInsert;

/**
 * Quality Control Records
 */
export const qualityControlRecords = mysqlTable("quality_control_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productionRecordId: varchar("productionRecordId", { length: 64 }),
  inspectionDate: date("inspectionDate").notNull(),
  inspectorName: varchar("inspectorName", { length: 100 }),
  defectType: varchar("defectType", { length: 100 }),
  defectCount: int("defectCount").notNull(),
  passed: boolean("passed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  dateIdx: index("inspection_date_idx").on(table.inspectionDate),
}));

export type QualityControlRecord = typeof qualityControlRecords.$inferSelect;
export type InsertQualityControlRecord = typeof qualityControlRecords.$inferInsert;

/**
 * Raw Materials Inventory
 */
export const rawMaterials = mysqlTable("raw_materials", {
  id: varchar("id", { length: 64 }).primaryKey(),
  materialName: varchar("materialName", { length: 200 }).notNull(),
  materialCategory: varchar("materialCategory", { length: 100 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  currentStock: int("currentStock").notNull(),
  minimumStock: int("minimumStock").notNull(),
  unitCost: int("unitCost").notNull(),
  supplier: varchar("supplier", { length: 200 }),
  lastRestockDate: date("lastRestockDate"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  categoryIdx: index("material_category_idx").on(table.materialCategory),
}));

export type RawMaterial = typeof rawMaterials.$inferSelect;
export type InsertRawMaterial = typeof rawMaterials.$inferInsert;

/**
 * Finished Goods Inventory
 */
export const finishedGoods = mysqlTable("finished_goods", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tireSize: varchar("tireSize", { length: 50 }).notNull(),
  tireType: varchar("tireType", { length: 50 }).notNull(),
  currentStock: int("currentStock").notNull(),
  minimumStock: int("minimumStock").notNull(),
  unitPrice: int("unitPrice").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  sizeIdx: index("finished_tire_size_idx").on(table.tireSize),
}));

export type FinishedGood = typeof finishedGoods.$inferSelect;
export type InsertFinishedGood = typeof finishedGoods.$inferInsert;

/**
 * Dealers/Retailers Database
 */
export const dealers = mysqlTable("dealers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  dealerCode: varchar("dealerCode", { length: 50 }).notNull().unique(),
  dealerName: varchar("dealerName", { length: 200 }).notNull(),
  contactPerson: varchar("contactPerson", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  dealerType: varchar("dealerType", { length: 50 }),
  creditLimit: int("creditLimit"),
  outstandingBalance: int("outstandingBalance"),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  cityIdx: index("dealer_city_idx").on(table.city),
  statusIdx: index("dealer_status_idx").on(table.status),
}));

export type Dealer = typeof dealers.$inferSelect;
export type InsertDealer = typeof dealers.$inferInsert;

/**
 * Sales Orders
 */
export const salesOrders = mysqlTable("sales_orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderNumber: varchar("orderNumber", { length: 100 }).notNull().unique(),
  dealerId: varchar("dealerId", { length: 64 }).notNull(),
  orderDate: date("orderDate").notNull(),
  deliveryDate: date("deliveryDate"),
  totalAmount: int("totalAmount").notNull(),
  paidAmount: int("paidAmount").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "partial", "paid"]).default("unpaid").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  dealerIdx: index("order_dealer_idx").on(table.dealerId),
  dateIdx: index("order_date_idx").on(table.orderDate),
  statusIdx: index("order_status_idx").on(table.status),
}));

export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = typeof salesOrders.$inferInsert;

/**
 * Sales Order Items
 */
export const salesOrderItems = mysqlTable("sales_order_items", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderId: varchar("orderId", { length: 64 }).notNull(),
  tireSize: varchar("tireSize", { length: 50 }).notNull(),
  tireType: varchar("tireType", { length: 50 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  totalPrice: int("totalPrice").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  orderIdx: index("item_order_idx").on(table.orderId),
}));

export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = typeof salesOrderItems.$inferInsert;

/**
 * Financial Transactions
 */
export const financialTransactions = mysqlTable("financial_transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  transactionDate: date("transactionDate").notNull(),
  transactionType: mysqlEnum("transactionType", ["revenue", "expense", "asset", "liability"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  amount: int("amount").notNull(),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  dealerId: varchar("dealerId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  dateIdx: index("transaction_date_idx").on(table.transactionDate),
  typeIdx: index("transaction_type_idx").on(table.transactionType),
  categoryIdx: index("transaction_category_idx").on(table.category),
}));

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

/**
 * Production Targets
 */
export const productionTargets = mysqlTable("production_targets", {
  id: varchar("id", { length: 64 }).primaryKey(),
  targetMonth: varchar("targetMonth", { length: 7 }).notNull(),
  tireSize: varchar("tireSize", { length: 50 }).notNull(),
  targetQuantity: int("targetQuantity").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  monthIdx: index("target_month_idx").on(table.targetMonth),
}));

export type ProductionTarget = typeof productionTargets.$inferSelect;
export type InsertProductionTarget = typeof productionTargets.$inferInsert;

/**
 * System Alerts
 */
export const systemAlerts = mysqlTable("system_alerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  alertType: mysqlEnum("alertType", ["low_stock", "quality_issue", "production_delay", "payment_overdue"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  typeIdx: index("alert_type_idx").on(table.alertType),
  resolvedIdx: index("alert_resolved_idx").on(table.resolved),
}));

export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertSystemAlert = typeof systemAlerts.$inferInsert;

// ============================================
// DQMS (Digital Quality Management System) Tables
// ============================================

/**
 * Quality Inspections - Multi-stage inspection records
 * Stages: mixing, building, curing, final
 */
export const qualityInspections = mysqlTable("quality_inspections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  batchId: varchar("batchId", { length: 64 }).notNull(),
  stage: mysqlEnum("stage", ["mixing", "building", "curing", "final"]).notNull(),
  inspectorId: varchar("inspectorId", { length: 64 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  result: mysqlEnum("result", ["pass", "fail", "rework"]).notNull(),
  notes: text("notes"),
  supervisorId: varchar("supervisorId", { length: 64 }),
  approvedAt: timestamp("approvedAt"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
}, (table) => ({
  batchIdx: index("inspection_batch_idx").on(table.batchId),
  stageIdx: index("inspection_stage_idx").on(table.stage),
  statusIdx: index("inspection_status_idx").on(table.status),
}));

export type QualityInspection = typeof qualityInspections.$inferSelect;
export type InsertQualityInspection = typeof qualityInspections.$inferInsert;

/**
 * Defects - Individual defect records linked to inspections
 */
export const defects = mysqlTable("defects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  inspectionId: varchar("inspectionId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["visual", "dimensional", "structural", "material"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  severity: mysqlEnum("severity", ["minor", "major", "critical"]).notNull(),
  description: text("description").notNull(),
  photoUrl: text("photoUrl"),
  rootCause: text("rootCause"),
  correctiveAction: text("correctiveAction"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  inspectionIdx: index("defect_inspection_idx").on(table.inspectionId),
  typeIdx: index("defect_type_idx").on(table.type),
}));

export type Defect = typeof defects.$inferSelect;
export type InsertDefect = typeof defects.$inferInsert;

/**
 * Production Batches - Batch tracking with traceability
 */
export const productionBatches = mysqlTable("production_batches", {
  id: varchar("id", { length: 64 }).primaryKey(),
  batchNumber: varchar("batchNumber", { length: 100 }).notNull().unique(),
  productType: varchar("productType", { length: 100 }).notNull(),
  tireSize: varchar("tireSize", { length: 50 }).notNull(),
  quantity: int("quantity").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  productionLine: varchar("productionLine", { length: 50 }).notNull(),
  shift: mysqlEnum("shift", ["day", "night"]).notNull(),
  status: mysqlEnum("status", ["in_progress", "completed", "failed", "rework"]).default("in_progress").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  batchNumberIdx: index("batch_number_idx").on(table.batchNumber),
  statusIdx: index("batch_status_idx").on(table.status),
}));

export type ProductionBatch = typeof productionBatches.$inferSelect;
export type InsertProductionBatch = typeof productionBatches.$inferInsert;

/**
 * Batch Traceability - Links batches to materials, equipment, operators
 */
export const batchTraceability = mysqlTable("batch_traceability", {
  id: varchar("id", { length: 64 }).primaryKey(),
  batchId: varchar("batchId", { length: 64 }).notNull(),
  materialLotIds: text("materialLotIds"),
  equipmentId: varchar("equipmentId", { length: 64 }),
  operatorId: varchar("operatorId", { length: 64 }),
  mixingTemp: int("mixingTemp"),
  mixingTime: int("mixingTime"),
  curingTemp: int("curingTemp"),
  curingPressure: int("curingPressure"),
  curingTime: int("curingTime"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  batchIdx: index("traceability_batch_idx").on(table.batchId),
}));

export type BatchTraceability = typeof batchTraceability.$inferSelect;
export type InsertBatchTraceability = typeof batchTraceability.$inferInsert;

/**
 * Material Lots - Raw material tracking
 */
export const materialLots = mysqlTable("material_lots", {
  id: varchar("id", { length: 64 }).primaryKey(),
  lotNumber: varchar("lotNumber", { length: 100 }).notNull().unique(),
  materialType: varchar("materialType", { length: 100 }).notNull(),
  supplier: varchar("supplier", { length: 200 }).notNull(),
  receiptDate: timestamp("receiptDate").notNull(),
  expiryDate: timestamp("expiryDate"),
  qualityCert: text("qualityCert"),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["available", "in_use", "depleted", "quarantine"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  lotNumberIdx: index("lot_number_idx").on(table.lotNumber),
  statusIdx: index("lot_status_idx").on(table.status),
}));

export type MaterialLot = typeof materialLots.$inferSelect;
export type InsertMaterialLot = typeof materialLots.$inferInsert;

/**
 * Equipment - Production equipment tracking
 */
export const equipment = mysqlTable("equipment", {
  id: varchar("id", { length: 64 }).primaryKey(),
  equipmentCode: varchar("equipmentCode", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  type: mysqlEnum("type", ["mixer", "building_machine", "curing_press", "testing_equipment"]).notNull(),
  productionLine: varchar("productionLine", { length: 50 }),
  lastMaintenanceDate: timestamp("lastMaintenanceDate"),
  nextMaintenanceDate: timestamp("nextMaintenanceDate"),
  calibrationDate: timestamp("calibrationDate"),
  status: mysqlEnum("status", ["operational", "maintenance", "down"]).default("operational").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  codeIdx: index("equipment_code_idx").on(table.equipmentCode),
  statusIdx: index("equipment_status_idx").on(table.status),
}));

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

/**
 * Operators - Production operators/workers
 */
export const operators = mysqlTable("operators", {
  id: varchar("id", { length: 64 }).primaryKey(),
  employeeId: varchar("employeeId", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  shift: mysqlEnum("shift", ["day", "night", "rotating"]).notNull(),
  trainingRecords: text("trainingRecords"),
  certifications: text("certifications"),
  performanceScore: int("performanceScore"),
  status: mysqlEnum("status", ["active", "inactive", "on_leave"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  employeeIdx: index("operator_employee_idx").on(table.employeeId),
  statusIdx: index("operator_status_idx").on(table.status),
}));

export type Operator = typeof operators.$inferSelect;
export type InsertOperator = typeof operators.$inferInsert;

/**
 * Cost of Quality - Financial impact tracking
 */
export const costOfQuality = mysqlTable("cost_of_quality", {
  id: varchar("id", { length: 64 }).primaryKey(),
  date: date("date").notNull(),
  scrapCost: int("scrapCost").notNull().default(0),
  reworkCost: int("reworkCost").notNull().default(0),
  warrantyCost: int("warrantyCost").notNull().default(0),
  inspectionCost: int("inspectionCost").notNull().default(0),
  totalCOQ: int("totalCOQ").notNull().default(0),
  defectCount: int("defectCount").notNull().default(0),
  productionVolume: int("productionVolume").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  dateIdx: index("coq_date_idx").on(table.date),
}));

export type CostOfQuality = typeof costOfQuality.$inferSelect;
export type InsertCostOfQuality = typeof costOfQuality.$inferInsert;

/**
 * Quality Alerts - Real-time quality alerts
 */
export const qualityAlerts = mysqlTable("quality_alerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  alertType: varchar("alertType", { length: 100 }).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  message: text("message").notNull(),
  threshold: int("threshold"),
  currentValue: int("currentValue"),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  acknowledgedBy: varchar("acknowledgedBy", { length: 64 }),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active").notNull(),
}, (table) => ({
  statusIdx: index("quality_alert_status_idx").on(table.status),
  severityIdx: index("quality_alert_severity_idx").on(table.severity),
}));

export type QualityAlert = typeof qualityAlerts.$inferSelect;
export type InsertQualityAlert = typeof qualityAlerts.$inferInsert;

/**
 * Alert Rules - Configurable alert thresholds
 */
export const alertRules = mysqlTable("alert_rules", {
  id: varchar("id", { length: 64 }).primaryKey(),
  ruleName: varchar("ruleName", { length: 200 }).notNull(),
  metric: varchar("metric", { length: 100 }).notNull(),
  threshold: int("threshold").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  notificationChannels: text("notificationChannels"),
  escalationTime: int("escalationTime"),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  metricIdx: index("alert_rule_metric_idx").on(table.metric),
  enabledIdx: index("alert_rule_enabled_idx").on(table.enabled),
}));

export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof alertRules.$inferInsert;
