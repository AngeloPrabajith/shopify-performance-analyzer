"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number) {
  if (score >= 90) return "#22C55E";
  if (score >= 75) return "#84CC16";
  if (score >= 50) return "#F59E0B";
  return "#EF4444";
}

function getGrade(score: number) {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function getLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs Work";
  return "Critical";
}

export function ScoreGauge({ score, size = 220 }: ScoreGaugeProps) {
  const color = getScoreColor(score);
  const grade = getGrade(score);
  const label = getLabel(score);

  // SVG arc calculation
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // The arc goes from 135deg to 405deg (270deg sweep)
  const startAngle = 135;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle;

  function polarToCartesian(angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  }

  function arcPath(from: number, to: number) {
    const s = polarToCartesian(from);
    const e = polarToCartesian(to);
    const largeArc = to - from > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const trackPath = arcPath(startAngle, endAngle);

  const motionScore = useMotionValue(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(motionScore, score, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplayScore(Math.round(v)),
    });
    return controls.stop;
  }, [score, motionScore]);

  const filledEndAngle = useTransform(
    motionScore,
    [0, 100],
    [startAngle, endAngle]
  );

  const [currentEnd, setCurrentEnd] = useState(startAngle);
  useEffect(() => {
    return filledEndAngle.on("change", setCurrentEnd);
  }, [filledEndAngle]);

  const fillPath = arcPath(startAngle, currentEnd);

  // Glow filter id unique per instance
  const filterId = `score-glow-${size}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size}>
          <defs>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled arc */}
          {currentEnd > startAngle && (
            <path
              d={fillPath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter={`url(#${filterId})`}
              style={{ transition: "stroke 0.3s ease" }}
            />
          )}
        </svg>

        {/* Center content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="font-mono font-bold leading-none"
            style={{ fontSize: size * 0.22, color }}
          >
            {displayScore}
          </span>
          <span
            className="font-mono font-semibold mt-1"
            style={{ fontSize: size * 0.09, color: "rgba(255,255,255,0.4)" }}
          >
            / 100
          </span>
        </div>
      </div>

      {/* Grade badge */}
      <div className="flex flex-col items-center gap-1">
        <span
          className="font-mono font-bold text-3xl"
          style={{ color }}
        >
          {grade}
        </span>
        <span
          className="text-sm px-3 py-1 rounded-full"
          style={{
            background: `${color}18`,
            border: `1px solid ${color}40`,
            color,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
