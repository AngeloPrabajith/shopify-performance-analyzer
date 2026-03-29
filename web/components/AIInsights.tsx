"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  Code2,
  ChevronDown,
  Loader2,
  Zap,
} from "lucide-react";
import type { AnalyzeOutput } from "@/types/analyzer";

interface AIInsightsData {
  summary: string;
  grade: string;
  benchmark: string;
  topFixes: {
    priority: number;
    title: string;
    impact: "high" | "medium" | "low";
    description: string;
    codeSnippet: string | null;
  }[];
  quickWins: string[];
  appWarning: string | null;
}

interface AIInsightsProps {
  analyzeOutput: AnalyzeOutput;
}

const IMPACT_CONFIG = {
  high: { color: "#EF4444", label: "High Impact" },
  medium: { color: "#F59E0B", label: "Med Impact" },
  low: { color: "#22C55E", label: "Low Impact" },
};

function FixCard({
  fix,
  index,
}: {
  fix: AIInsightsData["topFixes"][number];
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const imp = IMPACT_CONFIG[fix.impact] ?? IMPACT_CONFIG.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 p-4 text-left cursor-pointer"
        style={{ background: "transparent" }}
      >
        <span
          className="font-mono font-bold text-sm mt-0.5 shrink-0 w-6"
          style={{ color: "#475569" }}
        >
          {fix.priority}.
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-100">
              {fix.title}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${imp.color}15`,
                color: imp.color,
                border: `1px solid ${imp.color}30`,
              }}
            >
              {imp.label}
            </span>
          </div>
        </div>
        {(fix.codeSnippet || fix.description) && (
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: "#475569", flexShrink: 0 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-4 pb-4 pt-0 space-y-3 border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <p
                className="text-sm mt-3 leading-relaxed"
                style={{ color: "#94A3B8" }}
              >
                {fix.description}
              </p>
              {fix.codeSnippet && (
                <pre
                  className="text-xs rounded-lg p-3 overflow-x-auto font-mono leading-relaxed"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    color: "#86EFAC",
                    border: "1px solid rgba(34,197,94,0.15)",
                  }}
                >
                  {fix.codeSnippet}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AIInsights({ analyzeOutput }: AIInsightsProps) {
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // In React Strict Mode, the first effect run is cleaned up immediately.
    // Reset the ref on cleanup so the second run can actually fetch.
    let cancelled = false;

    // Skip if we already have data (prevents re-fetching on parent re-renders)
    if (fetchedRef.current) return;

    async function fetchInsights() {
      setLoading(true);
      setError(null);

      try {
        // Send only what the AI endpoint needs (exclude waterfall/pages to reduce payload)
        const { waterfall: _w, pages: _p, ...payload } = analyzeOutput;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const res = await fetch("/api/ai-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }

        const json = await res.json();
        if (!cancelled) {
          fetchedRef.current = true;
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error
            ? err.name === "AbortError" ? "AI request timed out" : err.message
            : "AI request failed";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchInsights();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(34, 197, 94, 0.03)",
        border: "1px solid rgba(34, 197, 94, 0.15)",
        boxShadow: "0 0 40px rgba(34, 197, 94, 0.05)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4"
        style={{
          borderBottom: "1px solid rgba(34, 197, 94, 0.1)",
          background: "rgba(34, 197, 94, 0.04)",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(34,197,94,0.15)" }}
        >
          <Sparkles size={16} style={{ color: "#22C55E" }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">AI Insights</h3>
          <p className="text-xs" style={{ color: "#64748B" }}>
            Powered by AI
          </p>
        </div>
      </div>

      <div className="p-6">
        {loading && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex items-center gap-2" style={{ color: "#22C55E" }}>
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">AI is analyzing your store...</span>
            </div>
            <div className="space-y-2 w-full max-w-lg">
              {[75, 55, 65, 45].map((w, i) => (
                <div key={i} className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertCircle size={18} style={{ color: "#EF4444", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-sm font-medium text-red-400">AI insights unavailable</p>
              <p className="text-xs mt-1" style={{ color: "#64748B" }}>{error}</p>
              {error.includes("ANTHROPIC_API_KEY") && (
                <p className="text-xs mt-2" style={{ color: "#64748B" }}>
                  Add your API key to <code className="font-mono text-slate-400">web/.env.local</code>
                </p>
              )}
            </div>
          </div>
        )}

        {data && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Summary row: grade + summary + benchmark in one wide row */}
            <div
              className="p-5 rounded-xl mb-5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-start gap-5">
                {/* Grade bubble */}
                <div className="text-center shrink-0">
                  <span
                    className="font-mono font-bold text-4xl leading-none block"
                    style={{ color: "#22C55E" }}
                  >
                    {data.grade}
                  </span>
                </div>

                <div
                  className="w-px self-stretch shrink-0"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                />

                {/* Summary */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed" style={{ color: "#CBD5E1" }}>
                    {data.summary}
                  </p>
                  {data.benchmark && (
                    <div className="flex items-center gap-2 mt-3">
                      <TrendingUp size={13} style={{ color: "#22C55E" }} />
                      <span className="text-xs font-medium" style={{ color: "#22C55E" }}>
                        {data.benchmark}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* App warning */}
            {data.appWarning && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl text-sm mb-5"
                style={{
                  background: "rgba(245,158,11,0.07)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  color: "#FCD34D",
                }}
              >
                <Zap size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                {data.appWarning}
              </div>
            )}

            {/* Fixes + Quick wins side by side on wide screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Priority fixes (takes 2/3 width) */}
              {data.topFixes.length > 0 && (
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 size={14} style={{ color: "#64748B" }} />
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#64748B" }}
                    >
                      Priority Fixes
                    </span>
                  </div>
                  <div className="space-y-2">
                    {data.topFixes.map((fix, i) => (
                      <FixCard key={i} fix={fix} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick wins (takes 1/3 width) */}
              {data.quickWins.length > 0 && (
                <div>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider block mb-3"
                    style={{ color: "#64748B" }}
                  >
                    Quick Wins
                  </span>
                  <div
                    className="rounded-xl p-4 space-y-3"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {data.quickWins.map((win, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: "#22C55E" }}
                        />
                        <span className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
                          {win}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
