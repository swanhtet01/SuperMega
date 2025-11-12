import { mysqlTable, mysqlEnum, varchar, text, int, date, timestamp, index, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * YTF-SPECIFIC SCHEMA
 * Based on actual Yangon Tyre Factory production data analysis
 * Date: November 2025
 */

// ============================================
// REFERENCE TABLES
// ============================================

/**
 * Tire Size Master - All tire sizes produced by YTF
 */
export const tireSizes = mysqlTable("tire_sizes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  size: varchar("size", { length: 50 }).notNull().unique(), // e.g., "7.00-16"
  batchCode: varchar("batchCode", { length: 20 }).notNull(), // e.g., "713", "747"
  pattern: varchar("pattern", { length: 50 }), // R, L, RL, AG, Grip, HW, Min
  category: mysqlEnum("category", ["passenger", "light_truck", "heavy_truck", "agricultural", "special"]).notNull(),
  specWeight: decimal("specWeight", { precision: 6, scale: 2 }).notNull(), // Specification weight in kg
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  sizeIdx: index("tire_size_idx").on(table.size),
  batchIdx: index("batch_code_idx").on(table.batchCode),
  categoryIdx: index("category_idx").on(table.category),
}));

export type TireSize = typeof tireSizes.$inferSelect;
export type InsertTireSize = typeof tireSizes.$inferInsert;

/**
 * Batch Code Reference - Meanings of batch codes
 */
export const batchCodes = mysqlTable("batch_codes", {
  id: varchar("id", { length: 64 }).primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(), // e.g., "713", "747"
  name: varchar("name", { length: 100 }).notNull(), // e.g., "L Pattern", "AG Agricultural"
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type BatchCode = typeof batchCodes.$inferSelect;
export type InsertBatchCode = typeof batchCodes.$inferInsert;

// ============================================
// PRODUCTION TABLES
// ============================================

/**
 * Daily Production Records - YTF Format
 * Matches the actual daily production report structure
 */
export const ytfProductionRecords = mysqlTable("ytf_production_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  
  // Date and Shift Info
  productionDate: date("productionDate").notNull(),
  batchNumber: varchar("batchNumber", { length: 100 }).notNull(), // e.g., "44-25"
  section: varchar("section", { length: 50 }).default("Section-07").notNull(),
  shiftType: mysqlEnum("shiftType", ["1-shift", "3-shift"]).notNull(),
  
  // Tire Info
  tireSizeId: varchar("tireSizeId", { length: 64 }).notNull(),
  tireSize: varchar("tireSize", { length: 50 }).notNull(), // Denormalized for quick access
  batchCode: varchar("batchCode", { length: 20 }).notNull(),
  
  // Targets
  target1Shift: int("target1Shift"),
  target3Shift: int("target3Shift"),
  
  // Curing Results (YTF's A/B/R System)
  curingA: int("curingA").default(0).notNull(), // Approved
  curingB: int("curingB").default(0).notNull(), // Defect B
  curingR: int("curingR").default(0).notNull(), // Rejected
  totalProduced: int("totalProduced").notNull(),
  
  // Weight Measurements
  specWeight: decimal("specWeight", { precision: 6, scale: 2 }).notNull(),
  weight1: decimal("weight1", { precision: 6, scale: 2 }), // Sample 1
  weight2: decimal("weight2", { precision: 6, scale: 2 }), // Sample 2
  weight3: decimal("weight3", { precision: 6, scale: 2 }), // Sample 3
  averageWeight: decimal("averageWeight", { precision: 6, scale: 2 }),
  totalWeight: decimal("totalWeight", { precision: 8, scale: 2 }),
  
  // Metadata
  supervisorName: varchar("supervisorName", { length: 100 }), // e.g., "PHYU PHYU AYE"
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  dateIdx: index("ytf_prod_date_idx").on(table.productionDate),
  batchIdx: index("ytf_batch_idx").on(table.batchNumber),
  sizeIdx: index("ytf_size_idx").on(table.tireSize),
  dateSize: index("ytf_date_size_idx").on(table.productionDate, table.tireSize),
}));

export type YTFProductionRecord = typeof ytfProductionRecords.$inferSelect;
export type InsertYTFProductionRecord = typeof ytfProductionRecords.$inferInsert;

/**
 * Flap Production Records
 * Flaps are inner tubes produced separately
 */
