/*
 * Design: Industrial Luxe - 採用情報ページ
 * セクション構成:
 * 1. ページタイトル
 * 2. 求める人物像（スキルより「想い」を重視）
 * 3. WOインターナル・ファンド（Earn→Pitch→Invest）
 * 4. 募集職種（求人情報）- APIから取得
 * 5. 価値観の5鉄則
 * 6. エントリーCTA
 */

import { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Heart, Zap, Target, Shield, TrendingUp, Briefcase, Users, Code, DollarSign, Lightbulb, Rocket, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { publicApi, JobItem } from "@/lib/api";

// ページヒーロー
function PageHero() {
  return (
    <section className="relative pt-32 pb-20 bg-anthracite overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="/images/team-collaboration.jpg"
          alt="採用情報"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-anthracite via-anthracite/95 to-anthracite/80" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">RECRUIT</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            採用情報
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl">
            結果を出せば、ひっくり返せる。
          </p>
          <div className="w-20 h-1 bg-brass mt-6" />
        </motion.div>
      </div>
    </section>
  );
}

// 求める人物像
function PersonaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">WHO WE NEED</span>
          <h2 className="font-display text-4xl font-bold text-foreground mb-6">
            求める人物像
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            スキルより<span className="text-brass font-semibold">「想い」</span>を重視します。
            学歴や経歴は関係ありません。大切なのは「変わりたい」という想いと、それを行動に移す覚悟です。
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-card border border-border p-8"
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Heart className="text-brass" size={24} />
              こんな人を求めています
            </h3>
            <ul className="space-y-4">
              {[
                "現状に満足せず、自分を変えたいと思っている人",
                "学歴や経歴にコンプレックスがあるが、それを跳ね返したい人",
                "「俺でもやれる」という自信を手に入れたい人",
                "仲間と一緒に成長し、共に未来を創りたい人",
                "将来、自分の事業を持ちたいと考えている人",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <div className="w-2 h-2 bg-brass mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-anthracite border border-white/10 p-8"
          >
            <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Target className="text-brass" size={24} />
              W.O.JPで得られるもの
            </h3>
            <ul className="space-y-4">
              {[
                "夢を語れる自信と、それを実現する力",
                "本業で結果を出し、投資家として成長する機会",
                "同じ志を持つ仲間とのネットワーク",
                "自分の事業を持つためのスキルと経験",
                "人生を逆転させるチャンス",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-brass mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// WOインターナル・ファンド
function InternalFundSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, [isInView]);

  const steps = [
    {
      icon: DollarSign,
      label: "EARN",
      title: "稼ぐ",
      description: "本業で結果を出し、収益を上げる。これが全ての基盤。",
      color: "from-brass/20 to-brass/5",
    },
    {
      icon: Lightbulb,
      label: "PITCH",
      title: "提案する",
      description: "自分のアイデアや事業プランを仲間にプレゼン。",
      color: "from-brass/30 to-brass/10",
    },
    {
      icon: Rocket,
      label: "INVEST",
      title: "投資する",
      description: "仲間の事業に投資し、共に成長する。",
      color: "from-brass/40 to-brass/15",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-anthracite overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">INTERNAL FUND</span>
          <h2 className="font-display text-4xl font-bold text-white mb-6">
            WOインターナル・ファンド
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            本業で稼ぐ力を証明し、仲間の事業へ投資するプラットフォーム。
            全員が「挑戦者」であり、全員が「投資家」になれる仕組みです。
          </p>
        </motion.div>

        {/* サイクル図解 - 改善版 */}
        <div className="relative max-w-5xl mx-auto">
          {/* 3つのステップ */}
          <div className="grid md:grid-cols-3 gap-6 md:gap-4 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative"
              >
                {/* カード */}
                <div
                  className={`bg-gradient-to-b ${step.color} border border-white/10 p-8 text-center transition-all duration-500 h-full ${
                    activeStep === index ? "border-brass/50 shadow-lg shadow-brass/20" : ""
                  }`}
                >
                  {/* ステップ番号 */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-brass text-anthracite font-display font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>

                  <motion.div
                    animate={activeStep === index ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 mx-auto bg-brass text-anthracite flex items-center justify-center mb-6 mt-2"
                  >
                    <step.icon size={36} />
                  </motion.div>

                  <span className="font-display text-brass text-sm tracking-[0.2em] mb-2 block">{step.label}</span>
                  <h3 className="font-display text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">{step.description}</p>
                </div>

                {/* 矢印（カードの外側に配置） */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-anthracite border border-brass/50 items-center justify-center">
                    <ArrowRight size={16} className="text-brass" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* 循環の矢印（下部に配置） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 flex items-center justify-center gap-4"
          >
            <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-brass/50" />
            <div className="flex items-center gap-3 px-6 py-3 border border-brass/30 bg-brass/5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-brass border-t-transparent rounded-full"
              />
              <span className="font-display text-brass text-sm tracking-wider">このサイクルが続く</span>
            </div>
            <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-brass/50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// 募集職種 - APIから取得
function JobsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await publicApi.getJobs();
      setJobs(response.data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // アイコンマッピング
  const getIcon = (position: string) => {
    if (position.includes("エンジニア") || position.includes("SES")) return Code;
    if (position.includes("営業")) return Briefcase;
    return Users;
  };

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">JOB OPENINGS</span>
          <h2 className="font-display text-4xl font-bold text-foreground">
            募集職種
          </h2>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-brass" size={48} />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-6">
            {jobs.map((job, index) => {
              const Icon = getIcon(job.title);
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  className="bg-card border border-border p-8 group hover:border-brass/50 transition-all duration-500"
                >
                  <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 items-start">
                    <div className="w-16 h-16 bg-brass/10 flex items-center justify-center shrink-0 group-hover:bg-brass/20 transition-colors duration-300">
                      <Icon className="text-brass" size={28} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="font-display text-2xl font-bold text-foreground">{job.title}</h3>
                        {job.employment_type && (
                          <span className="px-3 py-1 bg-brass/10 text-brass text-sm font-display">{job.employment_type}</span>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-4">{job.description}</p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <span>勤務地：{job.location}</span>
                        {job.salary_range && <span>給与：{job.salary_range}</span>}
                      </div>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.split(/[、,]/).map((req: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-muted text-muted-foreground text-sm">
                              {req.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link href="/contact">
                      <span className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-brass text-anthracite font-display font-semibold tracking-wider hover:bg-brass-light transition-all duration-300 shrink-0">
                        応募する
                        <ArrowRight size={16} />
                      </span>
                    </Link>
                  </div>

                  <Link href="/contact" className="md:hidden">
                    <span className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-brass text-anthracite font-display font-semibold tracking-wider">
                      応募する
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            現在募集中の職種はありません。
          </div>
        )}
      </div>
    </section>
  );
}

// 価値観の5鉄則
function ValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const values = [
    {
      number: "01",
      icon: TrendingUp,
      title: "未来への投資",
      description: "目先の利益より、長期的な成長を優先する。",
    },
    {
      number: "02",
      icon: Zap,
      title: "スピードはリスペクト",
      description: "即レス、即行動。スピードこそが信頼の証。",
    },
    {
      number: "03",
      icon: Heart,
      title: "本音と現実",
      description: "良いことも悪いことも正直に。透明性を大切に。",
    },
    {
      number: "04",
      icon: Shield,
      title: "自律した意思",
      description: "指示待ちではなく、自ら考え行動する。",
    },
    {
      number: "05",
      icon: Target,
      title: "責任ある完遂",
      description: "始めたことは最後までやり抜く。結果にコミット。",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">OUR VALUES</span>
          <h2 className="font-display text-4xl font-bold text-foreground">
            価値観の5鉄則
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-4">
          {values.map((value, index) => (
            <motion.div
              key={value.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-card border border-border p-6 text-center group hover:border-brass/50 transition-all duration-500"
            >
              <div className="w-12 h-12 mx-auto bg-brass text-anthracite font-display font-bold flex items-center justify-center mb-4">
                {value.number}
              </div>
              <value.icon className="w-8 h-8 text-brass mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-2">{value.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// エントリーCTA
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-anthracite">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            あなたの<span className="text-brass">挑戦</span>を待っています
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
            学歴も、経歴も関係ない。大切なのは「変わりたい」という想いと、それを行動に移す覚悟。
            W.O.JPは、あなたの挑戦を全力でサポートします。
          </p>
          <Link href="/contact">
            <span className="inline-flex items-center gap-3 px-12 py-5 bg-brass text-anthracite font-display font-bold text-lg tracking-wider hover:bg-brass-light transition-all duration-300">
              エントリーする
              <ArrowRight size={20} />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function Recruit() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero />
        <PersonaSection />
        <InternalFundSection />
        <JobsSection />
        <ValuesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
