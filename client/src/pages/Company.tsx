/*
 * Design: Industrial Luxe - 会社概要ページ
 * セクション構成:
 * 1. ページタイトル
 * 2. 代表メッセージ
 * 3. 経営理念（MVV）
 * 4. 会社情報
 * 5. 拠点一覧
 * 6. 取引先・加盟団体
 */

import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ArrowRight, MapPin, Building2, Target, Eye, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ページヒーロー
function PageHero() {
  return (
    <section className="relative pt-32 pb-20 bg-anthracite overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="/images/hero-bg.jpg"
          alt="会社概要"
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">COMPANY</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            会社概要
          </h1>
          <div className="w-20 h-1 bg-brass" />
        </motion.div>
      </div>
    </section>
  );
}

// 代表メッセージ
function CEOMessageSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* 左側：ロゴ */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative flex items-center justify-center p-8 md:p-12 lg:p-16">
              {/* ロゴ画像 */}
              <img
                src="/images/wojapan-logo2-2048x410 (1).png"
                alt="W.O.JP ロゴ"
                className="w-full max-w-full h-auto object-contain"
                style={{ background: "transparent" }}
              />
            </div>
          </motion.div>

          {/* 右側：メッセージ */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">MESSAGE</span>
            <h2 className="font-display text-4xl font-bold text-foreground mb-8">
              代表メッセージ
            </h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                「夢を語れる自信を、その手に。」
              </p>
              <p>
                大学中退、泥だらけの現場仕事。「俺の人生、こんなもんかな」と思っていた時期がありました。
                でも、営業との出会いが全てを変えました。学歴コンプレックスを跳ね返す行動量。
                「俺でもやれる」という自信が、人生を変えたのです。
              </p>
              <p>
                だから今、かつての自分のような「くすぶっている若者」の踏み台になりたい。
                W.O.JPを作った本当の理由は、そこにあります。
              </p>
              <p>
                私たちは、挑戦者の夢を実現し、共に未来を創る投資家集団です。
                あなたの「変わりたい」という想いを、全力でサポートします。
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              {/* <p className="font-display text-foreground mb-4">株式会社W.O.JP</p> */}
              <img
                src="/images/W.O.JP-CEO-sign.png"
                alt="代表取締役 大谷まさと"
                className="h-12 object-contain"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// 経営理念（MVV）
function MVVSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const mvv = [
    {
      icon: Target,
      label: "MISSION",
      title: "『未経験』を、最強の武器へ。",
      content: " 私たちは、過去の経歴で人を判断しません。 未経験者こそが「一番伸びるポテンシャル」であると証明し、理想論で終わらない現実的なキャリア支援を社会の当たり前にします。 「夢を語るだけの転職」ではなく、現実と向き合い、稼ぐ力を身につけ、一人ひとりが「この選択でよかった」と胸を張れる未来をつくること。それが私たちの使命です。",
    },
    {
      icon: Eye,
      label: "VISION",
      title: "資金力で仲間の夢を加速させる、『挑戦者のための投資家』になる",
      content: "私たちは、単なる人材会社ではありません。利益率の高い事業にこだわり、圧倒的な「資金力（原資）」を作ります。 その資金とビジネスの力で、仲間の夢や可能性に投資し、形にしていく。 社員全員が「投資家」の視点を持ち、誠実な行動で成功を掴み取ることで、誰もが夢を実現できる新たな社会構造を構築します。",
    },
  ];

  const values = [
    {
      number: "1",
      title: "過去ではなく『未来に投資』する",
      content: "誰かの過去に興味はない。私たちは「これからどうなりたいか」という可能性に、時間と資金を全力で注ぎ込む。性別や経歴を問わず、挑戦する意志のある者を全力で引き上げる。",
    },
    {
      number: "2",
      title: "結果こそが『夢を語る自信』になる",
      content: "頑張るだけでは意味がない。結果を出すことにこだわる。その結果こそが、胸を張って次の夢を語り、人生の選択肢を広げるための唯一の「自信」となる。",
    },
    {
      number: "3",
      title: "スピードは『リスペクト』である",
      content: "スピードは、成果を最短で出すための最強の武器だ。60点でもまずは動く。そのスピードこそが、お客様と仲間の時間を大切にする最大の「敬意（リスペクト）」であると知る。",
    },
    {
      number: "4",
      title: "『本音』と『現実』から逃げない",
      content: "言葉になっていない想いまで汲み取り、厳しい現実も誠実に伝える。表面的な希望や、都合のいい選択肢だけを提示することは優しさではない。私たちは人生という重みに敬意を払い、対等に向き合う。",
    },
    {
      number: "5",
      title: "選択に『責任』を持ち、成長を止めない",
      content: "紹介して終わりではない。決断の瞬間まで伴走し、その後の人生にも責任を持つ気概で挑む。そのために、私たち自身が常に学び、変化を楽しみ、支援できる選択肢を増やし続ける。",
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">PHILOSOPHY</span>
          <h2 className="font-display text-4xl font-bold text-white">
            経営理念
          </h2>
        </motion.div>

        {/* MISSION & VISION */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {mvv.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white/5 border border-white/10 p-8 text-center group hover:border-brass/50 transition-all duration-500"
            >
              <div className="w-16 h-16 mx-auto bg-brass/10 flex items-center justify-center mb-6 group-hover:bg-brass/20 transition-colors duration-300">
                <item.icon className="text-brass" size={32} />
              </div>
              <span className="font-display text-brass text-sm tracking-[0.2em] mb-2 block">{item.label}</span>
              <h3 className="font-display text-2xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-gray-300 leading-relaxed">{item.content}</p>
            </motion.div>
          ))}
        </div>

        {/* VALUES */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/5 border border-white/10 p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto bg-brass/10 flex items-center justify-center mb-6">
              <Heart className="text-brass" size={32} />
            </div>
            <span className="font-display text-brass text-sm tracking-[0.2em] mb-2 block">VALUES</span>
            <h3 className="font-display text-2xl font-bold text-white mb-4">
              私たちは、以下の5つの価値観を行動の基準とします。
            </h3>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={value.number}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="flex gap-6 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-brass/10 flex items-center justify-center group-hover:bg-brass/20 transition-colors duration-300">
                    <span className="font-display text-brass text-xl font-bold">{value.number}</span>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="font-display text-lg font-bold text-white mb-2 group-hover:text-brass transition-colors duration-300">
                    {value.title}
                  </h4>
                  <p className="text-gray-300 leading-relaxed">{value.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// 会社情報
function CompanyInfoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const companyInfo = [
    { label: "社名", value: "株式会社W.O.JP" },
    { label: "設立", value: "2024年10月" },
    { label: "代表者", value: "大谷 まさと" },
    { label: "資本金", value: "300万円" },
    // { label: "従業員数", value: "50名（2025年12月現在）" },
    { label: "事業内容", value: "人材紹介事業 / クリエイティブ事業 / SES事業" },
    { label: "許可番号", value: "" },
    { label: "所在地", value: "〒160-0022 東京都新宿区新宿5-14-12 天翔オフィス新宿三丁目404" },
    // { label: "TEL", value: "03-XXXX-XXXX" },
    // { label: "FAX", value: "03-XXXX-XXXX" },
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">COMPANY INFO</span>
          <h2 className="font-display text-4xl font-bold text-foreground">
            会社情報
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card border border-border">
            <table className="w-full">
              <tbody>
                {companyInfo.map((item, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <th className="py-5 px-6 text-left font-display text-sm text-muted-foreground bg-muted/30 w-40 md:w-48">{item.label}</th>
                    <td className="py-5 px-6 text-foreground">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// 拠点一覧
function OfficesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const offices = [
    {
      name: "本社（東京）",
      address: "〒160-0022 東京都新宿区新宿5-14-12 天翔オフィス新宿三丁目404",
      // access: "JR新宿駅 西口より徒歩5分",
    },
    {
      name: "東京支社",
      address: "〒150-6139 東京都渋谷区渋谷2-24-12 渋谷スクランブルスクエア 39F",
      // access: "JR大阪駅より徒歩3分",
    },
    {
      name: "大阪支社",
      address: "〒530-0011 大阪府大阪市北区大深町1-1 LINKS UMEDA 8F",
      // access: "JR名古屋駅より徒歩4分",
    },
    {
      name: "名古屋支社",
      address: "〒450-6050 愛知県名古屋市中村区名駅1-1-4 JRセントラルタワーズ 50F",
      // access: "JR博多駅より徒歩2分",
    },
    {
      name: "福岡支社",
      address: "〒810-0041 福岡県福岡市中央区大名1-1-29 WeWork大名 1F",
    },
    {
      name: "仙台支社",
      address: "〒983-0852 宮城県仙台市宮城野区榴岡1-1-1 JR仙台イーストゲートビル 3F",
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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">OFFICES</span>
          <h2 className="font-display text-4xl font-bold text-foreground">
            拠点一覧
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {offices.map((office, index) => (
            <motion.div
              key={office.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-card border border-border p-6 group hover:border-brass/50 transition-all duration-500"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brass/10 flex items-center justify-center shrink-0 group-hover:bg-brass/20 transition-colors duration-300">
                  <MapPin className="text-brass" size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{office.name}</h3>
                  <p className="text-muted-foreground text-sm">{office.address}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 取引先・加盟団体
function PartnersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const partners = [
    "株式会社SNJAPAN"
  ];

  // const associations = [
  //   "一般社団法人 日本人材紹介事業協会",
  //   "東京商工会議所",
  // ];

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16">
          {/* 主要取引先 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">PARTNERS</span>
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              主要取引先
            </h2>
            <div className="space-y-3">
              {partners.map((partner, index) => (
                <div key={index} className="flex items-center gap-3 py-3 border-b border-border">
                  <Building2 className="text-brass" size={18} />
                  <span className="text-foreground">{partner}</span>
                </div>
              ))}
            </div>
            {/* <p className="text-muted-foreground text-sm mt-4">※順不同、一部抜粋</p> */}
          </motion.div>

          {/* 加盟団体 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">ASSOCIATIONS</span>
            <h2 className="font-display text-3xl font-bold text-foreground mb-8">
              加盟団体
            </h2> */}
            {/* <div className="space-y-3">
              {associations.map((association, index) => (
                <div key={index} className="flex items-center gap-3 py-3 border-b border-border">
                  <Building2 className="text-brass" size={18} />
                  <span className="text-foreground">{association}</span>
                </div>
              ))}
            </div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Company() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero />
        <CEOMessageSection />
        <MVVSection />
        <CompanyInfoSection />
        <OfficesSection />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
}
