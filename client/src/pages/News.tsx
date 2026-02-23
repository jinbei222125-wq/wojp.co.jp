/*
 * Design: Industrial Luxe - NEWSページ
 * 4列グリッドレイアウト（画像＋更新日＋種別＋タイトル）
 * フィルター機能：種別・年代
 */

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { publicApi, NewsPublicItem } from "@/lib/api";

const categories = ["すべて", "お知らせ", "重要なお知らせ", "プレスリリース", "メディア掲載"];

// ページヒーロー
function PageHero() {
  return (
    <section className="relative pt-32 pb-20 bg-anthracite overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(199,175,117,0.1)_25%,rgba(199,175,117,0.1)_50%,transparent_50%,transparent_75%,rgba(199,175,117,0.1)_75%)] bg-[length:40px_40px]" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">NEWS</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            お知らせ
          </h1>
          <div className="w-20 h-1 bg-brass" />
        </motion.div>
      </div>
    </section>
  );
}

// フィルターセクション
function FilterSection({
  selectedCategory,
  setSelectedCategory,
  selectedYear,
  setSelectedYear,
  years,
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  years: string[];
}) {
  return (
    <div className="bg-muted/30 border-b border-border py-6">
      <div className="container">
        <div className="flex flex-col md:flex-row gap-6">
          {/* カテゴリフィルター */}
          <div className="flex-1">
            <label className="font-display text-sm text-muted-foreground mb-3 block">種別</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 font-display text-sm transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-brass text-anthracite"
                      : "bg-card border border-border text-foreground hover:border-brass/50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 年代フィルター */}
          <div>
            <label className="font-display text-sm text-muted-foreground mb-3 block">年代</label>
            <div className="flex flex-wrap gap-2">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 font-display text-sm transition-all duration-300 ${
                    selectedYear === year
                      ? "bg-brass text-anthracite"
                      : "bg-card border border-border text-foreground hover:border-brass/50"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ニュースグリッド - 完全に揃えたレイアウト
function NewsGrid({ news }: { news: NewsPublicItem[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  if (news.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground text-lg">該当するニュースがありません。</p>
      </div>
    );
  }

  return (
    <section ref={ref} className="py-16 bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((item, index) => (
            <Link key={item.id} href={`/news/${item.slug}`}>
              <motion.article
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="group cursor-pointer h-full"
              >
                <div className="bg-card border border-border overflow-hidden hover:border-brass/50 transition-all duration-500 h-full flex flex-col">
                  {/* 画像 - 固定アスペクト比 */}
                  <div className="aspect-[16/10] overflow-hidden flex-shrink-0 bg-muted">
                    {item.eyecatch_image_url ? (
                      <img
                        src={item.eyecatch_image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brass/20 to-brass/5">
                        <span className="font-display text-brass/50 text-4xl">W</span>
                      </div>
                    )}
                  </div>

                  {/* コンテンツ - 固定高さ */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* 日付とカテゴリ - 固定高さ */}
                    <div className="flex items-center gap-3 mb-3 h-6">
                      <span className="flex items-center gap-1 text-muted-foreground text-sm whitespace-nowrap">
                        <Calendar size={14} />
                        {item.published_at 
                          ? new Date(item.published_at).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, ".")
                          : "-"
                        }
                      </span>
                      <span className="px-2 py-0.5 bg-brass/10 text-brass text-xs font-display whitespace-nowrap">
                        {item.category}
                      </span>
                    </div>

                    {/* タイトル - 固定高さと2行制限 */}
                    <h3 className="font-display text-foreground font-semibold leading-relaxed group-hover:text-brass transition-colors duration-300 line-clamp-2 h-[3.5rem]">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedYear, setSelectedYear] = useState("すべて");
  const [newsList, setNewsList] = useState<NewsPublicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await publicApi.getNews();
      setNewsList(response.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // 年代リストを動的に生成
  const years = useMemo(() => {
    if (!newsList || newsList.length === 0) return ["すべて"];
    const uniqueYears = Array.from(new Set(
      newsList
        .filter(item => item.published_at)
        .map(item => new Date(item.published_at!).getFullYear().toString())
    ));
    return ["すべて", ...uniqueYears.sort((a, b) => parseInt(b) - parseInt(a))];
  }, [newsList]);

  // フィルタリング
  const filteredNews = useMemo(() => {
    if (!newsList) return [];
    return newsList.filter((item) => {
      const categoryMatch = selectedCategory === "すべて" || item.category === selectedCategory;
      const yearMatch = selectedYear === "すべて" || 
        (item.published_at && new Date(item.published_at).getFullYear().toString() === selectedYear);
      return categoryMatch && yearMatch;
    });
  }, [newsList, selectedCategory, selectedYear]);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero />
        <FilterSection
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          years={years}
        />
        {isLoading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="animate-spin text-brass" size={32} />
          </div>
        ) : (
          <NewsGrid news={filteredNews} />
        )}
      </main>
      <Footer />
    </div>
  );
}
