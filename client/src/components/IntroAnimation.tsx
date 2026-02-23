/**
 * Design: Industrial Luxe - Intro Animation
 * 
 * 圧倒的に美しいイントロアニメーション
 * 「夢を語れる自信を、その手に。」を演出後にメインコンテンツを表示
 * 
 * 演出:
 * 1. 黒背景からゴールドのラインが中央から広がる
 * 2. テキストが一文字ずつフェードイン（タイプライター風）
 * 3. 全体がゴールドの光に包まれて消える
 * 4. メインのファーストビューが現れる
 */

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [phase, setPhase] = useState<"lines" | "text1" | "text2" | "glow" | "exit">("lines");
  
  const line1 = "夢を語れる自信を、";
  const line2 = "その手に。";

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("text1"), 800),
      setTimeout(() => setPhase("text2"), 2200),
      setTimeout(() => setPhase("glow"), 3800),
      setTimeout(() => setPhase("exit"), 4800),
      setTimeout(() => onComplete(), 5600),
    ];
    
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? (
        <motion.div
          className="fixed inset-0 z-[100] bg-anthracite flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Background Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-brass/30 rounded-full"
                initial={{ 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  y: [null, Math.random() * -200],
                  scale: [0, Math.random() * 2 + 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Central Gold Lines */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Horizontal Line */}
            <motion.div
              className="absolute top-1/2 left-1/2 h-[1px] bg-gradient-to-r from-transparent via-brass to-transparent"
              initial={{ width: 0, x: "-50%" }}
              animate={{ width: phase === "lines" ? 0 : "80vw", x: "-50%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            
            {/* Vertical Line */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-brass to-transparent"
              initial={{ height: 0, y: "-50%" }}
              animate={{ height: phase === "lines" ? 0 : "60vh", y: "-50%" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />

            {/* Corner Accents */}
            {["top-left", "top-right", "bottom-left", "bottom-right"].map((corner, i) => (
              <motion.div
                key={corner}
                className={`absolute w-8 h-8 border-brass ${
                  corner === "top-left" ? "-top-32 -left-40 border-t border-l" :
                  corner === "top-right" ? "-top-32 -right-40 border-t border-r" :
                  corner === "bottom-left" ? "-bottom-32 -left-40 border-b border-l" :
                  "-bottom-32 -right-40 border-b border-r"
                }`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: phase !== "lines" ? 0.6 : 0, 
                  scale: phase !== "lines" ? 1 : 0.5 
                }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
              />
            ))}
          </motion.div>

          {/* Main Text Container */}
          <div className="relative z-10 text-center px-8">
            {/* Line 1 */}
            <div className="overflow-hidden mb-4">
              <motion.div
                className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider"
                initial={{ y: 100, opacity: 0 }}
                animate={{ 
                  y: (phase === "text1" || phase === "text2" || phase === "glow") ? 0 : 100,
                  opacity: (phase === "text1" || phase === "text2" || phase === "glow") ? 1 : 0
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {line1.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: (phase === "text1" || phase === "text2" || phase === "glow") ? 1 : 0,
                      y: (phase === "text1" || phase === "text2" || phase === "glow") ? 0 : 20
                    }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.05 * i,
                      ease: "easeOut"
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Line 2 */}
            <div className="overflow-hidden">
              <motion.div
                className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider"
                initial={{ y: 100, opacity: 0 }}
                animate={{ 
                  y: (phase === "text2" || phase === "glow") ? 0 : 100,
                  opacity: (phase === "text2" || phase === "glow") ? 1 : 0
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {line2.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className="inline-block text-brass"
                    initial={{ opacity: 0, y: 30, scale: 0.8 }}
                    animate={{ 
                      opacity: (phase === "text2" || phase === "glow") ? 1 : 0,
                      y: (phase === "text2" || phase === "glow") ? 0 : 30,
                      scale: (phase === "text2" || phase === "glow") ? 1 : 0.8
                    }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.08 * i,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Underline Accent */}
            <motion.div
              className="mt-8 mx-auto h-[2px] bg-gradient-to-r from-transparent via-brass to-transparent"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: (phase === "text2" || phase === "glow") ? "60%" : 0,
                opacity: (phase === "text2" || phase === "glow") ? 1 : 0
              }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-brass/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "glow" ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          />

          {/* Radial Glow from Center */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, rgba(200, 170, 110, 0.3) 0%, transparent 70%)"
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: phase === "glow" ? 1 : 0,
              scale: phase === "glow" ? 1.5 : 0.5
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Skip Button */}
          <motion.button
            className="absolute bottom-8 right-8 text-concrete-light/50 text-sm font-display tracking-wider hover:text-brass transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={onComplete}
          >
            SKIP →
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
