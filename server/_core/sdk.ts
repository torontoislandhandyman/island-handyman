import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import { getSessionUser } from "./password-auth";

/** Kept as a small compatibility seam for the existing tRPC context. */
class LocalSessionService {
  authenticateRequest(req: Request): Promise<User | null> {
    return getSessionUser(req);
  }
}

export const sdk = new LocalSessionService();
