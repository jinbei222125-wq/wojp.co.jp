/*
 * Design: Industrial Luxe - NEWSページ
 * 4列グリッドレイアウト（画像＋更新日＋種別＋タイトル）
 * フィルター機能：種別・年代
 * カテゴリはAPIから動的取得し、管理画面で設定した色を反映
 */

import { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { publicApi, NewsPublicItem, NewsCategoryPublicItem } from "@/lib/api";

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

// フィルターセクション（カテゴリをAPIから動的取得）
function FilterSection({
  selectedCategory,
  setSelectedCategory,
  selectedYear,
  setSelectedYear,
  years,
  categoryList,
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  years: string[];
  categoryList: NewsCategoryPublicItem[];
}) {
  // 「すべて」ボタン + DBから取得したカテゴリ
  const allButton = { id: 0, name: "すべて", slug: "all", color: "#C7AF75", sortOrder: -1 };
  const buttons = [allButton, ...categoryList];

  return (
    <div className="bg-muted/30 border-b border-border py-6">
      <div className="container">
        <div className="flex flex-col md:flex-row gap-6">
          {/* カテゴリフィルター */}
          <div className="flex-1">
            <label className="font-display text-sm text-muted-foreground mb-3 block">種別</label>
            <div className="flex flex-wrap gap-2">
              {buttons.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="px-4 py-2 font-display text-sm transition-all duration-300 border"
                    style={
                      isSelected
                        ? {
                            backgroundColor: cat.color,
                            borderColor: cat.color,
                            color: "#fff",
                          }
                        : {
                            backgroundColor: "transparent",
                            borderColor: "var(--border)",
                            color: "var(--foreground)",
                          }
                    }
                  >
                    {cat.name}
                  </button>
                );
              })}
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
function NewsGrid({
  news,
  categoryList,
}: {
  news: NewsPublicItem[];
  categoryList: NewsCategoryPublicItem[];
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // カテゴリ名→色のマップ
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoryList.forEach((c) => {
      map[c.name] = c.color;
    });
    return map;
  }, [categoryList]);

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
          {news.map((item, index) => {
            const catColor = colorMap[item.category] ?? "#C7AF75";
            return (
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
                            ? new Date(item.published_at)
                                .toLocaleDateString("ja-JP", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                })
                                .replace(/\//g, ".")
                            : "-"}
                        </span>
                        {/* カテゴリバッジ - 管理画面で設定した色を反映 */}
                        <span
                          className="px-2 py-0.5 text-xs font-display whitespace-nowrap text-white"
                          style={{ backgroundColor: catColor }}
                        >
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
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedYear, setSelectedYear] = useState("すべて");
  const [newsList, setNewsList] = useState<NewsPublicItem[]>([]);
  const [categoryList, setCategoryList] = useState<NewsCategoryPublicItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [newsRes, catsRes] = await Promise.all([
        publicApi.getNews(),
        publicApi.getCategories(),
      ]);
      setNewsList(newsRes.data);
      setCategoryList(catsRes);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 年代リストを動的に生成
  const years = useMemo(() => {
    if (!newsList || newsList.length === 0) return ["すべて"];
    const uniqueYears = Array.from(
      new Set(
        newsList
          .filter((item) => item.published_at)
          .map((item) => new Date(item.published_at!).getFullYear().toString())
      )
    );
    return ["すべて", ...uniqueYears.sort((a, b) => parseInt(b) - parseInt(a))];
  }, [newsList]);

  // フィルタリング
  const filteredNews = useMemo(() => {
    if (!newsList) return [];
    return newsList.filter((item) => {
      const categoryMatch =
        selectedCategory === "すべて" || item.category === selectedCategory;
      const yearMatch =
        selectedYear === "すべて" ||
        (item.published_at &&
          new Date(item.published_at).getFullYear().toString() === selectedYear);
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
          categoryList={categoryList}
        />
        {isLoading ? (
          <div className="py-24 flex justify-center">
            <Loader2 className="animate-spin text-brass" size={32} />
          </div>
        ) : (
          <NewsGrid news={filteredNews} categoryList={categoryList} />
        )}
      </main>
      <Footer />
    </div>
  );
}
