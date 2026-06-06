/**
 * Vercel-specific Express app factory.
 * This file intentionally does NOT import ./vite to prevent vite and its plugins
 * from being bundled into the serverless function (api/server.js).
 *
 * Used only by src/api-entry/server.ts → built to api/server.js.
 * The local dev server (server/_core/index.ts) uses index.ts which imports vite.
 */
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { setupRestApi } from "../restApi";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // REST API endpoints (contact form, admin news/jobs CRUD, etc.)
  setupRestApi(app);

  // OAuth callback
  registerOAuthRoutes(app);

  // tRPC API (news list, job positions, auth.me, etc.)
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // On Vercel, static assets are served by CDN from dist/public/.
  // Any non-API request that reaches this function returns 404.
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
