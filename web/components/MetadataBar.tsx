"use client";

import { Clock, Activity, HardDrive, Globe, Eye, Zap, Timer, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

interface MetadataBarProps {
  url: string;
  loadTime: number;
  totalRequests: number;
  totalTransferSize: number;
  ttfb?: number | null;
  fcp?: number | null;
  lcp?: number | null;
  cls?: number | null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatMs(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function loadTimeColor(ms: number) {
  if (ms < 2000) return "#22C55E";
  if (ms < 4000) return "#F59E0B";
  return "#EF4444";
}

function ttfbColor(ms: number) {
  if (ms < 800) return "#22C55E";
  if (ms < 1800) return "#F59E0B";
  return "#EF4444";
}

function fcpColor(ms: number) {
  if (ms < 1800) return "#22C55E";
  if (ms < 3000) return "#F59E0B";
  return "#EF4444";
}

function lcpColor(ms: number) {
  if (ms < 2500) return "#22C55E";
  if (ms < 4000) return "#F59E0B";
  return "#EF4444";
}

function clsColor(value: number) {
  if (value < 0.1) return "#22C55E";
  if (value < 0.25) return "#F59E0B";
  return "#EF4444";
}

export function MetadataBar({
  url,
  loadTime,
  totalRequests,
  totalTransferSize,
  ttfb,
  fcp,
  lcp,
  cls,
}: MetadataBarProps) {
  const stats = [
    {
      icon: Clock,
      label: "Load Time",
      value: formatMs(loadTime),
      color: loadTimeColor(loadTime),
    },
    ...(ttfb != null
      ? [
          {
            icon: Timer,
            label: "TTFB",
            value: formatMs(ttfb),
            color: ttfbColor(ttfb),
            tooltip: "Time to First Byte",
          },
        ]
      : []),
    ...(fcp != null
      ? [
          {
            icon: Eye,
            label: "FCP",
            value: formatMs(fcp),
            color: fcpColor(fcp),
            tooltip: "First Contentful Paint",
          },
        ]
      : []),
    ...(lcp != null
      ? [
          {
            icon: Zap,
            label: "LCP",
            value: formatMs(lcp),
            color: lcpColor(lcp),
            tooltip: "Largest Contentful Paint",
          },
        ]
      : []),
    ...(cls != null
      ? [
          {
            icon: LayoutDashboard,
            label: "CLS",
            value: cls.toFixed(3),
            color: clsColor(cls),
            tooltip: "Cumulative Layout Shift",
          },
        ]
      : []),
    {
      icon: Activity,
      label: "Requests",
      value: totalRequests.toString(),
      color: totalRequests > 100 ? "#F59E0B" : "#94A3B8",
    },
    {
      icon: HardDrive,
      label: "Transfer",
      value: formatBytes(totalTransferSize),
      color: totalTransferSize > 3 * 1024 * 1024 ? "#EF4444" : "#94A3B8",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-4 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* URL */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Globe size={16} style={{ color: "#64748B" }} className="shrink-0" />
          <span
            className="text-sm truncate font-mono"
            style={{ color: "#94A3B8" }}
            title={url}
          >
            {url}
          </span>
        </div>

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-8 self-center"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />

        {/* Stats */}
        <div className="flex items-center gap-5 sm:gap-7 flex-wrap flex-shrink-0">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2" title={"tooltip" in stat ? stat.tooltip : undefined}>
              <stat.icon size={14} style={{ color: stat.color }} />
              <div className="flex flex-col">
                <span
                  className="font-mono font-semibold text-sm leading-none"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs leading-none mt-0.5"
                  style={{ color: "#475569" }}
                >
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
