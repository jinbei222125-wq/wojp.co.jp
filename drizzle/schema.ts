import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
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
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * NEWS table for company announcements
 * - slug: URL-friendly identifier for public access
 * - isPublished: Controls visibility on the public site
 *
 * NOTE: This schema matches the actual Turso DB columns.
 * The DB uses excerpt/thumbnailUrl/authorId instead of category/imageUrl.
 */
export const news = sqliteTable("news", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  title: text("title").notNull(),
  content: text("content").notNull(), // Markdown content
  excerpt: text("excerpt"), // 記事の概要
  thumbnailUrl: text("thumbnailUrl"), // サムネイル画像URL
  category: text("category").default("お知らせ"), // カテゴリ
  authorId: integer("authorId"), // 投稿者ID
  isPublished: integer("isPublished", { mode: "boolean" }).notNull().default(false), // false = draft, true = published
  publishedAt: integer("publishedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

/**
 * Job positions table for recruitment
 * - slug: URL-friendly identifier for public access
 * - isPublished: Controls visibility on the public site
 */
export const jobPositions = sqliteTable("job_positions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(), // URL-friendly identifier
  positionName: text("positionName").notNull(),
  description: text("description").notNull(), // 業務内容
  requirements: text("requirements").notNull(), // 応募資格
  location: text("location").notNull(), // 勤務地
  salary: text("salary").notNull(), // 給与
  employmentType: text("employmentType"), // 雇用形態
  isPublished: integer("isPublished", { mode: "boolean" }).notNull().default(false), // false = draft, true = published
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true), // true = active, false = inactive (deprecated, use isPublished)
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type JobPosition = typeof jobPositions.$inferSelect;
export type InsertJobPosition = typeof jobPositions.$inferInsert;

/**
 * Jobs table (admin-created recruit data).
 * Used for RECRUIT public API; same schema as wojp-admin.
 */
export const jobs = sqliteTable("jobs", {
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
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

/**
 * Admins table (wojp-admin schema). Used for login fallback.
 */
export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "super_admin"] }).notNull().default("admin"),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;

/**
 * Admin users table for admin panel authentication
 * Separate from main users table for security isolation
 */
export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: text("name").notNull(),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true), // true = active, false = inactive
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastLoginAt: integer("lastLoginAt", { mode: "timestamp" }),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;

/**
 * Audit log table for tracking admin actions
 */
export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminUserId: integer("adminUserId").notNull(),
  action: text("action").notNull(), // create, update, delete, publish, unpublish
  targetType: text("targetType").notNull(), // news, job
  targetId: integer("targetId").notNull(),
  details: text("details"), // JSON string with additional details
  ipAddress: text("ipAddress"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
