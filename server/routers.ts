import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { storageGetSignedUrl, storagePut } from "./storage";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCustomerMessage,
  createCustomerTestimonial,
  createProjectFileRecord,
  createJobRequest,
  createOwnerMessage,
  addProjectEvent,
  approveRequestAndCreateProject,
  getAuthorizedProject,
  getAuthorizedProjectFile,
  getCustomerWorkspace,
  getAdminOverview,
  getOwnerWorkspace,
  getCustomerPortal,
  getPublicSiteData,
  getPublicTestimonials,
  markProjectMessagesRead,
  updateCustomerNotes,
  updateProjectStatus,
  updateBusinessSettings,
  updateCustomerAccountEmail,
  updateCustomerAccess,
  updateJobRequestStatus,
  updateOpeningVisibility,
  updateAvailabilitySlot,
  updateTestimonialApproval,
  createNotification,
  getNotifications,
  markNotificationRead,
} from "./db";
import { systemRouter } from "./_core/systemRouter";
import { ownerEmail, sendEmail } from "./email";

const jobRequestInput = z.object({
  customerName: z.string().min(2).max(160),
  email: z.string().email().max(320).optional().or(z.literal("")),
  phone: z.string().max(60).optional().or(z.literal("")),
  location: z.string().min(2).max(200),
  service: z.string().min(2).max(160),
  description: z.string().min(10).max(5000),
  preferredDate: z.string().max(20).optional(),
  preferredTime: z.string().max(80).optional(),
  urgency: z.enum(["routine", "soon", "urgent"]).default("routine"),
}).refine((input) => Boolean(input.email?.trim() || input.phone?.trim()), {
  message: "Provide an email address, a phone number, or both.",
  path: ["email"],
});

const adminOnlyProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Owner access is required." });
  }
  return next();
});

const messageInput = z.object({ requestId: z.number().int().positive(), body: z.string().trim().min(1).max(5000) });

