import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import type { NextFunction, Request, Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return (Array.isArray(value) ? value[0] : value?.split(",")[0])?.trim();
}

function protectTrpcWritesFromCrossSiteCookies(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "POST") return next();
  const fetchSite = req.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") return res.status(403).json({ error: "This request is not allowed." });

  const origin = req.get("origin");
  const publicHost = firstHeader(req.headers["x-forwarded-host"]) ?? req.get("host");
  if (origin && publicHost && fetchSite !== "same-origin") {
    try {
      const parsedOrigin = new URL(origin);
      if (parsedOrigin.host.toLowerCase() !== publicHost.toLowerCase()) {
        return res.status(403).json({ error: "This request is not allowed." });
      }
    } catch {
      return res.status(403).json({ error: "This request is not allowed." });
    }
  }
  return next();
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.get("/_app/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  // tRPC API
  app.use(
    "/api/trpc",
    protectTrpcWritesFromCrossSiteCookies,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
