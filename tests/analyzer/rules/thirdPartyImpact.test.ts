import { describe, it, expect } from 'vitest';
import { thirdPartyImpactRule } from '../../../src/analyzer/rules/thirdPartyImpact.js';
import {
  createMockPageLoadResult,
  createMockNetworkRequest,
} from '../../helpers/fixtures.js';

describe('thirdPartyImpactRule', () => {
  const pageUrl = 'https://my-store.myshopify.com';

  it('identifies third-party scripts and provides a summary', () => {
    const data = createMockPageLoadResult({
      pageUrl,
      requests: [
        createMockNetworkRequest({
          url: 'https://static.klaviyo.com/onsite/js/klaviyo.js',
          size: 80000,
          resourceType: 'script',
        }),
      ],
    });

    const issues = thirdPartyImpactRule.evaluate(data);
    const summary = issues.find((i) => i.severity === 'info');
    expect(summary).toBeDefined();
    expect(summary!.title).toContain('1 third-party');
  });

  it('treats Shopify CDN as first-party', () => {
    const data = createMockPageLoadResult({
      pageUrl,
      requests: [
        createMockNetworkRequest({
          url: 'https://cdn.shopify.com/s/files/scripts/main.js',
          size: 300000,
          resourceType: 'script',
        }),
      ],
    });

    const issues = thirdPartyImpactRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });

  it('flags when total third-party script size exceeds 500kb', () => {
    const data = createMockPageLoadResult({
      pageUrl,
      requests: [
        createMockNetworkRequest({
          url: 'https://external1.com/big.js',
          size: 300000,
          resourceType: 'script',
        }),
        createMockNetworkRequest({
          url: 'https://external2.com/bigger.js',
          size: 300000,
          resourceType: 'script',
        }),
      ],
    });

    const issues = thirdPartyImpactRule.evaluate(data);
    const critical = issues.find((i) => i.severity === 'critical');
    expect(critical).toBeDefined();
  });

  it('flags individual third-party scripts over 200kb', () => {
    const data = createMockPageLoadResult({
      pageUrl,
      requests: [
        createMockNetworkRequest({
          url: 'https://heavy-vendor.com/analytics.js',
          size: 250000,
          resourceType: 'script',
        }),
      ],
    });

    const issues = thirdPartyImpactRule.evaluate(data);
    const warning = issues.find((i) => i.severity === 'warning');
    expect(warning).toBeDefined();
    expect(warning!.title).toContain('analytics.js');
  });

  it('returns no issues when there are no third-party scripts', () => {
    const data = createMockPageLoadResult({
      pageUrl,
      requests: [
        createMockNetworkRequest({
          url: 'https://my-store.myshopify.com/assets/theme.js',
          size: 50000,
          resourceType: 'script',
        }),
      ],
    });

    const issues = thirdPartyImpactRule.evaluate(data);
    expect(issues).toHaveLength(0);
  });
});
