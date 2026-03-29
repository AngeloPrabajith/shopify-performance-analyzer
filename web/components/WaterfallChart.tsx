"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { WaterfallEntry } from "@/types/analyzer";

interface WaterfallChartProps {
  requests: WaterfallEntry[];
}

const TYPE_COLORS: Record<string, string> = {
  document: "#8B5CF6",
  script: "#F59E0B",
  stylesheet: "#22C55E",
  image: "#06B6D4",
  font: "#EC4899",
  xhr: "#3B82F6",
  fetch: "#3B82F6",
  media: "#F97316",
  other: "#64748B",
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || TYPE_COLORS.other;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function extractFilename(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const last = segments.pop() || "";
    if (last.includes(".")) return last.length > 40 ? last.slice(0, 37) + "..." : last;
    if (last.length > 2) return `${parsed.hostname}/${last}`;
    return parsed.hostname + parsed.pathname;
  } catch {
    return url.slice(0, 40);
  }
}

const ROW_HEIGHT = 28;
const LABEL_WIDTH = 220;
const TIMELINE_PADDING = 16;
const MAX_VISIBLE = 50;

export function WaterfallChart({ requests }: WaterfallChartProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...requests].filter((r) => r.startTime >= 0 && r.duration > 0).sort((a, b) => a.startTime - b.startTime),
    [requests],
  );

  if (sorted.length === 0) return null;

  const visible = showAll ? sorted : sorted.slice(0, MAX_VISIBLE);
  const hasMore = sorted.length > MAX_VISIBLE;

  const minStart = sorted[0].startTime;
  const maxEnd = Math.max(...sorted.map((r) => r.startTime + r.duration));
  const totalDuration = maxEnd - minStart || 1;

  const chartWidth = 600;
  const svgHeight = visible.length * ROW_HEIGHT + 24;

  // Time markers
  const markerCount = 5;
  const markers = Array.from({ length: markerCount + 1 }, (_, i) => {
    const t = (totalDuration / markerCount) * i;
    return { time: t, x: (t / totalDuration) * chartWidth };
  });

  // Type legend
  const usedTypes = [...new Set(sorted.map((r) => r.resourceType))];

  return (
    <div className="glass overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer transition-colors duration-200"
        style={{ borderBottom: expanded ? "1px solid rgba(255,255,255,0.06)" : "none" }}
      >
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm text-slate-100">Network Waterfall</h2>
          <span className="font-mono text-xs px-2 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "#64748B" }}>
            {sorted.length} requests
          </span>
        </div>
        {expanded ? <ChevronUp size={16} style={{ color: "#64748B" }} /> : <ChevronDown size={16} style={{ color: "#64748B" }} />}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-5 pb-5 overflow-x-auto"
        >
          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap py-3">
            {usedTypes.map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-sm" style={{ background: getTypeColor(type) }} />
                <span className="text-xs capitalize" style={{ color: "#64748B" }}>{type}</span>
              </div>
            ))}
          </div>

          <div style={{ minWidth: LABEL_WIDTH + chartWidth + TIMELINE_PADDING * 2 }}>
            <svg
              width={LABEL_WIDTH + chartWidth + TIMELINE_PADDING * 2}
              height={svgHeight}
              style={{ display: "block" }}
            >
              {/* Time markers */}
              {markers.map((m, i) => (
                <g key={i}>
                  <line
                    x1={LABEL_WIDTH + TIMELINE_PADDING + m.x}
                    y1={0}
                    x2={LABEL_WIDTH + TIMELINE_PADDING + m.x}
                    y2={svgHeight}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={1}
                  />
                  <text
                    x={LABEL_WIDTH + TIMELINE_PADDING + m.x}
                    y={12}
                    fill="#475569"
                    fontSize={10}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {m.time < 1000 ? `${Math.round(m.time)}ms` : `${(m.time / 1000).toFixed(1)}s`}
                  </text>
                </g>
              ))}

              {/* Rows */}
              {visible.map((req, i) => {
                const y = i * ROW_HEIGHT + 20;
                const barX = ((req.startTime - minStart) / totalDuration) * chartWidth;
                const barW = Math.max(2, (req.duration / totalDuration) * chartWidth);
                const color = getTypeColor(req.resourceType);

                return (
                  <g key={i}>
                    {/* Alternating row background */}
                    {i % 2 === 0 && (
                      <rect x={0} y={y - 2} width={LABEL_WIDTH + chartWidth + TIMELINE_PADDING * 2} height={ROW_HEIGHT} fill="rgba(255,255,255,0.015)" rx={2} />
                    )}

                    {/* Filename label */}
                    <text x={4} y={y + 14} fill="#94A3B8" fontSize={11} fontFamily="monospace">
                      {extractFilename(req.url)}
                    </text>

                    {/* Bar */}
                    <rect
                      x={LABEL_WIDTH + TIMELINE_PADDING + barX}
                      y={y + 4}
                      width={barW}
                      height={16}
                      rx={3}
                      fill={color}
                      opacity={0.85}
                    />

                    {/* Size label after bar */}
                    <text
                      x={LABEL_WIDTH + TIMELINE_PADDING + barX + barW + 6}
                      y={y + 15}
                      fill="#475569"
                      fontSize={10}
                      fontFamily="monospace"
                    >
                      {formatBytes(req.size)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Show more toggle */}
          {hasMore && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-xs px-4 py-1.5 rounded-lg cursor-pointer transition-colors duration-200"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748B" }}
              >
                {showAll ? `Show first ${MAX_VISIBLE}` : `Show all ${sorted.length} requests`}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
