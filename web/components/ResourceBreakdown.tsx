"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { WaterfallEntry } from "@/types/analyzer";

interface ResourceBreakdownProps {
  requests: WaterfallEntry[];
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  script: { label: "Scripts", color: "#F59E0B" },
  image: { label: "Images", color: "#06B6D4" },
  stylesheet: { label: "Stylesheets", color: "#22C55E" },
  font: { label: "Fonts", color: "#EC4899" },
  xhr: { label: "XHR/Fetch", color: "#3B82F6" },
  fetch: { label: "XHR/Fetch", color: "#3B82F6" },
  document: { label: "Document", color: "#8B5CF6" },
  other: { label: "Other", color: "#64748B" },
};

function formatKB(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourceBreakdown({ requests }: ResourceBreakdownProps) {
  const data = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const req of requests) {
      const type =
        req.resourceType === "fetch" ? "xhr" : req.resourceType;
      const key = TYPE_CONFIG[type] ? type : "other";
      byType[key] = (byType[key] || 0) + req.size;
    }

    return Object.entries(byType)
      .filter(([, size]) => size > 0)
      .map(([type, size]) => ({
        name: TYPE_CONFIG[type]?.label ?? "Other",
        value: size,
        color: TYPE_CONFIG[type]?.color ?? "#64748B",
      }))
      .sort((a, b) => b.value - a.value);
  }, [requests]);

  const totalSize = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass p-5"
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: "#64748B" }}
      >
        Resource Breakdown
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Donut chart */}
        <div style={{ width: 160, height: 160 }} className="shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  const pct = ((d.value / totalSize) * 100).toFixed(1);
                  return (
                    <div
                      className="px-3 py-2 rounded-lg text-xs"
                      style={{
                        background: "#1E293B",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#CBD5E1",
                      }}
                    >
                      <span style={{ color: d.color, fontWeight: 600 }}>
                        {d.name}
                      </span>
                      : {formatKB(d.value)} ({pct}%)
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
          {data.map((entry) => {
            const pct = ((entry.value / totalSize) * 100).toFixed(1);
            return (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: entry.color }}
                />
                <div className="min-w-0">
                  <span className="text-xs font-medium" style={{ color: "#CBD5E1" }}>
                    {entry.name}
                  </span>
                  <span className="text-xs font-mono ml-1.5" style={{ color: "#64748B" }}>
                    {formatKB(entry.value)} ({pct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
