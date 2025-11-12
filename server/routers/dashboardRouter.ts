import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getProductionSummary,
  getSalesSummary,
  getInventorySummary,
  getFinancialSummary,
  getQualityMetrics,
  getSystemInsights,
} from "../db";

export const dashboardRouter = router({
  kpis: protectedProcedure
    .input(
      z
        .object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const [production, sales, inventory, financial, quality] = await Promise.all([
        getProductionSummary(input),
        getSalesSummary(input),
        getInventorySummary(),
        getFinancialSummary(input),
        getQualityMetrics(input),
      ]);

      return {
        production,
        sales,
        inventory,
        financial,
        quality,
      };
    }),

  insights: protectedProcedure
    .input(
      z
        .object({
          insightType: z.string().optional(),
          severity: z.string().optional(),
          isResolved: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getSystemInsights(input);
    }),
});
