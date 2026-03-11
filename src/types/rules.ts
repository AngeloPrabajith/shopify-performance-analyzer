import type { PageLoadResult } from './network.js';
import type { AnalysisIssue } from './analysis.js';

export interface AnalysisRule {
  id: string;
  name: string;
  evaluate(data: PageLoadResult): AnalysisIssue[];
}
