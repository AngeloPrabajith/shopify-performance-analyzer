import { describe, it, expect } from 'vitest';
import { calculateScore } from '../../src/scoring/scoreCalculator.js';
import type { AnalysisIssue } from '../../src/types/analysis.js';
import type { DetectedApp } from '../../src/types/detection.js';

function makeIssue(
  severity: 'critical' | 'warning' | 'info',
  ruleId = 'test-rule',
): AnalysisIssue {
  return { ruleId, severity, title: 'Test', description: 'Test issue' };
}

function makeApp(name: string): DetectedApp {
  return {
    appName: name,
    vendor: name,
    matchedDomain: `${name.toLowerCase()}.com`,
    scriptCount: 1,
    totalSize: 10000,
  };
}

describe('calculateScore', () => {
  it('returns 100 with no issues and few apps', () => {
    const score = calculateScore([], []);
    expect(score.overall).toBe(100);
  });

  it('deducts 15 points per critical issue', () => {
    const issues = [makeIssue('critical')];
    const score = calculateScore(issues, []);
    expect(score.overall).toBe(85);
  });

  it('deducts 5 points per warning', () => {
    const issues = [makeIssue('warning'), makeIssue('warning')];
    const score = calculateScore(issues, []);
    expect(score.overall).toBe(90);
  });

  it('deducts 1 point per info issue', () => {
    const issues = [makeIssue('info'), makeIssue('info'), makeIssue('info')];
    const score = calculateScore(issues, []);
    expect(score.overall).toBe(97);
  });

  it('never drops below 0', () => {
    const issues = Array.from({ length: 10 }, () => makeIssue('critical'));
    const score = calculateScore(issues, []);
    expect(score.overall).toBe(0);
  });

  it('applies a penalty when more than 10 apps are detected', () => {
    const apps = Array.from({ length: 11 }, (_, i) => makeApp(`App${i}`));
    const score = calculateScore([], apps);
    expect(score.overall).toBe(95);
  });

  it('no app penalty with 10 or fewer apps', () => {
    const apps = Array.from({ length: 10 }, (_, i) => makeApp(`App${i}`));
    const score = calculateScore([], apps);
    expect(score.overall).toBe(100);
  });

  it('groups issues into category scores', () => {
    const issues = [
      makeIssue('warning', 'heavy-scripts'),
      makeIssue('warning', 'image-optimization'),
    ];
    const score = calculateScore(issues, []);
    expect(score.categories['scripts']).toBe(95);
    expect(score.categories['images']).toBe(95);
  });
});
