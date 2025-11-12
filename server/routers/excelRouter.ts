import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  generateProductionTemplate,
  generateInventoryTemplate,
  generateSalesTemplate,
  generateFinancialTemplate,
  generateQualityTemplate,
  importProductionData,
  importInventoryData,
  importSalesData,
  importFinancialData,
  exportProductionData,
  exportInventoryData,
  exportSalesData,
  exportFinancialData,
} from "../services/excelService";
import {
  getProductionRecords,
  getRawMaterials,
  getFinishedGoods,
  getDealers,
  getSalesOrders,
  getFinancialTransactions,
} from "../db";

/**
 * Excel Import/Export Router
 * Handles bulk data operations with Excel files
 */
export const excelRouter = router({
  
  // ============================================================================
  // TEMPLATE GENERATION
  // ============================================================================

  generateProductionTemplate: protectedProcedure
    .mutation(async () => {
      const buffer = generateProductionTemplate();
      return {
        data: Buffer.from(buffer).toString("base64"),
        filename: "production_template.xlsx",
      };
    }),

  generateInventoryTemplate: protectedProcedure
    .mutation(async () => {
      const buffer = generateInventoryTemplate();
      return {
        data: Buffer.from(buffer).toString("base64"),
        filename: "inventory_template.xlsx",
      };
    }),

  generateSalesTemplate: protectedProcedure
    .mutation(async () => {
      const buffer = generateSalesTemplate();
      return {
        data: Buffer.from(buffer).toString("base64"),
        filename: "sales_template.xlsx",
      };
    }),

  generateFinancialTemplate: protectedProcedure
    .mutation(async () => {
      const buffer = generateFinancialTemplate();
      return {
        data: Buffer.from(buffer).toString("base64"),
        filename: "financial_template.xlsx",
      };
    }),

  generateQualityTemplate: protectedProcedure
    .mutation(async () => {
      const buffer = generateQualityTemplate();
      return {
        data: Buffer.from(buffer).toString("base64"),
        filename: "quality_template.xlsx",
      };
    }),

  // ============================================================================
  // DATA IMPORT
  // ============================================================================

  importProduction: protectedProcedure
    .input(z.object({
      data: z.string(), // Base64 encoded Excel file
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.data, "base64");
      const result = await importProductionData(buffer);
      return result;
    }),

  importInventory: protectedProcedure
    .input(z.object({
      data: z.string(), // Base64 encoded Excel file
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.data, "base64");
      const result = await importInventoryData(buffer);
      return result;
    }),

  importSales: protectedProcedure
    .input(z.object({
      data: z.string(), // Base64 encoded Excel file
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.data, "base64");
      const result = await importSalesData(buffer);
      return result;
    }),

  importFinancial: protectedProcedure
    .input(z.object({
      data: z.string(), // Base64 encoded Excel file
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.data, "base64");
      const result = await importFinancialData(buffer);
      return result;
    }),

  // ============================================================================
  // DATA EXPORT
  // ============================================================================

  exportProduction: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Get all production records (we'll filter by date if needed later)
      const records = await getProductionRecords(1000);
      
      const buffer = await exportProductionData(records);
      return {
        data: Buffer.from(buffer).toString("base64"),
        filename: `production_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),

  exportInventory: protectedProcedure
    .mutation(async () => {
      const rawMaterials = await getRawMaterials();
      const finishedGoods = await getFinishedGoods();
      
      const buffer = await exportInventoryData(rawMaterials, finishedGoods);
      return {
        data: Buffer.from(buffer).toString("base64"),
        filename: `inventory_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),

  exportSales: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const dealers = await getDealers();
      // Get all sales orders (we'll filter by date if needed later)
      const orders = await getSalesOrders({ limit: 1000 });
      
      const buffer = await exportSalesData(dealers, orders);
      return {
        data: Buffer.from(buffer).toString("base64"),
        filename: `sales_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),

  exportFinancial: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const transactions = await getFinancialTransactions({
        startDate: input.startDate,
        endDate: input.endDate,
      });
      
      const buffer = await exportFinancialData(transactions);
      return {
        data: Buffer.from(buffer).toString("base64"),
        filename: `financial_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      };
    }),
});

