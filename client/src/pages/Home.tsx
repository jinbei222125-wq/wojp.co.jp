/*
 * Design: Industrial Luxe - TOP Page
 * 6セクション構成:
 * ① ファーストビュー（圧倒的クリエイティブ）
 * ② OUR ADVANTAGE（選ばれる3つの理由）
 * ③ OUR SERVICES（3事業）
 * ④ Recruit Highlight
 * ⑤ NEWS & PROFILE
 * ⑥ 創業秘話への誘導
 */

import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, TrendingUp, Users, ChevronDown, Briefcase, Palette, Code, Building2, Calendar, ExternalLink, Play } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IntroAnimation from "@/components/IntroAnimation";

// カウントアップアニメーション用フック
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
}

// ① 人材紹介・SES事業らしいファーストビューセクション
function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  // スクロール時の挙動を自然に - 背景は固定、コンテンツのみフェード
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-10%"]);
  
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["挑戦者", "逆転者"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={containerRef} className="relative h-[150vh]">
      {/* スティッキーコンテナ */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* 背景 - チーム画像をメインに（人材紹介・SESらしさ） */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-team.jpg"
            alt="W.O.JP Team - キャリア支援のプロフェッショナルチーム"
            className="w-full h-full object-cover"
          />
          {/* 複層グラデーションオーバーレイ - テキスト読みやすさのため */}
          <div className="absolute inset-0 bg-gradient-to-r from-anthracite via-anthracite/70 to-anthracite/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-anthracite/80 via-transparent to-anthracite/40" />
        </div>

        {/* グリッドオーバーレイ */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px'
          }} />
        </div>

        {/* フローティングパーティクル */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-brass/40 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              }}
              animate={{
                y: [null, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        {/* メインコンテンツ - スクロール時に自然にフェード */}
        <motion.div 
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-10 h-full flex items-center"
        >
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* 左側：テキストコンテンツ */}
              <div className="relative">
                {/* 装飾的なナンバリング */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 0.1, x: 0 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -left-8 top-0 font-display text-[200px] font-bold text-white leading-none select-none pointer-events-none hidden lg:block"
                >
                  01
                </motion.div>

                {/* 縦のアクセントライン */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "100px" }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="w-1 bg-gradient-to-b from-brass to-brass/0 mb-8"
                />

                {/* タグライン */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="flex items-center gap-4 mb-6"
                >
                  <div className="h-px w-12 bg-brass" />
                  <span className="font-display text-brass text-sm tracking-[0.3em]">VISION</span>
                </motion.div>

                {/* メインコピー */}
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                  className="relative"
                >
                  <span className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] block mb-2">
                    夢を語れる
                  </span>
                  <span className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] block mb-2">
                    自信を、
                  </span>
                  <motion.span 
                    className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] block"
                    style={{
                      background: "linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    その手に。
                  </motion.span>
                </motion.h1>

                {/* サブコピー */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                  className="text-xl md:text-2xl text-gray-400 mt-8 mb-4 font-light tracking-wide"
                >
                  未経験を最強の武器へ。
                </motion.p>

                {/* ダイナミックテキスト - 位置を下げてサイズを大きく */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1.8 }}
                  className="mb-12 mt-6"
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-gray-400 text-xl md:text-2xl leading-relaxed">私たちは、</span>
                    <div className="relative h-12 inline-flex items-center overflow-hidden" style={{ minWidth: '6rem' }}>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={currentWord}
                          initial={{ y: 40, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -40, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="font-display text-3xl md:text-4xl font-bold text-brass whitespace-nowrap"
                        >
                          {words[currentWord]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <span className="text-gray-400 text-xl md:text-2xl leading-relaxed">の集団です。</span>
                  </div>
                </motion.div>

                {/* CTAボタン */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 2 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link href="/contact">
                    <span className="group relative inline-flex items-center gap-3 px-10 py-5 bg-brass text-anthracite font-display font-semibold tracking-wider overflow-hidden">
                      <span className="relative z-10">無料相談する</span>
                      <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </span>
                  </Link>
                  <Link href="/service/recruit">
                    <span className="group inline-flex items-center gap-3 px-10 py-5 border border-white/20 text-white font-display tracking-wider hover:border-brass hover:text-brass transition-all duration-300 backdrop-blur-sm">
                      事業を見る
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              </div>


            </div>
          </div>
        </motion.div>

        {/* スクロールインジケーター */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-white/40 text-xs tracking-[0.3em] font-display">SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border border-white/20 rounded-full flex justify-center pt-2"
          >
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-2 bg-brass rounded-full"
            />
          </motion.div>
        </motion.div>

        {/* 左サイドバー装飾 */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-6">
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-brass/50 to-transparent" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border border-brass/30 flex items-center justify-center"
          >
            <div className="w-6 h-6 border border-brass/50 rotate-45" />
          </motion.div>
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-brass/50 to-transparent" />
        </div>

        {/* 右サイドバー - ソーシャルリンク風 */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4">
          <div className="w-px h-16 bg-brass/30" />
          <span className="font-display text-white/40 text-xs tracking-widest" style={{ writingMode: "vertical-rl" }}>FOLLOW US</span>
          <div className="w-px h-16 bg-brass/30" />
        </div>
      </div>
    </section>
  );
}

// ② OUR ADVANTAGE セクション
function AdvantageSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const advantages = [
    {
      icon: MapPin,
      number: "46",
      unit: "都道府県",
      title: "全国対応",
      description: "全国どこでもサポート可能。地方在住でも安心してキャリアチェンジに挑戦できます。（沖縄を除く）",
    },
    {
      icon: TrendingUp,
      number: "年収",
      unit: "アップ確約",
      title: "年収アップ確約",
      description: "転職後の年収アップを確約。あなたのスキルと可能性を最大限に評価し、適正な報酬を実現します。",
    },
    {
      icon: Users,
      number: "専任",
      unit: "伴走",
      title: "専任伴走（即レス対応）",
      description: "専任のキャリアアドバイザーが入社後もサポート。「スピードはリスペクト」の精神で即レス対応。",
    },
  ];

  return (
    <section ref={ref} className="py-32 bg-background relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brass/5 to-transparent" />

      <div className="container relative">
        {/* セクションタイトル */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">OUR ADVANTAGE</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            選ばれる<span className="text-brass">3つの理由</span>
          </h2>
        </motion.div>

        {/* 3つのカード */}
        <div className="grid md:grid-cols-3 gap-8">
          {advantages.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative bg-card border border-border p-8 hover:border-brass/50 transition-all duration-500"
            >
              {/* アイコン */}
              <div className="w-16 h-16 bg-brass/10 flex items-center justify-center mb-6 group-hover:bg-brass/20 transition-colors duration-300">
                <item.icon className="text-brass" size={28} />
              </div>

              {/* 数値 */}
              <div className="mb-4">
                <span className="font-display text-4xl font-bold text-brass">{item.number}</span>
                <span className="text-foreground text-lg ml-1">{item.unit}</span>
              </div>

              {/* タイトル */}
              <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>

              {/* 説明 */}
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>

              {/* ホバー時のアクセント */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-brass group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ③ OUR SERVICES セクション
function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      icon: Briefcase,
      tag: "HR BUSINESS",
      title: "人材紹介事業",
      description: "未経験を最強の武器へ。現実的な伴走で支えるキャリアチェンジ。",
      href: "/service/recruit",
      image: "/images/construction-worker.jpg",
    },
    {
      icon: Palette,
      tag: "CREATIVE",
      title: "クリエイティブ事業",
      description: "ビジネス課題を解決し、次の挑戦のための原資を創出するクリエイティブ。",
      href: "/service/creative",
      image: "/images/team-collaboration.jpg",
    },
    {
      icon: Code,
      tag: "SES",
      title: "SES事業",
      description: "現場での結果こそが、夢を語る唯一の自信になる。",
      href: "/service/ses",
      image: "/images/success-moment.jpg",
    },
  ];

  return (
    <section ref={ref} className="py-32 bg-anthracite relative overflow-hidden">
      <div className="container">
        {/* セクションタイトル */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">OUR SERVICES</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
            3つの<span className="text-brass">事業</span>
          </h2>
        </motion.div>

        {/* サービスカード */}
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Link href={service.href}>
                <div className="group relative h-[450px] overflow-hidden cursor-pointer">
                  {/* 背景画像 */}
                  <img
                    src={service.image}
                    alt={service.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-anthracite via-anthracite/60 to-transparent" />

                  {/* コンテンツ */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <span className="font-display text-brass text-xs tracking-[0.2em] mb-2">{service.tag}</span>
                    <h3 className="font-display text-2xl font-bold text-white mb-3">{service.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex items-center gap-2 text-brass font-display text-sm tracking-wider group-hover:gap-4 transition-all duration-300">
                      詳しく見る
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  {/* ホバーオーバーレイ */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-brass/50 transition-all duration-500" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ④ Recruit Highlight セクション
function RecruitSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 bg-background relative overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* 左側：画像 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="/images/team-collaboration.jpg"
                alt="若手社員"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-anthracite/30 to-transparent" />
            </div>
            {/* 装飾 */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border-2 border-brass/30" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-brass/10" />
            
            {/* RECRUITバッジ */}
            <div className="absolute top-8 left-8 bg-brass px-4 py-2">
              <span className="font-display text-anthracite text-sm tracking-[0.2em] font-semibold">RECRUIT</span>
            </div>
          </motion.div>

          {/* 右側：テキスト */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              結果を出せば、
              <br />
              <span className="text-brass">ひっくり返せる。</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              学歴も、経歴も関係ない。大切なのは「変わりたい」という想いと、それを行動に移す覚悟。
              W.O.JPは、あなたの挑戦を全力でサポートします。
            </p>
            <Link href="/recruit">
              <span className="inline-flex items-center gap-2 px-8 py-4 bg-brass text-anthracite font-display font-semibold tracking-wider hover:bg-brass-light transition-all duration-300">
                採用情報を見る
                <ArrowRight size={18} />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ⑤ NEWS & PROFILE セクション
function NewsProfileSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // tRPCからNEWSデータを取得
  const { data: newsItems = [] } = trpc.news.list.useQuery({ limit: 5 });

  const companyInfo = [
    { label: "社名", value: "株式会社W.O.JP" },
    { label: "設立", value: "2024年10月" },
    { label: "代表者", value: "大谷 まさと" },
    { label: "資本金", value: "300万円" },
    { label: "事業内容", value: "HR事業 / クリエイティブ事業 / SES事業" },
    { label: "許可番号", value: "" },
  ];

  // 日付フォーマット関数
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <section ref={ref} className="py-32 bg-muted/30 relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* NEWS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">NEWS</h2>
              <Link href="/news">
                <span className="text-brass font-display text-sm tracking-wider hover:underline flex items-center gap-1">
                  More <ArrowRight size={14} />
                </span>
              </Link>
            </div>
            <div className="space-y-0 border-t border-border">
              {newsItems.length > 0 ? (
                newsItems.map((item) => (
                  <Link key={item.id} href={`/news/${item.slug}`}>
                    <div className="grid grid-cols-[100px_120px_1fr] items-center gap-4 py-4 border-b border-border hover:bg-muted/50 transition-colors px-2 -mx-2 cursor-pointer">
                      <span className="text-muted-foreground text-sm font-display flex items-center gap-1">
                        <Calendar size={14} />
                        {item.publishedAt ? formatDate(new Date(item.publishedAt)) : "-"}
                      </span>
                      <span className="text-brass text-xs font-display tracking-wider px-2 py-1 bg-brass/10 text-center">
                        {item.category}
                      </span>
                      <span className="text-foreground text-sm line-clamp-1">{item.title}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  お知らせはまだありません
                </div>
              )}
            </div>
          </motion.div>

          {/* COMPANY PROFILE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">COMPANY</h2>
              <Link href="/company">
                <span className="text-brass font-display text-sm tracking-wider hover:underline flex items-center gap-1">
                  More <ArrowRight size={14} />
                </span>
              </Link>
            </div>
            <div className="bg-card border border-border p-8">
              <table className="w-full">
                <tbody>
                  {companyInfo.map((item, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 text-muted-foreground text-sm font-display w-28">{item.label}</td>
                      <td className="py-3 text-foreground text-sm">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ⑥ 創業秘話への誘導セクション
function StorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 bg-anthracite relative overflow-hidden">
      {/* 背景画像 */}
      <div className="absolute inset-0 opacity-20">
        <img
          src="/images/ceo-portrait.jpg"
          alt="創業者"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-anthracite via-anthracite/90 to-anthracite/70" />

      <div className="container relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">FOUNDER'S STORY</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              ど底辺から始まった、<span className="text-brass">逆転劇。</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              大学中退、泥だらけの現場仕事。「俺の人生、こんなもんかな」と思っていた。
              でも、営業との出会いが全てを変えた。学歴コンプレックスを跳ね返す行動量。
              「俺でもやれる」という自信が、人生を変えた。
            </p>
            <Link href="/story">
              <span className="inline-flex items-center gap-2 text-brass font-display tracking-wider hover:gap-4 transition-all duration-300">
                More Story
                <ArrowRight size={18} />
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <div className={showIntro ? "opacity-0" : "opacity-100 transition-opacity duration-500"}>
        <Header />
        <main>
          <HeroSection />
          <AdvantageSection />
          <ServicesSection />
          <RecruitSection />
          <NewsProfileSection />
          <StorySection />
        </main>
        <Footer />
      </div>
    </>
  );
}
