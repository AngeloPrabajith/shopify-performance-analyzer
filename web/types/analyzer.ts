// Locally-defined types mirroring the core analyzer output.
// The core library is not available on Vercel (only on Railway),
// so we duplicate the type interfaces here for the web app.

export type Severity = "critical" | "warning" | "info";
export type PageType = "homepage" | "product" | "collection";

export interface AnalysisIssue {
  ruleId: string;
  severity: Severity;
  title: string;
  description: string;
  resourceUrl?: string;
  savingsKb?: number;
}

export interface DetectedApp {
  appName: string;
  vendor: string;
  matchedDomain: string;
  scriptCount: number;
  totalSize: number;
}

export interface WaterfallEntry {
  url: string;
  resourceType: string;
  size: number;
  duration: number;
  startTime: number;
}

export interface AnalysisResult {
  metadata: {
    url: string;
    loadTime: number;
    totalRequests: number;
    totalTransferSize: number;
    ttfb?: number;
    fcp?: number;
    lcp?: number;
    cls?: number;
  };
  issues: AnalysisIssue[];
}

export interface ScoreBreakdown {
  overall: number;
  categories: Record<string, number>;
}

export interface ScannedPage {
  pageType: PageType;
  result: AnalysisResult;
  score: ScoreBreakdown;
}

export interface AnalyzeOutput {
  result: AnalysisResult;
  apps: DetectedApp[];
  score: ScoreBreakdown;
  waterfall: WaterfallEntry[];
  pages?: ScannedPage[];
  missingPageTypes?: PageType[];
}
