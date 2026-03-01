import express, { Request, Response, NextFunction } from "express";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { news, jobPositions, jobs, admins, adminUsers, newsCategories } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "./lib/db";

// Dynamic import for bcryptjs (may not be installed)
async function getBcrypt() {
  try {
    return await import("bcryptjs");
  } catch (error) {
    console.warn("[REST API] bcryptjs not available, password verification will fail");
    return null;
  }
}

const JWT_SECRET = new TextEncoder().encode(ENV.cookieSecret || process.env.JWT_SECRET || "");

// Helper to verify admin token
async function verifyAdminToken(token: string): Promise<{ adminId: number; email: string } | null> {
  if (!JWT_SECRET.length) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== "admin") {
      return null;
    }
    return {
      adminId: payload.adminId as number,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

// Helper to parse cookies from cookie header
function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  return cookies;
}

// Middleware to authenticate admin requests
async function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.admin_token || req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ detail: "認証が必要です" });
  }

  const admin = await verifyAdminToken(token);
  if (!admin) {
    return res.status(401).json({ detail: "無効なトークンです" });
  }

  const db = await getDb();
  if (!db) {
    return res.status(500).json({ detail: "データベース接続エラー" });
  }

  // Try adminUsers table first, then admins table
  let adminUser: any = null;
  try {
    const result = await db.select().from(adminUsers)
      .where(and(eq(adminUsers.id, admin.adminId), eq(adminUsers.isActive, true)))
      .limit(1);
    if (result.length > 0) {
      adminUser = result[0];
    }
  } catch (error) {
    // Try admins table (fallback)
    try {
      // Note: This assumes admins table exists with similar structure
      // For Turso, we use Drizzle ORM only
      console.warn("[REST API] adminUsers table not found, trying admins table");
    } catch (err) {
      // Both tables might not exist
    }
  }

  if (!adminUser) {
    return res.status(401).json({ detail: "管理者が見つかりません" });
  }

  (req as any).admin = adminUser;
  next();
}

/**
 * Get admin user by email
 * Tries both adminUsers and admins tables for compatibility
 */
async function getAdminByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  // Try adminUsers table first (wojp-corporate schema)
  try {
    const result = await db.select().from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);
    if (result.length > 0) {
      return result[0];
    }
  } catch (error) {
    // Table might not exist, try admins table
  }

  // Try admins table (wojp-admin schema)
  try {
    const result = await db.select().from(admins)
      .where(eq(admins.email, email))
      .limit(1);
    if (result.length > 0) {
      return result[0];
    }
  } catch {
    // Table might not exist
  }

  return null;
}

