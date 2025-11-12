import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  productionRecords,
  InsertProductionRecord,
  qualityControlRecords,
  InsertQualityControlRecord,
  rawMaterials,
  InsertRawMaterial,
  finishedGoods,
  InsertFinishedGood,
  dealers,
  InsertDealer,
  salesOrders,
  InsertSalesOrder,
  salesOrderItems,
  InsertSalesOrderItem,
  financialTransactions,
  InsertFinancialTransaction,
  productionTargets,
  InsertProductionTarget,
  systemAlerts,
  InsertSystemAlert,
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
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
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

// ============= PRODUCTION MANAGEMENT =============

export async function addProductionRecord(record: InsertProductionRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(productionRecords).values(record);
  return record;
}

export async function getProductionRecords(startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(productionRecords);
  if (startDate && endDate) {
    query = query.where(and(gte(productionRecords.productionDate, startDate), lte(productionRecords.productionDate, endDate))) as any;
  }
  return await query.orderBy(desc(productionRecords.productionDate));
}

export async function getProductionSummary(month: string) {
  const db = await getDb();
  if (!db) return [];
  const startDate = `${month}-01`;
  const endDate = `${month}-31`;
  return await db.select({
    tireSize: productionRecords.tireSize,
    tireType: productionRecords.tireType,
    totalProduced: sql<number>`SUM(${productionRecords.quantityProduced})`,
    totalApproved: sql<number>`SUM(${productionRecords.quantityApproved})`,
    totalRejected: sql<number>`SUM(${productionRecords.quantityRejected})`,
  }).from(productionRecords).where(and(gte(productionRecords.productionDate, startDate), lte(productionRecords.productionDate, endDate))).groupBy(productionRecords.tireSize, productionRecords.tireType);
}

export async function getRawMaterials() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(rawMaterials).orderBy(rawMaterials.materialName);
}

export async function getFinishedGoods() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(finishedGoods).orderBy(finishedGoods.tireSize);
}

export async function getDealers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(dealers).orderBy(dealers.dealerName);
}

export async function getSalesOrders(startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(salesOrders);
  if (startDate && endDate) {
    query = query.where(and(gte(salesOrders.orderDate, startDate), lte(salesOrders.orderDate, endDate))) as any;
  }
  return await query.orderBy(desc(salesOrders.orderDate));
}

export async function getFinancialTransactions(startDate?: string, endDate?: string) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(financialTransactions);
  if (startDate && endDate) {
    query = query.where(and(gte(financialTransactions.transactionDate, startDate), lte(financialTransactions.transactionDate, endDate))) as any;
  }
  return await query.orderBy(desc(financialTransactions.transactionDate));
}

export async function getSystemAlerts(resolved?: boolean) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(systemAlerts);
  if (resolved !== undefined) {
    query = query.where(eq(systemAlerts.resolved, resolved)) as any;
  }
  return await query.orderBy(desc(systemAlerts.createdAt));
}

export async function getDashboardKPIs(month: string) {
  const db = await getDb();
  if (!db) return null;
  const startDate = `${month}-01`;
  const endDate = `${month}-31`;
  const productionStats = await db.select({
    totalProduced: sql<number>`SUM(${productionRecords.quantityProduced})`,
    totalApproved: sql<number>`SUM(${productionRecords.quantityApproved})`,
    totalRejected: sql<number>`SUM(${productionRecords.quantityRejected})`,
  }).from(productionRecords).where(and(gte(productionRecords.productionDate, startDate), lte(productionRecords.productionDate, endDate)));
  const salesStats = await db.select({
    totalOrders: count(salesOrders.id),
    totalRevenue: sql<number>`SUM(${salesOrders.totalAmount})`,
    totalPaid: sql<number>`SUM(${salesOrders.paidAmount})`,
  }).from(salesOrders).where(and(gte(salesOrders.orderDate, startDate), lte(salesOrders.orderDate, endDate)));
  return {
    production: productionStats[0] || { totalProduced: 0, totalApproved: 0, totalRejected: 0 },
    sales: salesStats[0] || { totalOrders: 0, totalRevenue: 0, totalPaid: 0 },
  };
}
