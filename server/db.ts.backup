import { eq, and, gte, lte, desc, count, sql } from "drizzle-orm";
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
  qualityInspections,
  InsertQualityInspection,
  defects,
  InsertDefect,
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

// ============= LEGACY FUNCTIONS (kept for compatibility) =============

export async function addProductionRecord(record: InsertProductionRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(productionRecords).values(record);
  return record;
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



// ============================================
// PRODUCTION FUNCTIONS
// ============================================

export async function getProductionRecords(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const records = await db
    .select()
    .from(productionRecords)
    .limit(limit)
    .offset(offset)
    .orderBy(productionRecords.productionDate);
  
  return records;
}

export async function getProductionByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  const records = await db
    .select()
    .from(productionRecords)
    .where(
      and(
        gte(productionRecords.productionDate, startDate),
        lte(productionRecords.productionDate, endDate)
      )
    )
    .orderBy(productionRecords.productionDate);
  
  return records;
}

export async function getProductionSummary() {
  const db = await getDb();
  if (!db) return { totalProduction: 0, totalApproved: 0, totalRejected: 0, approvalRate: 0, defectRate: 0 };
  
  const records = await db.select().from(productionRecords);
  
  const totalProduced = records.reduce((sum, r) => sum + r.quantityProduced, 0);
  const totalApproved = records.reduce((sum, r) => sum + r.quantityApproved, 0);
  const totalRejected = records.reduce((sum, r) => sum + r.quantityRejected, 0);
  
  return {
    totalProduction: totalProduced,
    totalApproved,
    totalRejected,
    approvalRate: totalProduced > 0 ? (totalApproved / totalProduced) * 100 : 0,
    defectRate: totalProduced > 0 ? (totalRejected / totalProduced) * 100 : 0,
  };
}

export async function createProductionRecord(data: Omit<InsertProductionRecord, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const record: InsertProductionRecord = {
    id,
    productionDate: data.productionDate,
    tireSize: data.tireSize,
    tireType: data.tireType,
    quantityProduced: data.quantityProduced,
    quantityApproved: data.quantityApproved,
    quantityRejected: data.quantityRejected,
    shift: data.shift,
    batchNumber: data.batchNumber,
    notes: data.notes,
  };
  
  await db.insert(productionRecords).values(record);
  
  return record;
}

// ============================================
// QUALITY FUNCTIONS
// ============================================

export async function getQualityInspections(filters: {
  batchId?: string;
  stage?: "mixing" | "building" | "curing" | "final";
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  // TODO: Implement proper filtering with drizzle-orm
  const inspections = await db
    .select()
    .from(qualityInspections)
    .limit(filters.limit || 50);
  
  return inspections;
}

export async function createQualityInspection(data: Omit<InsertQualityInspection, 'id' | 'timestamp'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `insp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.insert(qualityInspections).values({
    id,
    ...data,
  });
  
  return { id, ...data };
}

export async function createDefect(data: Omit<InsertDefect, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `defect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.insert(defects).values({
    id,
    ...data,
  });
  
  return { id, ...data };
}

export async function getDefectsByInspection(inspectionId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const defectRecords = await db
    .select()
    .from(defects)
    .where(eq(defects.inspectionId, inspectionId));
  
  return defectRecords;
}

export async function getQualityMetrics(filters: {
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return { defectRate: 0, passRate: 0, totalInspections: 0 };
  
  const inspections = await db.select().from(qualityInspections);
  
  const totalInspections = inspections.length;
  const passedInspections = inspections.filter(i => i.result === "pass").length;
  const failedInspections = inspections.filter(i => i.result === "fail").length;
  
  return {
    totalInspections,
    passRate: totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0,
    defectRate: totalInspections > 0 ? (failedInspections / totalInspections) * 100 : 0,
  };
}

// ============================================
// INVENTORY FUNCTIONS
// ============================================

export async function getRawMaterials() {
  const db = await getDb();
  if (!db) return [];
  
  const materials = await db.select().from(rawMaterials);
  return materials;
}

export async function getFinishedGoods() {
  const db = await getDb();
  if (!db) return [];
  
  const goods = await db.select().from(finishedGoods);
  return goods;
}

export async function updateRawMaterialStock(id: string, quantity: number, operation: "add" | "subtract") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const material = await db.select().from(rawMaterials).where(eq(rawMaterials.id, id)).limit(1);
  
  if (material.length === 0) {
    throw new Error("Material not found");
  }
  
  const currentStock = material[0].currentStock;
  const newStock = operation === "add" ? currentStock + quantity : currentStock - quantity;
  
  if (newStock < 0) {
    throw new Error("Insufficient stock");
  }
  
  await db.update(rawMaterials)
    .set({ currentStock: newStock })
    .where(eq(rawMaterials.id, id));
  
  return { id, newStock };
}

export async function updateFinishedGoodsStock(id: string, quantity: number, operation: "add" | "subtract") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const goods = await db.select().from(finishedGoods).where(eq(finishedGoods.id, id)).limit(1);
  
  if (goods.length === 0) {
    throw new Error("Finished goods not found");
  }
  
  const currentStock = goods[0].currentStock;
  const newStock = operation === "add" ? currentStock + quantity : currentStock - quantity;
  
  if (newStock < 0) {
    throw new Error("Insufficient stock");
  }
  
  await db.update(finishedGoods)
    .set({ currentStock: newStock })
    .where(eq(finishedGoods.id, id));
  
  return { id, newStock };
}

