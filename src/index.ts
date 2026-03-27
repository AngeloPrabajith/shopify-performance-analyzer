export const VERSION = "0.1.0";

export { analyze, analyzeMultiPage } from './orchestrator.js';
export type { AnalyzeOptions, AnalyzeOutput, PageType, ScannedPage } from './orchestrator.js';
export type { AnalysisResult, AnalysisIssue } from './types/analysis.js';
export type { DetectedApp } from './types/detection.js';
export type { ScoreBreakdown } from './types/scoring.js';
