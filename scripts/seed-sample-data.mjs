import { drizzle } from "drizzle-orm/mysql2";
import { 
  productionRecords,
  qualityInspections,
  defects,
  rawMaterials,
  finishedGoods,
  dealers,
  salesOrders,
  salesOrderItems,
  financialTransactions,
  systemAlerts
} from "../drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const TIRE_SIZES = ["700R16", "750R16", "825R16", "825R20", "900R20", "1000R20", "1100R20", "1200R20"];
const TIRE_TYPES = ["Motorcycle", "Passenger Car", "Light Truck", "Heavy Truck"];
const SHIFTS = ["Day", "Night", "Overtime"];

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedData() {
  console.log("🌱 Starting to seed sample data...\n");

  try {
    // 1. Production Records (30 days of data)
    console.log("📊 Creating production records...");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const tireSize = randomChoice(TIRE_SIZES);
      const tireType = randomChoice(TIRE_TYPES);
      const quantityProduced = randomInt(800, 1200);
      const defectRate = Math.random() * 0.05; // 0-5% defect rate
      const quantityRejected = Math.floor(quantityProduced * defectRate);
      const quantityApproved = quantityProduced - quantityRejected;
      
      await db.insert(productionRecords).values({
        id: `prod_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        productionDate: date.toISOString().split('T')[0],
        tireSize,
        tireType,
        quantityProduced,
        quantityApproved,
        quantityRejected,
        shift: randomChoice(SHIFTS),
        batchNumber: `${date.toISOString().split('T')[0].replace(/-/g, '')}-L${randomInt(1,4)}-${randomChoice(['D','N','O'])}-${randomInt(100,999)}`,
        notes: Math.random() > 0.7 ? "Normal production run" : null,
      });
    }
    console.log("✅ Created 30 production records\n");

    // 2. Quality Inspections
    console.log("🔍 Creating quality inspections...");
    for (let i = 0; i < 20; i++) {
      const result = Math.random() > 0.15 ? "pass" : (Math.random() > 0.5 ? "fail" : "rework");
      
      await db.insert(qualityInspections).values({
        id: `insp_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        batchId: `BATCH-${randomInt(1000, 9999)}`,
        inspectorId: "inspector_1",
        stage: randomChoice(["mixing", "building", "curing", "final"]),
        result,
        notes: result !== "pass" ? "Issues detected during inspection" : null,
      });
    }
    console.log("✅ Created 20 quality inspections\n");

    // 3. Raw Materials
    console.log("📦 Creating raw materials inventory...");
    const materials = [
      { name: "Natural Rubber", category: "Rubber", unit: "kg", stock: 5000, min: 2000, cost: 250 },
      { name: "Synthetic Rubber", category: "Rubber", unit: "kg", stock: 3000, min: 1500, cost: 300 },
      { name: "Carbon Black", category: "Filler", unit: "kg", stock: 2000, min: 1000, cost: 150 },
      { name: "Steel Wire", category: "Reinforcement", unit: "kg", stock: 1500, min: 800, cost: 400 },
      { name: "Textile Cord", category: "Reinforcement", unit: "m", stock: 10000, min: 5000, cost: 50 },
      { name: "Sulfur", category: "Chemical", unit: "kg", stock: 500, min: 200, cost: 100 },
      { name: "Zinc Oxide", category: "Chemical", unit: "kg", stock: 300, min: 150, cost: 120 },
    ];

    for (const mat of materials) {
      await db.insert(rawMaterials).values({
        id: `rm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        materialName: mat.name,
        materialCategory: mat.category,
        unit: mat.unit,
        currentStock: mat.stock,
        minimumStock: mat.min,
        unitCost: mat.cost,
        supplier: `Supplier ${randomInt(1, 5)}`,
        lastRestockDate: randomDate(startDate, new Date()).toISOString().split('T')[0],
      });
    }
    console.log("✅ Created 7 raw materials\n");

    // 4. Finished Goods
    console.log("🏭 Creating finished goods inventory...");
    for (const size of TIRE_SIZES) {
      await db.insert(finishedGoods).values({
        id: `fg_${Date.now()}_${size}_${Math.random().toString(36).substr(2, 9)}`,
        tireSize: size,
        tireType: randomChoice(TIRE_TYPES),
        currentStock: randomInt(500, 2000),
        minimumStock: 300,
        unitPrice: randomInt(15000, 45000),
      });
    }
    console.log("✅ Created 8 finished goods entries\n");

    // 5. Dealers
    console.log("🏪 Creating dealers...");
    const dealerNames = ["Yangon Auto Parts", "Mandalay Tire Center", "Naypyidaw Motors", "Bago Wheels", "Mawlamyine Trading"];
    const dealerIds = [];
    
    for (let i = 0; i < dealerNames.length; i++) {
      const name = dealerNames[i];
      const id = `dealer_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      dealerIds.push(id);
      
      await db.insert(dealers).values({
        id,
        dealerCode: `D${String(i + 1).padStart(4, '0')}`,
        dealerName: name,
        contactPerson: `Contact ${randomInt(1, 100)}`,
        phone: `09${randomInt(100000000, 999999999)}`,
        email: `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        address: `${name} Street, Myanmar`,
        city: randomChoice(["Yangon", "Mandalay", "Naypyidaw", "Bago", "Mawlamyine"]),
        region: "Myanmar",
        dealerType: "Distributor",
        creditLimit: randomInt(5000000, 20000000),
        outstandingBalance: randomInt(0, 5000000),
        status: "active",
      });
    }
    console.log("✅ Created 5 dealers\n");

    // 6. Sales Orders
    console.log("💰 Creating sales orders...");
    for (let i = 0; i < 15; i++) {
      const dealerId = randomChoice(dealerIds);
      const orderDate = randomDate(startDate, new Date());
      const deliveryDate = new Date(orderDate);
      deliveryDate.setDate(deliveryDate.getDate() + randomInt(3, 14));
      
      const orderId = `order_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const orderNumber = `SO-${Date.now()}-${i}`;
      
      // Create order items
      const numItems = randomInt(1, 3);
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const quantity = randomInt(50, 200);
        const unitPrice = randomInt(15000, 45000);
        const totalPrice = quantity * unitPrice;
        totalAmount += totalPrice;
        
        await db.insert(salesOrderItems).values({
          id: `item_${Date.now()}_${i}_${j}_${Math.random().toString(36).substr(2, 9)}`,
          orderId,
          tireSize: randomChoice(TIRE_SIZES),
          tireType: randomChoice(TIRE_TYPES),
          quantity,
          unitPrice,
          totalPrice,
        });
      }
      
      const paidAmount = Math.random() > 0.3 ? totalAmount : Math.floor(totalAmount * randomInt(50, 90) / 100);
      const status = randomChoice(["pending", "confirmed", "shipped", "delivered"]);
      const paymentStatus = paidAmount >= totalAmount ? "paid" : (paidAmount > 0 ? "partial" : "unpaid");
      
      await db.insert(salesOrders).values({
        id: orderId,
        orderNumber,
        dealerId,
        orderDate: orderDate.toISOString().split('T')[0],
        deliveryDate: deliveryDate.toISOString().split('T')[0],
        totalAmount,
        paidAmount,
        status,
        paymentStatus,
        notes: Math.random() > 0.7 ? "Urgent delivery required" : null,
      });
    }
    console.log("✅ Created 15 sales orders\n");

    // 7. Financial Transactions
    console.log("💵 Creating financial transactions...");
    for (let i = 0; i < 40; i++) {
      const isRevenue = Math.random() > 0.4;
      const amount = isRevenue ? randomInt(5000000, 20000000) : randomInt(1000000, 10000000);
      
      await db.insert(financialTransactions).values({
        id: `txn_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
        transactionDate: randomDate(startDate, new Date()).toISOString().split('T')[0],
        transactionType: isRevenue ? "revenue" : "expense",
        category: isRevenue 
          ? randomChoice(["Sales Revenue", "Service Income", "Other Income"])
          : randomChoice(["Raw Materials", "Salaries", "Utilities", "Maintenance", "Transportation"]),
        amount,
        description: isRevenue ? "Sales payment received" : "Operational expense",
        referenceNumber: `REF-${randomInt(10000, 99999)}`,
      });
    }
    console.log("✅ Created 40 financial transactions\n");

    // 8. System Alerts
    console.log("⚠️ Creating system alerts...");
    const alerts = [
      { type: "quality", severity: "high", title: "High Defect Rate Detected", message: "Defect rate exceeded 5% threshold in Line 2" },
      { type: "inventory", severity: "medium", title: "Low Stock Alert", message: "Natural Rubber stock below minimum level" },
      { type: "production", severity: "low", title: "Production Target Met", message: "Daily production target achieved for 825R20" },
    ];
    
    for (const alert of alerts) {
      await db.insert(systemAlerts).values({
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        alertType: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        resolved: Math.random() > 0.5,
        acknowledgedBy: Math.random() > 0.5 ? "user_1" : null,
      });
    }
    console.log("✅ Created 3 system alerts\n");

    console.log("🎉 Sample data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log("  - 30 production records");
    console.log("  - 20 quality inspections");
    console.log("  - 7 raw materials");
    console.log("  - 8 finished goods");
    console.log("  - 5 dealers");
    console.log("  - 15 sales orders");
    console.log("  - 40 financial transactions");
    console.log("  - 3 system alerts");
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

seedData()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });

