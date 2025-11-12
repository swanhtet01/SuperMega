import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { 
  getRawMaterials,
  getFinishedGoods,
  updateRawMaterialStock,
  updateFinishedGoodsStock,
  getLowStockItems 
} from "../db";

export const inventoryRouter = router({
  // Get all raw materials
  rawMaterials: protectedProcedure
    .query(async () => {
      const materials = await getRawMaterials();
      return materials;
    }),

  // Get all finished goods
  finishedGoods: protectedProcedure
    .query(async () => {
      const goods = await getFinishedGoods();
      return goods;
    }),

  // Update raw material stock
  updateRawMaterial: protectedProcedure
    .input(z.object({
      id: z.string(),
      quantity: z.number(),
      operation: z.enum(["add", "subtract"]),
    }))
    .mutation(async ({ input }) => {
      const updated = await updateRawMaterialStock(input.id, input.quantity, input.operation);
      return updated;
    }),

  // Update finished goods stock
  updateFinishedGoods: protectedProcedure
    .input(z.object({
      id: z.string(),
      quantity: z.number(),
      operation: z.enum(["add", "subtract"]),
    }))
    .mutation(async ({ input }) => {
      const updated = await updateFinishedGoodsStock(input.id, input.quantity, input.operation);
      return updated;
    }),

  // Get low stock items
  lowStock: protectedProcedure
    .query(async () => {
      const items = await getLowStockItems();
      return items;
    }),

  // Get inventory summary
  summary: protectedProcedure
    .query(async () => {
      const rawMaterials = await getRawMaterials();
      const finishedGoods = await getFinishedGoods();
      
      const totalRawMaterialValue = rawMaterials.reduce((sum, item) => 
        sum + (item.currentStock * item.unitCost), 0
      );
      
      const totalFinishedGoodsValue = finishedGoods.reduce((sum, item) => 
        sum + (item.currentStock * item.unitPrice), 0
      );

      return {
        totalRawMaterialValue,
        totalFinishedGoodsValue,
        totalValue: totalRawMaterialValue + totalFinishedGoodsValue,
        rawMaterialCount: rawMaterials.length,
        finishedGoodsCount: finishedGoods.length,
      };
    }),
});

