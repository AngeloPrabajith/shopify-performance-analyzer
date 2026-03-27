"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Zap,
  Filter,
  ChevronDown,
  Home,
  ShoppingBag,
  Grid3X3,
} from "lucide-react";
import type { AnalyzeOutput, PageType } from "@analyzer";
import { AnalyzingScreen } from "@/components/AnalyzingScreen";
import { ScoreGauge } from "@/components/ScoreGauge";
import { MetadataBar } from "@/components/MetadataBar";
import { CategoryChart } from "@/components/CategoryChart";
import { IssueCard } from "@/components/IssueCard";
import { AppTable } from "@/components/AppTable";
import { AIInsights } from "@/components/AIInsights";

type SeverityFilter = "all" | "critical" | "warning" | "info";

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 };
const PAGE_SIZE = 10;

const PAGE_TAB_CONFIG: Record<PageType, { label: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }> = {
  homepage: { label: "Homepage", Icon: Home },
  product: { label: "Product Page", Icon: ShoppingBag },
  collection: { label: "Collection Page", Icon: Grid3X3 },
};

function scoreColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
}

function ResultsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const url = params.get("url") ?? "";
  const scope = params.get("scope") === "full" ? "full" : "homepage";

  const [output, setOutput] = useState<AnalyzeOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeTab, setActiveTab] = useState<PageType>("homepage");

  const runAnalysis = useCallback(async () => {
    if (!url) {
      setError("No URL provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setOutput(null);
    setVisibleCount(PAGE_SIZE);
    setActiveTab("homepage");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, scanScope: scope }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (HTTP ${res.status})`);
      }

      const data: AnalyzeOutput = await res.json();
      setOutput(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [url, scope]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [severityFilter, activeTab]);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass p-8 text-center max-w-sm">
          <AlertTriangle size={32} className="mx-auto mb-4" style={{ color: "#F59E0B" }} />
          <p className="text-slate-300 mb-4">No store URL specified.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <AnalyzingScreen url={url} fullScan={scope === "full"} />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass p-8 text-center max-w-md">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <AlertTriangle size={24} style={{ color: "#EF4444" }} />
          </div>
          <h2 className="text-lg font-semibold text-slate-100 mb-2">Analysis Failed</h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "#64748B" }}>{error}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8" }}
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <button
              onClick={runAnalysis}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22C55E" }}
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!output) return null;

  const { apps, score } = output;
  const hasMultiplePages = output.pages && output.pages.length > 1;

  // Get the active page's result - for homepage use the primary result
  const activePageData = hasMultiplePages
    ? output.pages!.find((p) => p.pageType === activeTab)
    : null;

  const activeResult = activePageData ? activePageData.result : output.result;
  const activeScore = activePageData ? activePageData.score : score;

  const issues = activeResult.issues;
  const sortedIssues = [...issues].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3),
  );

  const filteredIssues =
    severityFilter === "all"
      ? sortedIssues
      : sortedIssues.filter((i) => i.severity === severityFilter);

  const visibleIssues = filteredIssues.slice(0, visibleCount);
  const hasMore = visibleCount < filteredIssues.length;
  const remaining = filteredIssues.length - visibleCount;

  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  const FILTERS: { value: SeverityFilter; label: string; count: number; color: string }[] = [
    { value: "all", label: "All", count: issues.length, color: "#94A3B8" },
    { value: "critical", label: "Critical", count: criticalCount, color: "#EF4444" },
    { value: "warning", label: "Warning", count: warningCount, color: "#F59E0B" },
    { value: "info", label: "Info", count: infoCount, color: "#06B6D4" },
  ];

  return (
    <main className="relative min-h-screen">
      <div
        className="orb"
        style={{ width: 600, height: 600, background: "radial-gradient(circle, #22C55E 0%, transparent 70%)", top: "-200px", right: "-200px", opacity: 0.07 }}
      />
      <div
        className="orb"
        style={{ width: 400, height: 400, background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", bottom: "20%", left: "-100px", opacity: 0.07 }}
      />

      {/* Top nav */}
      <nav
        className="sticky top-0 z-20 flex items-center justify-between px-5 py-3"
        style={{ background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm cursor-pointer transition-colors duration-200"
          style={{ color: "#64748B" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#94A3B8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#64748B")}
        >
          <ArrowLeft size={16} />
          New Scan
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}>
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-300 hidden sm:block">Shopify Analyzer</span>
        </div>

        <button
          onClick={runAnalysis}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748B" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#94A3B8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#64748B")}
        >
          <RefreshCw size={13} />
          Re-scan
        </button>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 py-8 space-y-6">

        {/* Metadata bar - always shows the active page */}
        <MetadataBar
          url={activeResult.metadata.url}
          loadTime={activeResult.metadata.loadTime}
          totalRequests={activeResult.metadata.totalRequests}
          totalTransferSize={activeResult.metadata.totalTransferSize}
          fcp={activeResult.metadata.fcp}
          lcp={activeResult.metadata.lcp}
        />

        {/* AI Insights - always at top, uses homepage data */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <AIInsights analyzeOutput={output} />
        </motion.div>

        {/* Page tab switcher (only shown for multi-page scans) */}
        {hasMultiplePages && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {output.pages!.map((p) => {
                const config = PAGE_TAB_CONFIG[p.pageType];
                const isActive = activeTab === p.pageType;
                const tabScore = p.score.overall;
                return (
                  <button
                    key={p.pageType}
                    onClick={() => { setActiveTab(p.pageType); setSeverityFilter("all"); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
                      color: isActive ? "#F8FAFC" : "#64748B",
                      border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                    }}
                  >
                    <config.Icon size={14} style={{ color: isActive ? "#22C55E" : undefined }} />
                    <span className="hidden sm:inline">{config.label}</span>
                    <span
                      className="font-mono text-xs px-1.5 py-0.5 rounded-md"
                      style={{
                        background: `${scoreColor(tabScore)}18`,
                        color: scoreColor(tabScore),
                        border: `1px solid ${scoreColor(tabScore)}30`,
                      }}
                    >
                      {tabScore}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Score + category chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div className="glass p-8 flex flex-col items-center justify-center gap-4">
            <ScoreGauge score={activeScore.overall} size={200} />
          </div>
          <CategoryChart categories={activeScore.categories} />
        </motion.div>

        {/* Issues */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} style={{ color: "#64748B" }} />
              <h2 className="font-semibold text-slate-100">
                Issues{" "}
                <span className="font-mono text-sm font-normal" style={{ color: "#475569" }}>
                  ({filteredIssues.length})
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSeverityFilter(f.value)}
                  className="text-xs px-3 py-1 rounded-full cursor-pointer transition-all duration-200 font-medium"
                  style={{
                    background: severityFilter === f.value ? `${f.color}18` : "rgba(255,255,255,0.04)",
                    border: severityFilter === f.value ? `1px solid ${f.color}40` : "1px solid rgba(255,255,255,0.07)",
                    color: severityFilter === f.value ? f.color : "#475569",
                  }}
                >
                  {f.label}
                  {f.count > 0 && <span className="ml-1 font-mono">{f.count}</span>}
                </button>
              ))}
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="glass py-12 flex flex-col items-center gap-3 text-center">
              <span className="text-3xl">✓</span>
              <p className="text-sm" style={{ color: "#475569" }}>
                No {severityFilter === "all" ? "" : severityFilter} issues detected
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {visibleIssues.map((issue, i) => (
                  <IssueCard key={`${issue.ruleId}-${i}`} issue={issue} index={i} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-4 flex flex-col items-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
                    }}
                  >
                    <ChevronDown size={15} />
                    Show {Math.min(PAGE_SIZE, remaining)} more
                    <span className="font-mono text-xs" style={{ color: "#475569" }}>
                      ({remaining} remaining)
                    </span>
                  </button>
                </div>
              )}

              {visibleCount >= filteredIssues.length && filteredIssues.length > PAGE_SIZE && (
                <p className="text-center text-xs mt-4" style={{ color: "#334155" }}>
                  All {filteredIssues.length} issues shown
                </p>
              )}
            </>
          )}
        </motion.div>

        {/* Detected apps - always shows combined list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <AppTable apps={apps} />
        </motion.div>

      </div>

      <footer
        className="relative z-10 border-t px-6 py-6 text-center mt-12"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <p className="text-xs" style={{ color: "#334155" }}>
          Shopify Performance Analyzer - Open source, MIT License
        </p>
      </footer>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
