import { mysqlTable, mysqlEnum, varchar, text, int, date, timestamp, index, boolean, decimal, json } from "drizzle-orm/mysql-core";

/**
 * YANGON TYRE FACTORY - REMOTE MANAGEMENT SYSTEM
 * Complete schema for remote factory monitoring and management
 */

// ============================================
// USER & ROLE MANAGEMENT
// ============================================

/**
 * Users - 4 Role System
 * Supervisor (lowest) → Manager → Executive → Admin
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["supervisor", "manager", "executive", "admin"]).default("supervisor").notNull(),
  plant: mysqlEnum("plant", ["plant-a", "plant-b", "both"]).default("both"),
  department: mysqlEnum("department", ["production", "sales", "inventory", "finance", "all"]),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// PRODUCTION MODULE
// ============================================

/**
 * Production Records - YTF A/B/R Quality System
 */
export const productionRecords = mysqlTable("production_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  
  // Plant & Date
  plant: mysqlEnum("plant", ["plant-a", "plant-b"]).default("plant-a").notNull(),
  productionDate: date("productionDate").notNull(),
  batchNumber: varchar("batchNumber", { length: 100 }).notNull(),
  section: varchar("section", { length: 50 }).default("Section-07"),
  shiftType: mysqlEnum("shiftType", ["1-shift", "3-shift"]).notNull(),
  
  // Tire Info
  tireSize: varchar("tireSize", { length: 50 }).notNull(),
  batchCode: varchar("batchCode", { length: 20 }).notNull(),
  tireType: varchar("tireType", { length: 50 }), // R, L, AG, Grip, etc.
  
  // Targets
  target1Shift: int("target1Shift"),
  target3Shift: int("target3Shift"),
  
  // YTF Quality System: A (Approved), B (Defect), R (Rejected)
  curingA: int("curingA").default(0).notNull(),
  curingB: int("curingB").default(0).notNull(),
  curingR: int("curingR").default(0).notNull(),
  totalProduced: int("totalProduced").notNull(),
  
  // Weight Tracking
  specWeight: decimal("specWeight", { precision: 6, scale: 2 }).default("0.00").notNull(),
  weight1: decimal("weight1", { precision: 6, scale: 2 }),
  weight2: decimal("weight2", { precision: 6, scale: 2 }),
  weight3: decimal("weight3", { precision: 6, scale: 2 }),
  averageWeight: decimal("averageWeight", { precision: 6, scale: 2 }),
  totalWeight: decimal("totalWeight", { precision: 8, scale: 2 }),
  
  // Metadata
  supervisorName: varchar("supervisorName", { length: 100 }),
  enteredBy: varchar("enteredBy", { length: 64 }), // User ID
  notes: text("notes"),
  sourceFile: varchar("sourceFile", { length: 500 }), // If imported from Excel
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  dateIdx: index("prod_date_idx").on(table.productionDate),
  batchIdx: index("prod_batch_idx").on(table.batchNumber),
  sizeIdx: index("prod_size_idx").on(table.tireSize),
}));

export type ProductionRecord = typeof productionRecords.$inferSelect;
export type InsertProductionRecord = typeof productionRecords.$inferInsert;

/**
 * Flap Production Records
 */
export const flapRecords = mysqlTable("flap_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  productionDate: date("productionDate").notNull(),
  batchNumber: varchar("batchNumber", { length: 100 }).notNull(),
  flapSize: varchar("flapSize", { length: 100 }).notNull(),
  shiftType: mysqlEnum("shiftType", ["1-shift", "3-shift"]).notNull(),
  target: int("target"),
  quantityProduced: int("quantityProduced").notNull(),
  quantityDefective: int("quantityDefective").default(0),
  unitWeight: decimal("unitWeight", { precision: 6, scale: 2 }),
  totalWeight: decimal("totalWeight", { precision: 8, scale: 2 }),
  notes: text("notes"),
  enteredBy: varchar("enteredBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  dateIdx: index("flap_date_idx").on(table.productionDate),
}));

export type FlapRecord = typeof flapRecords.$inferSelect;
export type InsertFlapRecord = typeof flapRecords.$inferInsert;

// ============================================
// SALES MODULE
// ============================================

/**
 * Dealers
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
  creditLimit: int("creditLimit").default(0),
  currentBalance: int("currentBalance").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Dealer = typeof dealers.$inferSelect;
export type InsertDealer = typeof dealers.$inferInsert;

/**
 * Sales Orders
 */
