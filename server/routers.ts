import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

// Import feature routers
import { dashboardRouter } from "./routers/dashboardRouter";
import { productionRouter } from "./routers/productionRouter";
import { qualityRouter } from "./routers/qualityRouter";
import { inventoryRouter } from "./routers/inventoryRouter";
import { salesRouter } from "./routers/salesRouter";
import { financialRouter } from "./routers/financialRouter";
import { aiRouter } from "./routers/aiRouter";
import { excelRouter } from "./routers/excelRouter";

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

  // Feature routers
  dashboard: dashboardRouter,
  production: productionRouter,
  quality: qualityRouter,
  inventory: inventoryRouter,
  sales: salesRouter,
  financial: financialRouter,
  ai: aiRouter,
  excel: excelRouter,
});

export type AppRouter = typeof appRouter;

