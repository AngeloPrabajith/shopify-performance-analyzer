"use client";

import { motion } from "framer-motion";
import { AlertTriangle, XCircle, Info, TrendingDown, Sparkles } from "lucide-react";
import type { AnalysisIssue } from "@/types/analyzer";

interface SummaryBannerProps {
  issues: AnalysisIssue[];
  score: number;
}

function verdict(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Your store performs excellently", color: "#22C55E" };
  if (score >= 70) return { text: "Your store performs well with room for improvement", color: "#84CC16" };
  if (score >= 50) return { text: "Your store has performance issues worth addressing", color: "#F59E0B" };
  return { text: "Your store has major performance issues hurting sales", color: "#EF4444" };
}

export function SummaryBanner({ issues, score }: SummaryBannerProps) {
  const critical = issues.filter((i) => i.severity === "critical").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const infos = issues.filter((i) => i.severity === "info").length;
  const totalSavings = issues.reduce((sum, i) => sum + (i.savingsKb || 0), 0);
  const v = verdict(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass p-4 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        {/* Verdict */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Sparkles size={16} style={{ color: v.color }} className="shrink-0" />
          <span className="text-sm font-medium" style={{ color: v.color }}>
            {v.text}
          </span>
        </div>

        {/* Issue counts */}
        <div className="flex items-center gap-3 shrink-0">
          {critical > 0 && (
            <div className="flex items-center gap-1.5">
              <XCircle size={13} style={{ color: "#EF4444" }} />
              <span className="text-xs font-mono font-semibold" style={{ color: "#EF4444" }}>
                {critical}
              </span>
              <span className="text-xs" style={{ color: "#64748B" }}>critical</span>
            </div>
          )}
          {warnings > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={13} style={{ color: "#F59E0B" }} />
              <span className="text-xs font-mono font-semibold" style={{ color: "#F59E0B" }}>
                {warnings}
              </span>
              <span className="text-xs" style={{ color: "#64748B" }}>warnings</span>
            </div>
          )}
          {infos > 0 && (
            <div className="flex items-center gap-1.5">
              <Info size={13} style={{ color: "#06B6D4" }} />
              <span className="text-xs font-mono font-semibold" style={{ color: "#06B6D4" }}>
                {infos}
              </span>
              <span className="text-xs" style={{ color: "#64748B" }}>info</span>
            </div>
          )}
        </div>

        {/* Savings */}
        {totalSavings > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <TrendingDown size={13} style={{ color: "#22C55E" }} />
            <span className="text-xs font-mono font-semibold" style={{ color: "#22C55E" }}>
              ~{totalSavings} KB
            </span>
            <span className="text-xs" style={{ color: "#64748B" }}>potential savings</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
