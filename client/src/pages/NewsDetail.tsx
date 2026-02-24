/*
 * Design: Industrial Luxe - NEWS詳細ページ
 * 圧倒的に美しいフォーマットで統一
 */

import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Tag, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { publicApi, NewsPublicItem } from "@/lib/api";
import { useState, useEffect, useCallback } from "react";

interface NewsDetailItem extends NewsPublicItem {
  body: string;
}

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<NewsDetailItem | null>(null);
  const [allNews, setAllNews] = useState<NewsPublicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const [newsDetail, newsListResponse] = await Promise.all([
        publicApi.getNewsDetail(slug),
        publicApi.getNews({ limit: 100 }),
      ]);
      setNews(newsDetail);
      setAllNews(newsListResponse.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-24 flex justify-center items-center">
          <Loader2 className="animate-spin text-brass" size={48} />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!news) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">記事が見つかりません</h1>
            <Link href="/news">
              <span className="text-brass hover:underline">ニュース一覧に戻る</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 前後の記事を取得
  const currentIndex = allNews.findIndex((item) => item.slug === slug || item.id.toString() === slug);
  const prevNews = currentIndex > 0 ? allNews[currentIndex - 1] : null;
  const nextNews = currentIndex >= 0 && currentIndex < allNews.length - 1 ? allNews[currentIndex + 1] : null;

  const formattedDate = news.published_at 
    ? new Date(news.published_at).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).replace(/\//g, ".")
    : "-";

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* ヒーローセクション */}
        <section className="relative pt-32 pb-16 bg-anthracite overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(199,175,117,0.1)_25%,rgba(199,175,117,0.1)_50%,transparent_50%,transparent_75%,rgba(199,175,117,0.1)_75%)] bg-[length:40px_40px]" />
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* パンくずリスト */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                <Link href="/">
                  <span className="hover:text-brass transition-colors">TOP</span>
                </Link>
                <span>/</span>
                <Link href="/news">
                  <span className="hover:text-brass transition-colors">NEWS</span>
                </Link>
                <span>/</span>
                <span className="text-white">{news.title}</span>
              </div>

              {/* メタ情報 */}
              <div className="flex items-center gap-4 mb-6">
                <span className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-2 px-3 py-1 bg-brass/20 text-brass text-sm font-display">
                  <Tag size={14} />
                  {news.category}
                </span>
              </div>

              {/* タイトル */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {news.title}
              </h1>

              {/* 抜粋 */}
              {news.excerpt && (
                <p className="mt-6 text-lg text-gray-300 leading-relaxed max-w-3xl border-l-4 border-brass/60 pl-5">
                  {news.excerpt}
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* メイン画像 */}
        {news.eyecatch_image_url && (
          <section className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="aspect-[21/9] max-h-[500px] overflow-hidden"
            >
              <img
                src={news.eyecatch_image_url}
                alt={news.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </motion.div>
          </section>
        )}

        {/* 記事本文 */}
        <section className="py-16 bg-background">
          <div className="container">
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="prose prose-lg max-w-none
                prose-headings:font-display prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-brass/30
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:mb-6
                prose-strong:text-foreground prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-brass prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-foreground/80
                prose-ul:my-6 prose-li:text-foreground/80 prose-li:mb-2
                prose-ol:my-6
                prose-table:my-8 prose-table:border-collapse
                prose-th:bg-anthracite prose-th:text-white prose-th:font-display prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:border prose-th:border-border
                prose-td:px-4 prose-td:py-3 prose-td:border prose-td:border-border prose-td:text-foreground/80
                prose-hr:border-border prose-hr:my-10
                prose-a:text-brass prose-a:no-underline hover:prose-a:underline
              ">
                <Streamdown>{news.body}</Streamdown>
              </div>
            </motion.article>
          </div>
        </section>

        {/* 前後の記事ナビゲーション */}
        <section className="py-12 bg-muted/30 border-t border-border">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {/* 前の記事 */}
                {prevNews ? (
                  <Link href={`/news/${prevNews.slug}`}>
                    <motion.div
                      whileHover={{ x: -5 }}
                      className="group flex items-center gap-4 p-6 bg-card border border-border hover:border-brass/50 transition-all duration-300"
                    >
                      <ArrowLeft size={20} className="text-brass flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs text-muted-foreground font-display tracking-wider">PREV</span>
                        <p className="text-foreground font-medium truncate group-hover:text-brass transition-colors">
                          {prevNews.title}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ) : (
                  <div />
                )}

                {/* 次の記事 */}
                {nextNews ? (
                  <Link href={`/news/${nextNews.slug}`}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="group flex items-center justify-end gap-4 p-6 bg-card border border-border hover:border-brass/50 transition-all duration-300 text-right"
                    >
                      <div className="min-w-0">
                        <span className="text-xs text-muted-foreground font-display tracking-wider">NEXT</span>
                        <p className="text-foreground font-medium truncate group-hover:text-brass transition-colors">
                          {nextNews.title}
                        </p>
                      </div>
                      <ArrowRight size={20} className="text-brass flex-shrink-0" />
                    </motion.div>
                  </Link>
                ) : (
                  <div />
                )}
              </div>

              {/* 一覧に戻る */}
              <div className="mt-12 text-center">
                <Link href="/news">
                  <span className="inline-flex items-center gap-2 px-8 py-4 border border-brass text-brass font-display tracking-wider hover:bg-brass hover:text-anthracite transition-all duration-300">
                    <ArrowLeft size={18} />
                    ニュース一覧に戻る
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
