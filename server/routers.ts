import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import {
  createMenuItem,
  createOrder,
  createReservation,
  deleteMenuItem,
  listAllMenuItems,
  listMenuItems,
  listOrders,
  listReservations,
  updateMenuItem,
  updateOrderStatus,
  updateReservationStatus,
} from "./db";

const menuItemInput = z.object({
  category: z.enum(["breakfast", "mezza", "mains", "desserts"]),
  imageUrl: z.string().max(512).refine((value) => value.startsWith("/") || value.startsWith("https://"), "Image URL must be a secure URL or internal storage path"),
  price: z.number().int().min(0).max(99999),
  rating: z.string().max(8).default("4.8"),
  isVegan: z.number().int().min(0).max(1).default(0),
  isPopular: z.number().int().min(0).max(1).default(0),
  isAvailable: z.number().int().min(0).max(1).default(1),
  nameAr: z.string().min(1).max(180),
  descriptionAr: z.string().min(1),
  nameEn: z.string().min(1).max(180),
  descriptionEn: z.string().min(1),
  nameFr: z.string().min(1).max(180),
  descriptionFr: z.string().min(1),
});

const adminMenuProcedure = adminProcedure;
const deliveryFees = { central: 10, north: 15, east: 18, west: 18, south: 20, outside: 30 } as const;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  menu: router({
    list: publicProcedure.query(() => listMenuItems()),
    createReservation: publicProcedure.input(z.object({
      guestName: z.string().min(2).max(180),
      guestCount: z.number().int().min(1).max(30),
      reservationAt: z.coerce.date(),
    })).mutation(async ({ input }) => {
      const reservation = await createReservation(input);
      await notifyOwner({
        title: "حجز جديد في Olive & Clay",
        content: `الاسم: ${input.guestName}\nعدد الضيوف: ${input.guestCount}\nالموعد: ${input.reservationAt.toLocaleString("ar-SA")}`,
      }).catch((error) => console.warn("[Reservation] Owner notification failed:", error));
      return reservation;
    }),
  }),
  orders: router({
    callWaiter: publicProcedure.input(z.object({ location: z.string().max(80).optional() })).mutation(async ({ input }) => {
      await notifyOwner({ title: "نداء نادل جديد", content: `يرجى التوجه إلى: ${input.location || "الطاولة غير محددة"}` }).catch((error) => console.warn("[Waiter] Owner notification failed:", error));
      return { success: true } as const;
    }),
    create: publicProcedure.input(z.object({
      orderType: z.enum(["reservation", "takeaway", "delivery", "room_service"]),
      customerName: z.string().min(2).max(180),
      customerPhone: z.string().max(40).optional(),
      roomNumber: z.string().max(40).optional(),
      address: z.string().max(1000).optional(),
      deliveryZone: z.enum(["central", "north", "east", "west", "south", "outside"]).optional(),
      reservationAt: z.coerce.date().optional(),
      guestCount: z.number().int().min(1).max(30).optional(),
      items: z.array(z.object({ id: z.string(), title: z.string().max(180), quantity: z.number().int().min(1).max(99), price: z.number().int().min(0) })).min(1),
      total: z.number().int().min(0).max(999999),
    })).mutation(async ({ input }) => {
      let reservationId: number | undefined;
      const deliveryFee = input.orderType === "delivery" && input.deliveryZone ? deliveryFees[input.deliveryZone] : 0;
      if (input.orderType === "reservation" && input.reservationAt) {
        const reservation = await createReservation({ guestName: input.customerName, guestCount: input.guestCount ?? 2, reservationAt: input.reservationAt });
        reservationId = reservation?.id;
      }
      const order = await createOrder({ orderType: input.orderType, customerName: input.customerName, customerPhone: input.customerPhone, roomNumber: input.roomNumber, address: input.address, deliveryZone: input.deliveryZone, deliveryFee, reservationId, itemsJson: JSON.stringify(input.items), total: input.total + deliveryFee });
      await notifyOwner({ title: "طلب جديد في Olive & Clay", content: `العميل: ${input.customerName}\nنوع الطلب: ${input.orderType}\nرسوم التوصيل: ${deliveryFee} SAR\nالإجمالي: ${input.total + deliveryFee} SAR` }).catch((error) => console.warn("[Order] Owner notification failed:", error));
      return order;
    }),
  }),
  admin: router({
    me: adminMenuProcedure.query(({ ctx }) => ctx.user),
    menu: router({
      list: adminMenuProcedure.query(() => listAllMenuItems()),
      uploadImage: adminMenuProcedure.input(z.object({
        fileName: z.string().min(1).max(180),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        base64: z.string().min(1).max(8_000_000),
      })).mutation(async ({ ctx, input }) => {
        const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const bytes = Buffer.from(input.base64, "base64");
        if (bytes.byteLength > 5 * 1024 * 1024) throw new Error("Image must be 5MB or smaller");
        return storagePut(`admin/${ctx.user.id}/${safeName}`, bytes, input.contentType);
      }),
      create: adminMenuProcedure.input(menuItemInput).mutation(({ input }) => createMenuItem(input)),
      update: adminMenuProcedure.input(z.object({ id: z.number().int().positive(), data: menuItemInput.partial() })).mutation(({ input }) => updateMenuItem(input.id, input.data)),
      remove: adminMenuProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deleteMenuItem(input.id)),
    }),
    reservations: router({
      list: adminMenuProcedure.query(() => listReservations()),
      updateStatus: adminMenuProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "confirmed", "cancelled"]) })).mutation(({ input }) => updateReservationStatus(input.id, input.status)),
    }),
    orders: router({
      list: adminMenuProcedure.query(() => listOrders()),
      updateStatus: adminMenuProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "confirmed", "preparing", "ready", "delivered", "cancelled"]) })).mutation(({ input }) => updateOrderStatus(input.id, input.status)),
    }),
  }),
});

export type AppRouter = typeof appRouter;
