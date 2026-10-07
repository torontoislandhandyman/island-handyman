import { and, asc, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  availabilitySlots,
  businessSettings,
  InsertJobRequest,
  InsertMessage,
  JobRequest,
  jobRequests,
  Message,
  messages,
  InsertTestimonial,
  testimonials,
  customers,
  Customer,
  projects,
  Project,
  projectFiles,
  ProjectFile,
  projectEvents,
  ProjectEvent,
  InsertUser,
  users,
  InsertNotification,
  Notification,
  notifications,
} from "../drizzle/schema";
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

const fallbackSettings = {
  id: 1,
  onlineStatus: "online" as const,
  publicMessage: "",
  contactEmail: null,
  contactPhone: null,
  jobAvailability: "accepting" as const,
  onlineLabel: "Checking messages",
  nextAvailableLabel: "3:00 PM",
  updatedAt: new Date(),
};

const fallbackOpenings = [
  { id: 1, slotDate: "today", startTime: "9:00 AM", endTime: "11:00 AM", status: "available" as const, publicNote: null, isPublic: 1, createdAt: new Date() },
  { id: 2, slotDate: "today", startTime: "1:00 PM", endTime: "3:00 PM", status: "booked" as const, publicNote: null, isPublic: 1, createdAt: new Date() },
  { id: 3, slotDate: "today", startTime: "3:00 PM", endTime: "5:00 PM", status: "available" as const, publicNote: null, isPublic: 1, createdAt: new Date() },
];

export async function getPublicSiteData() {
  const db = await getDb();
  if (!db) return { settings: fallbackSettings, calendar: fallbackOpenings };
  const settings = (await db.select().from(businessSettings).limit(1))[0] ?? fallbackSettings;
  const calendar = await db.select().from(availabilitySlots).where(eq(availabilitySlots.isPublic, 1)).orderBy(asc(availabilitySlots.slotDate), asc(availabilitySlots.startTime)).limit(90);
  return { settings, calendar };
}

export async function getPrivateAvailability() {
  const db = await getDb();
  if (!db) return { settings: fallbackSettings, openings: fallbackOpenings };
  const settings = (await db.select().from(businessSettings).limit(1))[0] ?? fallbackSettings;
  const openings = await db
    .select()
    .from(availabilitySlots)
    .where(and(eq(availabilitySlots.isPublic, 1), eq(availabilitySlots.status, "available")))
    .orderBy(asc(availabilitySlots.slotDate), asc(availabilitySlots.startTime))
    .limit(30);
  return { settings, openings };
}

export async function getAdminOverview() {
  const db = await getDb();
  const privateAvailability = await getPrivateAvailability();
  if (!db) return { ...privateAvailability, requests: [], messages: [] as Message[], testimonials: [] };
  const requests = await db.select().from(jobRequests).orderBy(desc(jobRequests.createdAt)).limit(50);
  const openings = await db.select().from(availabilitySlots).orderBy(asc(availabilitySlots.slotDate), asc(availabilitySlots.startTime)).limit(50);
  const requestIds = requests.map((request) => request.id);
  const conversationMessages = requestIds.length
    ? await db.select().from(messages).where(inArray(messages.jobRequestId, requestIds)).orderBy(asc(messages.createdAt))
    : [];
  const customerTestimonials = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt)).limit(50);
  return { settings: privateAvailability.settings, openings: openings.length ? openings : privateAvailability.openings, requests, messages: conversationMessages, testimonials: customerTestimonials };
}

export async function getPublicTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(and(eq(testimonials.customerWantsPublic, 1), eq(testimonials.ownerApproved, 1))).orderBy(desc(testimonials.createdAt)).limit(12);
}

export async function createJobRequest(input: Omit<InsertJobRequest, "status" | "customerAccess" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(jobRequests).values({ ...input, email: input.email || null, status: "new", customerAccess: "pending" });
  return Number(result[0].insertId);
}

