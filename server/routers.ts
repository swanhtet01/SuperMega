import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { dashboardRouter } from "./routers/dashboardRouter";
import { productionRouter } from "./routers/productionRouter";
import { communicationRouter } from "./routers/communicationRouter";
import { authRouter } from "./routers/authRouter";

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
    ...authRouter._def.procedures,
  }),

  // YTF Feature Routers
  dashboard: dashboardRouter,
  production: productionRouter,
  communication: communicationRouter,
});

export type AppRouter = typeof appRouter;