export const flapProductionRecords = mysqlTable("flap_production_records", {
  id: varchar("id", { length: 64 }).primaryKey(),
  
  // Date and Shift
  productionDate: date("productionDate").notNull(),
  batchNumber: varchar("batchNumber", { length: 100 }).notNull(),
  shiftType: mysqlEnum("shiftType", ["1-shift", "3-shift"]).notNull(),
  
  // Flap Info
  flapSize: varchar("flapSize", { length: 100 }).notNull(), // e.g., "Flap 7.50/8.25-16"
  
  // Targets and Production
  target1Shift: int("target1Shift"),
  target3Shift: int("target3Shift"),
  quantityProduced: int("quantityProduced").notNull(),
  quantityDefective: int("quantityDefective").default(0).notNull(),
  
  // Weight
  unitWeight: decimal("unitWeight", { precision: 6, scale: 2 }),
  totalWeight: decimal("totalWeight", { precision: 8, scale: 2 }),
  
  // Notes (often in Myanmar language)
  notes: text("notes"), // e.g., "အသားမပြည့်(4)လုံး" - incomplete/defective
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  dateIdx: index("flap_date_idx").on(table.productionDate),
  sizeIdx: index("flap_size_idx").on(table.flapSize),
}));

export type FlapProductionRecord = typeof flapProductionRecords.$inferSelect;
export type InsertFlapProductionRecord = typeof flapProductionRecords.$inferInsert;

// ============================================
// KNOWLEDGE BASE TABLES
// ============================================

/**
 * YTF Wiki Pages - Knowledge base for tire sizes, processes, troubleshooting
 */
export const wikiPages = mysqlTable("wiki_pages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  category: mysqlEnum("category", ["tire_specs", "batch_codes", "quality_issues", "best_practices", "troubleshooting", "training"]).notNull(),
  content: text("content").notNull(), // Markdown format
  tags: text("tags"), // JSON array of tags
  relatedTireSize: varchar("relatedTireSize", { length: 50 }),
  relatedBatchCode: varchar("relatedBatchCode", { length: 20 }),
  viewCount: int("viewCount").default(0).notNull(),
  lastViewedAt: timestamp("lastViewedAt"),
  createdBy: varchar("createdBy", { length: 64 }),
  updatedBy: varchar("updatedBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
}, (table) => ({
  slugIdx: index("wiki_slug_idx").on(table.slug),
  categoryIdx: index("wiki_category_idx").on(table.category),
  sizeIdx: index("wiki_tire_size_idx").on(table.relatedTireSize),
}));

export type WikiPage = typeof wikiPages.$inferSelect;
export type InsertWikiPage = typeof wikiPages.$inferInsert;

/**
 * Quality Insights - AI-generated insights from production data
 */
export const qualityInsights = mysqlTable("quality_insights", {
  id: varchar("id", { length: 64 }).primaryKey(),
  insightType: mysqlEnum("insightType", ["weight_variance", "quality_drop", "efficiency_improvement", "anomaly_detected", "best_practice"]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).notNull(),
  tireSize: varchar("tireSize", { length: 50 }),
  batchCode: varchar("batchCode", { length: 20 }),
  dateRange: varchar("dateRange", { length: 100 }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation"),
  dataSource: text("dataSource"), // JSON with supporting data
  isResolved: boolean("isResolved").default(false).notNull(),
  resolvedBy: varchar("resolvedBy", { length: 64 }),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  typeIdx: index("insight_type_idx").on(table.insightType),
  severityIdx: index("insight_severity_idx").on(table.severity),
  sizeIdx: index("insight_tire_size_idx").on(table.tireSize),
}));

export type QualityInsight = typeof qualityInsights.$inferSelect;
export type InsertQualityInsight = typeof qualityInsights.$inferInsert;

/**
 * Data Sync Log - Track auto-sync operations
 */
export const dataSyncLog = mysqlTable("data_sync_log", {
  id: varchar("id", { length: 64 }).primaryKey(),
  syncType: mysqlEnum("syncType", ["google_drive", "excel_import", "manual_entry"]).notNull(),
  sourceFile: varchar("sourceFile", { length: 500 }),
  recordsImported: int("recordsImported").default(0).notNull(),
  recordsFailed: int("recordsFailed").default(0).notNull(),
  status: mysqlEnum("status", ["success", "partial", "failed"]).notNull(),
  errorLog: text("errorLog"),
  syncedBy: varchar("syncedBy", { length: 64 }),
  syncedAt: timestamp("syncedAt").defaultNow(),
}, (table) => ({
  typeIdx: index("sync_type_idx").on(table.syncType),
  statusIdx: index("sync_status_idx").on(table.status),
  dateIdx: index("sync_date_idx").on(table.syncedAt),
}));

export type DataSyncLog = typeof dataSyncLog.$inferSelect;
export type InsertDataSyncLog = typeof dataSyncLog.$inferInsert;

// ============================================
// KEEP EXISTING TABLES (Users, Dealers, Sales, Financial)
// ============================================

export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["inspector", "supervisor", "manager", "executive", "admin"]).default("inspector").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

