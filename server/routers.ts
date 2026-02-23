import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

/**
 * Public API Router for W.O.JP Corporate Site
 * This router only provides read-only access to published content.
 * All admin operations are handled by the separate wojp-admin service.
 */
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // NEWS router - Public read-only access
  news: router({
    // Public: Get all published news
    list: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const news = await db.getPublishedNews();
        if (input?.limit) {
          return news.slice(0, input.limit);
        }
        return news;
      }),

    // Public: Get single news by slug
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getNewsBySlug(input.slug);
      }),
  }),

  // Job Positions router - Public read-only access
  jobPositions: router({
    // Public: Get active job positions
    list: publicProcedure.query(async () => {
      return await db.getActiveJobPositions();
    }),
  }),
});

export type AppRouter = typeof appRouter;