export const salesOrders = mysqlTable("sales_orders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  orderNumber: varchar("orderNumber", { length: 100 }).notNull().unique(),
  orderDate: date("orderDate").notNull(),
  dealerId: varchar("dealerId", { length: 64 }).notNull(),
  dealerName: varchar("dealerName", { length: 200 }), // Denormalized
  totalAmount: int("totalAmount").notNull(),
  paidAmount: int("paidAmount").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "delivered", "paid", "cancelled"]).default("pending").notNull(),
  deliveryDate: date("deliveryDate"),
  paymentTerms: varchar("paymentTerms", { length: 100 }),
  notes: text("notes"),
  enteredBy: varchar("enteredBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  dateIdx: index("order_date_idx").on(table.orderDate),
  dealerIdx: index("order_dealer_idx").on(table.dealerId),
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
  tireType: varchar("tireType", { length: 50 }),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(),
  totalPrice: int("totalPrice").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  orderIdx: index("item_order_idx").on(table.orderId),
}));

export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = typeof salesOrderItems.$inferInsert;

// ============================================
// INVENTORY MODULE
// ============================================

/**
 * Raw Materials
 */
export const rawMaterials = mysqlTable("raw_materials", {
  id: varchar("id", { length: 64 }).primaryKey(),
  materialCode: varchar("materialCode", { length: 50 }).notNull().unique(),
  materialName: varchar("materialName", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  unit: varchar("unit", { length: 20 }).notNull(),
  currentStock: int("currentStock").notNull(),
  minimumStock: int("minimumStock").notNull(),
  unitCost: int("unitCost").notNull(),
  supplier: varchar("supplier", { length: 200 }),
  lastRestockDate: date("lastRestockDate"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  categoryIdx: index("material_category_idx").on(table.category),
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
  batchCode: varchar("batchCode", { length: 20 }),
  currentStock: int("currentStock").notNull(),
  minimumStock: int("minimumStock").notNull(),
  unitPrice: int("unitPrice").notNull(),
  location: varchar("location", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  sizeIdx: index("fg_size_idx").on(table.tireSize),
}));

export type FinishedGood = typeof finishedGoods.$inferSelect;
export type InsertFinishedGood = typeof finishedGoods.$inferInsert;

// ============================================
// FINANCIAL MODULE
// ============================================

/**
 * Financial Transactions
 */
export const financialTransactions = mysqlTable("financial_transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  transactionDate: date("transactionDate").notNull(),
  type: mysqlEnum("type", ["revenue", "expense", "payment_received", "payment_made"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: int("amount").notNull(),
  description: text("description"),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  relatedEntity: varchar("relatedEntity", { length: 200 }), // Dealer name, supplier name, etc.
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  notes: text("notes"),
  enteredBy: varchar("enteredBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  dateIdx: index("fin_date_idx").on(table.transactionDate),
  typeIdx: index("fin_type_idx").on(table.type),
  categoryIdx: index("fin_category_idx").on(table.category),
}));

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

// ============================================
// COMMUNITY & COMMUNICATION
// ============================================

/**
 * Announcements Board
 */
export const announcements = mysqlTable("announcements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["production", "sales", "hr", "safety", "maintenance", "general"]).notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  isPinned: boolean("isPinned").default(false).notNull(),
  targetRoles: text("targetRoles"), // JSON array of roles
  targetDepartments: text("targetDepartments"), // JSON array of departments
  scheduledFor: timestamp("scheduledFor"),
  expiresAt: timestamp("expiresAt"),
  attachments: text("attachments"), // JSON array of file URLs
  postedBy: varchar("postedBy", { length: 64 }).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  categoryIdx: index("ann_category_idx").on(table.category),
  priorityIdx: index("ann_priority_idx").on(table.priority),
  dateIdx: index("ann_date_idx").on(table.createdAt),
}));

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Schedule Calendar
 */
export const scheduleEvents = mysqlTable("schedule_events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  eventType: mysqlEnum("eventType", ["production", "maintenance", "meeting", "holiday", "training", "other"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  isAllDay: boolean("isAllDay").default(false).notNull(),
  location: varchar("location", { length: 200 }),
  participants: text("participants"), // JSON array of user IDs
  reminderBefore: int("reminderBefore"), // Minutes before event
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  typeIdx: index("event_type_idx").on(table.eventType),
  dateIdx: index("event_date_idx").on(table.startDate),
}));

export type ScheduleEvent = typeof scheduleEvents.$inferSelect;
export type InsertScheduleEvent = typeof scheduleEvents.$inferInsert;

// ============================================
// AI INSIGHTS & ALERTS
// ============================================

/**
 * System Insights - AI-generated insights
 */
