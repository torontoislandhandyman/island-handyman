import type { Express } from "express";
import { getAuthorizedProjectFile } from "../db";
import { storageGetSignedUrl } from "../storage";
import { getSessionUser } from "./password-auth";

export function registerStorageProxy(app: Express) {
  app.get("/api/private-files/:fileId", async (req, res) => {
    res.set({
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });

    const fileId = Number(req.params.fileId);
    if (!Number.isSafeInteger(fileId) || fileId < 1) {
      res.status(404).send("File not found.");
      return;
    }

    let user;
    try {
      user = await getSessionUser(req);
    } catch (error) {
      console.error("[PrivateFiles] session lookup failed:", error);
      res.status(503).send("Private files are temporarily unavailable.");
      return;
    }

    if (!user) {
      res.status(401).send("Please sign in to view this file.");
      return;
    }

    try {
      const file = await getAuthorizedProjectFile(fileId, { email: user.email }, user.role === "admin");
      if (!file) {
        res.status(404).send("File not found.");
        return;
      }

      const signedUrl = await storageGetSignedUrl(file.storageKey);
      res.redirect(302, signedUrl);
    } catch (err) {
      console.error("[PrivateFiles] download failed:", err);
      res.status(502).send("The file could not be opened right now.");
    }
  });
}