function safeStoredName(originalName: string) {
  const cleaned = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.{2,}/g, ".").replace(/^\.+/, "").slice(0, 180);
  return cleaned || "attachment";
}

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
  notifications: router({
    list: protectedProcedure.query(({ ctx }) => getNotifications(ctx.user)),
    markRead: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => markNotificationRead(input.id, ctx.user)),
  }),
  site: router({
    publicTestimonials: publicProcedure.query(() => getPublicTestimonials()),
    publicSiteData: publicProcedure.query(() => getPublicSiteData()),
    submitJobRequest: publicProcedure.input(jobRequestInput).mutation(async ({ input }) => {
      const id = await createJobRequest(input);
      const contact = [input.email, input.phone].filter(Boolean).join(" / ") || "no contact provided";
      const notified = await notifyOwner({
        title: "New Island Handyman request",
        content: `${input.customerName} requested ${input.service} in ${input.location}. Contact: ${contact}. Access is pending owner approval. Review request #${id} in the owner dashboard.`,
      });
      await createNotification({ recipientRole: "owner", recipientEmail: ownerEmail() || null, kind: "new_request", title: "New job request", body: `${input.customerName} requested ${input.service} in ${input.location}.`, requestId: id });
      if (ownerEmail()) await sendEmail({ to: ownerEmail(), subject: "New Island Handyman request", text: `${input.customerName} requested ${input.service} in ${input.location}. Review request #${id}.` });
      return { success: true, id, notified } as const;
    }),
    adminOverview: adminOnlyProcedure.query(() => getAdminOverview()),
    updateBusinessStatus: adminOnlyProcedure
      .input(z.object({
        onlineStatus: z.enum(["online", "offline", "busy"]),
        jobAvailability: z.enum(["accepting", "limited", "fully_booked", "not_working"]),
        publicMessage: z.string().max(240).optional(),
        contactEmail: z.string().email().max(320).nullable().optional(),
        contactPhone: z.string().max(60).nullable().optional(),
      }))
      .mutation(({ input }) => updateBusinessSettings(input)),
    updateAvailabilitySlot: adminOnlyProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["available", "tentative", "booked", "closed", "off_island"]), startTime: z.string().max(20), endTime: z.string().max(20), publicNote: z.string().max(240).nullable(), isPublic: z.boolean() })).mutation(({ input }) => updateAvailabilitySlot({ ...input, isPublic: input.isPublic ? 1 : 0 })),
    updateRequestStatus: adminOnlyProcedure
      .input(z.object({ id: z.number().int().positive(), status: z.enum(["new", "reviewing", "need_more_information", "quoted", "scheduled", "in_progress", "completed", "declined", "cancelled"]) }))
      .mutation(({ input }) => updateJobRequestStatus(input.id, input.status)),
    updateCustomerAccess: adminOnlyProcedure
      .input(z.object({ id: z.number().int().positive(), customerAccess: z.enum(["pending", "approved", "declined"]) }))
      .mutation(async ({ input }) => { await updateCustomerAccess(input.id, input.customerAccess); if (input.customerAccess === "approved") await approveRequestAndCreateProject(input.id, "approved"); const overview = await getAdminOverview(); const request = overview.requests.find((item) => item.id === input.id); const recipient = request?.accountEmail || request?.email; if (request && recipient) { const title = input.customerAccess === "approved" ? "Your Island Handyman request was approved" : "Island Handyman request update"; const body = input.customerAccess === "approved" ? "Your private customer workspace is now available. Sign in to see project updates and messages." : `Your request is currently marked ${input.customerAccess}.`; await createNotification({ recipientRole: "customer", recipientEmail: recipient, kind: `access_${input.customerAccess}`, title, body, requestId: request.id, projectId: request.projectId }); await sendEmail({ to: recipient, subject: title, text: body }); } }),
    updateCustomerAccountEmail: adminOnlyProcedure
      .input(z.object({ id: z.number().int().positive(), accountEmail: z.string().email().max(320).nullable() }))
      .mutation(({ input }) => updateCustomerAccountEmail(input.id, input.accountEmail)),
    updateOpeningVisibility: adminOnlyProcedure
      .input(z.object({ id: z.number().int().positive(), isPublic: z.boolean() }))
      .mutation(({ input }) => updateOpeningVisibility(input.id, input.isPublic ? 1 : 0)),
    updateTestimonialApproval: adminOnlyProcedure
      .input(z.object({ id: z.number().int().positive(), ownerApproved: z.boolean() }))
      .mutation(({ input }) => updateTestimonialApproval(input.id, input.ownerApproved)),
    sendOwnerMessage: adminOnlyProcedure.input(messageInput).mutation(async ({ ctx, input }) => { await createOwnerMessage(input.requestId, ctx.user.id, input.body); const overview = await getAdminOverview(); const request = overview.requests.find((item) => item.id === input.requestId); if (request) { await createNotification({ recipientRole: "customer", recipientEmail: request.accountEmail || request.email || null, kind: "owner_message", title: "New project update", body: input.body, requestId: request.id, projectId: request.projectId }); if (request.accountEmail || request.email) await sendEmail({ to: request.accountEmail || request.email!, subject: "New Island Handyman project update", text: input.body }); } }),
    workspace: adminOnlyProcedure.query(() => getOwnerWorkspace()),
    updateProjectStatus: adminOnlyProcedure.input(z.object({ projectId: z.number().int().positive(), status: z.enum(["new", "reviewing", "need_more_information", "quoted", "scheduled", "in_progress", "completed", "declined", "cancelled", "paused", "archived"]) })).mutation(async ({ ctx, input }) => { await updateProjectStatus(input.projectId, input.status, ctx.user.id); const work = await getOwnerWorkspace(); const project = work.projects.find((item) => item.id === input.projectId); const customer = project ? work.customers.find((item) => item.id === project.customerId) : undefined; const recipient = customer?.accountEmail || customer?.email; if (project && recipient) { const body = `Your project “${project.title}” is now ${input.status.replaceAll("_", " ")}.`; await createNotification({ recipientRole: "customer", recipientEmail: recipient, kind: "project_status", title: "Project status updated", body, projectId: project.id }); await sendEmail({ to: recipient, subject: "Island Handyman project status updated", text: body }); } }),
    updateCustomerNotes: adminOnlyProcedure.input(z.object({ customerId: z.number().int().positive(), notes: z.string().max(10000) })).mutation(({ input }) => updateCustomerNotes(input.customerId, input.notes)),
    addProjectEvent: adminOnlyProcedure.input(z.object({ projectId: z.number().int().positive(), note: z.string().trim().min(1).max(5000) })).mutation(({ ctx, input }) => addProjectEvent(input.projectId, input.note, ctx.user.id)),
    uploadProjectFile: adminOnlyProcedure.input(z.object({ projectId: z.number().int().positive(), category: z.enum(["before", "during", "after", "document", "other"]), originalName: z.string().min(1).max(255), mimeType: z.string().max(120), fileData: z.string().min(1).max(12_000_000) })).mutation(async ({ ctx, input }) => {
      const project = await getAuthorizedProject(input.projectId, { email: null }, true);
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      const buffer = Buffer.from(input.fileData, "base64");
      if (buffer.byteLength > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Files must be 8 MB or smaller." });
      const stored = await storagePut(`projects/${project.id}/${input.category}/${safeStoredName(input.originalName)}`, buffer, input.mimeType);
      await createProjectFileRecord({ customerId: project.customerId, projectId: project.id, uploadedByType: "owner", uploadedByUserId: ctx.user.id, storageKey: stored.key, originalName: input.originalName, mimeType: input.mimeType, fileSize: buffer.byteLength, category: input.category });
      const work = await getOwnerWorkspace(); const customer = work.customers.find((item) => item.id === project.customerId); const recipient = customer?.accountEmail || customer?.email; if (recipient) { const body = `A new ${input.category} file was added to “${project.title}”.`; await createNotification({ recipientRole: "customer", recipientEmail: recipient, kind: "file_uploaded", title: "New project file", body, projectId: project.id }); await sendEmail({ to: recipient, subject: "New Island Handyman project file", text: body }); }
      return { success: true } as const;
    }),
    getProjectFileUrl: adminOnlyProcedure.input(z.object({ fileId: z.number().int().positive() })).mutation(async ({ input }) => { const file = await getAuthorizedProjectFile(input.fileId, { email: null }, true); if (!file) throw new TRPCError({ code: "NOT_FOUND" }); return { url: await storageGetSignedUrl(file.storageKey) }; }),
  }),
  customer: router({
    portal: protectedProcedure.query(({ ctx }) => getCustomerPortal(ctx.user)),
    workspace: protectedProcedure.query(({ ctx }) => getCustomerWorkspace(ctx.user)),
    markRead: protectedProcedure.input(z.object({ projectId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const project = await getAuthorizedProject(input.projectId, ctx.user); if (!project) throw new TRPCError({ code: "FORBIDDEN" }); await markProjectMessagesRead(input.projectId, "customer"); }),
    sendMessage: protectedProcedure.input(messageInput).mutation(async ({ ctx, input }) => { await createCustomerMessage(ctx.user, input.requestId, input.body); await notifyOwner({ title: "New customer message", content: `A customer sent a new message for request #${input.requestId}.` }); await createNotification({ recipientRole: "owner", recipientEmail: ownerEmail() || null, kind: "customer_message", title: "New customer message", body: input.body, requestId: input.requestId }); }),
    sendProjectMessage: protectedProcedure.input(z.object({ projectId: z.number().int().positive(), requestId: z.number().int().positive(), body: z.string().trim().min(1).max(5000) })).mutation(async ({ ctx, input }) => { const project = await getAuthorizedProject(input.projectId, ctx.user); if (!project) throw new TRPCError({ code: "FORBIDDEN" }); return createCustomerMessage(ctx.user, input.requestId, input.body); }),
    uploadProjectFile: protectedProcedure.input(z.object({ projectId: z.number().int().positive(), category: z.enum(["before", "during", "after", "document", "other"]), originalName: z.string().min(1).max(255), mimeType: z.string().max(120), fileData: z.string().min(1).max(12_000_000) })).mutation(async ({ ctx, input }) => {
      const project = await getAuthorizedProject(input.projectId, ctx.user);
      if (!project) throw new TRPCError({ code: "FORBIDDEN" });
      const buffer = Buffer.from(input.fileData, "base64");
      if (buffer.byteLength > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Files must be 8 MB or smaller." });
      const stored = await storagePut(`projects/${project.id}/${input.category}/${safeStoredName(input.originalName)}`, buffer, input.mimeType);
      await createProjectFileRecord({ customerId: project.customerId, projectId: project.id, uploadedByType: "customer", uploadedByUserId: ctx.user.id, storageKey: stored.key, originalName: input.originalName, mimeType: input.mimeType, fileSize: buffer.byteLength, category: input.category });
      await notifyOwner({ title: "New customer file", content: `A customer added a ${input.category} file to project #${input.projectId}.` });
      await createNotification({ recipientRole: "owner", recipientEmail: ownerEmail() || null, kind: "file_uploaded", title: "New customer file", body: `A customer added ${input.originalName}.`, projectId: input.projectId });
      return { success: true } as const;
    }),
    getProjectFileUrl: protectedProcedure.input(z.object({ fileId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const file = await getAuthorizedProjectFile(input.fileId, ctx.user); if (!file) throw new TRPCError({ code: "NOT_FOUND" }); return { url: await storageGetSignedUrl(file.storageKey) }; }),
    submitTestimonial: protectedProcedure.input(z.object({ requestId: z.number().int().positive(), body: z.string().trim().min(10).max(3000), customerWantsPublic: z.boolean(), beforeImageUrl: z.string().url().max(1000).nullable(), afterImageUrl: z.string().url().max(1000).nullable() })).mutation(({ ctx, input }) => createCustomerTestimonial(ctx.user, input.requestId, input.body, input.customerWantsPublic, input.beforeImageUrl, input.afterImageUrl)),
  }),
});

export type AppRouter = typeof appRouter;
