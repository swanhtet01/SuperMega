import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createProductionRecord,
  getProductionRecords,
  getProductionSummary,
} from "../db";

export const productionRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        productionDate: z.string(),
        batchNumber: z.string(),
        shiftType: z.enum(["1-shift", "3-shift"]),
        tireSize: z.string(),
        batchCode: z.string(),
        target1Shift: z.number().optional(),
        target3Shift: z.number().optional(),
        curingA: z.number(),
        curingB: z.number(),
        curingR: z.number(),
        totalProduced: z.number(),
        specWeight: z.string().optional(),
        weightSample1: z.string().optional(),
        weightSample2: z.string().optional(),
        weightSample3: z.string().optional(),
        averageWeight: z.string().optional(),
        totalWeight: z.string().optional(),
        supervisorName: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createProductionRecord({
        ...input,
        productionDate: new Date(input.productionDate),
      });
      return { success: true, id };
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          tireSize: z.string().optional(),
          batchNumber: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getProductionRecords(input);
    }),

  summary: protectedProcedure
    .input(
      z
        .object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getProductionSummary(input);
    }),
});
