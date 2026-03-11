import type { AnalysisIssue } from '../types/analysis.js';
import type { DetectedApp } from '../types/detection.js';
import type { ScoreBreakdown } from '../types/scoring.js';

// Per-issue penalties (tuned so real-world sites land in a useful range)
const SEVERITY_PENALTIES: Record<string, number> = {
  critical: 10,
  warning: 3,
  info: 0.5,
};

// Cap how much any single rule can deduct so one noisy rule
// doesn't tank the entire score on its own
const PER_RULE_CAP = 25;

const APP_COUNT_THRESHOLD = 10;
const APP_COUNT_PENALTY = 5;

// Maps rule IDs to score categories
const CATEGORY_MAP: Record<string, string> = {
  'heavy-scripts': 'scripts',
  'duplicate-libraries': 'scripts',
  'render-blocking': 'scripts',
  'image-optimization': 'images',
  'third-party-impact': 'third-party',
};

export function calculateScore(
  issues: AnalysisIssue[],
  detectedApps: DetectedApp[],
): ScoreBreakdown {
  // Group raw penalties by rule so we can cap per-rule deductions
  const ruleDeductions: Record<string, number> = {};

  for (const issue of issues) {
    const penalty = SEVERITY_PENALTIES[issue.severity] || 0;
    ruleDeductions[issue.ruleId] = (ruleDeductions[issue.ruleId] || 0) + penalty;
  }

  // Apply per-rule cap, then roll up into categories
  let totalDeductions = 0;
  const categoryDeductions: Record<string, number> = {};

  for (const [ruleId, rawDeduction] of Object.entries(ruleDeductions)) {
    const capped = Math.min(rawDeduction, PER_RULE_CAP);
    totalDeductions += capped;

    const category = CATEGORY_MAP[ruleId] || 'other';
    categoryDeductions[category] = (categoryDeductions[category] || 0) + capped;
  }

  // Penalize stores running too many apps
  if (detectedApps.length > APP_COUNT_THRESHOLD) {
    totalDeductions += APP_COUNT_PENALTY;
    categoryDeductions['apps'] =
      (categoryDeductions['apps'] || 0) + APP_COUNT_PENALTY;
  }

  // Build category scores (each starts at 100)
  const categories: Record<string, number> = {};
  for (const [category, deduction] of Object.entries(categoryDeductions)) {
    categories[category] = Math.max(0, Math.round(100 - deduction));
  }

  return {
    overall: Math.max(0, Math.round(100 - totalDeductions)),
    categories,
  };
}
