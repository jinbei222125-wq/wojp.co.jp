/*
 * Design: Industrial Luxe - Service Page
 * 
 * 各事業を「挑戦のための原資創出」として再定義
 * 
 * Services:
 * 1. 人材紹介事業 (HR) - 未経験を最強の武器へ
 * 2. クリエイティブ事業 (Creative) - 原資を創出するクリエイティブ
 * 3. SES事業 - 夢を語る自信を積み上げる
 */

import { useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Users, Palette, Code, CheckCircle, Clock, Award, Briefcase } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Hero Section
function ServiceHero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-[60vh] min-h-[450px] overflow-hidden">
      {/* Background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="absolute inset-0 bg-anthracite" />
        <div className="absolute inset-0 opacity-30">
          <img
            src="/images/team-collaboration.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-anthracite/60 via-anthracite/80 to-anthracite" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative h-full flex items-center"
        style={{ opacity }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-16 bg-brass" />
              <span className="font-display text-sm tracking-widest text-brass">
                SERVICES
              </span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              挑戦の機会と、
              <br />
              <span className="text-brass">資金の源泉</span>。
            </h1>
            
            <p className="text-xl text-concrete-light max-w-2xl">
              私たちの事業は、すべて「挑戦のための原資創出」につながっています。
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// Service Section Component
interface ServiceSectionProps {
  id: string;
  number: string;
  subtitle: string;
  title: string;
  tagline: string;
  description: string[];
  features: { icon: typeof Users; title: string; description: string }[];
  image: string;
  reverse?: boolean;
}

function ServiceSection({
  id,
  number,
  subtitle,
  title,
  tagline,
  description,
  features,
  image,
  reverse,
}: ServiceSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id={id}
      ref={ref}
      className={`py-24 md:py-32 ${reverse ? "bg-muted" : "bg-background"}`}
    >
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-5xl font-bold text-brass/20">
              {number}
            </span>
            <div className="w-12 h-0.5 bg-brass" />
            <span className="font-mono text-sm text-brass tracking-widest">
              {subtitle}
            </span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-anthracite leading-tight mb-4">
            {title}
          </h2>
          
          <p className="text-xl text-brass font-display">
            {tagline}
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start ${reverse ? "lg:flex-row-reverse" : ""}`}>
          {/* Description & Features */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={reverse ? "lg:order-2" : ""}
          >
            <div className="space-y-6 mb-10">
              {description.map((paragraph, index) => (
                <p key={index} className="text-lg text-concrete leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-12 h-12 bg-brass/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-brass" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-anthracite mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-concrete text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={reverse ? "lg:order-1" : ""}
          >
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Gold accent */}
              <div className={`absolute -bottom-4 ${reverse ? "-left-4" : "-right-4"} w-full h-full border-2 border-brass -z-10`} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// SES 5 Rules Section
function SESRulesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const rules = [
    "納期は命。約束を守ることがプロの証。",
    "報連相は即時。問題は小さいうちに共有。",
    "技術力より姿勢。学び続ける意志が最強の武器。",
    "チームの成功が自分の成功。個人プレーは厳禁。",
    "現場での信頼が、次の挑戦への切符になる。",
  ];

  return (
    <section ref={ref} className="py-20 bg-anthracite">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <span className="font-mono text-sm text-brass tracking-widest">
              SES PROFESSIONAL CODE
            </span>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mt-4">
              運用の5箇条
            </h3>
          </div>

          <div className="space-y-4">
            {rules.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4 p-6 bg-white/5 border-l-2 border-brass"
              >
                <span className="font-mono text-2xl font-bold text-brass">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-lg text-white leading-relaxed">
                  {rule}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section
function ServiceCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-muted">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="w-1 h-16 bg-brass mx-auto mb-8" />
          
          <h2 className="font-display text-3xl md:text-4xl font-bold text-anthracite leading-tight mb-6">
            あなたの挑戦を、
            <br />
            私たちが<span className="text-brass">全力でサポート</span>します。
          </h2>
          
          <p className="text-lg text-concrete mb-10">
            未経験でも大丈夫。大切なのは、変わりたいという想いです。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recruit">
              <span className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-brass text-anthracite font-display text-lg tracking-wider font-semibold hover:bg-brass-light transition-all duration-300 group">
                採用エントリー
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 border-2 border-anthracite text-anthracite font-display text-lg tracking-wider hover:border-brass hover:text-brass transition-all duration-300"
            >
              無料キャリア相談
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Service Page
export default function Service() {
  const [location] = useLocation();

  // Scroll to section on hash change
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  const services: ServiceSectionProps[] = [
    {
      id: "hr",
      number: "01",
      subtitle: "HR BUSINESS",
      title: "人材紹介事業",
      tagline: "未経験を最強の武器へ。現実的な伴走で支えるキャリアチェンジ。",
      description: [
        "学歴や経験がなくても、人生は変えられる。私たちは、そう信じています。",
        "独自の研修制度（動画研修×OJT）で、最短2週間でのデビューを実現。入社後も専任のキャリアアドバイザーが伴走し、あなたの成長を支え続けます。",
        "全国46都道府県に対応。地方在住でも、あなたの「変わりたい」を全力でサポートします。",
      ],
      features: [
        {
          icon: Clock,
          title: "最短2週間デビュー",
          description: "動画研修×OJTの独自プログラムで、未経験から即戦力へ。",
        },
        {
          icon: Users,
          title: "専任伴走サポート",
          description: "入社後も担当アドバイザーが継続的にフォロー。",
        },
        {
          icon: Award,
          title: "年収アップ確約",
          description: "キャリアチェンジで収入アップを実現。",
        },
      ],
      image: "/images/team-collaboration.jpg",
      reverse: false,
    },
    {
      id: "creative",
      number: "02",
      subtitle: "CREATIVE",
      title: "クリエイティブ事業",
      tagline: "ビジネス課題を解決し、次の挑戦のための原資を創出するクリエイティブ。",
      description: [
        "私たちのクリエイティブは、単なる制作物ではありません。クライアントのビジネス課題を解決し、成果を生み出すための戦略的なソリューションです。",
        "グッズ制作、フィギュア制作、デザイン全般。高品質なアウトプットで、クライアントの期待を超え続けます。",
        "そして、ここで生まれた利益は、次の挑戦のための原資となります。",
      ],
      features: [
        {
          icon: Palette,
          title: "戦略的デザイン",
          description: "ビジネス成果に直結するクリエイティブを提供。",
        },
        {
          icon: Briefcase,
          title: "幅広い制作実績",
          description: "グッズ、フィギュア、デザイン全般に対応。",
        },
        {
          icon: CheckCircle,
          title: "高品質保証",
          description: "妥協のないクオリティで期待を超える。",
        },
      ],
      image: "/images/success-moment.jpg",
      reverse: true,
    },
    {
      id: "ses",
      number: "03",
      subtitle: "SES",
      title: "SES事業",
      tagline: "現場での結果こそが、夢を語る唯一の自信になる。",
      description: [
        "夢を語るには、実績が必要です。SES事業は、その実績を積み上げる場所。",
        "クライアント先での業務を通じて、技術力だけでなく、ビジネスパーソンとしての基礎を磨きます。",
        "現場で信頼を勝ち取ることが、次の挑戦への切符になる。プロ意識を持って、一つひとつの仕事に向き合います。",
      ],
      features: [
        {
          icon: Code,
          title: "実践的スキル習得",
          description: "現場での経験を通じて、即戦力となる技術を習得。",
        },
        {
          icon: Users,
          title: "チーム連携",
          description: "クライアントチームの一員として、協働の力を学ぶ。",
        },
        {
          icon: Award,
          title: "キャリアアップ",
          description: "実績を積み重ね、次のステージへ。",
        },
      ],
      image: "/images/hero-bg.jpg",
      reverse: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ServiceHero />
        
        {/* Service Sections */}
        {services.map((service, index) => (
          <ServiceSection key={service.id} {...service} />
        ))}
        
        <SESRulesSection />
        <ServiceCTA />
      </main>
      <Footer />
    </div>
  );
}
