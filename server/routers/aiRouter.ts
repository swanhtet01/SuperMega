import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { 
  getProductionRecords, 
  getProductionSummary,
  getQualityInspections,
  getRawMaterials,
  getFinishedGoods,
  getDealers,
  getSalesOrders,
  getFinancialTransactions 
} from "../db";

/**
 * AI Assistant Router
 * Provides natural language query interface for business intelligence
 */
export const aiRouter = router({
  
  // Main chat endpoint - processes natural language queries
  chat: protectedProcedure
    .input(z.object({
      message: z.string(),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { message, conversationHistory = [] } = input;
      
      // Build context about Yangon Tyre's current data
      const context = await buildDataContext();
      
      // Create system prompt with business context
      const systemPrompt = `You are an AI business intelligence assistant for Yangon Tyre Factory, a tire manufacturing company in Myanmar.

You have access to real-time data from their ERP system including:
- Production records (tire sizes, quantities, batches, quality metrics)
- Quality inspections (defect rates, inspection results)
- Inventory (raw materials, finished goods, stock levels)
- Sales (dealers, orders, revenue)
- Financial data (expenses, revenue, profit/loss)

Current Business Context:
${context}

When answering questions:
1. Provide specific numbers and data when available
2. Offer insights and recommendations
3. Be concise but informative
4. Use Myanmar Kyat (MMK) for currency
5. Reference tire sizes in standard format (e.g., 750R16, 825R20)
6. If you need more specific data, suggest what reports or queries would help

Answer in a professional, helpful tone as if you're a senior business analyst.`;

      // Build conversation messages
      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        { role: "user" as const, content: message },
      ];

      // Call LLM
      const response = await invokeLLM({ messages });
      
      const assistantMessage = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

      return {
        message: assistantMessage,
        timestamp: new Date().toISOString(),
      };
    }),

  // Get suggested queries based on current data
  getSuggestedQueries: protectedProcedure
    .query(async () => {
      const suggestions = [
        {
          category: "Production",
          queries: [
            "Show me today's production summary",
            "What was our production last month by tire size?",
            "Which tire sizes are we producing the most?",
            "Show production trends for the last 6 months",
          ],
        },
        {
          category: "Quality",
          queries: [
            "What's our current defect rate?",
            "Show me defects by type this month",
            "Which tire sizes have the highest defect rate?",
            "How has our quality improved over time?",
          ],
        },
        {
          category: "Sales",
          queries: [
            "Which dealers owe us the most money?",
            "Show me top 10 dealers by sales volume",
            "What are our best-selling tire sizes?",
            "Show sales trends for this quarter",
          ],
        },
        {
          category: "Financial",
          queries: [
            "What's our profit margin this month?",
            "Show me expense breakdown by category",
            "What's our revenue vs expenses trend?",
            "Calculate cost per tire produced",
          ],
        },
        {
          category: "Inventory",
          queries: [
            "Which raw materials are running low?",
            "Show me finished goods inventory levels",
            "What's our inventory turnover rate?",
            "Predict next month's raw material needs",
          ],
        },
        {
          category: "Executive",
          queries: [
            "Generate executive summary for this week",
            "What are the top 3 issues I should address?",
            "Show me key performance indicators",
            "What's our overall business health?",
          ],
        },
      ];

      return suggestions;
    }),

  // Generate a report based on query
  generateReport: protectedProcedure
    .input(z.object({
      query: z.string(),
      format: z.enum(["summary", "detailed", "executive"]).optional(),
    }))
    .mutation(async ({ input }) => {
      const { query, format = "summary" } = input;
      
      // Build comprehensive data context
      const context = await buildDetailedDataContext();
      
      const systemPrompt = `You are generating a business report for Yangon Tyre Factory.

Data Context:
${context}

Generate a ${format} report that answers: "${query}"

Format the report with:
- Clear headings and sections
- Specific numbers and metrics
- Key insights and trends
- Actionable recommendations
- Professional business language

Use markdown formatting for structure.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate ${format} report for: ${query}` },
        ],
      });

      const report = response.choices[0]?.message?.content || "Unable to generate report.";

      return {
        report,
        generatedAt: new Date().toISOString(),
        query,
        format,
      };
    }),
});

/**
 * Build quick data context summary for AI
 */
async function buildDataContext(): Promise<string> {
  try {
    // Get recent data summaries
    const [production, quality, inventory, sales, financial] = await Promise.all([
      getProductionSummary().catch(() => null),
      getQualityInspections({ limit: 100 }).catch(() => []),
      Promise.all([
        getRawMaterials().catch(() => []),
        getFinishedGoods().catch(() => []),
      ]),
      Promise.all([
        getDealers().catch(() => []),
        getSalesOrders({ limit: 100 }).catch(() => []),
      ]),
      getFinancialTransactions({ limit: 100 }).catch(() => []),
    ]);

    const [rawMaterials, finishedGoods] = inventory;
    const [dealers, orders] = sales;

    // Calculate key metrics
    const totalProduction = production?.totalQuantity || 0;
    const defectRate = quality.length > 0 
      ? (quality.filter(q => q.result === "fail").length / quality.length * 100).toFixed(2)
      : "0.00";
    const lowStockMaterials = rawMaterials.filter(m => m.quantityInStock < m.reorderLevel).length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    
    const totalRevenue = financial
      .filter(t => t.transactionType === "revenue")
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = financial
      .filter(t => t.transactionType === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return `
Production: ${totalProduction} tires produced recently
Quality: ${defectRate}% defect rate from ${quality.length} inspections
Inventory: ${rawMaterials.length} raw materials (${lowStockMaterials} low stock), ${finishedGoods.length} finished goods
Sales: ${dealers.length} dealers, ${orders.length} orders (${pendingOrders} pending)
Financial: MMK ${totalRevenue.toLocaleString()} revenue, MMK ${totalExpenses.toLocaleString()} expenses
`.trim();
  } catch (error) {
    return "Limited data available. System is initializing.";
  }
}

/**
 * Build detailed data context for report generation
 */
async function buildDetailedDataContext(): Promise<string> {
  try {
    const basicContext = await buildDataContext();
    
    // Add more detailed breakdowns
    const production = await getProductionRecords({ limit: 500 }).catch(() => []);
    const quality = await getQualityInspections({ limit: 500 }).catch(() => []);
    
    // Production by tire size
    const productionBySize = production.reduce((acc, p) => {
      acc[p.tireSize] = (acc[p.tireSize] || 0) + p.quantityProduced;
      return acc;
    }, {} as Record<string, number>);

    // Defects by type
    const defectsByType = quality.reduce((acc, q) => {
      if (q.result === "fail") {
        acc[q.defectType || "unknown"] = (acc[q.defectType || "unknown"] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return `
${basicContext}

Production Breakdown by Tire Size:
${Object.entries(productionBySize).map(([size, qty]) => `- ${size}: ${qty} units`).join("\n")}

Defects Breakdown by Type:
${Object.entries(defectsByType).map(([type, count]) => `- ${type}: ${count} defects`).join("\n")}
`.trim();
  } catch (error) {
    return await buildDataContext();
  }
}

