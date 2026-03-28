export const VERSION = "0.1.0";

export { analyze, analyzeMultiPage, analyzeSinglePage } from './orchestrator.js';
export type { AnalyzeOptions, AnalyzeOutput, PageType, ScannedPage, WaterfallEntry } from './orchestrator.js';
export type { AnalysisResult, AnalysisIssue } from './types/analysis.js';
export type { DetectedApp } from './types/detection.js';
export type { ScoreBreakdown } from './types/scoring.js';
