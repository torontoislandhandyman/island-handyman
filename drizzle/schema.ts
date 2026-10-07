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
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const businessSettings = mysqlTable("business_settings", {
  id: int("id").primaryKey(),
  onlineStatus: mysqlEnum("onlineStatus", ["online", "offline", "busy"]).default("online").notNull(),
  publicMessage: varchar("publicMessage", { length: 240 }).default("").notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 60 }),
  jobAvailability: mysqlEnum("jobAvailability", ["accepting", "limited", "fully_booked", "not_working"]).default("accepting").notNull(),
  onlineLabel: varchar("onlineLabel", { length: 120 }).default("Checking messages").notNull(),
  nextAvailableLabel: varchar("nextAvailableLabel", { length: 120 }).default("3:00 PM").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BusinessSettings = typeof businessSettings.$inferSelect;

export const availabilitySlots = mysqlTable("availability_slots", {
  id: int("id").autoincrement().primaryKey(),
  slotDate: varchar("slotDate", { length: 10 }).notNull(),
  startTime: varchar("startTime", { length: 20 }).notNull(),
  endTime: varchar("endTime", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["available", "tentative", "booked", "closed", "off_island"]).default("available").notNull(),
  publicNote: varchar("publicNote", { length: 240 }),
  isPublic: int("isPublic").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 60 }),
  notes: text("notes"),
  accountEmail: varchar("accountEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  location: varchar("location", { length: 220 }),
  description: text("description"),
  status: mysqlEnum("status", ["new", "reviewing", "need_more_information", "quoted", "scheduled", "in_progress", "completed", "declined", "cancelled", "paused", "archived"]).default("new").notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const jobRequests = mysqlTable("job_requests", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId"),
  projectId: int("projectId"),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  accountEmail: varchar("accountEmail", { length: 320 }),
  phone: varchar("phone", { length: 60 }),
  location: varchar("location", { length: 200 }).notNull(),
  service: varchar("service", { length: 160 }).notNull(),
  description: text("description").notNull(),
  preferredDate: varchar("preferredDate", { length: 20 }),
  preferredTime: varchar("preferredTime", { length: 80 }),
  urgency: mysqlEnum("urgency", ["routine", "soon", "urgent"]).default("routine").notNull(),
  status: mysqlEnum("status", ["new", "reviewing", "need_more_information", "quoted", "scheduled", "in_progress", "completed", "declined", "cancelled"]).default("new").notNull(),
  customerAccess: mysqlEnum("customerAccess", ["pending", "approved", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type JobRequest = typeof jobRequests.$inferSelect;
export type InsertJobRequest = typeof jobRequests.$inferInsert;

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  jobRequestId: int("jobRequestId").notNull(),
  projectId: int("projectId"),
  senderType: mysqlEnum("senderType", ["customer", "owner"]).notNull(),
  senderUserId: int("senderUserId"),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
});
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const projectFiles = mysqlTable("project_files", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  projectId: int("projectId").notNull(),
  uploadedByType: mysqlEnum("uploadedByType", ["customer", "owner"]).notNull(),
  uploadedByUserId: int("uploadedByUserId"),
  storageKey: varchar("storageKey", { length: 1000 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  fileSize: int("fileSize").notNull(),
  category: mysqlEnum("category", ["before", "during", "after", "document", "other"]).default("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = typeof projectFiles.$inferInsert;

export const projectEvents = mysqlTable("project_events", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  projectId: int("projectId").notNull(),
  eventType: varchar("eventType", { length: 80 }).notNull(),
  note: text("note").notNull(),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ProjectEvent = typeof projectEvents.$inferSelect;
export type InsertProjectEvent = typeof projectEvents.$inferInsert;

export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  jobRequestId: int("jobRequestId").notNull(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  body: text("body").notNull(),
  beforeImageUrl: varchar("beforeImageUrl", { length: 1000 }),
  afterImageUrl: varchar("afterImageUrl", { length: 1000 }),
  customerWantsPublic: int("customerWantsPublic").default(0).notNull(),
  ownerApproved: int("ownerApproved").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  recipientUserId: int("recipientUserId"),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  recipientRole: mysqlEnum("recipientRole", ["owner", "customer"]).notNull(),
  kind: varchar("kind", { length: 80 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  body: text("body").notNull(),
  projectId: int("projectId"),
  requestId: int("requestId"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