export const systemInsights = mysqlTable("system_insights", {
  id: varchar("id", { length: 64 }).primaryKey(),
  insightType: mysqlEnum("insightType", [
    "quality_alert", "weight_variance", "production_efficiency", 
    "inventory_alert", "sales_trend", "financial_anomaly", "general"
  ]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation"),
  affectedModule: mysqlEnum("affectedModule", ["production", "sales", "inventory", "finance", "all"]),
  dataSnapshot: text("dataSnapshot"), // JSON with supporting data
  isResolved: boolean("isResolved").default(false).notNull(),
  resolvedBy: varchar("resolvedBy", { length: 64 }),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  typeIdx: index("insight_type_idx").on(table.insightType),
  severityIdx: index("insight_severity_idx").on(table.severity),
  moduleIdx: index("insight_module_idx").on(table.affectedModule),
}));

export type SystemInsight = typeof systemInsights.$inferSelect;
export type InsertSystemInsight = typeof systemInsights.$inferInsert;

// ============================================
// FILE MANAGEMENT & SYNC
// ============================================

/**
 * Uploaded Files
 */
export const uploadedFiles = mysqlTable("uploaded_files", {
  id: varchar("id", { length: 64 }).primaryKey(),
  fileName: varchar("fileName", { length: 500 }).notNull(),
  fileType: varchar("fileType", { length: 100 }).notNull(),
  fileSize: int("fileSize").notNull(),
  filePath: varchar("filePath", { length: 1000 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }),
  category: mysqlEnum("category", ["production", "sales", "inventory", "finance", "announcement", "other"]).notNull(),
  uploadedBy: varchar("uploadedBy", { length: 64 }).notNull(),
  processedStatus: mysqlEnum("processedStatus", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  recordsExtracted: int("recordsExtracted").default(0),
  errorLog: text("errorLog"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  categoryIdx: index("file_category_idx").on(table.category),
  statusIdx: index("file_status_idx").on(table.processedStatus),
}));

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = typeof uploadedFiles.$inferInsert;

/**
 * Data Sync Log
 */
export const dataSyncLog = mysqlTable("data_sync_log", {
  id: varchar("id", { length: 64 }).primaryKey(),
  syncType: mysqlEnum("syncType", ["google_drive", "excel_upload", "manual_entry", "api_import"]).notNull(),
  sourceIdentifier: varchar("sourceIdentifier", { length: 500 }),
  targetModule: mysqlEnum("targetModule", ["production", "sales", "inventory", "finance", "all"]).notNull(),
  recordsImported: int("recordsImported").default(0).notNull(),
  recordsFailed: int("recordsFailed").default(0).notNull(),
  status: mysqlEnum("status", ["success", "partial", "failed"]).notNull(),
  errorLog: text("errorLog"),
  syncedBy: varchar("syncedBy", { length: 64 }),
  syncedAt: timestamp("syncedAt").defaultNow(),
}, (table) => ({
  typeIdx: index("sync_type_idx").on(table.syncType),
  moduleIdx: index("sync_module_idx").on(table.targetModule),
  statusIdx: index("sync_status_idx").on(table.status),
}));

export type DataSyncLog = typeof dataSyncLog.$inferSelect;
export type InsertDataSyncLog = typeof dataSyncLog.$inferInsert;

// ============================================
// SYSTEM SETTINGS & META INFRASTRUCTURE
// ============================================

/**
 * System Settings - Configurable parameters
 */
export const systemSettings = mysqlTable("system_settings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  settingKey: varchar("settingKey", { length: 200 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  settingType: mysqlEnum("settingType", ["string", "number", "boolean", "json"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  isEditable: boolean("isEditable").default(true).notNull(),
  updatedBy: varchar("updatedBy", { length: 64 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  categoryIdx: index("setting_category_idx").on(table.category),
}));

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

/**
 * Audit Log - Track all system changes
 */
export const auditLog = mysqlTable("audit_log", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  userName: varchar("userName", { length: 200 }),
  action: varchar("action", { length: 100 }).notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: varchar("entityId", { length: 64 }),
  changes: text("changes"), // JSON with before/after values
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: varchar("userAgent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdx: index("audit_user_idx").on(table.userId),
  moduleIdx: index("audit_module_idx").on(table.module),
  dateIdx: index("audit_date_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

/**
 * System Notifications - User notifications
 */
export const systemNotifications = mysqlTable("system_notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "error"]).notNull(),
  category: varchar("category", { length: 100 }),
  actionUrl: varchar("actionUrl", { length: 1000 }),
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userIdx: index("notif_user_idx").on(table.userId),
  readIdx: index("notif_read_idx").on(table.isRead),
  dateIdx: index("notif_date_idx").on(table.createdAt),
}));

export type SystemNotification = typeof systemNotifications.$inferSelect;
export type InsertSystemNotification = typeof systemNotifications.$inferInsert;

