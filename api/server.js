// server/_core/app.vercel.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { and, desc, eq } from "drizzle-orm";

// drizzle/schema.ts
import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";
var users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var news = sqliteTable("news", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  // URL-friendly identifier
  title: text("title").notNull(),
  content: text("content").notNull(),
  // Markdown content
  excerpt: text("excerpt"),
  // 記事の概要
  thumbnailUrl: text("thumbnailUrl"),
  // サムネイル画像URL
  authorId: integer("authorId"),
  // 投稿者ID
  isPublished: integer("isPublished", { mode: "boolean" }).notNull().default(false),
  // false = draft, true = published
  publishedAt: integer("publishedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var jobPositions = sqliteTable("job_positions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  // URL-friendly identifier
  positionName: text("positionName").notNull(),
  description: text("description").notNull(),
  // 業務内容
  requirements: text("requirements").notNull(),
  // 応募資格
  location: text("location").notNull(),
  // 勤務地
  salary: text("salary").notNull(),
  // 給与
  employmentType: text("employmentType"),
  // 雇用形態
  isPublished: integer("isPublished", { mode: "boolean" }).notNull().default(false),
  // false = draft, true = published
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  // true = active, false = inactive (deprecated, use isPublished)
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  location: text("location"),
  employmentType: text("employmentType", { enum: ["full_time", "part_time", "contract", "internship"] }).notNull(),
  salaryRange: text("salaryRange"),
  isPublished: integer("isPublished", { mode: "boolean" }).notNull().default(false),
  publishedAt: integer("publishedAt", { mode: "timestamp" }),
  closingDate: integer("closingDate", { mode: "timestamp" }),
  authorId: integer("authorId").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});
var admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "super_admin"] }).notNull().default("admin"),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" })
});
var adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name").notNull(),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  // true = active, false = inactive
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date()),
  lastLoginAt: integer("lastLoginAt", { mode: "timestamp" })
});
var auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminUserId: integer("adminUserId").notNull(),
  action: text("action").notNull(),
  // create, update, delete, publish, unpublish
  targetType: text("targetType").notNull(),
  // news, job
  targetId: integer("targetId").notNull(),
  details: text("details"),
  // JSON string with additional details
  ipAddress: text("ipAddress"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => /* @__PURE__ */ new Date())
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/lib/db.ts
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
var _db = null;
async function getDb() {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    if (!databaseUrl) {
      console.error("[Database] DATABASE_URL is not set");
      return null;
    }
    if (databaseUrl.includes("libsql://") && !authToken) {
      console.warn(
        "[Database] TURSO_AUTH_TOKEN is not set. Remote Turso database requires authentication token."
      );
    }
    try {
      const client = createClient({
        url: databaseUrl,
        authToken
      });
      _db = drizzle(client);
      console.log("[Database] Connected to Turso");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error?.message || error);
      _db = null;
    }
  }
  return _db;
}

