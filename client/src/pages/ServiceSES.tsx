/*
 * Design: Industrial Luxe - SES事業ページ
 * セクション構成:
 * 1. ページタイトル
 * 2. 読者へのメッセージ
 * 3. 対応領域・メニュー
 * 4. 運用の五箇条
 * 5. CTA（SESに関するお問い合わせ）
 */

import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Monitor, Server, Cloud, Shield, Zap, MessageSquare, Target, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ページヒーロー
function PageHero() {
  return (
    <section className="relative pt-32 pb-20 bg-anthracite overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="/images/success-moment.jpg"
          alt="SES事業"
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">SYSTEM ENGINEERING SERVICE</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            SES事業
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
            現場での結果こそが、
            <br />
            <span className="text-brass">夢を語る唯一の自信になる。</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            W.O.JPのSES事業は、単なる人材派遣ではありません。
            エンジニア一人ひとりが「本業で結果を出す」ことを最優先に、
            お客様のプロジェクト成功に貢献します。
            現場での実績が、次の挑戦への自信と原資を生み出す。
            それが私たちの考えるSESの本質です。
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// 対応領域・メニュー
function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      icon: Monitor,
      title: "常駐型開発支援",
      description: "お客様先に常駐し、開発チームの一員としてプロジェクトを推進。Web開発、業務システム、モバイルアプリなど幅広い領域に対応します。",
      tags: ["Web開発", "業務システム", "モバイルアプリ", "フロントエンド", "バックエンド"],
    },
    {
      icon: Server,
      title: "受託開発",
      description: "要件定義から設計、開発、テスト、運用まで一貫して対応。お客様のビジネス課題を技術で解決します。",
      tags: ["要件定義", "設計", "開発", "テスト", "運用保守"],
    },
    {
      icon: Cloud,
      title: "インフラ・クラウド構築",
      description: "AWS、Azure、GCPなど主要クラウドプラットフォームでのインフラ構築・運用を支援。セキュリティ対策も万全です。",
      tags: ["AWS", "Azure", "GCP", "Docker", "Kubernetes"],
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">SERVICE MENU</span>
          <h2 className="font-display text-4xl font-bold text-foreground">
            対応領域
          </h2>
        </motion.div>

        <div className="space-y-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-card border border-border p-8 md:p-10 group hover:border-brass/50 transition-all duration-500"
            >
              <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
                <div className="w-20 h-20 bg-brass/10 flex items-center justify-center shrink-0 group-hover:bg-brass/20 transition-colors duration-300">
                  <service.icon className="text-brass" size={36} />
                </div>

                <div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-brass/10 text-brass text-sm font-display"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 運用の五箇条
function PrinciplesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const principles = [
    {
      number: "01",
      icon: Target,
      title: "本業コミット",
      description: "まずは本業で結果を出す。それが全ての基盤となる。",
    },
    {
      number: "02",
      icon: Zap,
      title: "スピード重視",
      description: "スピードはリスペクト。迅速な対応で信頼を築く。",
    },
    {
      number: "03",
      icon: MessageSquare,
      title: "本音と現実",
      description: "良いことも悪いことも正直に。透明性のあるコミュニケーション。",
    },
    {
      number: "04",
      icon: Shield,
      title: "自律した意思",
      description: "指示待ちではなく、自ら考え行動する。",
    },
    {
      number: "05",
      icon: CheckCircle,
      title: "責任ある完遂",
      description: "始めたことは最後までやり抜く。結果にコミットする。",
    },
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">OUR PRINCIPLES</span>
          <h2 className="font-display text-4xl font-bold text-white">
            運用の五箇条
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-4">
          {principles.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 p-6 text-center group hover:border-brass/50 transition-all duration-500"
            >
              <div className="w-12 h-12 mx-auto bg-brass text-anthracite font-display font-bold flex items-center justify-center mb-4">
                {item.number}
              </div>
              <item.icon className="w-8 h-8 text-brass mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
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
            SESに関するお問い合わせ
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            エンジニアリソースのご相談、プロジェクト支援のご依頼など、
            お気軽にお問い合わせください。
          </p>
          <Link href="/contact">
            <span className="inline-flex items-center gap-2 px-10 py-5 bg-brass text-anthracite font-display font-semibold tracking-wider text-lg hover:bg-brass-light transition-all duration-300 hover:shadow-lg hover:shadow-brass/30">
              SESに関するお問い合わせ
              <ArrowRight size={20} />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function ServiceSES() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero />
        <MessageSection />
        <ServicesSection />
        <PrinciplesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
