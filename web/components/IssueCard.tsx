"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, Info, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisIssue } from "@/types/analyzer";


interface IssueCardProps {
  issue: AnalysisIssue;
  index: number;
}

const SEVERITY_CONFIG = {
  critical: {
    color: "#EF4444",
    bg: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.2)",
    icon: XCircle,
    label: "Critical",
  },
  warning: {
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.2)",
    icon: AlertTriangle,
    label: "Warning",
  },
  info: {
    color: "#06B6D4",
    bg: "rgba(6, 182, 212, 0.08)",
    border: "rgba(6, 182, 212, 0.2)",
    icon: Info,
    label: "Info",
  },
};

const RULE_DESCRIPTIONS: Record<string, string> = {
  "heavy-scripts": "Large JavaScript files significantly increase parse and execution time.",
  "duplicate-libraries": "Multiple versions of the same library loaded, wasting bytes and causing potential conflicts.",
  "render-blocking": "Scripts loaded synchronously in <head> block the browser from rendering any content.",
  "image-optimization": "Images served without compression or modern formats (WebP/AVIF).",
  "third-party-impact": "External scripts from third parties add latency beyond your control.",
};

export function IssueCard({ issue, index }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.info;
  const Icon = config.icon;

  const ruleDescription = RULE_DESCRIPTIONS[issue.ruleId];
  const hasExtra = !!(issue.resourceUrl || issue.savingsKb);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left cursor-pointer transition-colors duration-150"
        style={{ background: "transparent" }}
        aria-expanded={expanded}
      >
        <Icon size={18} style={{ color: config.color, flexShrink: 0 }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-mono font-medium px-2 py-0.5 rounded-md"
              style={{
                background: `${config.color}18`,
                color: config.color,
                border: `1px solid ${config.color}30`,
              }}
            >
              {config.label}
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: "#475569" }}
            >
              {issue.ruleId}
            </span>
          </div>
          <p
            className="text-sm mt-1 leading-snug font-medium"
            style={{ color: "#CBD5E1" }}
          >
            {issue.title}
          </p>
        </div>

        {(hasExtra || ruleDescription) && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: "#475569", flexShrink: 0 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        )}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (hasExtra || ruleDescription) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-4 pb-4 pt-0 border-t space-y-2"
              style={{ borderColor: `${config.border}` }}
            >
              <p
                className="text-xs mt-3 leading-relaxed"
                style={{ color: "#94A3B8" }}
              >
                {issue.description}
              </p>
              {ruleDescription && (
                <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
                  {ruleDescription}
                </p>
              )}
              {issue.resourceUrl && (
                <p className="text-xs font-mono truncate" style={{ color: "#475569" }}>
                  {issue.resourceUrl}
                </p>
              )}
              {issue.savingsKb && (
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-md font-mono"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "#22C55E",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  ~{issue.savingsKb} KB savings
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
