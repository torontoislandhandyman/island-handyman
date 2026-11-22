import { and, eq, gt, isNull, lt, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { authSessions, authSetupTokens, jobRequests, users, type User } from "../drizzle/schema";
import { getDb } from "./db";
import { normalizeEmail } from "./_core/passwords";

async function requiredDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db;
}

function approvedCustomerEmailCondition(email: string) {
  return and(
    eq(jobRequests.customerAccess, "approved"),
    or(
      eq(jobRequests.accountEmail, email),
      and(or(isNull(jobRequests.accountEmail), eq(jobRequests.accountEmail, "")), eq(jobRequests.email, email)),
    ),
  );
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await requiredDb();
  const rows = await db.select().from(users).where(eq(users.email, normalizeEmail(email))).limit(1);
  return rows[0] ?? null;
}

export async function isPasswordSetupEligible(email: string, ownerEmail: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (normalizeEmail(ownerEmail) === normalized && Boolean(ownerEmail.trim())) return true;
  const db = await requiredDb();
  const existing = await db.select({ role: users.role }).from(users).where(eq(users.email, normalized)).limit(1);
  if (existing[0]?.role === "admin") return true;
  const approved = await db.select({ id: jobRequests.id }).from(jobRequests).where(approvedCustomerEmailCondition(normalized)).limit(1);
  return approved.length > 0;
}

export async function issuePasswordSetupToken(email: string, tokenHash: string, expiresAt: Date): Promise<void> {
  const db = await requiredDb();
  const normalized = normalizeEmail(email);
  await db.delete(authSetupTokens).where(or(eq(authSetupTokens.email, normalized), lt(authSetupTokens.expiresAt, new Date())));
  await db.insert(authSetupTokens).values({ email: normalized, tokenHash, expiresAt });
}

export async function completePasswordSetup(tokenHash: string, passwordHash: string, ownerEmail: string): Promise<User | null> {
  const db = await requiredDb();
  const now = new Date();
  const token = (await db.select().from(authSetupTokens).where(and(
    eq(authSetupTokens.tokenHash, tokenHash),
    gt(authSetupTokens.expiresAt, now),
    isNull(authSetupTokens.consumedAt),
  )).limit(1))[0];
  if (!token) return null;

  const normalizedEmail = normalizeEmail(token.email);
  const isOwner = Boolean(ownerEmail.trim()) && normalizeEmail(ownerEmail) === normalizedEmail;
  let user = await findUserByEmail(normalizedEmail);
  const approved = await db.select({ id: jobRequests.id }).from(jobRequests).where(approvedCustomerEmailCondition(normalizedEmail)).limit(1);
  if (!isOwner && user?.role !== "admin" && !approved.length) {
    await db.delete(authSetupTokens).where(eq(authSetupTokens.id, token.id));
    return null;
  }

  // The conditional update makes redemption single-use even if two requests race.
  const result = await db.update(authSetupTokens).set({ consumedAt: now }).where(and(
    eq(authSetupTokens.id, token.id),
    isNull(authSetupTokens.consumedAt),
    gt(authSetupTokens.expiresAt, now),
  ));
  if (Number(result[0]?.affectedRows ?? 0) !== 1) return null;

  if (user) {
    await db.update(users).set({
      email: normalizedEmail,
      passwordHash,
      loginMethod: "password",
      lastSignedIn: now,
      ...(isOwner ? { role: "admin" as const } : {}),
    }).where(eq(users.id, user.id));
    user = await findUserByEmail(normalizedEmail);
  } else {
    const approved = await db.select({ customerName: jobRequests.customerName }).from(jobRequests).where(approvedCustomerEmailCondition(normalizedEmail)).limit(1);
    if (!isOwner && !approved.length) return null;

    await db.insert(users).values({
      openId: `local_${randomUUID()}`,
      name: isOwner ? "Island Handyman Owner" : approved[0]?.customerName ?? "Island Handyman Client",
      email: normalizedEmail,
      passwordHash,
      loginMethod: "password",
      role: isOwner ? "admin" : "user",
      lastSignedIn: now,
    });
    user = await findUserByEmail(normalizedEmail);
  }

  if (!user) return null;
  await db.delete(authSessions).where(eq(authSessions.userId, user.id));
  return user;
}

export async function createAuthSession(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
  const db = await requiredDb();
  await db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));
  await db.insert(authSessions).values({ userId, tokenHash, expiresAt });
}

export async function getUserForSession(tokenHash: string): Promise<User | null> {
  const db = await requiredDb();
  const now = new Date();
  const session = (await db.select({ id: authSessions.id, userId: authSessions.userId }).from(authSessions).where(and(
    eq(authSessions.tokenHash, tokenHash),
    gt(authSessions.expiresAt, now),
  )).limit(1))[0];
  if (!session) return null;
  const user = (await db.select().from(users).where(eq(users.id, session.userId)).limit(1))[0] ?? null;
  if (!user) await db.delete(authSessions).where(eq(authSessions.id, session.id));
  return user;
}

export async function deleteAuthSession(tokenHash: string): Promise<void> {
  const db = await requiredDb();
  await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
}

export async function updateLastSignedIn(userId: number, when = new Date()): Promise<void> {
  const db = await requiredDb();
  await db.update(users).set({ lastSignedIn: when }).where(eq(users.id, userId));
}
