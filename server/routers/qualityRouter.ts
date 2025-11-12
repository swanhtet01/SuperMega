import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { 
  getQualityInspections,
  createQualityInspection,
  createDefect,
  getDefectsByInspection,
  getQualityMetrics 
} from "../db";

export const qualityRouter = router({
  // Get all inspections
  listInspections: protectedProcedure
    .input(z.object({
      batchId: z.string().optional(),
      stage: z.enum(["mixing", "building", "curing", "final"]).optional(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ input }) => {
      const inspections = await getQualityInspections(input);
      return inspections;
    }),

  // Create new inspection
  createInspection: protectedProcedure
    .input(z.object({
      batchId: z.string(),
      stage: z.enum(["mixing", "building", "curing", "final"]),
      result: z.enum(["pass", "fail", "rework"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const inspection = await createQualityInspection({
        ...input,
        inspectorId: ctx.user.id,
      });
      return inspection;
    }),

  // Create defect
  createDefect: protectedProcedure
    .input(z.object({
      inspectionId: z.string(),
      type: z.enum(["visual", "dimensional", "structural", "material"]),
      category: z.string(),
      severity: z.enum(["minor", "major", "critical"]),
      description: z.string(),
      photoUrl: z.string().optional(),
      rootCause: z.string().optional(),
      correctiveAction: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const defect = await createDefect(input);
      return defect;
    }),

  // Get defects for an inspection
  getDefects: protectedProcedure
    .input(z.object({
      inspectionId: z.string(),
    }))
    .query(async ({ input }) => {
      const defects = await getDefectsByInspection(input.inspectionId);
      return defects;
    }),

  // Get quality metrics
  metrics: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const metrics = await getQualityMetrics(input);
      return metrics;
    }),
});

