import AdminLayout from "@/components/AdminLayout";
import { adminNewsApi, adminJobsApi, NewsItem, JobItem, ApiError } from "@/lib/api";
import { Newspaper, Briefcase, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useCallback } from "react";

export default function AdminDashboard() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [jobsList, setJobsList] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [newsData, jobsData] = await Promise.all([
        adminNewsApi.list(),
        adminJobsApi.list(),
      ]);
      setNewsList(newsData);
      setJobsList(jobsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = [
    {
      label: "NEWS記事数",
      value: newsList?.length ?? 0,
      icon: Newspaper,
      href: "/admin/news",
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      label: "募集職種数",
      value: jobsList?.length ?? 0,
      icon: Briefcase,
      href: "/admin/recruit",
      color: "bg-green-500/20 text-green-400",
    },
    {
      label: "公開中の求人",
      value: jobsList?.filter(j => j.is_published).length ?? 0,
      icon: TrendingUp,
      href: "/admin/recruit",
      color: "bg-brass/20 text-brass",
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-brass" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-white">ダッシュボード</h1>
          <p className="text-gray-400 mt-2">W.O.JP コーポレートサイト管理画面</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className="bg-anthracite border border-white/10 rounded-xl p-6 hover:border-brass/50 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-4xl font-display font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon size={28} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent News */}
          <div className="bg-anthracite border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-white">最新NEWS</h2>
              <Link href="/admin/news">
                <span className="text-brass text-sm hover:underline">すべて見る →</span>
              </Link>
            </div>
            <div className="space-y-3">
              {newsList?.slice(0, 5).map((news) => (
                <div key={news.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${news.is_published ? "bg-brass" : "bg-gray-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{news.title}</p>
                    <p className="text-gray-500 text-xs">
                      {news.published_at 
                        ? new Date(news.published_at).toLocaleDateString("ja-JP")
                        : new Date(news.created_at).toLocaleDateString("ja-JP")
                      }
                    </p>
                  </div>
                  <span className="text-xs text-brass bg-brass/10 px-2 py-1 rounded">
                    {news.category}
                  </span>
                </div>
              ))}
              {(!newsList || newsList.length === 0) && (
                <p className="text-gray-500 text-center py-4">まだNEWSがありません</p>
              )}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-anthracite border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-white">募集職種</h2>
              <Link href="/admin/recruit">
                <span className="text-brass text-sm hover:underline">すべて見る →</span>
              </Link>
            </div>
            <div className="space-y-3">
              {jobsList?.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${job.is_published ? "bg-green-400" : "bg-gray-500"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{job.title}</p>
                    <p className="text-gray-500 text-xs">{job.location}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${job.is_published ? "text-green-400 bg-green-500/10" : "text-gray-400 bg-gray-500/10"}`}>
                    {job.is_published ? "公開中" : "非公開"}
                  </span>
                </div>
              ))}
              {(!jobsList || jobsList.length === 0) && (
                <p className="text-gray-500 text-center py-4">まだ募集職種がありません</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
