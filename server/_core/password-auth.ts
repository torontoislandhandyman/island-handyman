import { parse as parseCookieHeader } from "cookie";
import type { Request, Response } from "express";
import { TRPCError } from "@trpc/server";
import type { User } from "../../drizzle/schema";
import { ownerEmail, sendEmail } from "../email";
import {
  completePasswordSetup as completeSetupInStore,
  createAuthSession,
  deleteAuthSession,
  findUserByEmail,
  getUserForSession,
  isPasswordSetupEligible,
  issuePasswordSetupToken,
  updateLastSignedIn,
} from "../auth-store";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { createOpaqueToken, hashOpaqueToken, hashPassword, normalizeEmail, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, verifyPassword } from "./passwords";

export const SESSION_TTL_MS = 60 * 24 * 60 * 60 * 1000;
const PASSWORD_LINK_TTL_MS = 60 * 60 * 1000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
let dummyHash: Promise<string> | undefined;

export type PublicUser = Pick<User, "id" | "name" | "email" | "role" | "createdAt" | "lastSignedIn">;

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt, lastSignedIn: user.lastSignedIn };
}

function consumeRateLimit(key: string, limit: number, now = Date.now()): boolean {
  if (rateBuckets.size > 4096) {
    Array.from(rateBuckets.entries()).forEach(([bucketKey, bucket]) => {
      if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
    });
  }
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

function rateLimitError(): TRPCError {
  return new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait a few minutes before trying again." });
}

function readSessionToken(req: Request): string | undefined {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  return cookies[COOKIE_NAME];
}

export async function getSessionUser(req: Request): Promise<User | null> {
  const token = readSessionToken(req);
  if (!token) return null;
  return getUserForSession(hashOpaqueToken(token));
}

async function startSession(user: User, req: Request, res: Response): Promise<void> {
  const rawToken = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await createAuthSession(user.id, hashOpaqueToken(rawToken), expiresAt);
  res.cookie(COOKIE_NAME, rawToken, {
    ...getSessionCookieOptions(req),
    expires: expiresAt,
    maxAge: SESSION_TTL_MS,
  });
}

export async function loginWithPassword(input: { email: string; password: string }, req: Request, res: Response): Promise<PublicUser> {
  const email = normalizeEmail(input.email);
  if (!consumeRateLimit("login:global", 250) || !consumeRateLimit(`login:email:${hashOpaqueToken(email)}`, 10)) throw rateLimitError();

  const user = await findUserByEmail(email);
  dummyHash ??= hashPassword("not-a-real-account-password");
  const candidateHash = user?.passwordHash ?? await dummyHash;
  const matches = await verifyPassword(input.password, candidateHash);
  if (!user || !user.passwordHash || !matches) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "The email address or password you entered is incorrect. If you have not set a password yet, use ‘Forgot Password?’ to set one.",
    });
  }

  await updateLastSignedIn(user.id);
  const signedInUser = { ...user, lastSignedIn: new Date() };
  await startSession(signedInUser, req, res);
  return toPublicUser(signedInUser);
}

function publicOriginForResetLink(): string | null {
  // Use an explicit site origin, never request Host or forwarding headers. The
  // provided custom domain is the canonical default until changed by config.
  const rawOrigin = process.env.PUBLIC_APP_URL?.trim() || "https://islandhandyman.vip";
  let origin: URL;
  try {
    origin = new URL(rawOrigin);
  } catch {
    return null;
  }
  if (origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) return null;
  const hostname = origin.hostname.toLowerCase();
  const localHost = ["localhost", "127.0.0.1", "::1"].includes(hostname);
  const isIslandDomain = hostname === "islandhandyman.vip" || hostname === "www.islandhandyman.vip";
  const isManusHost = ["manus.space", "manus.computer", "manuspre.computer"].some((suffix) => hostname.endsWith(`.${suffix}`));
  if (!localHost && !isIslandDomain && !isManusHost) return null;
  if (localHost && !["http:", "https:"].includes(origin.protocol)) return null;
  if (!localHost && origin.protocol !== "https:") return null;

  return origin.origin;
}

export async function requestPasswordSetup(emailInput: string): Promise<{ success: true }> {
  const email = normalizeEmail(emailInput);
  if (!consumeRateLimit("setup:global", 60) || !consumeRateLimit(`setup:email:${hashOpaqueToken(email)}`, 3)) throw rateLimitError();

  const eligible = await isPasswordSetupEligible(email, ownerEmail());
  if (!eligible) return { success: true };

  const origin = publicOriginForResetLink();
  if (!origin || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.warn("[Auth] Password email is eligible but public origin or mail delivery is not configured.");
    return { success: true };
  }

  const token = createOpaqueToken();
  await issuePasswordSetupToken(email, hashOpaqueToken(token), new Date(Date.now() + PASSWORD_LINK_TTL_MS));
  const url = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
  const text = `Use this secure Island Handyman link to set or reset your password. It expires in one hour and works once:\n\n${url}\n\nIf you did not request this, you can ignore this email.`;
  const html = `<p>Use this secure Island Handyman link to set or reset your password. It expires in one hour and works once.</p><p><a href="${url}" style="display:inline-block;padding:14px 20px;border-radius:10px;background:#215749;color:#ffffff;text-decoration:none;font-weight:700">Set or reset my password</a></p><p>If you did not request this, you can ignore this email.</p>`;
  const delivered = await sendEmail({ to: email, subject: "Set up or reset your Island Handyman password", text, html });
  if (!delivered) console.warn("[Auth] Password setup email was not delivered.");
  return { success: true };
}

export async function completePasswordSetup(input: { token: string; password: string }, req: Request, res: Response): Promise<PublicUser> {
  if (input.password.length < PASSWORD_MIN_LENGTH || input.password.length > PASSWORD_MAX_LENGTH) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Choose a password between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters long.` });
  }
  const passwordHash = await hashPassword(input.password);
  const user = await completeSetupInStore(hashOpaqueToken(input.token), passwordHash, ownerEmail());
  if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "This password link is invalid or has expired. Please request a new one." });
  await startSession(user, req, res);
  return toPublicUser(user);
}

export async function logoutFromRequest(req: Request, res: Response): Promise<void> {
  const token = readSessionToken(req);
  try {
    if (token) await deleteAuthSession(hashOpaqueToken(token));
  } finally {
    res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(req), maxAge: -1 });
  }
}
