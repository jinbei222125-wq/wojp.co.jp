/*
 * Design: Industrial Luxe - 人材紹介事業ページ
 * セクション構成:
 * 1. ページタイトル
 * 2. 読者へのメッセージ
 * 3. キャリアアドバイザー紹介
 * 4. 研修制度紹介
 * 5. 転職者の声
 * 6. CTA（キャリア無料相談）
 */

import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight, GraduationCap, Users, Clock, CheckCircle, Quote } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ページヒーロー
function PageHero() {
  return (
    <section className="relative pt-32 pb-20 bg-anthracite overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="/images/construction-worker.jpg"
          alt="人材紹介事業"
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">RECRUITING AGENCY</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            人材紹介事業
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
            未経験から新しい業界への挑戦を
            <br />
            <span className="text-brass">全力サポート。</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            学歴や経歴は関係ありません。大切なのは「変わりたい」という想いと、それを行動に移す覚悟。
            私たちは、あなたの可能性を最大限に引き出し、理想のキャリアへと導きます。
            専任のキャリアアドバイザーが、入社前から入社後まで一貫してサポート。
            「スピードはリスペクト」の精神で、あなたの挑戦を全力で支えます。
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// キャリアアドバイザー紹介
function AdvisorsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const advisors = [
    {
      name: "田中 健太",
      title: "シニアキャリアアドバイザー",
      message: "「できない理由」より「できる方法」を一緒に考えましょう。あなたの可能性は無限大です。",
      image: "/images/team-collaboration.jpg",
    },
    {
      name: "佐藤 美咲",
      title: "キャリアアドバイザー",
      message: "転職は人生の大きな決断。だからこそ、一人ひとりに寄り添った丁寧なサポートを心がけています。",
      image: "/images/success-moment.jpg",
    },
    {
      name: "山田 翔太",
      title: "キャリアアドバイザー",
      message: "私自身も未経験からのキャリアチェンジ経験者。その経験を活かして、リアルなアドバイスをお届けします。",
      image: "/images/ceo-portrait.jpg",
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">CAREER ADVISORS</span>
          <h2 className="font-display text-4xl font-bold text-foreground">
            キャリアアドバイザー紹介
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {advisors.map((advisor, index) => (
            <motion.div
              key={advisor.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-card border border-border overflow-hidden group"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={advisor.image}
                  alt={advisor.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <p className="text-brass text-sm font-display tracking-wider mb-1">{advisor.title}</p>
                <h3 className="font-display text-xl font-bold text-foreground mb-4">{advisor.name}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">"{advisor.message}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 研修制度紹介
function TrainingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      step: "01",
      title: "オンライン動画研修",
      duration: "1週間",
      description: "業界知識、ビジネスマナー、基礎スキルをオンラインで学習。自分のペースで進められます。",
      icon: GraduationCap,
    },
    {
      step: "02",
      title: "実践型OJT研修",
      duration: "1週間",
      description: "先輩社員と一緒に現場で実践。リアルな業務を通じてスキルを磨きます。",
      icon: Users,
    },
    {
      step: "03",
      title: "現場デビュー",
      duration: "最短2週間",
      description: "研修終了後、いよいよ現場デビュー。専任アドバイザーが継続サポートします。",
      icon: Clock,
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">TRAINING PROGRAM</span>
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            研修制度紹介
          </h2>
          <p className="text-muted-foreground text-lg">
            動画研修×OJTで<span className="text-brass font-semibold">最短2週間</span>デビュー
          </p>
        </motion.div>

        <div className="relative">
          {/* 接続線 */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative bg-card border border-border p-8 text-center"
              >
                {/* ステップ番号 */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-brass text-anthracite font-display font-bold flex items-center justify-center">
                  {item.step}
                </div>

                <div className="pt-6">
                  <item.icon className="w-12 h-12 text-brass mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-brass font-display text-sm mb-4">{item.duration}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 転職者の声
function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: "K.S さん",
      age: "26歳",
      before: "飲食店スタッフ",
      after: "ITエンジニア",
      message: "未経験からのIT業界転職は不安でしたが、アドバイザーさんの丁寧なサポートのおかげで、今では自信を持って仕事ができています。年収も100万円以上アップしました！",
    },
    {
      name: "M.T さん",
      age: "24歳",
      before: "アパレル販売員",
      after: "人材コンサルタント",
      message: "接客経験を活かせる仕事を探していました。自分の強みを一緒に見つけてくれて、今の仕事に出会えました。毎日やりがいを感じています。",
    },
    {
      name: "Y.H さん",
      age: "28歳",
      before: "工場作業員",
      after: "営業職",
      message: "「俺でもできるのか？」という不安がありましたが、研修制度がしっかりしていて安心でした。今では営業成績トップを目指して頑張っています。",
    },
    {
      name: "A.N さん",
      age: "23歳",
      before: "フリーター",
      after: "Webデザイナー",
      message: "正社員経験がなくても大丈夫でした。自分の「好き」を仕事にできて、毎日が充実しています。",
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">SUCCESS STORIES</span>
          <h2 className="font-display text-4xl font-bold text-white">
            転職者の声
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-card/5 border border-white/10 p-8 relative"
            >
              <Quote className="absolute top-6 right-6 text-brass/20" size={40} />

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-brass/20 rounded-full flex items-center justify-center">
                  <span className="font-display text-brass font-bold">{item.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-display text-white font-semibold">{item.name}（{item.age}）</p>
                  <p className="text-gray-400 text-sm">
                    {item.before} → <span className="text-brass">{item.after}</span>
                  </p>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed">"{item.message}"</p>
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
            まずは無料相談から
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            キャリアに関するお悩み、転職のご相談など、お気軽にお問い合わせください。
            専任のキャリアアドバイザーが丁寧にお答えします。
          </p>
          <Link href="/contact">
            <span className="inline-flex items-center gap-2 px-10 py-5 bg-brass text-anthracite font-display font-semibold tracking-wider text-lg hover:bg-brass-light transition-all duration-300 hover:shadow-lg hover:shadow-brass/30">
              キャリア無料相談
              <ArrowRight size={20} />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function ServiceRecruit() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero />
        <MessageSection />
        <AdvisorsSection />
        <TrainingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
