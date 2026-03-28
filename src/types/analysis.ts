export type Severity = 'critical' | 'warning' | 'info';

export interface AnalysisIssue {
  ruleId: string;
  severity: Severity;
  title: string;
  description: string;
  resourceUrl?: string;
  savingsKb?: number;
}

export interface PageMetadata {
  url: string;
  loadTime: number;
  totalRequests: number;
  totalTransferSize: number;
  ttfb: number | null;
  fcp: number | null;
  lcp: number | null;
  cls: number | null;
}

export interface AnalysisResult {
  issues: AnalysisIssue[];
  metadata: PageMetadata;
}
