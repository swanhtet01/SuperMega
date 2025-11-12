import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { 
  getProductionRecords, 
  getProductionSummary,
  getRawMaterials,
  getFinishedGoods,
  getDealers,
  getSalesOrders,
  getFinancialTransactions,
  getSystemAlerts,
  getDashboardKPIs,
  addProductionRecord,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard API
  dashboard: router({
    getKPIs: protectedProcedure
      .input((val: unknown) => val as { month: string })
      .query(async ({ input }) => {
        return await getDashboardKPIs(input.month);
      }),
    
    getAlerts: protectedProcedure.query(async () => {
      return await getSystemAlerts(false);
    }),
  }),

  // Production Management API
  production: router({
    getRecords: protectedProcedure
      .input((val: unknown) => val as { startDate?: string; endDate?: string })
      .query(async ({ input }) => {
        return await getProductionRecords(input.startDate, input.endDate);
      }),
    
    getSummary: protectedProcedure
      .input((val: unknown) => val as { month: string })
      .query(async ({ input }) => {
        return await getProductionSummary(input.month);
      }),
    
    addRecord: protectedProcedure
      .input((val: unknown) => val as any)
      .mutation(async ({ input }) => {
        return await addProductionRecord(input);
      }),
  }),

  // Inventory Management API
  inventory: router({
    getRawMaterials: protectedProcedure.query(async () => {
      return await getRawMaterials();
    }),
    
    getFinishedGoods: protectedProcedure.query(async () => {
      return await getFinishedGoods();
    }),
  }),

  // Sales Management API
  sales: router({
    getDealers: protectedProcedure.query(async () => {
      return await getDealers();
    }),
    
    getOrders: protectedProcedure
      .input((val: unknown) => val as { startDate?: string; endDate?: string })
      .query(async ({ input }) => {
        return await getSalesOrders(input.startDate, input.endDate);
      }),
  }),

  // Financial Management API
  financial: router({
    getTransactions: protectedProcedure
      .input((val: unknown) => val as { startDate?: string; endDate?: string })
      .query(async ({ input }) => {
        return await getFinancialTransactions(input.startDate, input.endDate);
      }),
  }),
});

export type AppRouter = typeof appRouter;