// server/db.ts
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getPublishedNews() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(news).where(eq(news.isPublished, true)).orderBy(desc(news.publishedAt));
}
async function getNewsBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(news).where(and(eq(news.slug, slug), eq(news.isPublished, true))).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getActiveJobPositions() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(jobPositions).where(and(eq(jobPositions.isPublished, true), eq(jobPositions.isActive, true))).orderBy(desc(jobPositions.createdAt));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // NEWS router - Public read-only access
  news: router({
    // Public: Get all published news
    list: publicProcedure.input(z2.object({
      limit: z2.number().optional()
    }).optional()).query(async ({ input }) => {
      const news2 = await getPublishedNews();
      if (input?.limit) {
        return news2.slice(0, input.limit);
      }
      return news2;
    }),
    // Public: Get single news by slug
    getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      return await getNewsBySlug(input.slug);
    })
  }),
  // Job Positions router - Public read-only access
  jobPositions: router({
    // Public: Get active job positions
    list: publicProcedure.query(async () => {
      return await getActiveJobPositions();
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/restApi.ts
import { eq as eq2, and as and2, desc as desc2 } from "drizzle-orm";
import { SignJWT as SignJWT2, jwtVerify as jwtVerify2 } from "jose";
async function getBcrypt() {
  try {
    return await import("bcryptjs");
  } catch (error) {
    console.warn("[REST API] bcryptjs not available, password verification will fail");
    return null;
  }
}
var JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || process.env.JWT_SECRET || "");
async function verifyAdminToken(token) {
  if (!JWT_SECRET.length) return null;
  try {
    const { payload } = await jwtVerify2(token, JWT_SECRET);
    if (payload.type !== "admin") {
      return null;
    }
    return {
      adminId: payload.adminId,
      email: payload.email
    };
  } catch {
    return null;
  }
}
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}
async function authenticateAdmin(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.admin_token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ detail: "\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059" });
  }
  const admin = await verifyAdminToken(token);
  if (!admin) {
    return res.status(401).json({ detail: "\u7121\u52B9\u306A\u30C8\u30FC\u30AF\u30F3\u3067\u3059" });
  }
  const db = await getDb();
  if (!db) {
    return res.status(500).json({ detail: "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u30A8\u30E9\u30FC" });
  }
  let adminUser = null;
  try {
    const result = await db.select().from(adminUsers).where(and2(eq2(adminUsers.id, admin.adminId), eq2(adminUsers.isActive, true))).limit(1);
    if (result.length > 0) {
      adminUser = result[0];
    }
  } catch (error) {
    try {
      console.warn("[REST API] adminUsers table not found, trying admins table");
    } catch (err) {
    }
  }
  if (!adminUser) {
    return res.status(401).json({ detail: "\u7BA1\u7406\u8005\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  }
  req.admin = adminUser;
  next();
}
async function getAdminByEmail(email) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(adminUsers).where(eq2(adminUsers.email, email)).limit(1);
    if (result.length > 0) {
      return result[0];
    }
  } catch (error) {
  }
  try {
    const result = await db.select().from(admins).where(eq2(admins.email, email)).limit(1);
    if (result.length > 0) {
      return result[0];
    }
  } catch {
  }
  return null;
}
function setupRestApi(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ detail: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u5FC5\u8981\u3067\u3059" });
      }
      const admin = await getAdminByEmail(email);
      if (!admin || admin.isActive === false) {
        return res.status(401).json({ detail: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093" });
      }
      const bcrypt = await getBcrypt();
      if (!bcrypt) {
        return res.status(500).json({ detail: "\u30D1\u30B9\u30EF\u30FC\u30C9\u691C\u8A3C\u6A5F\u80FD\u304C\u5229\u7528\u3067\u304D\u307E\u305B\u3093\u3002bcryptjs\u3092\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3057\u3066\u304F\u3060\u3055\u3044\u3002" });
      }
      const isValid = await bcrypt.compare(password, admin.passwordHash);
      if (!isValid) {
        return res.status(401).json({ detail: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u307E\u305F\u306F\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093" });
      }
      const token = await new SignJWT2({
        adminId: admin.id,
        email: admin.email,
        type: "admin"
      }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(JWT_SECRET);
      const cookieOptions = {
        httpOnly: true,
        secure: ENV.isProduction,
        sameSite: ENV.isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        // 7 days
        path: "/"
      };
      res.cookie("admin_token", token, cookieOptions);
      return res.json({
        success: true,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role || "admin",
          is_active: !!admin.isActive
        }
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      return res.status(500).json({ detail: "\u30ED\u30B0\u30A4\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: ENV.isProduction,
      sameSite: ENV.isProduction ? "none" : "lax",
      path: "/"
    });
    return res.json({ success: true, message: "\u30ED\u30B0\u30A2\u30A6\u30C8\u3057\u307E\u3057\u305F" });
  });
  app2.get("/api/auth/me", authenticateAdmin, async (req, res) => {
    const admin = req.admin;
    return res.json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role || "admin",
      is_active: !!admin.isActive
    });
  });
  app2.get("/api/public/news", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u30A8\u30E9\u30FC" });
      }
      const limit = parseInt(req.query.limit) || 100;
      const page = parseInt(req.query.page) || 1;
      const allNews = await db.select().from(news).where(eq2(news.isPublished, true)).orderBy(desc2(news.publishedAt));
      const total = allNews.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = allNews.slice(startIndex, endIndex);
      const transformedNews = paginatedNews.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        eyecatch_image_url: item.thumbnailUrl || null,
        category: item.category || "\u304A\u77E5\u3089\u305B",
        published_at: item.publishedAt ? item.publishedAt.toISOString() : null,
        excerpt: item.excerpt || item.content?.substring(0, 200) || void 0
      }));
      return res.json({
        data: transformedNews,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("[Public API] Get news error:", error);
      return res.status(500).json({ detail: "\u30CB\u30E5\u30FC\u30B9\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app2.get("/api/public/news/:idOrSlug", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u30A8\u30E9\u30FC" });
      }
      const { idOrSlug } = req.params;
      const isNumeric = /^\d+$/.test(idOrSlug);
      let newsItem;
      if (isNumeric) {
        const result = await db.select().from(news).where(and2(eq2(news.id, parseInt(idOrSlug)), eq2(news.isPublished, true))).limit(1);
        newsItem = result.length > 0 ? result[0] : null;
      } else {
        const result = await db.select().from(news).where(and2(eq2(news.slug, idOrSlug), eq2(news.isPublished, true))).limit(1);
        newsItem = result.length > 0 ? result[0] : null;
      }
      if (!newsItem) {
        return res.status(404).json({ detail: "\u30CB\u30E5\u30FC\u30B9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
      }
      return res.json({
        id: newsItem.id,
        title: newsItem.title,
        slug: newsItem.slug,
        body: newsItem.content,
        eyecatch_image_url: newsItem.thumbnailUrl || null,
        category: newsItem.category || "\u304A\u77E5\u3089\u305B",
        published_at: newsItem.publishedAt ? newsItem.publishedAt.toISOString() : null,
        excerpt: newsItem.excerpt || newsItem.content?.substring(0, 200) || void 0
      });
    } catch (error) {
      console.error("[Public API] Get news detail error:", error);
      return res.status(500).json({ detail: "\u30CB\u30E5\u30FC\u30B9\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app2.get("/api/public/jobs", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u30A8\u30E9\u30FC" });
      }
      const limit = parseInt(req.query.limit) || 100;
      const page = parseInt(req.query.page) || 1;
      const allJobs = await db.select().from(jobs).where(eq2(jobs.isPublished, true)).orderBy(desc2(jobs.createdAt));
      const total = allJobs.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedJobs = allJobs.slice(startIndex, endIndex);
      const transformedJobs = paginatedJobs.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        requirements: item.requirements ?? "",
        location: item.location ?? "",
        employment_type: item.employmentType ?? null,
        salary_range: item.salaryRange ?? null,
        is_published: !!item.isPublished,
        published_at: item.publishedAt ? typeof item.publishedAt === "object" && "toISOString" in item.publishedAt ? item.publishedAt.toISOString() : null : null
      }));
      return res.json({
        data: transformedJobs,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("[Public API] Get jobs error:", error);
      return res.status(500).json({ detail: "\u6C42\u4EBA\u60C5\u5831\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app2.get("/api/public/jobs/:idOrSlug", async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u30A8\u30E9\u30FC" });
      }
      const { idOrSlug } = req.params;
      const isNumeric = /^\d+$/.test(idOrSlug);
      let job;
      if (isNumeric) {
        const result = await db.select().from(jobs).where(and2(eq2(jobs.id, parseInt(idOrSlug)), eq2(jobs.isPublished, true))).limit(1);
        job = result.length > 0 ? result[0] : null;
      } else {
        const result = await db.select().from(jobs).where(and2(eq2(jobs.slug, idOrSlug), eq2(jobs.isPublished, true))).limit(1);
        job = result.length > 0 ? result[0] : null;
      }
      if (!job) {
        return res.status(404).json({ detail: "\u6C42\u4EBA\u60C5\u5831\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
      }
      return res.json({
        id: job.id,
        title: job.title,
        slug: job.slug,
        description: job.description,
        requirements: job.requirements ?? "",
        location: job.location ?? "",
        employment_type: job.employmentType ?? null,
        salary_range: job.salaryRange ?? null,
        is_published: !!job.isPublished,
        published_at: job.publishedAt ? typeof job.publishedAt === "object" && "toISOString" in job.publishedAt ? job.publishedAt.toISOString() : null : null
      });
    } catch (error) {
      console.error("[Public API] Get job detail error:", error);
      return res.status(500).json({ detail: "\u6C42\u4EBA\u60C5\u5831\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app2.get("/api/admin/news", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u30A8\u30E9\u30FC" });
      }
      const allNews = await db.select().from(news).orderBy(desc2(news.createdAt));
      const transformedNews = allNews.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        body: item.content,
        eyecatch_image_url: item.thumbnailUrl || null,
        category: null,
        is_published: !!item.isPublished,
        published_at: item.publishedAt ? item.publishedAt.toISOString() : null,
        created_by: null,
        updated_by: null,
        created_at: item.createdAt ? item.createdAt.toISOString() : "",
        updated_at: item.updatedAt ? item.updatedAt.toISOString() : ""
      }));
      return res.json(transformedNews);
    } catch (error) {
      console.error("[Admin API] Get news error:", error);
      return res.status(500).json({ detail: "\u30CB\u30E5\u30FC\u30B9\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
  app2.get("/api/admin/jobs", authenticateAdmin, async (req, res) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u63A5\u7D9A\u30A8\u30E9\u30FC" });
      }
      const allJobs = await db.select().from(jobs).orderBy(desc2(jobs.createdAt));
      const transformedJobs = allJobs.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        requirements: item.requirements ?? "",
        location: item.location ?? "",
        employment_type: item.employmentType || null,
        salary_range: item.salaryRange || null,
        is_published: !!item.isPublished,
        published_at: item.publishedAt ? typeof item.publishedAt === "object" && "toISOString" in item.publishedAt ? item.publishedAt.toISOString() : null : null,
        created_by: null,
        updated_by: null,
        created_at: item.createdAt ? item.createdAt.toISOString() : "",
        updated_at: item.updatedAt ? item.updatedAt.toISOString() : ""
      }));
      return res.json(transformedJobs);
    } catch (error) {
      console.error("[Admin API] Get jobs error:", error);
      return res.status(500).json({ detail: "\u6C42\u4EBA\u60C5\u5831\u306E\u53D6\u5F97\u306B\u5931\u6557\u3057\u307E\u3057\u305F" });
    }
  });
}

// server/_core/app.vercel.ts
function createApp() {
  const app2 = express();
  app2.use(express.json({ limit: "50mb" }));
  app2.use(express.urlencoded({ limit: "50mb", extended: true }));
  setupRestApi(app2);
  registerOAuthRoutes(app2);
  app2.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  app2.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  return app2;
}

// src/api-entry/server.ts
var app = createApp();
function handler(req, res) {
  const pathParam = req.query?.path;
  if (pathParam) {
    const pathStr = Array.isArray(pathParam) ? pathParam.join("/") : pathParam;
    const { path: _removed, ...restQuery } = req.query;
    const queryStr = new URLSearchParams(
      Object.entries(restQuery).flatMap(
        ([k, v]) => Array.isArray(v) ? v.map((val) => [k, val]) : [[k, String(v ?? "")]]
      )
    ).toString();
    req.url = `/api/${pathStr}${queryStr ? `?${queryStr}` : ""}`;
  }
  return app(req, res);
}
export {
  handler as default
};
