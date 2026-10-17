import express from "express";
import { createServer } from "http";
import type { AddressInfo } from "net";
import { describe, expect, it } from "vitest";
import { registerStorageProxy } from "./storageProxy";

describe("private file HTTP route", () => {
  it("requires a website session and does not expose arbitrary storage keys", async () => {
    const app = express();
    registerStorageProxy(app);
    const server = createServer(app);

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as AddressInfo;
    const origin = `http://127.0.0.1:${address.port}`;

    try {
      const privateFile = await fetch(`${origin}/api/private-files/1`, { headers: { connection: "close" } });
      expect(privateFile.status).toBe(401);
      expect(privateFile.headers.get("cache-control")).toContain("no-store");

      const oldPublicProxy = await fetch(`${origin}/manus-storage/projects/private/photo.jpg`, { headers: { connection: "close" } });
      expect(oldPublicProxy.status).toBe(404);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  });
});
