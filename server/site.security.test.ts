import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createNotification, getDb, getNotifications, markNotificationRead } from "./db";
import { eq } from "drizzle-orm";
import { notifications } from "../drizzle/schema";
import type { TrpcContext } from "./_core/context";
import { DEFAULT_SITE_CONTENT } from "../shared/siteContent";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const regularUser: AuthenticatedUser = {
  id: 2,
  openId: "regular-user",
  email: "customer@example.com",
  name: "Customer",
  passwordHash: null,
  loginMethod: "password",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const ownerUser: AuthenticatedUser = {
  ...regularUser,
  id: 1,
  openId: "owner-user",
  email: "owner@example.com",
  name: "Owner",
  role: "admin",
};

describe("site security boundaries", () => {
  it("rejects malformed public job requests before touching the database", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.site.submitJobRequest({
      customerName: "A",
      email: "not-an-email",
      location: "Ward's Island",
      service: "Deck repair",
      description: "Too short",
      urgency: "routine",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("requires either email or phone contact on a public request", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.site.submitJobRequest({
      customerName: "Island Customer",
      email: "",
      phone: "",
      location: "Algonquin Island",
      service: "Fence repair",
      description: "The gate is sagging and needs a careful repair.",
      urgency: "routine",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("does not allow a regular authenticated user to open the admin overview", async () => {
    const caller = appRouter.createCaller(createContext(regularUser));
    await expect(caller.site.adminOverview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("keeps public site content readable for visitors but editable only by the owner", async () => {
    const customerCaller = appRouter.createCaller(createContext(regularUser));
    await expect(customerCaller.site.adminSiteContent()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(customerCaller.site.saveSiteContent(DEFAULT_SITE_CONTENT)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("exposes only public site settings and calendar data", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const result = await caller.site.publicSiteData();
    expect(result).toHaveProperty("settings");
    expect(result).toHaveProperty("calendar");
    expect(Array.isArray(result.calendar)).toBe(true);
  });

  it("keeps calendar editing behind owner authorization", async () => {
    const caller = appRouter.createCaller(createContext(regularUser));
    await expect(caller.site.updateAvailabilitySlot({ id: 1, status: "available", startTime: "9:00 AM", endTime: "11:00 AM", publicNote: null, isPublic: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not allow a regular authenticated user to open the owner workspace", async () => {
    const caller = appRouter.createCaller(createContext(regularUser));
    await expect(caller.site.workspace()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not allow an unauthenticated visitor to access the customer portal", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.customer.portal()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires authentication for notification access", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.notifications.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("scopes notification queries to the authenticated role", async () => {
    const customerCaller = appRouter.createCaller(createContext(regularUser));
    const ownerCaller = appRouter.createCaller(createContext(ownerUser));
    await expect(customerCaller.notifications.list()).resolves.toBeInstanceOf(Array);
    await expect(ownerCaller.notifications.list()).resolves.toBeInstanceOf(Array);
  });

  // This integration test inserts and deletes a row in the configured database; opt in explicitly.
  it.skipIf(process.env.RUN_DATABASE_INTEGRATION_TESTS !== "true")("creates, scopes, and marks a customer notification as read", async () => {
    const title = `Notification test ${Date.now()}`;
    await createNotification({ recipientRole: "customer", recipientEmail: regularUser.email, kind: "test", title, body: "Test notification" });
    const before = await getNotifications(regularUser);
    const item = before.find((notification) => notification.title === title);
    expect(item).toBeTruthy();
    expect(item?.readAt).toBeNull();
    await markNotificationRead(item!.id, ownerUser);
    const afterOwnerAttempt = await getNotifications(regularUser);
    expect(afterOwnerAttempt.find((notification) => notification.id === item!.id)?.readAt).toBeNull();
    const caller = appRouter.createCaller(createContext(regularUser));
    await caller.notifications.markRead({ id: item!.id });
    const afterCustomerRead = await getNotifications(regularUser);
    expect(afterCustomerRead.find((notification) => notification.id === item!.id)?.readAt).toBeInstanceOf(Date);
    const db = await getDb();
    if (db) await db.delete(notifications).where(eq(notifications.id, item!.id));
  });

  it("does not allow an unauthenticated visitor to access the persistent customer workspace or uploads", async () => {
    const caller = appRouter.createCaller(createContext(null));
    await expect(caller.customer.workspace()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.customer.uploadProjectFile({
      projectId: 1,
      category: "during",
      originalName: "photo.jpg",
      mimeType: "image/jpeg",
      fileData: "cGhvdG8=",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("keeps an authenticated but unapproved customer on the pending state", async () => {
    const caller = appRouter.createCaller(createContext(regularUser));
    await expect(caller.customer.portal()).resolves.toMatchObject({ access: "pending" });
    await expect(caller.customer.workspace()).resolves.toMatchObject({ access: "pending", projects: [] });
  });

  it("blocks direct project and file ID access for an unapproved customer", async () => {
    const caller = appRouter.createCaller(createContext(regularUser));
    await expect(caller.customer.markRead({ projectId: 999999 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.customer.getProjectFileUrl({ fileId: 999999 })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("allows the authenticated owner direct access to the owner workspace", async () => {
    const caller = appRouter.createCaller(createContext(ownerUser));
    await expect(caller.site.workspace()).resolves.toMatchObject({ stats: { customers: expect.any(Number), projects: expect.any(Number) } });
  });
});
