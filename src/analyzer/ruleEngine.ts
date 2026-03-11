import type { PageLoadResult } from '../types/network.js';
import type { AnalysisIssue } from '../types/analysis.js';
import type { AnalysisRule } from '../types/rules.js';

/**
 * Runs all provided rules against the page data and collects issues.
 * Each rule is isolated so a single failure won't take down the whole analysis.
 */
export function runRules(
  data: PageLoadResult,
  rules: AnalysisRule[],
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];

  for (const rule of rules) {
    try {
      const result = rule.evaluate(data);
      issues.push(...result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`Rule "${rule.id}" failed: ${message}`);
    }
  }

  return issues;
}
