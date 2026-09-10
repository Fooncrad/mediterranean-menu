import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  category: mysqlEnum("category", ["breakfast", "mezza", "mains", "desserts"]).notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  price: int("price").notNull(),
  rating: varchar("rating", { length: 8 }).default("4.8").notNull(),
  isVegan: int("isVegan").default(0).notNull(),
  isPopular: int("isPopular").default(0).notNull(),
  isAvailable: int("isAvailable").default(1).notNull(),
  nameAr: varchar("nameAr", { length: 180 }).notNull(),
  descriptionAr: text("descriptionAr").notNull(),
  nameEn: varchar("nameEn", { length: 180 }).notNull(),
  descriptionEn: text("descriptionEn").notNull(),
  nameFr: varchar("nameFr", { length: 180 }).notNull(),
  descriptionFr: text("descriptionFr").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  guestName: varchar("guestName", { length: 180 }).notNull(),
  guestCount: int("guestCount").notNull(),
  reservationAt: timestamp("reservationAt").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderType: mysqlEnum("orderType", ["reservation", "takeaway", "delivery", "room_service"]).notNull(),
  status: mysqlEnum("status", ["new", "confirmed", "preparing", "ready", "delivered", "cancelled"]).default("new").notNull(),
  customerName: varchar("customerName", { length: 180 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 40 }),
  roomNumber: varchar("roomNumber", { length: 40 }),
  address: text("address"),
  deliveryZone: varchar("deliveryZone", { length: 100 }),
  deliveryFee: int("deliveryFee").default(0).notNull(),
  reservationId: int("reservationId"),
  itemsJson: text("itemsJson").notNull(),
  total: int("total").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
