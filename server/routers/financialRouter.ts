import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { 
  getFinancialTransactions,
  createFinancialTransaction,
  getFinancialSummary,
  getProfitAndLoss 
} from "../db";

export const financialRouter = router({
  // Get all transactions
  transactions: protectedProcedure
    .input(z.object({
      type: z.enum(["revenue", "expense", "asset", "liability"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      limit: z.number().optional().default(100),
    }))
    .query(async ({ input }) => {
      const transactions = await getFinancialTransactions(input);
      return transactions;
    }),

  // Create new transaction
  createTransaction: protectedProcedure
    .input(z.object({
      transactionDate: z.string(),
      transactionType: z.enum(["revenue", "expense", "asset", "liability"]),
      category: z.string(),
      description: z.string().optional(),
      amount: z.number(),
      referenceNumber: z.string().optional(),
      dealerId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const transaction = await createFinancialTransaction({
        ...input,
        transactionDate: new Date(input.transactionDate),
      });
      return transaction;
    }),

  // Get financial summary
  summary: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const summary = await getFinancialSummary(input);
      return summary;
    }),

  // Get P&L statement
  profitAndLoss: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const pl = await getProfitAndLoss(input.startDate, input.endDate);
      return pl;
    }),

  // Get expense breakdown
  expenseBreakdown: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const transactions = await getFinancialTransactions({
        type: "expense",
        ...input,
      });
      
      const breakdown = transactions.reduce((acc, t) => {
        const category = t.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += t.amount;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(breakdown).map(([category, amount]) => ({
        category,
        amount,
      }));
    }),
});

