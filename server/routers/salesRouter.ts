import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { 
  getDealers,
  createDealer,
  updateDealer,
  getSalesOrders,
  createSalesOrder,
  updateSalesOrderStatus,
  getSalesOrderItems 
} from "../db";

export const salesRouter = router({
  // Get all dealers
  dealers: protectedProcedure
    .input(z.object({
      status: z.enum(["active", "inactive", "suspended"]).optional(),
    }))
    .query(async ({ input }) => {
      const dealers = await getDealers(input.status);
      return dealers;
    }),

  // Create new dealer
  createDealer: protectedProcedure
    .input(z.object({
      dealerCode: z.string(),
      dealerName: z.string(),
      contactPerson: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      dealerType: z.string().optional(),
      creditLimit: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const dealer = await createDealer(input);
      return dealer;
    }),

  // Update dealer
  updateDealer: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        dealerName: z.string().optional(),
        contactPerson: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        creditLimit: z.number().optional(),
        outstandingBalance: z.number().optional(),
        status: z.enum(["active", "inactive", "suspended"]).optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const updated = await updateDealer(input.id, input.data);
      return updated;
    }),

  // Get all sales orders
  orders: protectedProcedure
    .input(z.object({
      dealerId: z.string().optional(),
      status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
      limit: z.number().optional().default(50),
    }))
    .query(async ({ input }) => {
      const orders = await getSalesOrders(input);
      return orders;
    }),

  // Create new sales order
  createOrder: protectedProcedure
    .input(z.object({
      dealerId: z.string(),
      orderDate: z.string(),
      deliveryDate: z.string().optional(),
      items: z.array(z.object({
        tireSize: z.string(),
        tireType: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const order = await createSalesOrder({
        ...input,
        orderDate: new Date(input.orderDate),
        deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
        items: input.items.map(item => ({
          tireSize: item.tireSize,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      return order;
    }),

  // Update order status
  updateOrderStatus: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const updated = await updateSalesOrderStatus(input.orderId, input.status);
      return updated;
    }),

  // Get order items
  orderItems: protectedProcedure
    .input(z.object({
      orderId: z.string(),
    }))
    .query(async ({ input }) => {
      const items = await getSalesOrderItems(input.orderId);
      return items;
    }),

  // Get sales summary
  summary: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const orders = await getSalesOrders({});
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const deliveredOrders = orders.filter(o => o.status === "delivered").length;

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
      };
    }),
});

