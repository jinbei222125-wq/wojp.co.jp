import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock public user context (no user)
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("News Router (Public API)", () => {
  it("list returns an array of published news", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.news.list();
    
    expect(Array.isArray(result)).toBe(true);
    // All returned news should be published
    result.forEach((news) => {
      expect(news.isPublished).toBe(1);
    });
  });

  it("getBySlug returns null for non-existent slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.news.getBySlug({ slug: "non-existent-slug-12345" });
    
    expect(result).toBeUndefined();
  });
});

describe("Job Positions Router (Public API)", () => {
  it("list returns an array of published jobs", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    
    const result = await caller.jobPositions.list();
    
    expect(Array.isArray(result)).toBe(true);
    // All returned jobs should be published
    result.forEach((job) => {
      expect(job.isPublished).toBe(1);
    });
  });
});
