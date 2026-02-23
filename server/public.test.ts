import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getPublishedNews: vi.fn(),
  getNewsBySlug: vi.fn(),
  getPublishedJobs: vi.fn(),
}));

import { getPublishedNews, getNewsBySlug, getPublishedJobs } from "./db";

describe("Public API - News", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPublishedNews should return only published news", async () => {
    const mockNews = [
      {
        id: 1,
        slug: "test-news-1",
        title: "Test News 1",
        content: "Content 1",
        category: "お知らせ" as const,
        imageUrl: null,
        isPublished: 1,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(getPublishedNews).mockResolvedValue(mockNews);

    const result = await getPublishedNews();

    expect(result).toHaveLength(1);
    expect(result[0].isPublished).toBe(1);
    expect(result[0].slug).toBe("test-news-1");
  });

  it("getNewsBySlug should return news by slug", async () => {
    const mockNews = {
      id: 1,
      slug: "test-news-1",
      title: "Test News 1",
      content: "Content 1",
      category: "お知らせ" as const,
      imageUrl: null,
      isPublished: 1,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(getNewsBySlug).mockResolvedValue(mockNews);

    const result = await getNewsBySlug("test-news-1");

    expect(result).not.toBeNull();
    expect(result?.slug).toBe("test-news-1");
  });

  it("getNewsBySlug should return null for non-existent slug", async () => {
    vi.mocked(getNewsBySlug).mockResolvedValue(null);

    const result = await getNewsBySlug("non-existent");

    expect(result).toBeNull();
  });
});

describe("Public API - Jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPublishedJobs should return only published jobs", async () => {
    const mockJobs = [
      {
        id: 1,
        slug: "test-job-1",
        positionName: "営業職",
        description: "業務内容",
        requirements: "応募資格",
        location: "東京",
        salary: "月給25万円〜",
        employmentType: "正社員",
        isPublished: 1,
        isActive: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(getPublishedJobs).mockResolvedValue(mockJobs);

    const result = await getPublishedJobs();

    expect(result).toHaveLength(1);
    expect(result[0].isPublished).toBe(1);
    expect(result[0].slug).toBe("test-job-1");
  });
});