export async function updateBusinessSettings(input: { onlineStatus: "online" | "offline" | "busy"; jobAvailability: "accepting" | "limited" | "fully_booked" | "not_working"; publicMessage?: string; contactEmail?: string | null; contactPhone?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(businessSettings).values({ id: 1, ...input }).onDuplicateKeyUpdate({ set: input });
  return (await db.select().from(businessSettings).where(eq(businessSettings.id, 1)).limit(1))[0];
}

export async function updateJobRequestStatus(id: number, status: JobRequest["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(jobRequests).set({ status }).where(eq(jobRequests.id, id));
}

export async function updateCustomerAccess(id: number, customerAccess: JobRequest["customerAccess"]) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(jobRequests).set({ customerAccess }).where(eq(jobRequests.id, id));
}

export async function updateCustomerAccountEmail(id: number, accountEmail: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(jobRequests).set({ accountEmail }).where(eq(jobRequests.id, id));
}

export async function updateOpeningVisibility(id: number, isPublic: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(availabilitySlots).set({ isPublic: isPublic ? 1 : 0 }).where(eq(availabilitySlots.id, id));
}

export async function updateAvailabilitySlot(input: { id: number; status: "available" | "tentative" | "booked" | "closed" | "off_island"; startTime: string; endTime: string; publicNote: string | null; isPublic: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(availabilitySlots).set({ status: input.status, startTime: input.startTime, endTime: input.endTime, publicNote: input.publicNote, isPublic: input.isPublic }).where(eq(availabilitySlots.id, input.id));
}

export async function getApprovedRequestsForCustomer(user: { email: string | null }) {
  const db = await getDb();
  if (!db || !user.email) return [];
  return db.select().from(jobRequests).where(and(or(eq(jobRequests.email, user.email), eq(jobRequests.accountEmail, user.email)), eq(jobRequests.customerAccess, "approved"))).orderBy(desc(jobRequests.createdAt));
}

export async function getCustomerPortal(user: { email: string | null }) {
  const requests = await getApprovedRequestsForCustomer(user);
  if (!user.email || !requests.length) return { access: "pending" as const, requests: [], messages: [] as Message[] };
  const availability = await getPrivateAvailability();
  const db = await getDb();
  const requestIds = requests.map((request) => request.id);
  const conversationMessages = db
    ? await db.select().from(messages).where(inArray(messages.jobRequestId, requestIds)).orderBy(asc(messages.createdAt))
    : [];
  return { access: "approved" as const, settings: availability.settings, openings: availability.openings, requests, messages: conversationMessages };
}

export async function createCustomerMessage(user: { id: number; email: string | null }, requestId: number, body: string) {
  const approvedRequests = await getApprovedRequestsForCustomer(user);
  const request = approvedRequests.find((item) => item.id === requestId);
  if (!request) throw new Error("Approved customer access is required for this conversation");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const message: InsertMessage = { jobRequestId: requestId, projectId: request.projectId, senderType: "customer", senderUserId: user.id, body };
  await db.insert(messages).values(message);
}

export async function createCustomerTestimonial(user: { email: string | null }, requestId: number, body: string, customerWantsPublic: boolean, beforeImageUrl: string | null, afterImageUrl: string | null) {
  const approvedRequests = await getApprovedRequestsForCustomer(user);
  const request = approvedRequests.find((item) => item.id === requestId);
  if (!request) throw new Error("Approved customer access is required to leave a testimonial");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const testimonial: InsertTestimonial = { jobRequestId: requestId, customerName: request.customerName, body, beforeImageUrl, afterImageUrl, customerWantsPublic: customerWantsPublic ? 1 : 0, ownerApproved: 0 };
  await db.insert(testimonials).values(testimonial);
}

export async function updateTestimonialApproval(id: number, ownerApproved: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(testimonials).set({ ownerApproved: ownerApproved ? 1 : 0 }).where(eq(testimonials.id, id));
}

export async function createOwnerMessage(requestId: number, userId: number, body: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const request = (await db.select().from(jobRequests).where(eq(jobRequests.id, requestId)).limit(1))[0];
  if (!request || request.customerAccess !== "approved") throw new Error("Approve customer access before starting a private conversation");
  const message: InsertMessage = { jobRequestId: requestId, projectId: request.projectId, senderType: "owner", senderUserId: userId, body };
  await db.insert(messages).values(message);
}

export async function createProjectFileRecord(input: import("../drizzle/schema").InsertProjectFile) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(projectFiles).values(input);
  return Number(result[0].insertId);
}

export async function getAuthorizedProjectFile(fileId: number, user: { email: string | null }, owner = false) {
  const db = await getDb();
  if (!db) return undefined;
  const file = (await db.select().from(projectFiles).where(eq(projectFiles.id, fileId)).limit(1))[0];
  if (!file) return undefined;
  const project = await getAuthorizedProject(file.projectId, user, owner);
  return project ? file : undefined;
}

export async function getCustomerWorkspace(user: { email: string | null }) {
  const db = await getDb();
  if (!db || !user.email) return { access: "pending" as const, customer: null, projects: [], requests: [], messages: [] as Message[], files: [] as ProjectFile[], events: [] as ProjectEvent[] };
  const customer = (await db.select().from(customers).where(or(eq(customers.email, user.email), eq(customers.accountEmail, user.email))).limit(1))[0];
  if (!customer) return { access: "pending" as const, customer: null, projects: [], requests: [], messages: [] as Message[], files: [] as ProjectFile[], events: [] as ProjectEvent[] };
  const customerRequests = await db.select().from(jobRequests).where(eq(jobRequests.customerId, customer.id)).orderBy(desc(jobRequests.createdAt));
  const approvedRequests = customerRequests.filter((request) => request.customerAccess === "approved");
  if (!approvedRequests.length) return { access: "pending" as const, customer: null, projects: [], requests: [], messages: [] as Message[], files: [] as ProjectFile[], events: [] as ProjectEvent[] };
  const approvedProjectIds = approvedRequests.flatMap((request) => request.projectId ? [request.projectId] : []);
  const customerProjects = approvedProjectIds.length ? await db.select().from(projects).where(and(eq(projects.customerId, customer.id), inArray(projects.id, approvedProjectIds))).orderBy(desc(projects.updatedAt)) : [];
  const projectIds = customerProjects.map((project) => project.id);
  const customerMessages = projectIds.length ? await db.select().from(messages).where(inArray(messages.projectId, projectIds)).orderBy(asc(messages.createdAt)) : [];
  const files = projectIds.length ? await db.select().from(projectFiles).where(and(eq(projectFiles.customerId, customer.id), inArray(projectFiles.projectId, projectIds))).orderBy(desc(projectFiles.createdAt)) : [];
  const events = projectIds.length ? await db.select().from(projectEvents).where(eq(projectEvents.customerId, customer.id)).orderBy(desc(projectEvents.createdAt)) : [];
  return { access: "approved" as const, customer, projects: customerProjects, requests: approvedRequests, messages: customerMessages, files, events };
}

export async function getOwnerWorkspace() {
  const db = await getDb();
  if (!db) return { customers: [] as Customer[], projects: [] as Project[], files: [] as ProjectFile[], events: [] as ProjectEvent[], messages: [] as Message[], stats: { customers: 0, projects: 0, active: 0, completed: 0, paused: 0, unread: 0 } };
  const approvedUnlinked = await db.select().from(jobRequests).where(and(eq(jobRequests.customerAccess, "approved"), isNull(jobRequests.projectId))).limit(50);
  for (const request of approvedUnlinked) await approveRequestAndCreateProject(request.id, "approved");
  const customerRows = await db.select().from(customers).orderBy(desc(customers.updatedAt));
  const projectRows = await db.select().from(projects).orderBy(desc(projects.updatedAt));
  const projectIds = projectRows.map((project) => project.id);
  const fileRows = projectIds.length ? await db.select().from(projectFiles).where(inArray(projectFiles.projectId, projectIds)).orderBy(desc(projectFiles.createdAt)) : [];
  const eventRows = projectIds.length ? await db.select().from(projectEvents).where(inArray(projectEvents.projectId, projectIds)).orderBy(desc(projectEvents.createdAt)) : [];
  const messageRows = projectIds.length ? await db.select().from(messages).where(inArray(messages.projectId, projectIds)).orderBy(asc(messages.createdAt)) : [];
  const activeStatuses = ["new", "reviewing", "need_more_information", "quoted", "scheduled", "in_progress"] as const;
  return { customers: customerRows, projects: projectRows, files: fileRows, events: eventRows, messages: messageRows, stats: { customers: customerRows.length, projects: projectRows.length, active: projectRows.filter((project) => activeStatuses.includes(project.status as typeof activeStatuses[number])).length, completed: projectRows.filter((project) => project.status === "completed").length, paused: projectRows.filter((project) => project.status === "paused" || project.status === "archived").length, unread: messageRows.filter((message) => message.senderType === "customer" && !message.readAt).length } };
}

export async function ensureCustomerFromRequest(requestId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const request = (await db.select().from(jobRequests).where(eq(jobRequests.id, requestId)).limit(1))[0];
  if (!request) throw new Error("Request not found");
  let customer = request.customerId ? (await db.select().from(customers).where(eq(customers.id, request.customerId)).limit(1))[0] : undefined;
  if (!customer) {
    customer = (await db.select().from(customers).where(or(request.email ? eq(customers.email, request.email) : eq(customers.email, ""), request.accountEmail ? eq(customers.accountEmail, request.accountEmail) : eq(customers.accountEmail, ""))).limit(1))[0];
  }
  if (!customer) {
    const result = await db.insert(customers).values({ name: request.customerName, email: request.email, phone: request.phone, accountEmail: request.accountEmail || request.email });
    customer = (await db.select().from(customers).where(eq(customers.id, Number(result[0].insertId))).limit(1))[0];
  } else {
    await db.update(customers).set({ name: request.customerName, email: request.email || customer.email, phone: request.phone || customer.phone, accountEmail: request.accountEmail || request.email || customer.accountEmail }).where(eq(customers.id, customer.id));
  }
  if (!customer) throw new Error("Could not create customer");
  await db.update(jobRequests).set({ customerId: customer.id }).where(eq(jobRequests.id, requestId));
  return customer;
}

export async function approveRequestAndCreateProject(requestId: number, access: "pending" | "approved" | "declined", title?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(jobRequests).set({ customerAccess: access }).where(eq(jobRequests.id, requestId));
  if (access !== "approved") return;
  const customer = await ensureCustomerFromRequest(requestId);
  const request = (await db.select().from(jobRequests).where(eq(jobRequests.id, requestId)).limit(1))[0];
  if (!request?.projectId) {
    const result = await db.insert(projects).values({ customerId: customer.id, title: title?.trim() || request?.service || "New project", location: request?.location, description: request?.description, status: request?.status === "completed" ? "completed" : "new" });
    await db.update(jobRequests).set({ projectId: Number(result[0].insertId) }).where(eq(jobRequests.id, requestId));
    await db.insert(projectEvents).values({ customerId: customer.id, projectId: Number(result[0].insertId), eventType: "created", note: "Project created from approved request." });
  }
}

export async function updateProjectStatus(projectId: number, status: Project["status"], userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const project = (await db.select().from(projects).where(eq(projects.id, projectId)).limit(1))[0];
  if (!project) throw new Error("Project not found");
  await db.update(projects).set({ status, completedAt: status === "completed" ? new Date() : project.completedAt }).where(eq(projects.id, projectId));
  await db.insert(projectEvents).values({ customerId: project.customerId, projectId, eventType: "status_changed", note: `Project status changed to ${status}.`, createdByUserId: userId });
}

export async function updateCustomerNotes(customerId: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.update(customers).set({ notes }).where(eq(customers.id, customerId));
}

export async function getAuthorizedProject(projectId: number, user: { email: string | null }, owner = false) {
  const db = await getDb();
  if (!db) return undefined;
  const project = (await db.select().from(projects).where(eq(projects.id, projectId)).limit(1))[0];
  if (!project) return undefined;
  if (owner) return project;
  if (!user.email) return undefined;
  const customer = (await db.select().from(customers).where(and(eq(customers.id, project.customerId), or(eq(customers.email, user.email), eq(customers.accountEmail, user.email)))).limit(1))[0];
  if (!customer) return undefined;
  const approvedLink = (await db.select({ id: jobRequests.id }).from(jobRequests).where(and(eq(jobRequests.projectId, project.id), eq(jobRequests.customerId, customer.id), eq(jobRequests.customerAccess, "approved"))).limit(1))[0];
  return approvedLink ? project : undefined;
}

export async function addProjectEvent(projectId: number, note: string, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const project = (await db.select().from(projects).where(eq(projects.id, projectId)).limit(1))[0];
  if (!project) throw new Error("Project not found");
  await db.insert(projectEvents).values({ customerId: project.customerId, projectId, eventType: "note", note, createdByUserId: userId });
}

export async function markProjectMessagesRead(projectId: number, reader: "customer" | "owner") {
  const db = await getDb();
  if (!db) return;
  await db.update(messages).set({ readAt: new Date() }).where(and(eq(messages.projectId, projectId), eq(messages.senderType, reader === "owner" ? "customer" : "owner")));
}

export async function createNotification(input: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(input);
}

export async function getNotifications(user: { id: number; role: "admin" | "user"; email: string | null }) {
  const db = await getDb();
  if (!db) return [] as Notification[];
  const recipient = user.role === "admin"
    ? eq(notifications.recipientRole, "owner")
    : and(eq(notifications.recipientRole, "customer"), or(eq(notifications.recipientUserId, user.id), user.email ? eq(notifications.recipientEmail, user.email) : eq(notifications.recipientEmail, "")));
  return db.select().from(notifications).where(recipient).orderBy(desc(notifications.createdAt)).limit(40);
}

export async function markNotificationRead(id: number, user: { id: number; role: "admin" | "user"; email: string | null }) {
  const db = await getDb();
  if (!db) return;
  const recipient = user.role === "admin"
    ? eq(notifications.recipientRole, "owner")
    : and(eq(notifications.recipientRole, "customer"), or(eq(notifications.recipientUserId, user.id), user.email ? eq(notifications.recipientEmail, user.email) : eq(notifications.recipientEmail, "")));
  await db.update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.id, id), recipient));
}
