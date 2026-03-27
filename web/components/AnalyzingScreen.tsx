"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const STEPS_SINGLE = [
  { label: "Launching headless browser", duration: 2500 },
  { label: "Loading storefront page", duration: 5000 },
  { label: "Capturing network requests", duration: 3000 },
  { label: "Running analysis rules", duration: 2000 },
  { label: "Detecting installed apps", duration: 1500 },
  { label: "Calculating performance score", duration: 1000 },
];

const STEPS_FULL = [
  { label: "Launching headless browser", duration: 2500 },
  { label: "Scanning homepage", duration: 5000 },
  { label: "Discovering product and collection pages", duration: 2000 },
  { label: "Scanning product page", duration: 6000 },
  { label: "Scanning collection page", duration: 6000 },
  { label: "Running analysis rules on all pages", duration: 2500 },
  { label: "Detecting installed apps", duration: 1500 },
  { label: "Calculating scores", duration: 1000 },
];

interface AnalyzingScreenProps {
  url: string;
  fullScan?: boolean;
}

export function AnalyzingScreen({ url, fullScan = false }: AnalyzingScreenProps) {
  const STEPS = fullScan ? STEPS_FULL : STEPS_SINGLE;
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let currentStep = 0;

    const advance = () => {
      if (currentStep < STEPS.length - 1) {
        setTimeout(() => {
          currentStep++;
          setActiveStep(currentStep);
          advance();
        }, STEPS[currentStep].duration);
      }
    };

    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = Math.min(((activeStep + 1) / STEPS.length) * 100, 95);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, #22C55E 0%, transparent 70%)",
          top: "10%",
          left: "5%",
          opacity: 0.08,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-8 sm:p-12 w-full max-w-lg"
      >
        {/* Animated logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full"
              style={{
                border: "2px solid transparent",
                background:
                  "linear-gradient(#0F172A, #0F172A) padding-box, linear-gradient(135deg, #22C55E, transparent 50%, #8B5CF6) border-box",
              }}
            />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ color: "#22C55E" }}
            >
              <Loader2 size={28} className="animate-spin" />
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-2" style={{ color: "#F8FAFC" }}>
          {fullScan ? "Running full scan" : "Analyzing your store"}
        </h2>
        <p className="text-sm text-center mb-8 font-mono truncate" style={{ color: "#64748B" }}>
          {url}
        </p>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {STEPS.map((step, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep;
            const isPending = i > activeStep;

            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <div className="shrink-0 relative w-4 h-4 flex items-center justify-center">
                  {isDone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "#22C55E" }}
                    >
                      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.div>
                  )}
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full"
                      style={{ background: "#22C55E", boxShadow: "0 0 8px rgba(34,197,94,0.6)" }}
                    />
                  )}
                  {isPending && (
                    <div className="w-3 h-3 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                  )}
                </div>

                <span
                  className="text-sm transition-colors duration-300"
                  style={{ color: isDone ? "#64748B" : isActive ? "#F8FAFC" : "#334155" }}
                >
                  {step.label}
                </span>

                {isDone && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-auto text-xs font-mono"
                    style={{ color: "#22C55E" }}
                  >
                    done
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #22C55E, #16A34A)", boxShadow: "0 0 8px rgba(34,197,94,0.5)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "#334155" }}>
          {fullScan ? "Full scan takes 60-120 seconds" : "This takes 15-45 seconds"} - we run a real browser
        </p>
      </motion.div>
    </div>
  );
}
