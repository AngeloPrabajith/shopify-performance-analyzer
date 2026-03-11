import type { AnalysisIssue } from '../types/analysis.js';
import type { DetectedApp } from '../types/detection.js';
import type { ScoreBreakdown } from '../types/scoring.js';

const SEVERITY_PENALTIES: Record<string, number> = {
  critical: 15,
  warning: 5,
  info: 1,
};

const APP_COUNT_THRESHOLD = 10;
const APP_COUNT_PENALTY = 5;

// Maps rule ID prefixes to score categories
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
  let totalDeductions = 0;
  const categoryDeductions: Record<string, number> = {};

  for (const issue of issues) {
    const penalty = SEVERITY_PENALTIES[issue.severity] || 0;
    totalDeductions += penalty;

    const category = CATEGORY_MAP[issue.ruleId] || 'other';
    categoryDeductions[category] = (categoryDeductions[category] || 0) + penalty;
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
    categories[category] = Math.max(0, 100 - deduction);
  }

  return {
    overall: Math.max(0, 100 - totalDeductions),
    categories,
  };
}
