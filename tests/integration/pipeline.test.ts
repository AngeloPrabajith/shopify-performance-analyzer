import { describe, it, expect } from 'vitest';
import { runRules, getDefaultRules } from '../../src/analyzer/index.js';
import { detectApps } from '../../src/detectors/appDetector.js';
import { calculateScore } from '../../src/scoring/scoreCalculator.js';
import {
  createMockPageLoadResult,
  createMockNetworkRequest,
  createMockHeadScript,
} from '../helpers/fixtures.js';
import type { AppFingerprint } from '../../src/types/detection.js';

// Simulates a realistic storefront with multiple issues
const realisticPageData = createMockPageLoadResult({
  pageUrl: 'https://test-store.myshopify.com',
  loadTime: 3200,
  domContentLoaded: 2100,
  requests: [
    // First-party theme assets
    createMockNetworkRequest({
      url: 'https://cdn.shopify.com/s/files/theme.js',
      size: 85000,
      resourceType: 'script',
    }),
    createMockNetworkRequest({
      url: 'https://cdn.shopify.com/s/files/theme.css',
      size: 42000,
      resourceType: 'stylesheet',
    }),
    // Heavy third-party script
    createMockNetworkRequest({
      url: 'https://static.klaviyo.com/onsite/js/klaviyo.js',
      size: 195000,
      resourceType: 'script',
    }),
    // Duplicate jQuery
    createMockNetworkRequest({
      url: 'https://cdn.shopify.com/s/files/jquery-3.6.0.min.js',
      size: 90000,
      resourceType: 'script',
    }),
    createMockNetworkRequest({
      url: 'https://cdn.example.com/vendor/jquery-3.5.1.min.js',
      size: 88000,
      resourceType: 'script',
    }),
    // Large image
    createMockNetworkRequest({
      url: 'https://cdn.shopify.com/s/files/hero-banner.png',
      size: 650000,
      resourceType: 'image',
      headers: { 'content-type': 'image/png' },
    }),
    // Another third-party
    createMockNetworkRequest({
      url: 'https://static.hotjar.com/c/hotjar-12345.js',
      size: 45000,
      resourceType: 'script',
    }),
    // Small tracker
    createMockNetworkRequest({
      url: 'https://connect.facebook.net/en_US/fbevents.js',
      size: 60000,
      resourceType: 'script',
    }),
  ],
  headScripts: [
    createMockHeadScript({
      src: 'https://cdn.shopify.com/s/files/theme.js',
      async: false,
      defer: false,
    }),
    createMockHeadScript({
      src: 'https://static.klaviyo.com/onsite/js/klaviyo.js',
      async: false,
      defer: false,
    }),
    createMockHeadScript({
      src: 'https://cdn.shopify.com/s/files/vendor.js',
      async: true,
      defer: false,
    }),
  ],
});

const testFingerprints: AppFingerprint[] = [
  { appName: 'Klaviyo', vendor: 'Klaviyo', domains: ['static.klaviyo.com'] },
  { appName: 'Hotjar', vendor: 'Hotjar', domains: ['static.hotjar.com'] },
  { appName: 'Facebook Pixel', vendor: 'Meta', domains: ['connect.facebook.net'] },
];

describe('full analysis pipeline', () => {
  it('runs all rules and produces issues', () => {
    const rules = getDefaultRules();
    const issues = runRules(realisticPageData, rules);

    // Should find at least: heavy script, duplicate jQuery, blocking scripts, large image
    expect(issues.length).toBeGreaterThanOrEqual(4);

    const ruleIds = [...new Set(issues.map((i) => i.ruleId))];
    expect(ruleIds).toContain('heavy-scripts');
    expect(ruleIds).toContain('duplicate-libraries');
    expect(ruleIds).toContain('render-blocking');
    expect(ruleIds).toContain('image-optimization');
    expect(ruleIds).toContain('third-party-impact');
  });

  it('detects apps from network requests', () => {
    const apps = detectApps(realisticPageData.requests, testFingerprints);
    expect(apps.length).toBeGreaterThanOrEqual(2);

    const appNames = apps.map((a) => a.appName);
    expect(appNames).toContain('Klaviyo');
    expect(appNames).toContain('Hotjar');
  });

  it('produces a reasonable score for a page with issues', () => {
    const rules = getDefaultRules();
    const issues = runRules(realisticPageData, rules);
    const apps = detectApps(realisticPageData.requests, testFingerprints);
    const score = calculateScore(issues, apps);

    // With this many issues the score should be noticeably below 100
    expect(score.overall).toBeLessThan(85);
    expect(score.overall).toBeGreaterThan(0);
    expect(score.categories).toBeDefined();
  });

  it('produces a perfect score for a clean page', () => {
    const cleanPage = createMockPageLoadResult({
      pageUrl: 'https://fast-store.myshopify.com',
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.shopify.com/s/files/theme.js',
          size: 30000,
          resourceType: 'script',
        }),
      ],
      headScripts: [
        createMockHeadScript({
          src: 'https://cdn.shopify.com/s/files/theme.js',
          async: true,
        }),
      ],
    });

    const rules = getDefaultRules();
    const issues = runRules(cleanPage, rules);
    const score = calculateScore(issues, []);

    expect(issues).toHaveLength(0);
    expect(score.overall).toBe(100);
  });
});
