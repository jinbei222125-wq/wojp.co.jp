/*
 * Design: Industrial Luxe - 問い合わせページ
 * フォーム構成：お名前、メール、種別、内容
 * サンクスページ演出：完了メッセージ表示後、自動リダイレクト
 */

import { useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const inquiryTypes = [
  { value: "recruit", label: "人材紹介に関するご相談" },
  { value: "creative", label: "クリエイティブ制作に関するご相談" },
  { value: "ses", label: "SESに関するご相談" },
  { value: "hiring", label: "採用に関するお問い合わせ" },
  { value: "other", label: "その他" },
];

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
          <span className="font-display text-brass text-sm tracking-[0.3em] mb-4 block">CONTACT</span>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
            お問い合わせ
          </h1>
          <div className="w-20 h-1 bg-brass" />
        </motion.div>
      </div>
    </section>
  );
}

// サンクスページ
function ThankYouSection({ onReset }: { onReset: () => void }) {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);

  // 自動リダイレクト
  useState(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocation("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="py-24 bg-background"
    >
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-24 h-24 mx-auto bg-brass/10 flex items-center justify-center mb-8"
          >
            <CheckCircle className="w-12 h-12 text-brass" />
          </motion.div>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
            送信ありがとうございます
          </h2>

          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            お問い合わせ内容を確認のうえ、担当者よりご連絡いたします。
            <br />
            通常、3営業日以内にご返信いたします。
          </p>

          <p className="text-muted-foreground text-sm mb-8">
            {countdown}秒後に自動的にトップページへ移動します...
          </p>

          <button
            onClick={() => setLocation("/")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-brass text-anthracite font-display font-semibold tracking-wider hover:bg-brass-light transition-all duration-300"
          >
            トップページへ戻る
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// お問い合わせフォーム
function ContactForm({ onSuccess }: { onSuccess: () => void }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // フォーム送信シミュレーション
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast.success("お問い合わせを受け付けました");
    setIsSubmitting(false);
    onSuccess();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section ref={ref} className="py-24 bg-background">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* 説明テキスト */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              お気軽にご相談ください
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              人材紹介、クリエイティブ制作、SES、採用など、
              どんなことでもお気軽にお問い合わせください。
              専門スタッフが丁寧にご対応いたします。
            </p>
          </motion.div>

          {/* フォーム */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="bg-card border border-border p-8 md:p-10">
              <div className="space-y-6">
                {/* お名前 */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    お名前 <span className="text-brass">*</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="山田 太郎"
                    className="bg-background"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    メールアドレス <span className="text-brass">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    className="bg-background"
                  />
                </div>

                {/* 電話番号 */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    電話番号
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="090-XXXX-XXXX"
                    className="bg-background"
                  />
                </div>

                {/* お問い合わせ種別 */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    お問い合わせ種別 <span className="text-brass">*</span>
                  </label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">選択してください</option>
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* お問い合わせ内容 */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    お問い合わせ内容 <span className="text-brass">*</span>
                  </label>
                  <Textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="お問い合わせ内容をご記入ください"
                    rows={6}
                    className="bg-background resize-none"
                  />
                </div>

                {/* プライバシーポリシー同意 */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    required
                    className="mt-1"
                  />
                  <label htmlFor="privacy" className="text-sm text-muted-foreground">
                    <a href="/privacy" className="text-brass hover:underline">プライバシーポリシー</a>に同意の上、送信してください。
                  </label>
                </div>

                {/* 送信ボタン */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-brass text-anthracite font-display font-semibold tracking-wider text-lg hover:bg-brass-light transition-all duration-300"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-anthracite/30 border-t-anthracite rounded-full"
                      />
                      送信中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      送信する
                      <Send size={18} />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <PageHero />
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <ThankYouSection key="thanks" onReset={() => setIsSubmitted(false)} />
          ) : (
            <ContactForm key="form" onSuccess={() => setIsSubmitted(true)} />
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
