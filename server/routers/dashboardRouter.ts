import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { 
  getProductionSummary,
  getQualityMetrics,
  getSalesSummary,
  getFinancialSummary,
  getInventorySummary,
  getSystemAlerts
} from "../db";

export const dashboardRouter = router({
  // Get all KPIs for dashboard
  getKPIs: protectedProcedure
    .input(z.object({
      month: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const production = await getProductionSummary();
      const quality = await getQualityMetrics({ startDate: undefined, endDate: undefined });
      const sales = await getSalesSummary();
      const financial = await getFinancialSummary({ startDate: undefined, endDate: undefined });
      const inventory = await getInventorySummary();

      return {
        production: {
          totalProduced: production.totalProduction || 0,
          totalApproved: production.totalApproved || 0,
          totalRejected: production.totalRejected || 0,
          approvalRate: production.approvalRate || 0,
        },
        quality: {
          defectRate: quality.defectRate || 0,
          totalInspections: quality.totalInspections || 0,
          passRate: quality.passRate || 0,
        },
        sales: {
          totalOrders: sales.totalOrders || 0,
          totalRevenue: sales.totalRevenue || 0,
          totalPaid: sales.totalPaid || 0,
          pendingOrders: sales.pendingOrders || 0,
        },
        financial: {
          totalRevenue: financial.totalRevenue || 0,
          totalExpenses: financial.totalExpenses || 0,
          netProfit: financial.netProfit || 0,
        },
        inventory: {
          lowStockItems: inventory.lowStockItems || 0,
          totalValue: inventory.totalValue || 0,
          finishedGoodsCount: inventory.finishedGoodsCount || 0,
        },
      };
    }),

  // Get system alerts
  getAlerts: protectedProcedure
    .query(async () => {
      const alerts = await getSystemAlerts();
      return alerts;
    }),
});

