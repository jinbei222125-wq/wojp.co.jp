/*
 * Design: Industrial Luxe - Story Page
 * 
 * 代表の原体験を4つのチャプター形式で共有
 * ターゲット（20-30代未経験者）の共感と応募意欲を最大化
 * 
 * Chapters:
 * 1. 大学中退、泥だらけの現場仕事
 * 2. 営業との出会い
 * 3. 「俺でもやれる」という自信
 * 4. くすぶっている若者の踏み台に
 */

import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Chapter Component
interface ChapterProps {
  number: string;
  title: string;
  content: string[];
  image?: string;
  imageAlt?: string;
  reverse?: boolean;
}

function Chapter({ number, title, content, image, imageAlt, reverse }: ChapterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? "lg:flex-row-reverse" : ""}`}>
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className={reverse ? "lg:order-2" : ""}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-6xl font-bold text-brass/20">
                {number}
              </span>
              <div className="w-12 h-0.5 bg-brass" />
            </div>
            
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-anthracite leading-tight mb-8">
              {title}
            </h2>
            
            <div className="space-y-6">
              {content.map((paragraph, index) => (
                <p key={index} className="text-lg text-concrete leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          {image && (
            <motion.div
              initial={{ opacity: 0, x: reverse ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={reverse ? "lg:order-1" : ""}
            >
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={image}
                    alt={imageAlt || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Gold accent */}
                <div className={`absolute -bottom-4 ${reverse ? "-left-4" : "-right-4"} w-full h-full border-2 border-brass -z-10`} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// Hero Section
function StoryHero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* Background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <div className="absolute inset-0 bg-anthracite" />
        <div className="absolute inset-0 opacity-20">
          <img
            src="/images/construction-worker.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-anthracite/50 via-anthracite/70 to-anthracite" />
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
                FOUNDER'S STORY
              </span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              ど底辺から始まった、
              <br />
              僕の<span className="text-brass">逆転劇</span>。
            </h1>
            
            <p className="text-xl text-concrete-light">
              W.O.JPを作った本当の理由。
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// Quote Section
function QuoteSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-muted">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <Quote className="w-12 h-12 text-brass mx-auto mb-8" />
          
          <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-anthracite leading-relaxed mb-8">
            「俺でもやれる」という自信が、
            <br />
            人生を変えた。
          </blockquote>
          
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brass">
              <img
                src="/images/ceo-portrait.jpg"
                alt="代表 大谷"
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-anthracite">大谷</p>
              <p className="text-sm text-concrete">W.O.JP 代表</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section
function StoryCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-anthracite">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="w-1 h-16 bg-brass mx-auto mb-8" />
          
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-6">
            あなたも、
            <br />
            <span className="text-brass">逆転の物語</span>を始めませんか？
          </h2>
          
          <p className="text-lg text-concrete-light mb-10">
            かつての僕のように「くすぶっている」あなたへ。
            <br />
            私たちが、あなたの踏み台になります。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/recruit">
              <span className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-brass text-anthracite font-display text-lg tracking-wider font-semibold hover:bg-brass-light transition-all duration-300 group">
                採用エントリー
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link href="/service">
              <span className="inline-flex items-center justify-center gap-2 px-10 py-4 border-2 border-white/30 text-white font-display text-lg tracking-wider hover:border-brass hover:text-brass transition-all duration-300">
                事業を見る
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Main Story Page
export default function Story() {
  const chapters: ChapterProps[] = [
    {
      number: "01",
      title: "大学中退、泥だらけの現場仕事。\n「俺の人生、こんなもんかな」。",
      content: [
        "大学を中退した僕は、建設現場で働いていた。毎日、泥だらけになりながら、重い資材を運ぶ日々。",
        "周りを見渡せば、同世代はスーツを着てオフィスで働いている。「俺には学歴がないから」「俺の人生、こんなもんかな」。そう思い込んでいた。",
        "でも、心のどこかでは「このままじゃ終わりたくない」という想いがくすぶっていた。",
      ],
      image: "/images/construction-worker.jpg",
      imageAlt: "建設現場で働く若者",
      reverse: false,
    },
    {
      number: "02",
      title: "営業との出会い。\n学歴コンプレックスを跳ね返す行動量。",
      content: [
        "転機は、ある営業職との出会いだった。彼は言った。「学歴なんて関係ない。結果を出せばいいんだ」。",
        "最初は半信半疑だった。でも、やってみることにした。朝から晩まで、誰よりも動いた。断られても、断られても、また立ち上がった。",
        "気づけば、大卒の同期よりも成績を上げていた。学歴コンプレックスを、行動量で跳ね返した瞬間だった。",
      ],
      image: "/images/team-collaboration.jpg",
      imageAlt: "チームで働くビジネスパーソン",
      reverse: true,
    },
    {
      number: "03",
      title: "「俺でもやれる」という自信が\n人生を変えた。",
      content: [
        "結果を出し続けることで、僕の中に確信が生まれた。「俺でもやれる」。",
        "この自信は、単なる自己満足じゃない。実績に裏打ちされた、本物の自信だ。",
        "夢を語れるようになった。大きな目標を持てるようになった。人生が、確実に変わり始めていた。",
      ],
      image: "/images/success-moment.jpg",
      imageAlt: "成功を収めたビジネスマン",
      reverse: false,
    },
    {
      number: "04",
      title: "かつての自分のような\n「くすぶっている若者」の踏み台になりたい。",
      content: [
        "今の僕があるのは、あの時「やってみろ」と背中を押してくれた人がいたから。",
        "だから今度は、僕がその役割を果たしたい。かつての自分のように、学歴や経験がなくて悩んでいる若者の踏み台になりたい。",
        "W.O.JPを作った理由は、そこにある。未経験を最強の武器へ。一緒に、逆転の物語を作ろう。",
      ],
      image: "/images/ceo-portrait.jpg",
      imageAlt: "W.O.JP代表",
      reverse: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <StoryHero />
        
        {/* Chapters */}
        <div className="divide-y divide-border">
          {chapters.map((chapter, index) => (
            <Chapter key={index} {...chapter} />
          ))}
        </div>
        
        <QuoteSection />
        <StoryCTA />
      </main>
      <Footer />
    </div>
  );
}