export function setupRestApi(app: express.Application) {
  // ============================================
  // Auth API
  // ============================================

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ detail: "メールアドレスとパスワードが必要です" });
      }

      const admin = await getAdminByEmail(email);
      if (!admin || (admin as any).isActive === false) {
        return res.status(401).json({ detail: "メールアドレスまたはパスワードが正しくありません" });
      }

      const bcrypt = await getBcrypt();
      if (!bcrypt) {
        return res.status(500).json({ detail: "パスワード検証機能が利用できません。bcryptjsをインストールしてください。" });
      }
      const isValid = await bcrypt.compare(password, (admin as any).passwordHash);
      if (!isValid) {
        return res.status(401).json({ detail: "メールアドレスまたはパスワードが正しくありません" });
      }

      const token = await new SignJWT({ 
        adminId: admin.id, 
        email: admin.email, 
        type: "admin" 
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

      const cookieOptions = {
        httpOnly: true,
        secure: ENV.isProduction,
        sameSite: ENV.isProduction ? ("none" as const) : ("lax" as const),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      };

      res.cookie("admin_token", token, cookieOptions);

      return res.json({
        success: true,
        user: {
          id: admin.id,
          email: admin.email,
          name: (admin as any).name,
          role: (admin as any).role || "admin",
          is_active: !!(admin as any).isActive,
        },
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      return res.status(500).json({ detail: "ログインに失敗しました" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: ENV.isProduction,
      sameSite: ENV.isProduction ? ("none" as const) : ("lax" as const),
      path: "/",
    });
    return res.json({ success: true, message: "ログアウトしました" });
  });

  app.get("/api/auth/me", authenticateAdmin, async (req: Request, res: Response) => {
    const admin = (req as any).admin;
    return res.json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role || "admin",
      is_active: !!admin.isActive,
    });
  });

  // ============================================
  // Public API (No authentication required)
  // ============================================

  // カテゴリ一覧取得（公開API）
  app.get("/api/public/categories", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "データベース接続エラー" });
      }
      const cats = await db.select().from(newsCategories)
        .orderBy(newsCategories.sortOrder, newsCategories.name);
      return res.json(cats.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color ?? "#6B7280",
        sortOrder: c.sortOrder,
      })));
    } catch (error) {
      console.error("[Public API] Get categories error:", error);
      return res.status(500).json({ detail: "カテゴリの取得に失敗しました" });
    }
  });

  app.get("/api/public/news", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "データベース接続エラー" });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const page = parseInt(req.query.page as string) || 1;
      const allNews = await db.select().from(news)
        .where(eq(news.isPublished, true))
        .orderBy(desc(news.publishedAt));
      const total = allNews.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedNews = allNews.slice(startIndex, endIndex);

      // Transform to match API response format
      const transformedNews = paginatedNews.map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        eyecatch_image_url: item.thumbnailUrl || null,
        category: item.category || "お知らせ",
        published_at: item.publishedAt ? item.publishedAt.toISOString() : null,
        excerpt: item.excerpt || item.content?.substring(0, 200) || undefined,
      }));

      return res.json({
        data: transformedNews,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("[Public API] Get news error:", error);
      return res.status(500).json({ detail: "ニュースの取得に失敗しました" });
    }
  });

  app.get("/api/public/news/:idOrSlug", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "データベース接続エラー" });
      }

      const { idOrSlug } = req.params;
      const isNumeric = /^\d+$/.test(idOrSlug);

      let newsItem;
      if (isNumeric) {
        const result = await db.select().from(news)
          .where(and(eq(news.id, parseInt(idOrSlug)), eq(news.isPublished, true)))
          .limit(1);
        newsItem = result.length > 0 ? result[0] : null;
      } else {
        const result = await db.select().from(news)
          .where(and(eq(news.slug, idOrSlug), eq(news.isPublished, true)))
          .limit(1);
        newsItem = result.length > 0 ? result[0] : null;
      }

      if (!newsItem) {
        return res.status(404).json({ detail: "ニュースが見つかりません" });
      }

      return res.json({
        id: newsItem.id,
        title: newsItem.title,
        slug: newsItem.slug,
        body: newsItem.content,
        eyecatch_image_url: newsItem.thumbnailUrl || null,
        category: newsItem.category || "お知らせ",
        published_at: newsItem.publishedAt ? newsItem.publishedAt.toISOString() : null,
        excerpt: newsItem.excerpt || newsItem.content?.substring(0, 200) || undefined,
      });
    } catch (error) {
      console.error("[Public API] Get news detail error:", error);
      return res.status(500).json({ detail: "ニュースの取得に失敗しました" });
    }
  });

  app.get("/api/public/jobs", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "データベース接続エラー" });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const page = parseInt(req.query.page as string) || 1;

      const allJobs = await db.select().from(jobs)
        .where(eq(jobs.isPublished, true))
        .orderBy(desc(jobs.createdAt));
      const total = allJobs.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedJobs = allJobs.slice(startIndex, endIndex);

      const transformedJobs = paginatedJobs.map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        requirements: item.requirements ?? "",
        location: item.location ?? "",
        employment_type: item.employmentType ?? null,
        salary_range: item.salaryRange ?? null,
        is_published: !!item.isPublished,
        published_at: item.publishedAt ? (typeof item.publishedAt === "object" && "toISOString" in item.publishedAt ? item.publishedAt.toISOString() : null) : null,
      }));

      return res.json({
        data: transformedJobs,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("[Public API] Get jobs error:", error);
      return res.status(500).json({ detail: "求人情報の取得に失敗しました" });
    }
  });

  app.get("/api/public/jobs/:idOrSlug", async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "データベース接続エラー" });
      }

      const { idOrSlug } = req.params;
      const isNumeric = /^\d+$/.test(idOrSlug);

      let job: any;
      if (isNumeric) {
        const result = await db.select().from(jobs)
          .where(and(eq(jobs.id, parseInt(idOrSlug)), eq(jobs.isPublished, true)))
          .limit(1);
        job = result.length > 0 ? result[0] : null;
      } else {
        const result = await db.select().from(jobs)
          .where(and(eq(jobs.slug, idOrSlug), eq(jobs.isPublished, true)))
          .limit(1);
        job = result.length > 0 ? result[0] : null;
      }

      if (!job) {
        return res.status(404).json({ detail: "求人情報が見つかりません" });
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
        published_at: job.publishedAt ? (typeof job.publishedAt === "object" && "toISOString" in job.publishedAt ? job.publishedAt.toISOString() : null) : null,
      });
    } catch (error) {
      console.error("[Public API] Get job detail error:", error);
      return res.status(500).json({ detail: "求人情報の取得に失敗しました" });
    }
  });

  // ============================================
  // Admin API (Authentication required)
  // ============================================

  app.get("/api/admin/news", authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "データベース接続エラー" });
      }

      const allNews = await db.select().from(news).orderBy(desc(news.createdAt));

      // Transform to match API response format
      const transformedNews = allNews.map((item: any) => ({
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
        updated_at: item.updatedAt ? item.updatedAt.toISOString() : "",
      }));

      return res.json(transformedNews);
    } catch (error) {
      console.error("[Admin API] Get news error:", error);
      return res.status(500).json({ detail: "ニュースの取得に失敗しました" });
    }
  });

  app.get("/api/admin/jobs", authenticateAdmin, async (req: Request, res: Response) => {
    try {
      const db = await getDb();
      if (!db) {
        return res.status(500).json({ detail: "データベース接続エラー" });
      }

      const allJobs = await db.select().from(jobs).orderBy(desc(jobs.createdAt));

      const transformedJobs = allJobs.map((item: any) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        requirements: item.requirements ?? "",
        location: item.location ?? "",
        employment_type: item.employmentType || null,
        salary_range: item.salaryRange || null,
        is_published: !!item.isPublished,
        published_at: item.publishedAt ? (typeof item.publishedAt === "object" && "toISOString" in item.publishedAt ? item.publishedAt.toISOString() : null) : null,
        created_by: null,
        updated_by: null,
        created_at: item.createdAt ? item.createdAt.toISOString() : "",
        updated_at: item.updatedAt ? item.updatedAt.toISOString() : "",
      }));

      return res.json(transformedJobs);
    } catch (error) {
      console.error("[Admin API] Get jobs error:", error);
      return res.status(500).json({ detail: "求人情報の取得に失敗しました" });
    }
  });
}
