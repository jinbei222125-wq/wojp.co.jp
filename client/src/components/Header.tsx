/*
 * Design: Industrial Luxe Header
 * - 縦のゴールドラインがアクセント
 * - スクロールで背景が変化
 * - SERVICEにドロップダウンメニュー
 * - メニュー構成: TOP / SERVICE(ドロップダウン) / COMPANY / STORY / RECRUIT / NEWS / CONTACT
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const serviceItems = [
  { href: "/service/recruit", label: "人材紹介事業" },
  { href: "/service/creative", label: "クリエイティブ事業" },
  { href: "/service/ses", label: "SES事業" },
];

const navItems = [
  { href: "/", label: "TOP" },
  { href: "/service", label: "SERVICE", hasDropdown: true },
  { href: "/company", label: "COMPANY" },
  { href: "/story", label: "STORY" },
  { href: "/recruit", label: "RECRUIT" },
  { href: "/news", label: "NEWS" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [isMobileServiceOpen, setIsMobileServiceOpen] = useState(false);
  const [location] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServiceDropdownOpen(false);
  }, [location]);

  // クリック外でドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isServiceActive = location.startsWith("/service");

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 group">
              <div className="w-1 h-10 bg-brass transition-all duration-300 group-hover:h-12" />
              <span className="font-display text-2xl font-bold tracking-wider text-foreground">
                W.O.JP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              item.hasDropdown ? (
                <div key={item.href} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                    className={`font-display text-sm tracking-widest relative py-2 transition-colors duration-300 flex items-center gap-1 ${
                      isServiceActive
                        ? "text-brass"
                        : "text-foreground hover:text-brass"
                    }`}
                  >
                    {item.label}
                    <ChevronDown 
                      size={14} 
                      className={`transition-transform duration-300 ${isServiceDropdownOpen ? "rotate-180" : ""}`}
                    />
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-brass transition-all duration-300 ${
                        isServiceActive ? "w-full" : "w-0"
                      }`}
                    />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isServiceDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-background/95 backdrop-blur-md border border-border shadow-xl"
                      >
                        {serviceItems.map((subItem) => (
                          <Link key={subItem.href} href={subItem.href}>
                            <span
                              className={`block px-5 py-3 font-display text-sm tracking-wider transition-all duration-300 border-l-2 ${
                                location === subItem.href
                                  ? "border-brass text-brass bg-brass/5"
                                  : "border-transparent text-foreground hover:border-brass hover:text-brass hover:bg-brass/5"
                              }`}
                            >
                              {subItem.label}
                            </span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`font-display text-sm tracking-widest relative py-2 transition-colors duration-300 ${
                      location === item.href
                        ? "text-brass"
                        : "text-foreground hover:text-brass"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-brass transition-all duration-300 ${
                        location === item.href ? "w-full" : "w-0"
                      }`}
                    />
                  </span>
                </Link>
              )
            ))}
            <Link href="/contact">
              <span className="px-6 py-2.5 bg-brass text-anthracite font-display text-sm tracking-wider font-semibold hover:bg-brass-light transition-all duration-300 hover:shadow-lg hover:shadow-brass/20">
                CONTACT
              </span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="メニュー"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <nav className="container py-6 flex flex-col gap-2">
              {navItems.map((item) => (
                item.hasDropdown ? (
                  <div key={item.href}>
                    <button
                      onClick={() => setIsMobileServiceOpen(!isMobileServiceOpen)}
                      className={`w-full font-display text-lg tracking-wider flex items-center justify-between py-3 border-l-2 pl-4 pr-4 transition-all duration-300 ${
                        isServiceActive
                          ? "border-brass text-brass"
                          : "border-transparent text-foreground"
                      }`}
                    >
                      {item.label}
                      <ChevronDown 
                        size={18} 
                        className={`transition-transform duration-300 ${isMobileServiceOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isMobileServiceOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-8 overflow-hidden"
                        >
                          {serviceItems.map((subItem) => (
                            <Link key={subItem.href} href={subItem.href}>
                              <span
                                className={`block py-2 font-display text-base tracking-wider border-l-2 pl-4 transition-all duration-300 ${
                                  location === subItem.href
                                    ? "border-brass text-brass"
                                    : "border-transparent text-muted-foreground hover:border-brass hover:text-brass"
                                }`}
                              >
                                {subItem.label}
                              </span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`font-display text-lg tracking-wider block py-3 border-l-2 pl-4 transition-all duration-300 ${
                        location === item.href
                          ? "border-brass text-brass"
                          : "border-transparent text-foreground hover:border-brass hover:text-brass"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              ))}
              <Link href="/contact">
                <span className="mt-4 block text-center px-6 py-3 bg-brass text-anthracite font-display tracking-wider font-semibold">
                  CONTACT
                </span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
