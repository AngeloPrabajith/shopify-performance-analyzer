"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ThumbsUp } from "lucide-react";
import type { PositiveFinding } from "@/data/positiveChecks";

interface PositiveFindingsProps {
  findings: PositiveFinding[];
}

export function PositiveFindings({ findings }: PositiveFindingsProps) {
  if (findings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass overflow-hidden"
      style={{ border: "1px solid rgba(34,197,94,0.15)" }}
    >
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{
          background: "rgba(34,197,94,0.06)",
          borderBottom: "1px solid rgba(34,197,94,0.1)",
        }}
      >
        <ThumbsUp size={16} style={{ color: "#22C55E" }} />
        <span className="text-sm font-semibold" style={{ color: "#22C55E" }}>
          What&apos;s Going Well
        </span>
        <span
          className="text-xs font-mono px-1.5 py-0.5 rounded-md ml-1"
          style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}
        >
          {findings.length}
        </span>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {findings.map((finding, i) => (
          <motion.div
            key={finding.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 * i }}
            className="flex items-start gap-2.5 p-3 rounded-lg"
            style={{
              background: "rgba(34,197,94,0.04)",
              border: "1px solid rgba(34,197,94,0.08)",
            }}
          >
            <CheckCircle2
              size={16}
              style={{ color: "#22C55E", marginTop: 1, flexShrink: 0 }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: "#CBD5E1" }}>
                {finding.title}
              </p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#64748B" }}>
                {finding.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
