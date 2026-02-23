/*
 * Design: Industrial Luxe - クリエイティブ事業ページ
 * セクション構成:
 * 1. ページタイトル
 * 2. 読者へのメッセージ
 * 3. 提供サービス内容
 * 4. CTA（事業無料相談）
 */

import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Package, Boxes, PenTool, Layers } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ページヒーロー
function PageHero() {
  return (
    <section className="relative pt-32 pb-20 bg-anthracite overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="/images/team-collaboration.jpg"
          alt="クリエイティブ事業"
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">CREATIVE SOLUTION</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            クリエイティブ事業
          </h1>
          <div className="w-20 h-1 bg-brass" />
        </motion.div>
      </div>
    </section>
  );
}

// メッセージセクション
function MessageSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 leading-relaxed">
            課題解決を「原資」に変え、
            <br />
            <span className="text-brass">仲間の夢を加速させる。</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            私たちのクリエイティブ事業は、単なる制作サービスではありません。
            お客様のビジネス課題を解決し、その成果を次の挑戦のための原資として活用する。
            それが、W.O.JPのクリエイティブ事業の本質です。
            オリジナルグッズ製造から3D設計まで、幅広いクリエイティブソリューションを提供します。
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// 提供サービス内容
function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      icon: Package,
      title: "オリジナルグッズ製造",
      description: "企業ノベルティ、イベントグッズ、オリジナル商品など、アイデアを形にします。小ロットから大量生産まで柔軟に対応。",
      features: ["企業ノベルティ制作", "イベントグッズ", "オリジナル商品開発", "小ロット対応"],
    },
    {
      icon: Boxes,
      title: "フィギュア・立体造形",
      description: "キャラクターフィギュア、プロトタイプ、展示用造形物など、高品質な立体造形を実現します。",
      features: ["キャラクターフィギュア", "プロトタイプ制作", "展示用造形物", "3Dプリント"],
    },
    {
      icon: PenTool,
      title: "2D・3D設計",
      description: "製品設計、パッケージデザイン、3Dモデリングなど、デジタルクリエイティブを幅広くサポート。",
      features: ["製品設計", "パッケージデザイン", "3Dモデリング", "CAD設計"],
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">OUR SERVICES</span>
          <h2 className="font-display text-4xl font-bold text-foreground">
            提供サービス
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-card border border-border p-8 group hover:border-brass/50 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-brass/10 flex items-center justify-center mb-6 group-hover:bg-brass/20 transition-colors duration-300">
                <service.icon className="text-brass" size={32} />
              </div>

              <h3 className="font-display text-2xl font-bold text-foreground mb-4">{service.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>

              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-brass" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="absolute bottom-0 left-0 w-0 h-1 bg-brass group-hover:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ワークフローセクション
function WorkflowSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    { step: "01", title: "ヒアリング", description: "課題やご要望を丁寧にヒアリング" },
    { step: "02", title: "企画・提案", description: "最適なソリューションをご提案" },
    { step: "03", title: "デザイン", description: "コンセプトに基づいたデザイン制作" },
    { step: "04", title: "制作・納品", description: "高品質な成果物をお届け" },
  ];

  return (
    <section ref={ref} className="py-24 bg-anthracite">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">WORKFLOW</span>
          <h2 className="font-display text-4xl font-bold text-white">
            制作の流れ
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="relative"
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-brass text-anthracite font-display text-2xl font-bold flex items-center justify-center mb-6">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>

              {/* 矢印（最後以外） */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-3 text-brass">
                  <ArrowRight size={24} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTAセクション
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl font-bold text-foreground mb-6">
            まずはお気軽にご相談ください
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            オリジナルグッズ製造、フィギュア制作、デザイン・設計など、
            クリエイティブに関するご相談をお待ちしております。
          </p>
          <Link href="/contact">
            <span className="inline-flex items-center gap-2 px-10 py-5 bg-brass text-anthracite font-display font-semibold tracking-wider text-lg hover:bg-brass-light transition-all duration-300 hover:shadow-lg hover:shadow-brass/30">
              事業無料相談
              <ArrowRight size={20} />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function ServiceCreative() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero />
        <MessageSection />
        <ServicesSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
