"use client";

import { useState } from "react";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import type { DetectedApp } from "@analyzer";

// DetectedApp fields: appName, vendor, matchedDomain, scriptCount, totalSize

interface AppTableProps {
  apps: DetectedApp[];
}

function sizeColor(bytes: number) {
  if (bytes < 100 * 1024) return "#22C55E";
  if (bytes < 500 * 1024) return "#F59E0B";
  return "#EF4444";
}

function formatKb(bytes: number) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function AppTable({ apps }: AppTableProps) {
  const [showAll, setShowAll] = useState(false);

  if (apps.length === 0) {
    return (
      <div className="glass p-6 flex flex-col items-center gap-3 py-10">
        <Package size={32} style={{ color: "#334155" }} />
        <p className="text-sm" style={{ color: "#475569" }}>
          No known apps detected
        </p>
      </div>
    );
  }

  const displayed = showAll ? apps : apps.slice(0, 8);

  return (
    <div className="glass overflow-hidden">
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2">
          <Package size={16} style={{ color: "#64748B" }} />
          <h3 className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
            Detected Apps
          </h3>
        </div>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{
            background: apps.length > 10 ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
            color: apps.length > 10 ? "#EF4444" : "#64748B",
            border: apps.length > 10 ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {apps.length} app{apps.length !== 1 ? "s" : ""}
        </span>
      </div>

      {apps.length > 10 && (
        <div
          className="px-5 py-3 text-xs flex items-center gap-2"
          style={{
            background: "rgba(239,68,68,0.06)",
            borderBottom: "1px solid rgba(239,68,68,0.12)",
            color: "#EF4444",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
          High app count ({apps.length}) — each app adds scripts and network requests.
          Consider auditing for unused apps.
        </div>
      )}

      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        {displayed.map((app, i) => {
          const color = sizeColor(app.totalSize);
          return (
            <motion.div
              key={`${app.appName}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              {/* App icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  color: "#475569",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {app.appName.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {app.appName}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "#475569" }}>
                  {app.vendor} · {app.scriptCount} script{app.scriptCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Size indicator */}
              <div className="flex flex-col items-end shrink-0">
                <span
                  className="text-xs font-mono font-semibold"
                  style={{ color }}
                >
                  {formatKb(app.totalSize)}
                </span>
                <span className="text-xs" style={{ color: "#334155" }}>
                  size
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {apps.length > 8 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-2 py-3 text-xs cursor-pointer transition-colors duration-200"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            color: "#64748B",
            background: "transparent",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#94A3B8")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color = "#64748B")
          }
        >
          {showAll ? (
            <>Show less <ChevronUp size={14} /></>
          ) : (
            <>Show {apps.length - 8} more <ChevronDown size={14} /></>
          )}
        </button>
      )}
    </div>
  );
}
