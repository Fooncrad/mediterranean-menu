import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import {
  createMenuItem,
  createReservation,
  deleteMenuItem,
  listAllMenuItems,
  listMenuItems,
  listReservations,
  updateMenuItem,
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
  }),
});

export type AppRouter = typeof appRouter;
