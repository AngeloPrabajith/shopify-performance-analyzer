import { describe, it, expect } from 'vitest';
import { formatReport } from '../../src/cli/formatter.js';
import type { AnalysisResult } from '../../src/types/analysis.js';
import type { DetectedApp } from '../../src/types/detection.js';
import type { ScoreBreakdown } from '../../src/types/scoring.js';

const mockResult: AnalysisResult = {
  issues: [
    {
      ruleId: 'heavy-scripts',
      severity: 'warning',
      title: 'Heavy script: klaviyo.js (190.4kb)',
      description: 'klaviyo.js is 190.4kb, exceeding the 100.0kb threshold.',
      resourceUrl: 'https://static.klaviyo.com/onsite/js/klaviyo.js',
      savingsKb: 88,
    },
    {
      ruleId: 'duplicate-libraries',
      severity: 'critical',
      title: 'Duplicate library: jQuery loaded 2 times',
      description: 'jQuery was found at 2 different URLs.',
    },
    {
      ruleId: 'render-blocking',
      severity: 'warning',
      title: 'Render-blocking script: theme.js',
      description: 'theme.js is loaded in <head> without async or defer.',
    },
  ],
  metadata: {
    url: 'https://test-store.myshopify.com',
    loadTime: 3200,
    totalRequests: 42,
    totalTransferSize: 1850000,
  },
};

const mockApps: DetectedApp[] = [
  {
    appName: 'Klaviyo',
    vendor: 'Klaviyo',
    matchedDomain: 'static.klaviyo.com',
    scriptCount: 2,
    totalSize: 195000,
  },
  {
    appName: 'Hotjar',
    vendor: 'Hotjar',
    matchedDomain: 'static.hotjar.com',
    scriptCount: 1,
    totalSize: 45000,
  },
];

const mockScore: ScoreBreakdown = {
  overall: 70,
  categories: { scripts: 75, images: 100 },
};

describe('formatReport', () => {
  const output = formatReport(mockResult, mockApps, mockScore);

  it('includes the store URL', () => {
    expect(output).toContain('test-store.myshopify.com');
  });

  it('includes the performance score', () => {
    expect(output).toContain('70');
    expect(output).toContain('100');
  });

  it('includes detected app names', () => {
    expect(output).toContain('Klaviyo');
    expect(output).toContain('Hotjar');
  });

  it('includes issue titles', () => {
    expect(output).toContain('klaviyo.js');
    expect(output).toContain('jQuery');
    expect(output).toContain('theme.js');
  });

  it('includes the summary section', () => {
    expect(output).toContain('Summary');
    expect(output).toContain('1 critical');
    expect(output).toContain('2 warnings');
  });

  it('includes request count and transfer size', () => {
    expect(output).toContain('42 requests');
  });
});
