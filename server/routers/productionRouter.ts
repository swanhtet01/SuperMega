import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { 
  getProductionRecords, 
  createProductionRecord,
  getProductionSummary,
  getProductionByDateRange 
} from "../db";

export const productionRouter = router({
  // Get all production records
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ input }) => {
      const records = await getProductionRecords(input.limit, input.offset);
      return records;
    }),

  // Get production by date range
  byDateRange: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const records = await getProductionByDateRange(input.startDate, input.endDate);
      return records;
    }),

  // Get production summary (for dashboard)
  summary: protectedProcedure
    .query(async () => {
      const summary = await getProductionSummary();
      return summary;
    }),

  // Create new production record
  create: protectedProcedure
    .input(z.object({
      productionDate: z.string(),
      tireSize: z.string(),
      tireType: z.string(),
      quantityProduced: z.number(),
      quantityApproved: z.number(),
      quantityRejected: z.number(),
      shift: z.string().optional(),
      batchNumber: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const record = await createProductionRecord({
        ...input,
        productionDate: new Date(input.productionDate),
      });
      return record;
    }),

  // Get production statistics
  stats: protectedProcedure
    .input(z.object({
      period: z.enum(["day", "week", "month", "year"]).optional().default("month"),
    }))
    .query(async ({ input }) => {
      // TODO: Implement statistics calculation
      return {
        totalProduction: 0,
        approvalRate: 0,
        defectRate: 0,
        trend: [],
      };
    }),
});

