import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertMenuItem, InsertOrder, InsertUser, menuItems, orders, reservations, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(eq(menuItems.isAvailable, 1)).orderBy(menuItems.id);
}

export async function listAllMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).orderBy(menuItems.id);
}

export async function createMenuItem(item: InsertMenuItem) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(menuItems).values(item);
  const id = Number(result[0].insertId);
  const created = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return created[0];
}

export async function updateMenuItem(id: number, item: Partial<InsertMenuItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(menuItems).set(item).where(eq(menuItems.id, id));
  const updated = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return updated[0];
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.delete(menuItems).where(eq(menuItems.id, id));
  return { success: true as const };
}

export async function createReservation(input: { guestName: string; guestCount: number; reservationAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(reservations).values(input);
  const id = Number(result[0].insertId);
  const created = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return created[0];
}

export async function listReservations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reservations).orderBy(desc(reservations.reservationAt));
}

export async function updateReservationStatus(id: number, status: "pending" | "confirmed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(reservations).set({ status }).where(eq(reservations.id, id));
  const updated = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
  return updated[0];
}

export async function createOrder(input: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(orders).values(input);
  const id = Number(result[0].insertId);
  const created = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return created[0];
}

export async function listOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: "new" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  const updated = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return updated[0];
}
