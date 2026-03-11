import type { AnalysisResult } from './types/analysis.js';
import type { DetectedApp } from './types/detection.js';
import type { ScoreBreakdown } from './types/scoring.js';
import { scrapePage } from './scraper/index.js';
import { runRules, getDefaultRules } from './analyzer/index.js';
import { detectApps, loadFingerprints } from './detectors/index.js';
import { calculateScore } from './scoring/index.js';

export interface AnalyzeOutput {
  result: AnalysisResult;
  apps: DetectedApp[];
  score: ScoreBreakdown;
}

export async function analyze(url: string): Promise<AnalyzeOutput> {
  // Scrape the page
  const pageData = await scrapePage(url);

  // Run analysis rules
  const rules = getDefaultRules();
  const issues = runRules(pageData, rules);

  // Detect installed apps
  const fingerprints = loadFingerprints();
  const apps = detectApps(pageData.requests, fingerprints);

  // Calculate score
  const score = calculateScore(issues, apps);

  // Build metadata
  const totalTransferSize = pageData.requests.reduce((sum, r) => sum + r.size, 0);

  return {
    result: {
      issues,
      metadata: {
        url: pageData.pageUrl,
        loadTime: pageData.loadTime,
        totalRequests: pageData.requests.length,
        totalTransferSize,
      },
    },
    apps,
    score,
  };
}
