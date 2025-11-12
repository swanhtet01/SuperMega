import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { authenticateUser } from "../services/simpleAuth";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import jwt from "jsonwebtoken";
import { ENV } from "../_core/env";

export const authRouter = router({
  simpleLogin: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await authenticateUser(input.username, input.password);
      
      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Create session token
      const token = jwt.sign(
        {
          sub: user.id,
          name: user.name,
          email: user.email,
        },
        ENV.jwtSecret,
        { expiresIn: '7d' }
      );

      // Set cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }),
});
