import * as XLSX from "xlsx";
import { 
  createProductionRecord,
  createRawMaterial,
  createFinishedGood,
  createDealer,
  createSalesOrder,
  createFinancialTransaction,
  createQualityInspection 
} from "../db";

/**
 * Excel Import/Export Service
 * Handles bulk data operations with Excel files
 */

// ============================================================================
// TEMPLATE GENERATION
// ============================================================================

export function generateProductionTemplate() {
  const template = [
    {
      "Production Date (YYYY-MM-DD)": "2025-01-15",
      "Tire Size": "750R16",
      "Tire Type": "nylon",
      "Quantity Produced": 100,
      "Quantity Approved": 95,
      "Quantity Rejected": 5,
      "Shift": "day",
      "Batch Number": "BATCH-001",
      "Notes": "Normal production",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Production");
  
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function generateInventoryTemplate() {
  const rawMaterialsTemplate = [
    {
      "Material Name": "Natural Rubber",
      "Material Type": "rubber",
      "Quantity In Stock": 5000,
      "Unit": "kg",
      "Unit Cost (MMK)": 2500,
      "Reorder Level": 1000,
      "Supplier": "Myanmar Rubber Co.",
      "Location": "Warehouse A",
    },
  ];

  const finishedGoodsTemplate = [
    {
      "Tire Size": "750R16",
      "Tire Type": "nylon",
      "Quantity In Stock": 500,
      "Unit Price (MMK)": 85000,
      "Location": "Finished Goods Warehouse",
    },
  ];

  const workbook = XLSX.utils.book_new();
  const rawSheet = XLSX.utils.json_to_sheet(rawMaterialsTemplate);
  const finishedSheet = XLSX.utils.json_to_sheet(finishedGoodsTemplate);
  
  XLSX.utils.book_append_sheet(workbook, rawSheet, "Raw Materials");
  XLSX.utils.book_append_sheet(workbook, finishedSheet, "Finished Goods");
  
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function generateSalesTemplate() {
  const dealersTemplate = [
    {
      "Dealer Code": "D001",
      "Dealer Name": "Yangon Tire Shop",
      "Contact Person": "U Aung",
      "Phone": "09-123456789",
      "Email": "dealer@example.com",
      "Address": "Yangon, Myanmar",
      "Credit Limit (MMK)": 10000000,
      "Payment Terms": "net30",
    },
  ];

  const ordersTemplate = [
    {
      "Order Number": "SO-2025-001",
      "Dealer Code": "D001",
      "Order Date (YYYY-MM-DD)": "2025-01-15",
      "Tire Size": "750R16",
      "Tire Type": "nylon",
      "Quantity": 50,
      "Unit Price (MMK)": 85000,
      "Status": "pending",
      "Delivery Date (YYYY-MM-DD)": "2025-01-20",
    },
  ];

  const workbook = XLSX.utils.book_new();
  const dealersSheet = XLSX.utils.json_to_sheet(dealersTemplate);
  const ordersSheet = XLSX.utils.json_to_sheet(ordersTemplate);
  
  XLSX.utils.book_append_sheet(workbook, dealersSheet, "Dealers");
  XLSX.utils.book_append_sheet(workbook, ordersSheet, "Sales Orders");
  
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function generateFinancialTemplate() {
  const template = [
    {
      "Transaction Date (YYYY-MM-DD)": "2025-01-15",
      "Transaction Type": "revenue",
      "Category": "tire_sales",
      "Description": "Sale to Dealer D001",
      "Amount (MMK)": 4250000,
      "Reference Number": "INV-001",
      "Dealer Code": "D001",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export function generateQualityTemplate() {
  const template = [
    {
      "Batch Number": "BATCH-001",
      "Inspection Stage": "final",
      "Inspection Date (YYYY-MM-DD)": "2025-01-15",
      "Inspector Name": "U Kyaw",
      "Result": "pass",
      "Defect Type": "",
      "Defect Count": 0,
      "Notes": "All quality checks passed",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Quality Inspections");
  
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

// ============================================================================
// DATA IMPORT
// ============================================================================

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export async function importProductionData(buffer: Buffer): Promise<ImportResult> {
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);

  const result: ImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < data.length; i++) {
    const row: any = data[i];
    try {
      await createProductionRecord({
        productionDate: new Date(row["Production Date (YYYY-MM-DD)"]),
        tireSize: row["Tire Size"],
        tireType: row["Tire Type"],
        quantityProduced: Number(row["Quantity Produced"]),
        quantityApproved: Number(row["Quantity Approved"]),
        quantityRejected: Number(row["Quantity Rejected"]),
        shift: row["Shift"] || undefined,
        batchNumber: row["Batch Number"] || undefined,
        notes: row["Notes"] || undefined,
      });
      result.imported++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        row: i + 2, // +2 because Excel rows start at 1 and we have a header
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  result.success = result.failed === 0;
  return result;
}

export async function importInventoryData(buffer: Buffer): Promise<ImportResult> {
  const workbook = XLSX.read(buffer);
  const result: ImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
  };

  // Import raw materials
  if (workbook.SheetNames.includes("Raw Materials")) {
    const worksheet = workbook.Sheets["Raw Materials"];
    const data = XLSX.utils.sheet_to_json(worksheet);

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      try {
        await createRawMaterial({
          materialName: row["Material Name"],
          materialType: row["Material Type"],
          quantityInStock: Number(row["Quantity In Stock"]),
          unit: row["Unit"],
          unitCost: Number(row["Unit Cost (MMK)"]),
          reorderLevel: Number(row["Reorder Level"]),
          supplier: row["Supplier"] || undefined,
          location: row["Location"] || undefined,
        });
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          error: `Raw Materials: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
  }

  // Import finished goods
  if (workbook.SheetNames.includes("Finished Goods")) {
    const worksheet = workbook.Sheets["Finished Goods"];
    const data = XLSX.utils.sheet_to_json(worksheet);

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      try {
        await createFinishedGood({
          tireSize: row["Tire Size"],
          tireType: row["Tire Type"],
          quantityInStock: Number(row["Quantity In Stock"]),
          unitPrice: Number(row["Unit Price (MMK)"]),
          location: row["Location"] || undefined,
        });
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          error: `Finished Goods: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
  }

  result.success = result.failed === 0;
  return result;
}

export async function importSalesData(buffer: Buffer): Promise<ImportResult> {
  const workbook = XLSX.read(buffer);
  const result: ImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
  };

  // Import dealers first
  if (workbook.SheetNames.includes("Dealers")) {
    const worksheet = workbook.Sheets["Dealers"];
    const data = XLSX.utils.sheet_to_json(worksheet);

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      try {
        await createDealer({
          dealerCode: row["Dealer Code"],
          dealerName: row["Dealer Name"],
          contactPerson: row["Contact Person"] || undefined,
          phone: row["Phone"] || undefined,
          email: row["Email"] || undefined,
          address: row["Address"] || undefined,
          creditLimit: Number(row["Credit Limit (MMK)"]) || undefined,
        });
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          error: `Dealers: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
  }

  // Import sales orders
  if (workbook.SheetNames.includes("Sales Orders")) {
    const worksheet = workbook.Sheets["Sales Orders"];
    const data = XLSX.utils.sheet_to_json(worksheet);

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      try {
        await createSalesOrder({
          orderNumber: row["Order Number"],
          dealerId: row["Dealer Code"], // Using dealer code as ID for now
          orderDate: new Date(row["Order Date (YYYY-MM-DD)"]),
          totalAmount: Number(row["Quantity"]) * Number(row["Unit Price (MMK)"]),
          status: row["Status"] || "pending",
          deliveryDate: row["Delivery Date (YYYY-MM-DD)"] || undefined,
        });
        result.imported++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          row: i + 2,
          error: `Sales Orders: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
  }

  result.success = result.failed === 0;
  return result;
}

export async function importFinancialData(buffer: Buffer): Promise<ImportResult> {
  const workbook = XLSX.read(buffer);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);

  const result: ImportResult = {
    success: true,
    imported: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < data.length; i++) {
    const row: any = data[i];
    try {
      await createFinancialTransaction({
        transactionDate: new Date(row["Transaction Date (YYYY-MM-DD)"]),
        transactionType: row["Transaction Type"],
        category: row["Category"],
        description: row["Description"] || undefined,
        amount: Number(row["Amount (MMK)"]),
        referenceNumber: row["Reference Number"] || undefined,
        dealerId: row["Dealer Code"] || undefined,
      });
      result.imported++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        row: i + 2,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  result.success = result.failed === 0;
  return result;
}

// ============================================================================
// DATA EXPORT
// ============================================================================

export async function exportProductionData(data: any[]): Promise<Buffer> {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Production");
  
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export async function exportInventoryData(rawMaterials: any[], finishedGoods: any[]): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();
  
  const rawSheet = XLSX.utils.json_to_sheet(rawMaterials);
  const finishedSheet = XLSX.utils.json_to_sheet(finishedGoods);
  
  XLSX.utils.book_append_sheet(workbook, rawSheet, "Raw Materials");
  XLSX.utils.book_append_sheet(workbook, finishedSheet, "Finished Goods");
  
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export async function exportSalesData(dealers: any[], orders: any[]): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();
  
  const dealersSheet = XLSX.utils.json_to_sheet(dealers);
  const ordersSheet = XLSX.utils.json_to_sheet(orders);
  
  XLSX.utils.book_append_sheet(workbook, dealersSheet, "Dealers");
  XLSX.utils.book_append_sheet(workbook, ordersSheet, "Sales Orders");
  
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export async function exportFinancialData(data: any[]): Promise<Buffer> {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
  
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

