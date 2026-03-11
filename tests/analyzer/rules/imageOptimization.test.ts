import { describe, it, expect } from 'vitest';
import { imageOptimizationRule } from '../../../src/analyzer/rules/imageOptimization.js';
import {
  createMockPageLoadResult,
  createMockNetworkRequest,
} from '../../helpers/fixtures.js';

describe('imageOptimizationRule', () => {
  it('flags images larger than 500kb', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.example.com/hero.jpg',
          size: 800000,
          resourceType: 'image',
        }),
      ],
    });

    const issues = imageOptimizationRule.evaluate(data);
    const sizeIssue = issues.find((i) => i.severity === 'warning');
    expect(sizeIssue).toBeDefined();
    expect(sizeIssue!.title).toContain('hero.jpg');
  });

  it('ignores small images', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.example.com/icon.png',
          size: 5000,
          resourceType: 'image',
          headers: { 'content-type': 'image/png' },
        }),
      ],
    });

    const issues = imageOptimizationRule.evaluate(data);
    // Should still get a format suggestion but not a size warning
    const sizeWarnings = issues.filter((i) => i.severity === 'warning');
    expect(sizeWarnings).toHaveLength(0);
  });

  it('suggests modern formats for PNG images', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.example.com/photo.png',
          size: 100000,
          resourceType: 'image',
          headers: { 'content-type': 'image/png' },
        }),
      ],
    });

    const issues = imageOptimizationRule.evaluate(data);
    const formatIssue = issues.find((i) => i.severity === 'info');
    expect(formatIssue).toBeDefined();
    expect(formatIssue!.description).toContain('WebP');
  });

  it('does not flag JPEG or WebP as legacy formats', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.example.com/photo.jpg',
          size: 100000,
          resourceType: 'image',
          headers: { 'content-type': 'image/jpeg' },
        }),
      ],
    });

    const issues = imageOptimizationRule.evaluate(data);
    const formatIssues = issues.filter((i) => i.severity === 'info');
    expect(formatIssues).toHaveLength(0);
  });

  it('ignores non-image resources', () => {
    const data = createMockPageLoadResult({
      requests: [
        createMockNetworkRequest({
          size: 900000,
          resourceType: 'script',
        }),
      ],
    });

    const issues = imageOptimizationRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });
});
