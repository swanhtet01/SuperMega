import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getAnnouncements } from "../db";

export const communicationRouter = router({
  announcements: protectedProcedure
    .input(
      z
        .object({
          category: z.string().optional(),
          isPinned: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getAnnouncements(input);
    }),
});
