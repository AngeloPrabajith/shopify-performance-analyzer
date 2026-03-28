"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Search,
  ShieldCheck,
  BarChart3,
  Package,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const EXAMPLE_URLS = [
  "https://allbirds.com",
  "https://gymshark.com",
  "https://bombas.com",
];

const FEATURES = [
  {
    icon: Zap,
    title: "Script Analysis",
    description:
      "Identifies heavy scripts, duplicate libraries, and render-blocking resources slowing your store.",
    color: "#F59E0B",
  },
  {
    icon: Package,
    title: "App Detection",
    description:
      "Fingerprints every installed Shopify app and quantifies its performance impact.",
    color: "#8B5CF6",
  },
  {
    icon: BarChart3,
    title: "Performance Score",
    description:
      "Grades your store across scripts, images, and third-party impact — with a single actionable score.",
    color: "#22C55E",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description:
      "Claude AI reads your results and generates specific, copy-paste-ready fixes for every issue.",
    color: "#06B6D4",
  },
];

const STATS = [
  { value: "6", label: "Analysis Rules" },
  { value: "48", label: "App Fingerprints" },
  { value: "<30s", label: "Avg. Scan Time" },
  { value: "Free", label: "Always" },
];

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fullScan, setFullScan] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function validate(value: string) {
    if (!value.trim()) return "Enter a Shopify store URL";
    try {
      const u = new URL(value.startsWith("http") ? value : `https://${value}`);
      if (!u.hostname.includes(".")) return "Enter a valid URL";
      return "";
    } catch {
      return "Enter a valid URL (e.g. https://yourstore.myshopify.com)";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const err = validate(normalized);
    if (err) {
      setError(err);
      inputRef.current?.focus();
      return;
    }
    setError("");
    const scopeParam = fullScan ? "&scope=full" : "";
    router.push(`/results?url=${encodeURIComponent(normalized)}${scopeParam}`);
  }

  return (
    <main className="relative min-h-screen flex flex-col overflow-x-hidden">
      {/* Background orbs */}
      <div
        className="orb"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, #22C55E 0%, transparent 70%)",
          top: "-150px",
          left: "-150px",
          opacity: 0.12,
        }}
      />
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
          top: "20%",
          right: "-100px",
          opacity: 0.1,
        }}
      />
      <div
        className="orb"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)",
          bottom: "10%",
          left: "30%",
          opacity: 0.08,
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-slate-100 text-sm">
            Shopify Analyzer
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/angeloprabajith/shopify-performance-analyzer"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-100 transition-colors duration-200 cursor-pointer"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center max-w-4xl mx-auto w-full">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
              color: "#22C55E",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "#22C55E",
                animation: "pulse-green 2s ease-in-out infinite",
              }}
            />
            Powered by Playwright + Claude AI
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6"
            style={{ color: "#F8FAFC", letterSpacing: "-0.03em" }}
          >
            Scan your{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #22C55E, #16A34A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Shopify store
            </span>
            <br />
            in seconds.
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "#94A3B8" }}
          >
            Detect render-blocking scripts, duplicate libraries, oversized images,
            and every installed app — then get AI-generated fixes to ship immediately.
          </p>

          {/* URL Input */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div
              className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl transition-all duration-200"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${
                  error
                    ? "rgba(239, 68, 68, 0.5)"
                    : focused
                    ? "rgba(34, 197, 94, 0.4)"
                    : "rgba(255, 255, 255, 0.1)"
                }`,
                boxShadow: focused
                  ? "0 0 0 4px rgba(34, 197, 94, 0.08), 0 8px 32px rgba(0,0,0,0.3)"
                  : "0 4px 24px rgba(0,0,0,0.2)",
              }}
            >
              <div className="flex items-center gap-3 flex-1 px-4 py-2">
                <Search
                  size={18}
                  style={{ color: focused ? "#22C55E" : "#64748B", flexShrink: 0 }}
                />
                <input
                  ref={inputRef}
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                  }}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="https://yourstore.myshopify.com"
                  className="flex-1 bg-transparent border-none outline-none text-base text-slate-100 placeholder-slate-600"
                  style={{ fontSize: "16px" }}
                  aria-label="Shopify store URL"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #22C55E, #16A34A)",
                  boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
                  minWidth: "140px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 6px 24px rgba(34, 197, 94, 0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 4px 16px rgba(34, 197, 94, 0.3)";
                }}
              >
                Analyze Store
                <ArrowRight size={16} />
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-2 text-sm text-red-400 text-left px-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </form>

          {/* Full scan toggle */}
          <div className="flex items-center justify-center mt-5">
            <button
              type="button"
              onClick={() => setFullScan((v) => !v)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
              style={{
                background: fullScan ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${fullScan ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              {/* Toggle pill */}
              <div
                className="relative w-8 h-4 rounded-full transition-colors duration-200 shrink-0"
                style={{ background: fullScan ? "#22C55E" : "rgba(255,255,255,0.12)" }}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200"
                  style={{ left: fullScan ? "calc(100% - 14px)" : "2px" }}
                />
              </div>
              <div className="text-left">
                <span className="text-xs font-medium block" style={{ color: fullScan ? "#22C55E" : "#64748B" }}>
                  Full scan
                </span>
                <span className="text-xs block" style={{ color: "#475569" }}>
                  Includes product and collection pages (+45s)
                </span>
              </div>
            </button>
          </div>

          {/* Example URLs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-slate-600">Try:</span>
            {EXAMPLE_URLS.map((exUrl) => (
              <button
                key={exUrl}
                onClick={() => setUrl(exUrl)}
                className="text-xs px-3 py-1 rounded-full cursor-pointer transition-colors duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#64748B",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#22C55E";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(34,197,94,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#64748B";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "rgba(255,255,255,0.08)";
                }}
              >
                {exUrl.replace("https://", "")}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 30 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="glass flex flex-col items-center py-4 px-3"
            >
              <span
                className="font-mono text-2xl font-bold"
                style={{ color: "#22C55E" }}
              >
                {stat.value}
              </span>
              <span className="text-xs mt-1" style={{ color: "#64748B" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto w-full">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-100 mb-3">
            Everything that matters for Shopify speed
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            We run a real browser, capture every network request, and apply rules
            tuned specifically for Shopify storefronts.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={mounted ? { opacity: 0, y: 24 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="glass glass-hover p-6 cursor-default"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
              >
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 className="font-semibold text-slate-100 mb-2 text-sm">{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What we check */}
      <section className="relative z-10 px-6 pb-24 max-w-4xl mx-auto w-full">
        <motion.div
          initial={mounted ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass p-8 sm:p-10"
        >
          <h3 className="font-semibold text-slate-100 mb-6 text-sm uppercase tracking-wider"
            style={{ color: "#64748B" }}>
            What we analyze
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Render-blocking scripts",
              "Heavy JavaScript bundles (>100 KB)",
              "Duplicate library versions",
              "Unoptimized images",
              "Third-party script impact",
              "Installed Shopify apps",
              "Total transfer size",
              "Page load time",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={16} style={{ color: "#22C55E", flexShrink: 0 }} />
                <span className="text-sm" style={{ color: "#94A3B8" }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 border-t px-6 py-8 text-center"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p className="text-xs" style={{ color: "#475569" }}>
          Built by{" "}
          <a
            href="https://github.com/angeloprabajith"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200"
            style={{ color: "#64748B" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "#22C55E")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.color = "#64748B")
            }
          >
            Angelo Prabajith
          </a>{" "}
          · Open source · MIT License
        </p>
      </footer>
    </main>
  );
}
