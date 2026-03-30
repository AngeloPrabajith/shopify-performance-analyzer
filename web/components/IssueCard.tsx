"use client";

import { useState } from "react";
import {
  ChevronDown,
  AlertTriangle,
  Info,
  XCircle,
  Lightbulb,
  Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AnalysisIssue } from "@/types/analyzer";
import issueMetadata, { DIFFICULTY_CONFIG } from "@/data/issueMetadata";

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

function extractImageFormat(url: string): string | null {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = pathname.match(/\.(png|jpe?g|gif|webp|avif|bmp|tiff?|svg)(\?|$)/);
    if (match) return match[1].replace("jpeg", "jpg").replace("tif", "tiff");
  } catch {}
  return null;
}

function ImagePreview({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const format = extractImageFormat(url);

  if (failed) return null;

  const formatColor =
    format === "webp" || format === "avif"
      ? "#22C55E"
      : format === "jpg"
        ? "#F59E0B"
        : "#EF4444";

  return (
    <div className="flex items-start gap-3 mt-2">
      <div
        className="rounded-lg overflow-hidden flex-shrink-0"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          maxWidth: 120,
          maxHeight: 80,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Flagged image"
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ maxWidth: 120, maxHeight: 80, objectFit: "cover", display: "block" }}
        />
      </div>
      {format && (
        <span
          className="text-xs font-mono font-medium px-2 py-0.5 rounded-md uppercase"
          style={{
            background: `${formatColor}18`,
            color: formatColor,
            border: `1px solid ${formatColor}30`,
          }}
        >
          {format}
        </span>
      )}
    </div>
  );
}

export function IssueCard({ issue, index }: IssueCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.info;
  const Icon = config.icon;
  const meta = issueMetadata[issue.ruleId];
  const diffConfig = meta ? DIFFICULTY_CONFIG[meta.difficulty] : null;

  const isImage =
    issue.ruleId === "image-optimization" && !!issue.resourceUrl;

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
            {diffConfig && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-md"
                style={{
                  background: diffConfig.bg,
                  color: diffConfig.color,
                  border: `1px solid ${diffConfig.color}30`,
                }}
              >
                {diffConfig.label}
              </span>
            )}
          </div>
          <p
            className="text-sm mt-1 leading-snug font-medium"
            style={{ color: "#CBD5E1" }}
          >
            {issue.title}
          </p>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: "#475569", flexShrink: 0 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-4 pb-4 pt-0 border-t space-y-3"
              style={{ borderColor: config.border }}
            >
              {/* Issue description */}
              <p className="text-xs mt-3 leading-relaxed" style={{ color: "#94A3B8" }}>
                {issue.description}
              </p>

              {/* Image preview for image-optimization issues */}
              {isImage && <ImagePreview url={issue.resourceUrl!} />}

              {/* Resource URL */}
              {issue.resourceUrl && (
                <p className="text-xs font-mono truncate" style={{ color: "#475569" }}>
                  {issue.resourceUrl}
                </p>
              )}

              {/* Savings badge */}
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

              {/* Why this matters */}
              {meta && (
                <div
                  className="rounded-lg p-3 mt-1"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Lightbulb size={13} style={{ color: "#F59E0B" }} />
                    <span className="text-xs font-semibold" style={{ color: "#CBD5E1" }}>
                      Why this matters
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                    {meta.whyItMatters}
                  </p>
                </div>
              )}

              {/* How to fix */}
              {meta && (
                <div
                  className="rounded-lg p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Wrench size={13} style={{ color: "#22C55E" }} />
                    <span className="text-xs font-semibold" style={{ color: "#CBD5E1" }}>
                      How to fix
                    </span>
                  </div>
                  <ol className="space-y-1.5 pl-4" style={{ listStyleType: "decimal" }}>
                    {meta.howToFix.map((step, i) => (
                      <li
                        key={i}
                        className="text-xs leading-relaxed"
                        style={{ color: "#94A3B8" }}
                      >
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
