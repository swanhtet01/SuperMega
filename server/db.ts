import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  InsertUser,
  productionRecords,
  InsertProductionRecord,
  flapRecords,
  InsertFlapRecord,
  dealers,
  InsertDealer,
  salesOrders,
  InsertSalesOrder,
  salesOrderItems,
  InsertSalesOrderItem,
  rawMaterials,
  InsertRawMaterial,
  finishedGoods,
  InsertFinishedGood,
  financialTransactions,
  InsertFinancialTransaction,
  announcements,
  InsertAnnouncement,
  scheduleEvents,
  InsertScheduleEvent,
  systemInsights,
  InsertSystemInsight,
  uploadedFiles,
  InsertUploadedFile,
  dataSyncLog,
  InsertDataSyncLog,
  systemSettings,
  InsertSystemSetting,
  auditLog,
  InsertAuditLog,
  systemNotifications,
  InsertSystemNotification,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER MANAGEMENT
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    // Set role - default to supervisor, admin if owner
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      } else {
        values.role = 'supervisor';
        updateSet.role = 'supervisor';
      }
    } else {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (user.department !== undefined) {
      values.department = user.department;
      updateSet.department = user.department;
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// PRODUCTION MODULE
// ============================================

export async function createProductionRecord(record: Omit<InsertProductionRecord, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.insert(productionRecords).values({
    id,
    ...record,
  });

  return id;
}

export async function getProductionRecords(filters?: {
  startDate?: string;
  endDate?: string;
  tireSize?: string;
  batchNumber?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(productionRecords);

  const conditions = [];
  if (filters?.startDate) {
    conditions.push(gte(productionRecords.productionDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(productionRecords.productionDate, filters.endDate));
  }
  if (filters?.tireSize) {
    conditions.push(eq(productionRecords.tireSize, filters.tireSize));
  }
  if (filters?.batchNumber) {
    conditions.push(eq(productionRecords.batchNumber, filters.batchNumber));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(productionRecords.productionDate));
}

export async function getProductionSummary(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return { totalProduced: 0, totalApproved: 0, totalRejected: 0, approvalRate: 0 };

  const conditions = [];
  if (filters?.startDate) {
    conditions.push(gte(productionRecords.productionDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(productionRecords.productionDate, filters.endDate));
  }

  let query = db
    .select({
      totalProduced: sql<number>`SUM(${productionRecords.totalProduced})`,
      totalApproved: sql<number>`SUM(${productionRecords.curingA})`,
      totalRejected: sql<number>`SUM(${productionRecords.curingR})`,
    })
    .from(productionRecords);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  const data = result[0] || { totalProduced: 0, totalApproved: 0, totalRejected: 0 };

  return {
    totalProduced: Number(data.totalProduced) || 0,
    totalApproved: Number(data.totalApproved) || 0,
    totalRejected: Number(data.totalRejected) || 0,
    approvalRate: data.totalProduced > 0 
      ? ((Number(data.totalApproved) / Number(data.totalProduced)) * 100) 
      : 0,
  };
}

// ============================================
// SALES MODULE
// ============================================

export async function createDealer(dealer: Omit<InsertDealer, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = `dealer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.insert(dealers).values({
    id,
    ...dealer,
  });

  return id;
}

export async function getDealers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(dealers).where(eq(dealers.isActive, true));
}

export async function getSalesSummary(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalAmount: 0, paidAmount: 0, pendingAmount: 0 };

  const conditions = [];
  if (filters?.startDate) {
    conditions.push(gte(salesOrders.orderDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(salesOrders.orderDate, filters.endDate));
  }

  let query = db
    .select({
      totalOrders: sql<number>`COUNT(*)`,
      totalAmount: sql<number>`SUM(${salesOrders.totalAmount})`,
      paidAmount: sql<number>`SUM(${salesOrders.paidAmount})`,
    })
    .from(salesOrders);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  const data = result[0] || { totalOrders: 0, totalAmount: 0, paidAmount: 0 };

  return {
    totalOrders: Number(data.totalOrders) || 0,
    totalAmount: Number(data.totalAmount) || 0,
    paidAmount: Number(data.paidAmount) || 0,
    pendingAmount: (Number(data.totalAmount) - Number(data.paidAmount)) || 0,
  };
}

// ============================================
// INVENTORY MODULE
// ============================================

export async function getInventorySummary() {
  const db = await getDb();
  if (!db) return { lowStockItems: 0, outOfStockItems: 0, totalValue: 0 };

  const rawMaterialsResult = await db
    .select({
      lowStock: sql<number>`SUM(CASE WHEN ${rawMaterials.currentStock} <= ${rawMaterials.minimumStock} THEN 1 ELSE 0 END)`,
      outOfStock: sql<number>`SUM(CASE WHEN ${rawMaterials.currentStock} = 0 THEN 1 ELSE 0 END)`,
      totalValue: sql<number>`SUM(${rawMaterials.currentStock} * ${rawMaterials.unitCost})`,
    })
    .from(rawMaterials);

  const finishedGoodsResult = await db
    .select({
      lowStock: sql<number>`SUM(CASE WHEN ${finishedGoods.currentStock} <= ${finishedGoods.minimumStock} THEN 1 ELSE 0 END)`,
      outOfStock: sql<number>`SUM(CASE WHEN ${finishedGoods.currentStock} = 0 THEN 1 ELSE 0 END)`,
      totalValue: sql<number>`SUM(${finishedGoods.currentStock} * ${finishedGoods.unitPrice})`,
    })
    .from(finishedGoods);

  const rawData = rawMaterialsResult[0] || { lowStock: 0, outOfStock: 0, totalValue: 0 };
  const fgData = finishedGoodsResult[0] || { lowStock: 0, outOfStock: 0, totalValue: 0 };

  return {
    lowStockItems: (Number(rawData.lowStock) || 0) + (Number(fgData.lowStock) || 0),
    outOfStockItems: (Number(rawData.outOfStock) || 0) + (Number(fgData.outOfStock) || 0),
    totalValue: (Number(rawData.totalValue) || 0) + (Number(fgData.totalValue) || 0),
  };
}

// ============================================
// FINANCIAL MODULE
// ============================================

export async function getFinancialSummary(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalExpenses: 0, netIncome: 0 };

  const conditions = [];
  if (filters?.startDate) {
    conditions.push(gte(financialTransactions.transactionDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(financialTransactions.transactionDate, filters.endDate));
  }

  let query = db
    .select({
      type: financialTransactions.type,
      total: sql<number>`SUM(${financialTransactions.amount})`,
    })
    .from(financialTransactions)
    .groupBy(financialTransactions.type);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  
  let totalRevenue = 0;
  let totalExpenses = 0;

  result.forEach((row) => {
    if (row.type === 'revenue' || row.type === 'payment_received') {
      totalRevenue += Number(row.total) || 0;
    } else if (row.type === 'expense' || row.type === 'payment_made') {
      totalExpenses += Number(row.total) || 0;
    }
  });

  return {
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
  };
}

// ============================================
// QUALITY & INSIGHTS MODULE
// ============================================

export async function getQualityMetrics(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return { defectRate: 0, rejectionRate: 0, topDefects: [] };

  const conditions = [];
  if (filters?.startDate) {
    conditions.push(gte(productionRecords.productionDate, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(productionRecords.productionDate, filters.endDate));
  }

  let query = db
    .select({
      totalProduced: sql<number>`SUM(${productionRecords.totalProduced})`,
      totalB: sql<number>`SUM(${productionRecords.curingB})`,
      totalR: sql<number>`SUM(${productionRecords.curingR})`,
    })
    .from(productionRecords);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query;
  const data = result[0] || { totalProduced: 0, totalB: 0, totalR: 0 };

  const totalProduced = Number(data.totalProduced) || 0;
  const totalB = Number(data.totalB) || 0;
  const totalR = Number(data.totalR) || 0;

  return {
    defectRate: totalProduced > 0 ? (totalB / totalProduced) * 100 : 0,
    rejectionRate: totalProduced > 0 ? (totalR / totalProduced) * 100 : 0,
    topDefects: [], // TODO: Implement when defect tracking is added
  };
}

export async function getSystemInsights(filters?: {
  insightType?: string;
  severity?: string;
  isResolved?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(systemInsights);

  const conditions = [];
  if (filters?.insightType) {
    conditions.push(eq(systemInsights.insightType, filters.insightType as any));
  }
  if (filters?.severity) {
    conditions.push(eq(systemInsights.severity, filters.severity as any));
  }
  if (filters?.isResolved !== undefined) {
    conditions.push(eq(systemInsights.isResolved, filters.isResolved));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(systemInsights.createdAt));
}

// ============================================
// ANNOUNCEMENTS & COMMUNICATION
// ============================================

export async function getAnnouncements(filters?: {
  category?: string;
  isPinned?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(announcements);

  const conditions = [];
  if (filters?.category) {
    conditions.push(eq(announcements.category, filters.category as any));
  }
  if (filters?.isPinned !== undefined) {
    conditions.push(eq(announcements.isPinned, filters.isPinned));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
}

// TODO: Add more helper functions as needed for other modules

