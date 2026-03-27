"use client";

import { motion } from "framer-motion";

interface CategoryChartProps {
  categories: Record<string, number>;
}

const CATEGORY_LABELS: Record<string, string> = {
  scripts: "Scripts",
  images: "Images",
  "third-party": "Third Party",
  apps: "Apps",
  other: "Other",
};

function getBarColor(score: number) {
  if (score >= 90) return "#22C55E";
  if (score >= 75) return "#84CC16";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

export function CategoryChart({ categories }: CategoryChartProps) {
  const entries = Object.entries(categories).sort((a, b) => a[1] - b[1]);

  if (entries.length === 0) {
    return (
      <div
        className="glass p-6 flex items-center justify-center"
        style={{ color: "#475569", fontSize: "0.875rem" }}
      >
        No category data
      </div>
    );
  }

  return (
    <div className="glass p-6">
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-5"
        style={{ color: "#64748B" }}
      >
        Category Scores
      </h3>
      <div className="space-y-4">
        {entries.map(([category, score], i) => {
          const color = getBarColor(score);
          const label = CATEGORY_LABELS[category] ?? category;
          return (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm" style={{ color: "#94A3B8" }}>
                  {label}
                </span>
                <span
                  className="font-mono text-sm font-semibold"
                  style={{ color }}
                >
                  {score}
                </span>
              </div>
              <div
                className="relative h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