export async function getLowStockItems() {
  const db = await getDb();
  if (!db) return { rawMaterials: [], finishedGoods: [] };
  
  const lowRawMaterials = await db
    .select()
    .from(rawMaterials)
    .where(lte(rawMaterials.currentStock, rawMaterials.minimumStock));
  
  const lowFinishedGoods = await db
    .select()
    .from(finishedGoods)
    .where(lte(finishedGoods.currentStock, finishedGoods.minimumStock));
  
  return {
    rawMaterials: lowRawMaterials,
    finishedGoods: lowFinishedGoods,
  };
}

// ============================================
// SALES FUNCTIONS
// ============================================

export async function getDealers(status?: "active" | "inactive" | "suspended") {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return await db.select().from(dealers).where(eq(dealers.status, status));
  }
  
  return await db.select().from(dealers);
}

export async function createDealer(data: Omit<InsertDealer, 'id' | 'createdAt' | 'updatedAt' | 'outstandingBalance' | 'status'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `dealer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.insert(dealers).values({
    id,
    ...data,
    outstandingBalance: 0,
    status: "active",
  });
  
  return { id, ...data };
}

export async function updateDealer(id: string, data: Partial<InsertDealer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dealers)
    .set(data)
    .where(eq(dealers.id, id));
  
  return { id, ...data };
}

export async function getSalesOrders(filters: {
  dealerId?: string;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  // TODO: Implement proper filtering
  const orders = await db
    .select()
    .from(salesOrders)
    .limit(filters.limit || 50);
  
  return orders;
}

export async function createSalesOrder(data: {
  dealerId: string;
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  items: Array<{
    tireSize: string;
    quantity: number;
    unitPrice: number;
  }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const orderNumber = `SO-${Date.now()}`;
  
  const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  const [order] = await db.insert(salesOrders).values({
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderNumber,
    dealerId: data.dealerId,
    orderDate: data.orderDate,
    deliveryDate: data.deliveryDate,
    totalAmount,
    paidAmount: 0,
    status: "pending",
    paymentStatus: "unpaid",
    notes: data.notes,
  }).$returningId();
  
  const orderId = order.id;
  
  // Insert order items
  for (const item of data.items) {
    const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(salesOrderItems).values({
      id: itemId,
      orderId,
      tireSize: item.tireSize,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
    });
  }
  
  return { id: orderId, orderNumber };
}

export async function updateSalesOrderStatus(orderId: string, status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(salesOrders)
    .set({ status })
    .where(eq(salesOrders.id, orderId));
  
  return { orderId, status };
}

export async function getSalesOrderItems(orderId: string) {
  const db = await getDb();
  if (!db) return [];
  
  const items = await db
    .select()
    .from(salesOrderItems)
    .where(eq(salesOrderItems.orderId, orderId));
  
  return items;
}

// ============================================
// FINANCIAL FUNCTIONS
// ============================================

export async function getFinancialTransactions(filters: {
  type?: "revenue" | "expense" | "asset" | "liability";
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  // TODO: Implement proper filtering
  const transactions = await db
    .select()
    .from(financialTransactions)
    .limit(filters.limit || 100);
  
  return transactions;
}

export async function createFinancialTransaction(data: Omit<InsertFinancialTransaction, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.insert(financialTransactions).values({
    id,
    ...data,
  });
  
  return { id, ...data };
}

export async function getFinancialSummary(filters: {
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalExpenses: 0, netProfit: 0 };
  
  const transactions = await db.select().from(financialTransactions);
  
  const revenue = transactions
    .filter(t => t.transactionType === "revenue")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = transactions
    .filter(t => t.transactionType === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalRevenue: revenue,
    totalExpenses: expense,
    netProfit: revenue - expense,
  };
}

export async function getProfitAndLoss(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) return { revenue: [], expenses: [], totalRevenue: 0, totalExpense: 0, netProfit: 0 };
  
  const transactions = await db.select().from(financialTransactions);
  
  const revenue = transactions.filter(t => t.transactionType === "revenue");
  const expenses = transactions.filter(t => t.transactionType === "expense");
  
  const totalRevenue = revenue.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  return {
    revenue,
    expenses,
    totalRevenue,
    totalExpense,
    netProfit: totalRevenue - totalExpense,
  };
}






// Raw Materials Management
export async function createRawMaterial(data: Omit<InsertRawMaterial, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `rm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(rawMaterials).values({ id, ...data });
  return id;
}

// Finished Goods Management
export async function createFinishedGood(data: Omit<InsertFinishedGood, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `fg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(finishedGoods).values({ id, ...data });
  return id;
}




// ============================================
// SUMMARY FUNCTIONS FOR DASHBOARD
// ============================================

export async function getSalesSummary() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalRevenue: 0, totalPaid: 0, pendingOrders: 0 };
  
  const orders = await db.select().from(salesOrders);
  
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalPaid = orders.reduce((sum, o) => sum + o.paidAmount, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  
  return {
    totalOrders,
    totalRevenue,
    totalPaid,
    pendingOrders,
  };
}

export async function getInventorySummary() {
  const db = await getDb();
  if (!db) return { lowStockItems: 0, totalValue: 0, finishedGoodsCount: 0 };
  
  const rawMats = await db.select().from(rawMaterials);
  const finished = await db.select().from(finishedGoods);
  
  const lowStockItems = rawMats.filter(m => m.currentStock <= m.minimumStock).length;
  const totalValue = rawMats.reduce((sum, m) => sum + (m.currentStock * m.unitCost), 0) +
                     finished.reduce((sum, f) => sum + (f.currentStock * f.unitPrice), 0);
  const finishedGoodsCount = finished.reduce((sum, f) => sum + f.currentStock, 0);
  
  return {
    lowStockItems,
    totalValue,
    finishedGoodsCount,
  };
}

